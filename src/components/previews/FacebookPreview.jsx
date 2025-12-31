import MediaCarousel from './MediaCarousel';

export default function FacebookPreview({ images, text, accountProfile }) {
  return (
    <div className="bg-[#F8F8F8] rounded-2xl overflow-hidden w-full max-w-xs">
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
        <p className="text-[15px] text-slate-800 whitespace-pre-wrap min-h-[40px]">
          {text || <span className="text-slate-400">暂无文案</span>}
        </p>
      </div>

      {/* Media Carousel */}
      <MediaCarousel media={images} aspectRatio="aspect-video" />

      {/* Engagement Stats */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-slate-500">
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
      <div className="flex items-center justify-around py-1">
        <button className="flex items-center justify-center gap-2 text-slate-600 hover:bg-[#F8F8F8] px-4 py-2 rounded-lg flex-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          <span className="text-sm font-medium">Like</span>
        </button>
        <button className="flex items-center justify-center gap-2 text-slate-600 hover:bg-[#F8F8F8] px-4 py-2 rounded-lg flex-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm font-medium">Comment</span>
        </button>
        <button className="flex items-center justify-center gap-2 text-slate-600 hover:bg-[#F8F8F8] px-4 py-2 rounded-lg flex-1">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
