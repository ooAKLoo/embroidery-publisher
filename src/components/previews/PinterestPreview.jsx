import MediaCarousel from './MediaCarousel';

export default function PinterestPreview({ images, text, title, accountProfile }) {
  return (
    <div className="bg-[#F8F8F8] rounded-2xl overflow-hidden w-full max-w-[200px]">
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
        <h3 className="text-base text-slate-900 font-semibold">
          {title || <span className="text-slate-400">暂无标题</span>}
        </h3>
        <p className="text-sm text-slate-600 whitespace-pre-wrap mt-2 min-h-[40px]">
          {text || <span className="text-slate-400">暂无描述</span>}
        </p>

        {/* Author */}
        <div className="flex items-center gap-2 mt-3 pt-3">
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
