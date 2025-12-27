export default function TwitterPreview({ images, text, accountProfile }) {
  const remaining = 280 - text.length;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] max-w-lg mx-auto p-4">
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

          <p className="text-[15px] text-slate-900 whitespace-pre-wrap mt-1 min-h-[40px]">
            {text || <span className="text-slate-400">暂无文案</span>}
          </p>

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
