export default function TikTokPreview({ images, text, accountProfile }) {
  const video = images.find(m => m.type === 'video');

  return (
    <div className="bg-black rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-w-sm mx-auto aspect-[9/16] relative">
      {/* Video Background */}
      {video ? (
        <video
          src={video.preview}
          className="w-full h-full object-cover"
          muted
          playsInline
          loop
        />
      ) : (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center">
          <div className="text-center text-white/50">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">需要上传视频</p>
          </div>
        </div>
      )}

      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <span className="text-white text-sm font-medium">关注</span>
          <div className="flex items-center gap-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right side actions */}
        <div className="absolute right-2 bottom-20 flex flex-col items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            <div className="w-9 h-9 rounded-full border border-white overflow-hidden bg-gradient-to-br from-rose-400 to-amber-300">
              {accountProfile?.avatar ? (
                <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                  {accountProfile?.displayName?.charAt(0) || 'Y'}
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#FE2C55] rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">+</span>
            </div>
          </div>

          {/* Like */}
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span className="text-white text-[10px]">12.5K</span>
          </div>

          {/* Comment */}
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="text-white text-[10px]">328</span>
          </div>

          {/* Bookmark */}
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z"/>
            </svg>
            <span className="text-white text-[10px]">收藏</span>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-0.5">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-white text-[10px]">分享</span>
          </div>

          {/* Music disc */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 flex items-center justify-center animate-spin" style={{ animationDuration: '3s' }}>
            <div className="w-3 h-3 rounded-full bg-slate-400" />
          </div>
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-4 left-3 right-14">
          <p className="text-white font-semibold text-sm mb-1">@{accountProfile?.username || 'username'}</p>
          <p className="text-white text-sm whitespace-pre-wrap">
            {text || <span className="text-white/50">暂无文案</span>}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4">
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="text-white text-xs">原声 - {accountProfile?.displayName || 'Your Name'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
