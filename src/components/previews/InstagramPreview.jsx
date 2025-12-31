import MediaCarousel from './MediaCarousel';

export default function InstagramPreview({ images, text, accountProfile }) {
  return (
    <div className="bg-[#F8F8F8] rounded-2xl overflow-hidden w-full max-w-xs">
      {/* Header */}
      <div className="flex items-center gap-3 p-3">
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
        <p className="text-sm">
          <span className="font-semibold">{accountProfile.username}</span>{' '}
          <span className="text-slate-700 whitespace-pre-wrap">{text || <span className="text-slate-400">暂无文案</span>}</span>
        </p>
        <p className="text-xs text-slate-400 mt-2">2 HOURS AGO</p>
      </div>
    </div>
  );
}
