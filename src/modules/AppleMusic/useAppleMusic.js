import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { downloadDir } from '@tauri-apps/api/path';

// 从 localStorage 读取/保存 media-user-token
const STORAGE_KEY = 'apple_music_user_token';

export function useAppleMusic() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 多播放列表支持
  const [playlists, setPlaylists] = useState([]); // [{ playlist, tracks, storefront }]
  const [activePlaylistId, setActivePlaylistId] = useState('all'); // 'all' 或具体 playlist id

  // 歌词下载状态
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsProgress, setLyricsProgress] = useState(null);
  const [lyricsResult, setLyricsResult] = useState(null);

  // 内封歌词状态 - 按播放列表存储
  const [embedLyricsLoading, setEmbedLyricsLoading] = useState(false);
  const [embedLyricsProgress, setEmbedLyricsProgress] = useState(null);
  const [embedLyricsResultMap, setEmbedLyricsResultMap] = useState({}); // { [playlistId]: result }

  // 监听进度事件
  useEffect(() => {
    const unlisten = listen('lyrics-progress', (event) => {
      setLyricsProgress(event.payload);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // 监听内封歌词进度事件
  useEffect(() => {
    const unlisten = listen('embed-lyrics-progress', (event) => {
      setEmbedLyricsProgress(event.payload);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  // 获取保存的 token
  const getMediaUserToken = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) || '';
  }, []);

  // 保存 token
  const setMediaUserToken = useCallback((token) => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // 转换 API 结果为前端格式
  const convertPlaylistResult = (result, storefront) => {
    const playlistInfo = {
      id: result.playlist.id,
      name: result.playlist.name,
      description: result.playlist.description,
      curatorName: result.playlist.curatorName,
      artwork: result.playlist.artworkUrl ? {
        url: result.playlist.artworkUrl,
        width: 300,
        height: 300
      } : null,
      trackCount: result.playlist.trackCount,
      lastModified: result.playlist.lastModified
    };

    const trackList = result.tracks.map(track => ({
      id: track.id,
      index: track.index,
      name: track.name,
      artistName: track.artistName,
      albumName: track.albumName,
      durationMs: track.durationMs,
      duration: track.duration,
      artwork: track.artworkUrl ? {
        url: track.artworkUrl,
        urlLarge: track.artworkUrlLarge
      } : null,
      previewUrl: track.previewUrl,
      isrc: track.isrc,
      genreNames: track.genreNames,
      releaseDate: track.releaseDate,
      appleMusicUrl: track.appleMusicUrl,
      playlistId: result.playlist.id,
      playlistName: result.playlist.name
    }));

    return { playlist: playlistInfo, tracks: trackList, storefront };
  };

  // 添加播放列表（追加模式）
  const addPlaylists = useCallback(async (urlsInput) => {
    setLoading(true);
    setError(null);
    setLyricsResult(null);
    setLyricsProgress(null);

    // 分割多个 URL
    const urls = urlsInput
      .split(/[\n,]+/)
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      setError('请输入至少一个播放列表 URL');
      setLoading(false);
      return null;
    }

    // 检查重复
    const existingIds = new Set(playlists.map(p => p.playlist.id));
    const newResults = [];
    const errors = [];

    for (const url of urls) {
      try {
        console.log(`获取播放列表: ${url}`);

        const sfMatch = url.match(/music\.apple\.com\/([a-z]{2})\//);
        const storefront = sfMatch ? sfMatch[1] : 'cn';

        const result = await invoke('fetch_apple_music_playlist', {
          urlOrId: url
        });

        // 检查是否已存在
        if (existingIds.has(result.playlist.id)) {
          console.log(`播放列表已存在: ${result.playlist.name}`);
          continue;
        }

        console.log('获取成功:', result.playlist.name);
        newResults.push(convertPlaylistResult(result, storefront));
        existingIds.add(result.playlist.id);
      } catch (err) {
        console.error(`获取播放列表失败 (${url}):`, err);
        errors.push(`${url}: ${typeof err === 'string' ? err : err.message || '获取失败'}`);
      }
    }

    // 追加到现有列表
    if (newResults.length > 0) {
      setPlaylists(prev => [...prev, ...newResults]);
      // 如果是第一个播放列表，自动选中它
      if (playlists.length === 0 && newResults.length === 1) {
        setActivePlaylistId(newResults[0].playlist.id);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    setLoading(false);
    return newResults;
  }, [playlists]);

  // 移除单个播放列表
  const removePlaylist = useCallback((playlistId) => {
    setPlaylists(prev => {
      const newList = prev.filter(p => p.playlist.id !== playlistId);
      // 如果移除的是当前选中的，切换到第一个或 all
      if (activePlaylistId === playlistId) {
        if (newList.length === 1) {
          setActivePlaylistId(newList[0].playlist.id);
        } else if (newList.length > 1) {
          setActivePlaylistId('all');
        }
      }
      return newList;
    });
    setLyricsResult(null);
  }, [activePlaylistId]);

  // 清空所有播放列表
  const clearPlaylists = useCallback(() => {
    setPlaylists([]);
    setActivePlaylistId('all');
    setLyricsResult(null);
    setLyricsProgress(null);
    setError(null);
  }, []);

  // 去重状态
  const [dedupeEnabled, setDedupeEnabled] = useState(false);

  // 本地文件匹配状态 - 按播放列表存储
  // { [playlistId]: { localFiles: [], matchedTracks: [] } }
  const [localFilesMap, setLocalFilesMap] = useState({});

  // 计算重复歌曲信息
  const duplicateInfo = useCallback(() => {
    if (playlists.length < 2) {
      return { count: 0, duplicates: [] };
    }

    const allTracks = playlists.flatMap(p => p.tracks);
    const trackMap = new Map(); // id -> [track, track, ...]

    allTracks.forEach(t => {
      if (!trackMap.has(t.id)) {
        trackMap.set(t.id, []);
      }
      trackMap.get(t.id).push(t);
    });

    // 找出重复的歌曲（出现超过1次）
    const duplicates = [];
    trackMap.forEach((tracks, id) => {
      if (tracks.length > 1) {
        duplicates.push({
          id,
          name: tracks[0].name,
          artistName: tracks[0].artistName,
          artwork: tracks[0].artwork,
          count: tracks.length,
          playlists: tracks.map(t => t.playlistName)
        });
      }
    });

    return {
      count: duplicates.reduce((sum, d) => sum + d.count - 1, 0), // 重复的数量（总数 - 唯一数）
      duplicates
    };
  }, [playlists]);

  // 获取当前显示的歌曲
  const currentTracks = useCallback(() => {
    if (activePlaylistId === 'all') {
      // 合并所有播放列表的歌曲
      let allTracks = playlists.flatMap(p => p.tracks);

      // 如果开启去重，按歌曲 ID 去重（保留第一个出现的）
      if (dedupeEnabled) {
        const seen = new Set();
        allTracks = allTracks.filter(t => {
          if (seen.has(t.id)) {
            return false;
          }
          seen.add(t.id);
          return true;
        });
      }

      // 重新编号
      return allTracks.map((t, i) => ({ ...t, index: i + 1 }));
    }
    const found = playlists.find(p => p.playlist.id === activePlaylistId);
    return found ? found.tracks : [];
  }, [playlists, activePlaylistId, dedupeEnabled]);

  // 获取当前选中的播放列表信息
  const currentPlaylist = useCallback(() => {
    if (activePlaylistId === 'all') {
      const totalTracks = playlists.reduce((sum, p) => sum + p.tracks.length, 0);
      return {
        id: 'all',
        name: `全部播放列表 (${playlists.length})`,
        description: playlists.map(p => p.playlist.name).join('、'),
        curatorName: '',
        artwork: playlists[0]?.playlist.artwork || null,
        trackCount: totalTracks
      };
    }
    const found = playlists.find(p => p.playlist.id === activePlaylistId);
    return found?.playlist || null;
  }, [playlists, activePlaylistId]);

  // 批量下载歌词
  const downloadLyrics = useCallback(async () => {
    const mediaUserToken = getMediaUserToken();
    if (!mediaUserToken) {
      setError('请先设置 media-user-token');
      return null;
    }

    const tracks = currentTracks();
    const playlist = currentPlaylist();

    if (!tracks.length || !playlist) {
      setError('没有可下载的歌曲');
      return null;
    }

    const downloadsPath = await downloadDir();
    const playlistDirName = playlist.name.replace(/[/\\:*?"<>|]/g, '_');
    const outputDir = `${downloadsPath}${playlistDirName}`;

    const storefront = playlists[0]?.storefront || 'cn';

    setLyricsLoading(true);
    setLyricsResult(null);
    setLyricsProgress({ current: 0, total: tracks.length, songName: '', artistName: '', success: false });
    setError(null);

    try {
      console.log(`开始下载 ${tracks.length} 首歌词到 ${outputDir}`);

      const tracksForBackend = tracks.map(t => ({
        id: t.id,
        index: t.index,
        name: t.name,
        artistName: t.artistName,
        albumName: t.albumName,
        durationMs: t.durationMs,
        duration: t.duration,
        artworkUrl: t.artwork?.url || null,
        artworkUrlLarge: t.artwork?.urlLarge || null,
        previewUrl: t.previewUrl,
        isrc: t.isrc,
        genreNames: t.genreNames,
        releaseDate: t.releaseDate,
        appleMusicUrl: t.appleMusicUrl
      }));

      const result = await invoke('fetch_lyrics_batch', {
        mediaUserToken,
        tracks: tracksForBackend,
        storefront,
        outputDir
      });

      console.log('歌词下载完成:', result);
      setLyricsResult(result);
      return result;
    } catch (err) {
      console.error('下载歌词失败:', err);
      setError(typeof err === 'string' ? err : err.message || '下载失败');
      return null;
    } finally {
      setLyricsLoading(false);
    }
  }, [playlists, currentTracks, currentPlaylist, getMediaUserToken]);

  // 解析本地文件名: "3 梦醒时分 - 梁静茹.m4a" => { index, name, artist }
  const parseLocalFileName = (fileName) => {
    // 去掉扩展名
    const nameWithoutExt = fileName.replace(/\.(m4a|mp3|flac|wav)$/i, '');

    // 匹配格式: "序号 歌名 - 歌手" 或 "序号 歌名 feat xxx - 歌手"
    const match = nameWithoutExt.match(/^(\d+)\s+(.+?)\s+-\s+(.+)$/);
    if (match) {
      return {
        index: parseInt(match[1], 10),
        name: match[2].trim(),
        artist: match[3].trim()
      };
    }
    return null;
  };

  // 标准化字符串用于比较
  const normalizeString = (str) => {
    return str
      .toLowerCase()
      .replace(/[\s\-_''""`]/g, '')  // 去掉空格、连字符、引号等
      .replace(/feat\.?/gi, '')       // 去掉 feat
      .replace(/\(.*?\)/g, '')        // 去掉括号内容
      .replace(/（.*?）/g, '');       // 去掉中文括号内容
  };

  // 匹配本地文件和播放列表歌曲
  const matchLocalFiles = useCallback((playlistId, localFiles) => {
    const playlist = playlists.find(p => p.playlist.id === playlistId);
    if (!playlist) return [];

    const tracks = playlist.tracks;
    const matchedTracks = [];

    for (const track of tracks) {
      const normalizedTrackName = normalizeString(track.name);
      const normalizedTrackArtist = normalizeString(track.artistName);

      let matchedFile = null;
      let matchScore = 0;

      for (const file of localFiles) {
        const parsed = parseLocalFileName(file.name);
        if (!parsed) continue;

        const normalizedFileName = normalizeString(parsed.name);
        const normalizedFileArtist = normalizeString(parsed.artist);

        // 计算匹配分数
        let score = 0;

        // 歌名匹配
        if (normalizedTrackName === normalizedFileName) {
          score += 50;
        } else if (normalizedTrackName.includes(normalizedFileName) || normalizedFileName.includes(normalizedTrackName)) {
          score += 30;
        }

        // 歌手匹配 - 处理多歌手情况
        const trackArtists = normalizedTrackArtist.split(/[&,，]/);
        const fileArtists = normalizedFileArtist.split(/[&,，]/);

        for (const ta of trackArtists) {
          for (const fa of fileArtists) {
            if (ta.trim() === fa.trim()) {
              score += 30;
            } else if (ta.includes(fa) || fa.includes(ta)) {
              score += 15;
            }
          }
        }

        // 序号匹配（如果播放列表顺序和文件序号一致）
        if (parsed.index === track.index) {
          score += 20;
        }

        if (score > matchScore) {
          matchScore = score;
          matchedFile = { ...file, parsed, score };
        }
      }

      matchedTracks.push({
        ...track,
        localFile: matchScore >= 50 ? matchedFile : null,  // 至少要歌名匹配
        matchScore: matchScore >= 50 ? matchScore : 0
      });
    }

    return matchedTracks;
  }, [playlists]);

  // 设置播放列表的本地文件
  const setLocalFilesForPlaylist = useCallback((playlistId, files) => {
    const localFiles = files.map(f => ({
      name: f.name,
      path: f.path,
      size: f.size
    }));

    const matchedTracks = matchLocalFiles(playlistId, localFiles);

    setLocalFilesMap(prev => ({
      ...prev,
      [playlistId]: {
        localFiles,
        matchedTracks,
        dirPath: files[0]?.dirPath || ''
      }
    }));

    return matchedTracks;
  }, [matchLocalFiles]);

  // 获取当前播放列表的本地文件匹配信息
  const getCurrentLocalFiles = useCallback(() => {
    if (activePlaylistId === 'all') return null;
    return localFilesMap[activePlaylistId] || null;
  }, [activePlaylistId, localFilesMap]);

  // 检查是否所有播放列表都上传了本地文件
  const allPlaylistsHaveLocalFiles = useCallback(() => {
    if (playlists.length === 0) return false;
    return playlists.every(p => {
      const localInfo = localFilesMap[p.playlist.id];
      return localInfo && localInfo.matchedTracks && localInfo.matchedTracks.some(t => t.localFile);
    });
  }, [playlists, localFilesMap]);

  // 获取所有播放列表的匹配统计
  const getAllMatchedStats = useCallback(() => {
    let totalMatched = 0;
    let totalTracks = 0;
    const playlistStats = [];

    for (const p of playlists) {
      const localInfo = localFilesMap[p.playlist.id];
      const matched = localInfo?.matchedTracks?.filter(t => t.localFile)?.length || 0;
      const total = p.tracks.length;
      totalMatched += matched;
      totalTracks += total;
      playlistStats.push({
        playlistId: p.playlist.id,
        playlistName: p.playlist.name,
        matched,
        total,
        dirPath: localInfo?.dirPath || ''
      });
    }

    return { totalMatched, totalTracks, playlistStats };
  }, [playlists, localFilesMap]);

  // 清除播放列表的本地文件
  const clearLocalFilesForPlaylist = useCallback((playlistId) => {
    setLocalFilesMap(prev => {
      const newMap = { ...prev };
      delete newMap[playlistId];
      return newMap;
    });
  }, []);

  // 合并下载所有播放列表的歌曲到"全部"文件夹
  const [mergeDownloadLoading, setMergeDownloadLoading] = useState(false);
  const [mergeDownloadProgress, setMergeDownloadProgress] = useState(null);
  const [mergeDownloadResult, setMergeDownloadResult] = useState(null);

  // 监听合并下载进度事件
  useEffect(() => {
    const unlisten = listen('merge-download-progress', (event) => {
      setMergeDownloadProgress(event.payload);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  const mergeDownloadAll = useCallback(async () => {
    if (!allPlaylistsHaveLocalFiles()) {
      setError('请先为所有播放列表上传本地文件');
      return null;
    }

    const downloadsPath = await downloadDir();
    // 确保路径以 / 结尾
    const normalizedPath = downloadsPath.endsWith('/') ? downloadsPath : `${downloadsPath}/`;
    const outputDir = `${normalizedPath}全部`;

    // 收集所有播放列表的匹配文件信息
    const allFiles = [];
    for (const p of playlists) {
      const localInfo = localFilesMap[p.playlist.id];
      if (!localInfo?.matchedTracks) continue;

      const matchedTracks = localInfo.matchedTracks.filter(t => t.localFile);
      for (const track of matchedTracks) {
        // 获取原文件扩展名
        const originalName = track.localFile.name;
        const extMatch = originalName.match(/\.(m4a|mp3|flac|wav|aac)$/i);
        const extension = extMatch ? extMatch[0] : '.m4a';

        // 使用播放列表的歌曲信息生成新文件名：歌名 - 歌手名.扩展名
        const newFileName = `${track.name} - ${track.artistName}${extension}`;

        allFiles.push({
          trackId: track.id,
          trackName: track.name,
          artistName: track.artistName,
          albumName: track.albumName,
          playlistId: p.playlist.id,
          playlistName: p.playlist.name,
          sourcePath: track.localFile.path,
          fileName: newFileName
        });
      }
    }

    if (allFiles.length === 0) {
      setError('没有可下载的文件');
      return null;
    }

    setMergeDownloadLoading(true);
    setMergeDownloadResult(null);
    setMergeDownloadProgress({ current: 0, total: allFiles.length, fileName: '' });
    setError(null);

    try {
      console.log(`开始合并下载 ${allFiles.length} 个文件到 ${outputDir}`);

      const result = await invoke('merge_copy_files', {
        files: allFiles,
        outputDir
      });

      console.log('合并下载完成:', result);
      setMergeDownloadResult(result);
      return result;
    } catch (err) {
      console.error('合并下载失败:', err);
      setError(typeof err === 'string' ? err : err.message || '合并下载失败');
      return null;
    } finally {
      setMergeDownloadLoading(false);
    }
  }, [playlists, localFilesMap, allPlaylistsHaveLocalFiles]);

  // 内封歌词到本地文件
  const embedLyricsToFiles = useCallback(async (playlistId) => {
    const mediaUserToken = getMediaUserToken();
    if (!mediaUserToken) {
      setError('请先设置 media-user-token');
      return null;
    }

    const localFilesInfo = localFilesMap[playlistId];
    if (!localFilesInfo?.matchedTracks?.length) {
      setError('请先上传本地文件并完成匹配');
      return null;
    }

    // 获取已匹配的歌曲和对应的本地文件
    const matchedPairs = localFilesInfo.matchedTracks.filter(t => t.localFile);
    if (matchedPairs.length === 0) {
      setError('没有已匹配的歌曲');
      return null;
    }

    const playlist = playlists.find(p => p.playlist.id === playlistId);
    const storefront = playlist?.storefront || 'cn';

    setEmbedLyricsLoading(true);
    setEmbedLyricsResultMap(prev => {
      const newMap = { ...prev };
      delete newMap[playlistId];
      return newMap;
    });
    setEmbedLyricsProgress({ current: 0, total: matchedPairs.length, trackName: '', success: false });
    setError(null);

    try {
      console.log(`开始内封 ${matchedPairs.length} 首歌曲的歌词`);
      console.log('matchedPairs:', matchedPairs);

      // 准备 tracks 数据（后端格式）
      const tracksForBackend = matchedPairs.map(t => ({
        id: t.id,
        index: t.index,
        name: t.name,
        artistName: t.artistName,
        albumName: t.albumName,
        durationMs: t.durationMs,
        duration: t.duration,
        artworkUrl: t.artwork?.url || null,
        artworkUrlLarge: t.artwork?.urlLarge || null,
        previewUrl: t.previewUrl,
        isrc: t.isrc,
        genreNames: t.genreNames,
        releaseDate: t.releaseDate,
        appleMusicUrl: t.appleMusicUrl
      }));

      // 准备 localFiles 数据（后端格式）
      const localFilesForBackend = matchedPairs.map(t => ({
        fileName: t.localFile?.name || '',
        filePath: t.localFile?.path || '',
        fileSize: t.localFile?.size || 0,
        extension: t.localFile?.name?.split('.').pop().toLowerCase() || ''
      }));

      console.log('tracksForBackend:', tracksForBackend);
      console.log('localFilesForBackend:', localFilesForBackend);

      const result = await invoke('fetch_and_embed_lyrics', {
        mediaUserToken,
        tracks: tracksForBackend,
        localFiles: localFilesForBackend,
        storefront
      });

      console.log('内封歌词完成:', result);
      setEmbedLyricsResultMap(prev => ({
        ...prev,
        [playlistId]: result
      }));
      return result;
    } catch (err) {
      console.error('内封歌词失败:', err);
      setError(typeof err === 'string' ? err : err.message || '内封失败');
      return null;
    } finally {
      setEmbedLyricsLoading(false);
    }
  }, [playlists, localFilesMap, getMediaUserToken, setError]);

  // 导出为 CSV
  const exportToCSV = useCallback(() => {
    const tracks = currentTracks();
    const playlist = currentPlaylist();
    if (!tracks.length) return;

    const headers = ['序号', '歌曲名', '歌手', '专辑', '时长', '类型', 'ISRC', 'Apple Music URL', '所属播放列表'];
    const rows = tracks.map(track => [
      track.index,
      `"${track.name.replace(/"/g, '""')}"`,
      `"${track.artistName.replace(/"/g, '""')}"`,
      `"${track.albumName.replace(/"/g, '""')}"`,
      track.duration,
      `"${track.genreNames.join(', ')}"`,
      track.isrc || '',
      track.appleMusicUrl || '',
      `"${track.playlistName || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist?.name || 'playlist'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentTracks, currentPlaylist]);

  return {
    loading,
    error,
    setError,
    // 多播放列表
    playlists,
    activePlaylistId,
    setActivePlaylistId,
    currentTracks: currentTracks(),
    currentPlaylist: currentPlaylist(),
    addPlaylists,
    removePlaylist,
    clearPlaylists,
    exportToCSV,
    // 去重
    dedupeEnabled,
    setDedupeEnabled,
    duplicateInfo: duplicateInfo(),
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
    getCurrentLocalFiles: getCurrentLocalFiles(),
    clearLocalFilesForPlaylist,
    allPlaylistsHaveLocalFiles: allPlaylistsHaveLocalFiles(),
    getAllMatchedStats: getAllMatchedStats(),
    // 内封歌词
    embedLyricsLoading,
    embedLyricsProgress,
    embedLyricsResult: activePlaylistId !== 'all' ? embedLyricsResultMap[activePlaylistId] : null,
    embedLyricsToFiles,
    // 合并下载
    mergeDownloadLoading,
    mergeDownloadProgress,
    mergeDownloadResult,
    mergeDownloadAll
  };
}
