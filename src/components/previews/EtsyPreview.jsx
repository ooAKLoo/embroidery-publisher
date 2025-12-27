import MediaCarousel from './MediaCarousel';

export default function EtsyPreview({ images, text, accountProfile }) {
  // 从文案中提取第一行作为标题
  const lines = text?.split('\n') || [];
  const title = lines[0] || '';
  const description = lines.slice(1).join('\n').trim();

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-w-lg mx-auto">
      {/* Product Image */}
      <div className="relative">
        <MediaCarousel media={images} aspectRatio="aspect-[4/5]" />
        {/* Favorite Button */}
        <button className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:scale-105 transition-transform">
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Shop Info */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-rose-400 to-amber-300">
            {accountProfile.avatar ? (
              <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                {accountProfile.displayName?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
          <span className="text-xs text-slate-500">{accountProfile.displayName}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-slate-800 line-clamp-2 mb-2 min-h-[40px]">
          {title || <span className="text-slate-400">产品标题</span>}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-lg font-bold text-slate-900">$299.00</span>
          <span className="text-xs text-slate-400 line-through">$399.00</span>
          <span className="text-xs text-green-600 font-medium">25% off</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(i => (
              <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-xs text-slate-500">(128 reviews)</span>
        </div>

        {/* Shipping */}
        <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>Free shipping</span>
        </div>

        {/* Description Preview */}
        {description && (
          <p className="text-xs text-slate-500 line-clamp-3 border-t border-slate-100 pt-3">
            {description}
          </p>
        )}
      </div>

      {/* Add to Cart Button */}
      <div className="px-4 pb-4">
        <button className="w-full py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition-colors">
          Add to cart
        </button>
      </div>
    </div>
  );
}
