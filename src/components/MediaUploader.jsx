import { useCallback, useRef } from 'react';

export default function MediaUploader({ images, setImages, settings }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  }, [setImages]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: event.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, [setImages]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const removeImage = useCallback((id) => {
    setImages(prev => prev.filter(img => img.id !== id));
  }, [setImages]);

  const moveImage = useCallback((fromIndex, toIndex) => {
    setImages(prev => {
      const newImages = [...prev];
      const [removed] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, removed);
      return newImages;
    });
  }, [setImages]);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-700">媒体素材</h3>
        <span className="text-xs text-slate-400">{images.length}/10 张</span>
      </div>

      {/* 上传区域 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${images.length === 0
            ? 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/50'
            : 'border-slate-200 hover:border-slate-300'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {images.length === 0 ? (
          <>
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-slate-600">拖拽图片到此处，或点击上传</p>
            <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG，建议上传高清大图</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">点击或拖拽添加更多图片</p>
        )}
      </div>

      {/* 图片预览列表 */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100"
            >
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-full object-cover"
              />

              {/* 水印标识 */}
              {settings.addWatermark && (
                <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1 rounded">
                  水印
                </div>
              )}

              {/* 序号 */}
              <div className="absolute top-1 left-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">{index + 1}</span>
              </div>

              {/* 操作按钮 */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); moveImage(index, index - 1); }}
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white"
                    title="前移"
                  >
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                  className="p-1.5 bg-red-500 rounded-full hover:bg-red-600"
                  title="删除"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {index < images.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); moveImage(index, index + 1); }}
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white"
                    title="后移"
                  >
                    <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 提示信息 */}
      {images.length > 0 && settings.generateDetails && (
        <p className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
          将自动为第一张图生成4张局部细节图，用于展示刺绣工艺
        </p>
      )}
    </div>
  );
}
