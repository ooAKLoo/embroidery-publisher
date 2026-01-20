import { useState, useEffect } from 'react';
import { useAppleMusic } from './useAppleMusic';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

function AppleMusicPlaylist() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEmbedResultModal, setShowEmbedResultModal] = useState(false);

  // 本地文件格式检测结果
  const [fixResult, setFixResult] = useState(null);
  const [fixing, setFixing] = useState(false);

  const {
    loading,
    error,
    setError,
    // 多播放列表
    playlists,
    activePlaylistId,
    setActivePlaylistId,
    currentTracks,
    currentPlaylist,
    addPlaylists,
    removePlaylist,
    clearPlaylists,
    exportToCSV,
    // 去重
    dedupeEnabled,
    setDedupeEnabled,
    duplicateInfo,
    // 歌词相关
    lyricsLoading,
    lyricsProgress,
    lyricsResult,
    downloadLyrics,
    // Token 管理
    getMediaUserToken,
    setMediaUserToken,
    // 本地文件匹配
    localFilesMap,
    setLocalFilesForPlaylist,
    getCurrentLocalFiles,
    clearLocalFilesForPlaylist,
    allPlaylistsHaveLocalFiles,
    getAllMatchedStats,
    // 内封歌词
    embedLyricsLoading,
    embedLyricsProgress,
    embedLyricsResult,
    embedLyricsToFiles,
    // 合并下载
    mergeDownloadLoading,
    mergeDownloadProgress,
    mergeDownloadResult,
    mergeDownloadAll
  } = useAppleMusic();

  // 上传本地文件状态
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // 初始化 token 输入框
  useEffect(() => {
    setTokenInput(getMediaUserToken());
  }, [getMediaUserToken]);

  // 首次加载自动显示添加弹窗
  useEffect(() => {
    if (playlists.length === 0 && !loading) {
      setShowAddModal(true);
    }
  }, []);

  // Cmd+F 搜索快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch]);

  // 过滤歌曲
  const filteredTracks = searchQuery.trim()
    ? currentTracks.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artistName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.albumName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentTracks;

  const handleAdd = async () => {
    if (inputUrl.trim()) {
      await addPlaylists(inputUrl.trim());
      setInputUrl('');
      setShowAddModal(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAdd();
    }
    if (e.key === 'Escape') {
      setShowAddModal(false);
    }
  };

  const handleSaveToken = () => {
    setMediaUserToken(tokenInput.trim());
    setShowTokenModal(false);
  };

  const handleDownloadLyrics = async () => {
    if (!getMediaUserToken()) {
      setShowTokenModal(true);
      return;
    }
    await downloadLyrics();
  };

  const handleRemovePlaylist = (playlistId) => {
    removePlaylist(playlistId);
  };

  const hasToken = !!getMediaUserToken();

  // 上传本地音乐文件夹
  const handleUploadLocalFiles = async () => {
    if (activePlaylistId === 'all') return;

    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择本地音乐文件夹'
      });

      if (selected) {
        setUploadingFiles(true);
        setFixResult(null); // 清除之前的扫描结果

        // 1. 扫描目录检测格式问题
        const scanResult = await invoke('scan_music_files', { dirPath: selected });
        setFixResult(scanResult);

        // 2. 获取所有音乐文件列表（用于匹配）
        const files = await invoke('list_music_files', { dirPath: selected });

        if (files && files.length > 0) {
          setLocalFilesForPlaylist(activePlaylistId, files.map(f => ({
            name: f.fileName,
            path: f.filePath,
            size: f.fileSize || 0,
            dirPath: selected
          })));
        }
      }
    } catch (err) {
      console.error('上传文件失败:', err);
      setError(typeof err === 'string' ? err : err.message || '上传失败');
    } finally {
      setUploadingFiles(false);
    }
  };

  // 直接修复格式（使用已扫描的结果）
  const handleFixFormat = async () => {
    if (!fixResult?.fixedFiles?.length || !localFilesInfo?.dirPath) return;

    try {
      setFixing(true);
      const fixedCount = await invoke('fix_music_extensions', {
        files: fixResult.fixedFiles
      });

      // 更新扫描结果
      setFixResult(prev => ({
        ...prev,
        fixedFiles: [],
        alreadyCorrect: prev.alreadyCorrect + fixedCount,
        mp3ToM4a: 0,
        m4aToMp3: 0
      }));

      // 重新扫描文件列表更新匹配
      const files = await invoke('list_music_files', { dirPath: localFilesInfo.dirPath });
      if (files && files.length > 0) {
        setLocalFilesForPlaylist(activePlaylistId, files.map(f => ({
          name: f.fileName,
          path: f.filePath,
          size: f.fileSize || 0,
          dirPath: localFilesInfo.dirPath
        })));
      }
    } catch (err) {
      console.error('修复失败:', err);
      setError(typeof err === 'string' ? err : err.message || '修复失败');
    } finally {
      setFixing(false);
    }
  };

  // 处理内封歌词
  const handleEmbedLyrics = async () => {
    if (!getMediaUserToken()) {
      setShowTokenModal(true);
      return;
    }
    await embedLyricsToFiles(activePlaylistId);
  };

  // 获取当前播放列表的匹配信息
  const localFilesInfo = getCurrentLocalFiles;
  const matchedCount = localFilesInfo?.matchedTracks?.filter(t => t.localFile)?.length || 0;
  const unmatchedCount = localFilesInfo?.matchedTracks?.filter(t => !t.localFile)?.length || 0;

  // 检测是否需要修复格式
  const needsFormatFix = fixResult && (fixResult.mp3ToM4a > 0 || fixResult.m4aToMp3 > 0);

  // 检测是否有缺封面的文件（通过匹配的歌曲检查本地文件是否缺封面）
  // TODO: 需要后端支持检测封面
  const needsCoverFix = false;

  // 计算进度百分比
  const progressPercent = lyricsProgress?.total > 0
    ? Math.round((lyricsProgress.current / lyricsProgress.total) * 100)
    : 0;

  // 计算输入框中 URL 数量
  const urlCount = inputUrl.split(/[\n,]+/).filter(u => u.trim()).length;

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <svg className="w-6 h-6 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.99-1.74 6.65-2.89 7.99-3.45 3.8-1.6 4.59-1.88 5.1-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.06.01.24 0 .38z"/>
            </svg>
            Apple Music 播放列表
          </h2>
          <button
            onClick={() => setShowTokenModal(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              hasToken
                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            {hasToken ? 'Token 已配置' : '配置 Token'}
          </button>
        </div>
      </div>

      {/* 播放列表 Tab */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 -mt-2">
          {playlists.length > 0 && (
            <>
              {/* 全部 Tab */}
              {playlists.length > 1 && (
                <button
                  onClick={() => setActivePlaylistId('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activePlaylistId === 'all'
                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  全部 ({currentTracks.length})
                </button>
              )}

              {/* 各播放列表 Tab */}
              {playlists.map((p) => (
                <div key={p.playlist.id} className="relative group">
                  <button
                    onClick={() => setActivePlaylistId(p.playlist.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                      activePlaylistId === p.playlist.id
                        ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p.playlist.artwork && (
                      <img src={p.playlist.artwork.url} alt="" className="w-5 h-5 rounded" />
                    )}
                    <span className="max-w-[120px] truncate">{p.playlist.name}</span>
                    <span className="opacity-70">({p.tracks.length})</span>
                  </button>
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemovePlaylist(p.playlist.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-slate-400 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                  >
                    <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </>
          )}

          {/* 添加按钮 */}
          <button
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all bg-white text-slate-500 hover:text-pink-500 hover:bg-pink-50 border border-dashed border-slate-300 hover:border-pink-300 flex items-center gap-1.5"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            {loading ? '获取中...' : '添加'}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm whitespace-pre-line">
          {error}
        </div>
      )}

      {/* 当前播放列表信息 */}
      {currentPlaylist && playlists.length > 0 && (
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-red-50">
          <div className="flex gap-4">
            {currentPlaylist.artwork && (
              <img
                src={currentPlaylist.artwork.url}
                alt={currentPlaylist.name}
                className="w-20 h-20 rounded-xl shadow-lg"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-800 truncate">{currentPlaylist.name}</h3>
              {currentPlaylist.curatorName && (
                <p className="text-sm text-slate-500 mt-0.5">{currentPlaylist.curatorName}</p>
              )}
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-sm text-slate-400">{currentTracks.length} 首歌曲</p>
                {/* 去重按钮 - 仅全部视图且有重复时显示 */}
                {activePlaylistId === 'all' && duplicateInfo.count > 0 && (
                  <button
                    onClick={() => setDedupeEnabled(!dedupeEnabled)}
                    className={`px-2 py-0.5 rounded text-xs transition-all ${
                      dedupeEnabled
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {dedupeEnabled ? '已去重' : '去重'}
                  </button>
                )}
              </div>

              {/* 全部 tab 下的合并下载区域 */}
              {activePlaylistId === 'all' && playlists.length > 1 && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  {/* 各播放列表上传状态 */}
                  {playlists.map(p => {
                    const hasFiles = localFilesMap[p.playlist.id]?.matchedTracks?.some(t => t.localFile);
                    return (
                      <span
                        key={p.playlist.id}
                        className={`text-xs px-2 py-1 rounded ${
                          hasFiles
                            ? 'bg-green-50 text-green-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {hasFiles ? '✓' : '○'} {p.playlist.name.slice(0, 8)}
                      </span>
                    );
                  })}

                  {/* 合并下载按钮 - 仅当所有播放列表都上传了本地文件时显示 */}
                  {allPlaylistsHaveLocalFiles && (
                    <button
                      onClick={mergeDownloadAll}
                      disabled={mergeDownloadLoading}
                      className="px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50"
                    >
                      {mergeDownloadLoading ? (
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      {mergeDownloadLoading ? '合并中...' : `合并下载 (${getAllMatchedStats.totalMatched})`}
                    </button>
                  )}
                </div>
              )}

              {/* 本地文件上传区域 - 仅单个播放列表时显示 */}
              {activePlaylistId !== 'all' && (
                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  {/* 上传本地文件按钮 */}
                  <button
                    onClick={handleUploadLocalFiles}
                    disabled={uploadingFiles}
                    className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {uploadingFiles ? (
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    )}
                    {uploadingFiles ? '扫描中...' : localFilesInfo ? '重新选择' : '上传本地文件'}
                  </button>

                  {/* 匹配状态 - 带背景 */}
                  {localFilesInfo && (
                    <>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        ✓ 已匹配 {matchedCount}
                      </span>
                      {unmatchedCount > 0 && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded">
                          ✗ 未匹配 {unmatchedCount}
                        </span>
                      )}
                    </>
                  )}

                  {/* 批量操作按钮 - 按需显示 */}
                  {localFilesInfo && matchedCount > 0 && (
                    <>
                      {/* 整理格式 - 仅在检测到格式问题时显示 */}
                      {needsFormatFix && (
                        <button
                          onClick={handleFixFormat}
                          disabled={fixing}
                          className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          {fixing ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          )}
                          {fixing ? '修复中...' : `整理格式 (${fixResult.mp3ToM4a + fixResult.m4aToMp3})`}
                        </button>
                      )}
                      {/* 补封面 - 仅在检测到缺封面时显示 */}
                      {needsCoverFix && (
                        <button
                          className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors bg-white text-slate-700 hover:bg-slate-50"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          补封面
                        </button>
                      )}
                      {/* 内封歌词 - 始终显示（需要用户手动触发） */}
                      <button
                        onClick={handleEmbedLyrics}
                        disabled={embedLyricsLoading}
                        className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        {embedLyricsLoading ? (
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        )}
                        {embedLyricsLoading ? '内封中...' : `内封歌词 (${matchedCount})`}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                导出 CSV
              </button>
              <button
                onClick={handleDownloadLyrics}
                disabled={lyricsLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {lyricsLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    下载中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    下载歌词
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 歌词下载进度条 */}
          {lyricsLoading && lyricsProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 truncate flex-1">
                  正在获取: {lyricsProgress.songName} - {lyricsProgress.artistName}
                </span>
                <span className="text-slate-500 ml-4">
                  {lyricsProgress.current}/{lyricsProgress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* 下载完成提示 */}
          {!lyricsLoading && lyricsResult && (
            <div className="mt-4 p-3 bg-white/80 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">
                  歌词下载完成：
                  <span className="text-green-600 font-medium ml-1">{lyricsResult.success} 首成功</span>
                  {lyricsResult.failed > 0 && (
                    <span className="text-slate-400 ml-1">（{lyricsResult.failed} 首无歌词）</span>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* 内封歌词进度条 */}
          {embedLyricsLoading && embedLyricsProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 truncate flex-1">
                  正在内封: {embedLyricsProgress.trackName}
                </span>
                <span className="text-slate-500 ml-4">
                  {embedLyricsProgress.current}/{embedLyricsProgress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${embedLyricsProgress.total > 0 ? Math.round((embedLyricsProgress.current / embedLyricsProgress.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* 内封完成提示 */}
          {!embedLyricsLoading && embedLyricsResult && (
            <div className="mt-4 p-3 bg-white/80 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">
                  歌词内封完成：
                  <span className="text-green-600 font-medium ml-1">{embedLyricsResult.success} 首成功</span>
                  {embedLyricsResult.failed > 0 && (
                    <button
                      onClick={() => setShowEmbedResultModal(true)}
                      className="text-red-500 hover:text-red-600 hover:underline ml-1"
                    >
                      （{embedLyricsResult.failed} 首失败）
                    </button>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* 合并下载进度条 */}
          {mergeDownloadLoading && mergeDownloadProgress && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-600 truncate flex-1">
                  正在复制: {mergeDownloadProgress.fileName}
                </span>
                <span className="text-slate-500 ml-4">
                  {mergeDownloadProgress.current}/{mergeDownloadProgress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                  style={{ width: `${mergeDownloadProgress.total > 0 ? Math.round((mergeDownloadProgress.current / mergeDownloadProgress.total) * 100) : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* 合并下载完成提示 */}
          {!mergeDownloadLoading && mergeDownloadResult && (
            <div className="mt-4 p-3 bg-white/80 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-slate-600">
                  合并下载完成：
                  <span className="text-green-600 font-medium ml-1">{mergeDownloadResult.success} 个文件</span>
                  {mergeDownloadResult.failed > 0 && (
                    <span className="text-red-500 ml-1">（{mergeDownloadResult.failed} 个失败）</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 搜索浮窗 - 右上角 */}
      {showSearch && (
        <div className="absolute top-16 right-6 z-20 bg-white rounded-xl shadow-lg p-2 w-64">
          <div className="relative flex items-center">
            <svg className="w-4 h-4 absolute left-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索..."
              autoFocus
              className="w-full pl-8 pr-7 py-1.5 bg-slate-100 rounded-lg text-sm focus:outline-none focus:bg-slate-50"
            />
            <button
              onClick={() => { setShowSearch(false); setSearchQuery(''); }}
              className="absolute right-2 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {searchQuery && (
            <div className="mt-1.5 px-1 text-xs text-slate-400">
              {filteredTracks.length} 个结果
            </div>
          )}
        </div>
      )}

      {/* 歌曲列表 */}
      <div className="flex-1 overflow-auto">
        {currentTracks.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 sticky top-0">
              <tr className="text-left text-xs text-slate-500 uppercase">
                <th className="px-6 py-3 w-12">#</th>
                <th className="px-6 py-3">歌曲</th>
                <th className="px-6 py-3">歌手</th>
                <th className="px-6 py-3">专辑</th>
                <th className="px-6 py-3 w-20">时长</th>
                {activePlaylistId === 'all' && playlists.length > 1 && (
                  <th className="px-4 py-3">列表</th>
                )}
                {/* 本地文件匹配状态列 */}
                {activePlaylistId !== 'all' && localFilesInfo && (
                  <th className="px-4 py-3 w-28">本地文件</th>
                )}
                <th className="px-4 py-3 w-12">链接</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTracks.map((track, idx) => (
                <tr key={`${track.playlistId}-${track.id}-${idx}`} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-3 text-sm text-slate-400">{idx + 1}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      {track.artwork ? (
                        <img
                          src={track.artwork.url}
                          alt={track.name}
                          className="w-10 h-10 rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                          <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{track.name}</p>
                        <p className="text-xs text-slate-400">{track.genreNames[0] || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-slate-600">{track.artistName}</td>
                  <td className="px-6 py-3 text-sm text-slate-500 line-clamp-1">{track.albumName}</td>
                  <td className="px-6 py-3 text-sm text-slate-400">{track.duration}</td>
                  {activePlaylistId === 'all' && playlists.length > 1 && (
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-[120px] truncate" title={track.playlistName}>
                      {track.playlistName}
                    </td>
                  )}
                  {/* 本地文件匹配状态 */}
                  {activePlaylistId !== 'all' && localFilesInfo && (() => {
                    const matchedTrack = localFilesInfo.matchedTracks?.find(t => t.id === track.id);
                    const localFile = matchedTrack?.localFile;
                    return (
                      <td className="px-4 py-3">
                        {localFile ? (
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-xs text-green-600 truncate max-w-[100px]" title={localFile.name}>
                              已匹配
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">未找到</span>
                        )}
                      </td>
                    );
                  })()}
                  <td className="px-4 py-3">
                    <a
                      href={track.appleMusicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 text-pink-500 hover:text-pink-600 transition-all"
                      title="在 Apple Music 中打开"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p className="text-sm">点击上方"添加"按钮导入播放列表</p>
          </div>
        )}
      </div>

      {/* 统计信息 */}
      {currentTracks.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between">
          <div className="flex items-center gap-2">
            <span>
              {playlists.length > 1 && activePlaylistId === 'all'
                ? `${playlists.length} 个播放列表，共 ${currentTracks.length} 首歌曲`
                : `共 ${currentTracks.length} 首歌曲`
              }
            </span>
            {/* 重复数量 - 去重后才显示，点击打开弹窗 */}
            {activePlaylistId === 'all' && dedupeEnabled && duplicateInfo.count > 0 && (
              <button
                onClick={() => setShowDuplicateModal(true)}
                className="text-amber-600 hover:text-amber-700 hover:underline"
              >
                ({duplicateInfo.count} 首重复)
              </button>
            )}
          </div>
          <span>
            总时长: {formatTotalDuration(currentTracks.reduce((sum, t) => sum + (t.durationMs || 0), 0))}
          </span>
        </div>
      )}

      {/* 添加播放列表弹窗 */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-[420px] max-w-[90vw] shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-slate-800">添加播放列表</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <textarea
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="粘贴 Apple Music 播放列表链接&#10;支持多个链接，每行一个"
                rows={4}
                autoFocus
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-300 transition-all resize-none"
              />
              {urlCount > 0 && (
                <span className="absolute right-3 bottom-3 text-xs text-slate-400">
                  {urlCount} 个链接
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-slate-400">⌘ + Enter 快速添加</span>
              <button
                onClick={handleAdd}
                disabled={loading || !inputUrl.trim()}
                className="px-5 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? '获取中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Token 配置弹窗 */}
      {showTokenModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowTokenModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 w-[420px] max-w-[90vw] shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-medium text-slate-800">配置 Media User Token</h3>
              <button
                onClick={() => setShowTokenModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              登录 music.apple.com，从 Cookie 获取 <code className="bg-slate-100 px-1 rounded">media-user-token</code>
            </p>
            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="粘贴 token..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-300 transition-all resize-none"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveToken}
                className="px-5 py-2 bg-pink-500 text-white rounded-lg text-sm font-medium hover:bg-pink-600 transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重复歌曲弹窗 */}
      {showDuplicateModal && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowDuplicateModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-[480px] max-w-[90vw] max-h-[70vh] shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-medium text-slate-800">
                重复歌曲 ({duplicateInfo.duplicates.length} 首)
              </h3>
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {duplicateInfo.duplicates.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg">
                  {item.artwork ? (
                    <img src={item.artwork.url} alt="" className="w-10 h-10 rounded-lg" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-500">{item.artistName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      ×{item.count}
                    </span>
                    <p className="text-xs text-slate-400 mt-1 max-w-[120px] truncate" title={item.playlists.join('、')}>
                      {item.playlists.join('、')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                点击上方"去重"按钮可合并重复歌曲
              </span>
              <button
                onClick={() => {
                  setDedupeEnabled(true);
                  setShowDuplicateModal(false);
                }}
                className="px-4 py-1.5 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
              >
                一键去重
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 内封歌词结果详情弹窗 */}
      {showEmbedResultModal && embedLyricsResult && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowEmbedResultModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-[520px] max-w-[90vw] max-h-[70vh] shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-medium text-slate-800">
                内封歌词结果
              </h3>
              <button
                onClick={() => setShowEmbedResultModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {/* 失败的歌曲 */}
              {embedLyricsResult.results.filter(r => !r.success).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-red-600 mb-2 px-2">
                    失败 ({embedLyricsResult.results.filter(r => !r.success).length})
                  </h4>
                  {embedLyricsResult.results.filter(r => !r.success).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 hover:bg-red-50 rounded-lg">
                      <svg className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.trackName}</p>
                        <p className="text-xs text-red-500 mt-0.5">{item.error || '未知错误'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* 成功的歌曲 */}
              {embedLyricsResult.results.filter(r => r.success).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-2 px-2">
                    成功 ({embedLyricsResult.results.filter(r => r.success).length})
                  </h4>
                  {embedLyricsResult.results.filter(r => r.success).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-green-50 rounded-lg">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm text-slate-700 truncate">{item.trackName}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowEmbedResultModal(false)}
                className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// 格式化总时长
function formatTotalDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  }
  return `${minutes} 分钟`;
}

export default AppleMusicPlaylist;
