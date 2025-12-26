import { useState, useRef, useEffect } from 'react';

// 格式化视频时长
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// 媒体轮播组件 - 支持多图和视频
function MediaCarousel({ media, aspectRatio = 'aspect-square', showControls = true }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const currentMedia = media[currentIndex];
  const isVideo = currentMedia?.type === 'video';
  const hasMultiple = media.length > 1;

  useEffect(() => {
    setCurrentIndex(0);
    setIsPlaying(false);
    setProgress(0);
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      video.currentTime = 0;
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, isVideo]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
    setProgress(percent * 100);
  };

  const goToPrev = () => {
    setCurrentIndex(prev => (prev === 0 ? media.length - 1 : prev - 1));
    setIsPlaying(false);
    setProgress(0);
  };

  const goToNext = () => {
    setCurrentIndex(prev => (prev === media.length - 1 ? 0 : prev + 1));
    setIsPlaying(false);
    setProgress(0);
  };

  if (media.length === 0) {
    return (
      <div className={`${aspectRatio} bg-slate-100 flex items-center justify-center text-slate-300`}>
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`${aspectRatio} bg-slate-900 relative group overflow-hidden`}>
      {/* 媒体内容 */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={currentMedia.preview}
          className="w-full h-full object-cover"
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />
      ) : (
        <img
          src={currentMedia.preview}
          alt=""
          className="w-full h-full object-cover"
        />
      )}

      {/* 视频播放控制 */}
      {isVideo && showControls && (
        <>
          {/* 中央播放按钮 */}
          {!isPlaying && (
            <div
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/60 transition-colors">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}

          {/* 底部控制栏 */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 进度条 */}
            <div
              className="h-1 bg-white/30 rounded-full cursor-pointer mb-2"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={togglePlay} className="text-white hover:text-white/80">
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-white/80">
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                <span className="text-white text-xs">
                  {formatDuration(videoRef.current?.currentTime || 0)} / {formatDuration(currentMedia.duration)}
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 多图轮播控制 */}
      {hasMultiple && showControls && (
        <>
          {/* 左右箭头 */}
          <button
            onClick={goToPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* 底部指示器 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {media.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsPlaying(false);
                  setProgress(0);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-4'
                    : 'bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>

          {/* 右上角计数 */}
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1}/{media.length}
          </div>
        </>
      )}

      {/* 单个视频的右上角标识 */}
      {isVideo && !hasMultiple && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span>视频</span>
        </div>
      )}
    </div>
  );
}

// 品牌图标组件
const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const PinterestIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

const platforms = [
  { id: 'instagram', name: 'Instagram', Icon: InstagramIcon, gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', limit: 2200 },
  { id: 'facebook', name: 'Facebook', Icon: FacebookIcon, activeColor: '#1877F2', limit: 63206 },
  { id: 'twitter', name: 'X', Icon: XIcon, activeColor: '#000000', limit: 280 },
  { id: 'pinterest', name: 'Pinterest', Icon: PinterestIcon, activeColor: '#E60023', limit: 500 },
];

function InstagramPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-[2px]">
          <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden">
            {accountProfile.avatar ? (
              <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover rounded-full" />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-rose-400 to-amber-300 flex items-center justify-center text-white text-xs font-bold">
                {accountProfile.displayName?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{accountProfile.username}</p>
          <p className="text-xs text-slate-400">Sponsored</p>
        </div>
        <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
        </svg>
      </div>

      {/* Media Carousel */}
      <MediaCarousel media={images} aspectRatio="aspect-square" />

      {/* Actions */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </div>

      {/* Likes */}
      <div className="px-3 pb-2">
        <p className="text-sm font-semibold">1,234 likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <div className="flex gap-1">
          <span className="text-sm font-semibold">{accountProfile.username}</span>
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="输入Instagram文案..."
            className="flex-1 text-sm text-slate-700 resize-none border-0 focus:ring-0 p-0 min-h-[40px]"
            rows={2}
          />
        </div>
        <textarea
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="#hashtags"
          className="w-full text-sm text-blue-500 resize-none border-0 focus:ring-0 p-0 mt-1"
          rows={2}
        />
        <p className="text-xs text-slate-400 mt-2">2 HOURS AGO</p>
      </div>
    </div>
  );
}

function FacebookPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-amber-300">
          {accountProfile.avatar ? (
            <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {accountProfile.displayName?.charAt(0) || 'Y'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[15px]">{accountProfile.displayName}</p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Just now</span>
            <span>·</span>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
          </div>
        </div>
        <svg className="w-6 h-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
        </svg>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="输入Facebook文案...（可以是长篇故事）"
          className="w-full text-[15px] text-slate-800 resize-none border-0 focus:ring-0 p-0 min-h-[60px]"
          rows={3}
        />
        <textarea
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="#hashtags"
          className="w-full text-[15px] text-blue-600 resize-none border-0 focus:ring-0 p-0 mt-1"
          rows={1}
        />
      </div>

      {/* Media Carousel */}
      <MediaCarousel media={images} aspectRatio="aspect-video" />

      {/* Engagement Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500 border-b">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <span>256</span>
        </div>
        <span>45 comments · 12 shares</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around py-1 border-b">
        <button className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg flex-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span className="text-sm font-medium">Like</span>
        </button>
        <button className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg flex-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-lg flex-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}

function TwitterPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  const fullText = text + (tags ? '\n' + tags : '');
  const remaining = 280 - fullText.length;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-md mx-auto p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 flex-shrink-0 overflow-hidden">
          {accountProfile.avatar ? (
            <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {accountProfile.displayName?.charAt(0) || 'Y'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-bold text-[15px]">{accountProfile.displayName}</span>
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-.115-.094-2.415-2.415c-.293-.293-.293-.768 0-1.06s.768-.294 1.06 0l1.77 1.767 3.825-5.74c.23-.345.696-.436 1.04-.207.346.23.44.696.21 1.04z" />
            </svg>
            <span className="text-slate-500 text-[15px]">@{accountProfile.username}</span>
            <span className="text-slate-500">·</span>
            <span className="text-slate-500 text-[15px]">2h</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="输入推文...（限280字符）"
            className="w-full text-[15px] text-slate-900 resize-none border-0 focus:ring-0 p-0 mt-1 min-h-[40px]"
            rows={2}
          />
          <textarea
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="#hashtags (1-2个)"
            className="w-full text-[15px] text-blue-500 resize-none border-0 focus:ring-0 p-0"
            rows={1}
          />

          {/* Media - Twitter 网格布局 */}
          {images.length > 0 && (
            <div className="mt-3 rounded-2xl overflow-hidden border border-slate-200">
              {images.length === 1 ? (
                // 单张：16:9 视频或图片
                images[0].type === 'video' ? (
                  <div className="aspect-[16/9] relative group bg-black">
                    <video
                      src={images[0].preview}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  </div>
                ) : (
                  <img src={images[0].preview} alt="" className="w-full aspect-[16/9] object-cover" />
                )
              ) : images.length === 2 ? (
                // 2张：左右各一半，整体 16:9
                <div className="flex aspect-[16/9] gap-0.5">
                  {images.slice(0, 2).map((img, i) => (
                    <div key={img.id || i} className="flex-1 relative overflow-hidden">
                      {img.type === 'video' ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <img src={img.thumbnail} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              ) : images.length === 3 ? (
                // 3张：左边大图占一半，右边两张各占一半高度，整体 16:9
                <div className="flex aspect-[16/9] gap-0.5">
                  <div className="w-1/2 relative overflow-hidden">
                    {images[0].type === 'video' ? (
                      <div className="w-full h-full bg-black">
                        <img src={images[0].thumbnail} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="w-1/2 flex flex-col gap-0.5">
                    {images.slice(1, 3).map((img, i) => (
                      <div key={img.id || i} className="flex-1 relative overflow-hidden">
                        {img.type === 'video' ? (
                          <div className="w-full h-full bg-black">
                            <img src={img.thumbnail} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // 4张及以上：2x2 网格，整体 16:9
                <div className="grid grid-cols-2 grid-rows-2 aspect-[16/9] gap-0.5">
                  {images.slice(0, 4).map((img, i) => (
                    <div key={img.id || i} className="relative overflow-hidden">
                      {img.type === 'video' ? (
                        <div className="w-full h-full bg-black">
                          <img src={img.thumbnail} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      )}
                      {/* 超过4张时显示 +N */}
                      {i === 3 && images.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">+{images.length - 4}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-3 flex items-center justify-between text-slate-500 max-w-[350px]">
            <button className="flex items-center gap-1 hover:text-blue-500 group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs">28</span>
            </button>
            <button className="flex items-center gap-1 hover:text-green-500 group">
              <div className="p-2 rounded-full group-hover:bg-green-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <span className="text-xs">156</span>
            </button>
            <button className="flex items-center gap-1 hover:text-pink-500 group">
              <div className="p-2 rounded-full group-hover:bg-pink-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xs">1.2K</span>
            </button>
            <button className="flex items-center gap-1 hover:text-blue-500 group">
              <div className="p-2 rounded-full group-hover:bg-blue-50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </div>
            </button>
            <div className="flex items-center">
              <span className={`text-xs font-medium ${remaining < 0 ? 'text-red-500' : remaining < 20 ? 'text-amber-500' : 'text-slate-400'}`}>
                {remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PinterestPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg max-w-xs mx-auto">
      {/* Media - Pinterest uses 2:3 ratio */}
      <div className="relative">
        <MediaCarousel media={images} aspectRatio="aspect-[2/3]" />

        {/* Save Button */}
        <button className="absolute top-3 right-3 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full text-sm shadow-lg">
          Save
        </button>

        {/* Bottom Actions */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </button>
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow-lg">
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Pin标题和描述...（关键词很重要）"
          className="w-full text-base text-slate-900 resize-none border-0 focus:ring-0 p-0 font-semibold min-h-[40px]"
          rows={2}
        />
        <textarea
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="关键词（搜索导向）"
          className="w-full text-sm text-slate-600 resize-none border-0 focus:ring-0 p-0 mt-2"
          rows={1}
        />

        {/* Author */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-amber-300">
            {accountProfile?.avatar ? (
              <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {accountProfile?.displayName?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-slate-700">{accountProfile?.displayName || 'Your Name'}</span>
        </div>
      </div>
    </div>
  );
}

export default function PlatformPreview({
  activePlatform,
  setActivePlatform,
  images,
  platformTexts,
  platformTags,
  updatePlatformText,
  updatePlatformTags,
  accountProfile
}) {
  const currentPlatform = platforms.find(p => p.id === activePlatform);
  const currentText = platformTexts[activePlatform] || '';
  const currentTags = platformTags[activePlatform] || '';
  const charCount = currentText.length + currentTags.length;

  return (
    <div className="flex flex-col h-full">
      {/* Platform Tabs */}
      <div className="flex items-center gap-3 p-4 bg-white border-b border-slate-200">
        {platforms.map(platform => {
          const Icon = platform.Icon;
          const isActive = activePlatform === platform.id;
          return (
            <button
              key={platform.id}
              onClick={() => setActivePlatform(platform.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'shadow-md scale-105 text-white'
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }
              `}
              style={isActive ? {
                background: platform.gradient || platform.activeColor,
              } : {}}
            >
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{platform.name}</span>
            </button>
          );
        })}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activePlatform === 'instagram' && (
          <InstagramPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('instagram', text)}
            onTagsChange={(tags) => updatePlatformTags('instagram', tags)}
            accountProfile={accountProfile}
          />
        )}
        {activePlatform === 'facebook' && (
          <FacebookPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('facebook', text)}
            onTagsChange={(tags) => updatePlatformTags('facebook', tags)}
            accountProfile={accountProfile}
          />
        )}
        {activePlatform === 'twitter' && (
          <TwitterPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('twitter', text)}
            onTagsChange={(tags) => updatePlatformTags('twitter', tags)}
            accountProfile={accountProfile}
          />
        )}
        {activePlatform === 'pinterest' && (
          <PinterestPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('pinterest', text)}
            onTagsChange={(tags) => updatePlatformTags('pinterest', tags)}
            accountProfile={accountProfile}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {currentPlatform?.name} - {charCount}/{currentPlatform?.limit} 字符
        </span>
        {charCount > (currentPlatform?.limit || 0) && (
          <span className="text-xs text-red-500 font-medium">
            超出限制 {charCount - (currentPlatform?.limit || 0)} 字符
          </span>
        )}
      </div>
    </div>
  );
}
