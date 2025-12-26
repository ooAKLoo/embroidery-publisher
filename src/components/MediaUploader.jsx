import { useCallback, useRef, useState } from 'react';
import WatermarkModal from './WatermarkModal';

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const getWatermarkPositionClass = (posId) => {
  const styles = {
    'top-left': 'top-1 left-1',
    'top-center': 'top-1 left-1/2 -translate-x-1/2',
    'top-right': 'top-1 right-1',
    'center-left': 'top-1/2 left-1 -translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'center-right': 'top-1/2 right-1 -translate-y-1/2',
    'bottom-left': 'bottom-1 left-1',
    'bottom-center': 'bottom-1 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-1 right-1',
  };
  return styles[posId] || styles['bottom-right'];
};

export default function MediaUploader({ images, setImages, settings, setSettings }) {
  const fileInputRef = useRef(null);
  const [showWatermarkModal, setShowWatermarkModal] = useState(false);

  const processFile = useCallback((file) => {
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');

    if (!isVideo && !isImage) return;

    if (isVideo) {
      // 对于视频，创建 blob URL 用于预览
      const videoUrl = URL.createObjectURL(file);
      // 生成视频缩略图
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;

      video.onloadeddata = () => {
        video.currentTime = 1; // 跳到第1秒截取封面
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnail = canvas.toDataURL('image/jpeg');

        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: videoUrl,
          thumbnail,
          name: file.name,
          type: 'video',
          duration: video.duration
        }]);
      };
    } else {
      // 对于图片，使用 FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          file,
          preview: event.target.result,
          name: file.name,
          type: 'image'
        }]);
      };
      reader.readAsDataURL(file);
    }
  }, [setImages]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    files.forEach(processFile);
    e.target.value = '';
  }, [processFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile]);

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
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-0 flex-shrink-0">
        <h3 className="font-medium text-slate-700">媒体素材</h3>
        <span className="text-xs text-slate-400">{images.length}/10 张</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-3">

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
          accept="image/*,video/*"
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
            <p className="text-sm text-slate-600">拖拽图片或视频到此处，或点击上传</p>
            <p className="text-xs text-slate-400 mt-1">支持 JPG、PNG、MP4，建议上传高清素材</p>
          </>
        ) : (
          <p className="text-sm text-slate-500">点击或拖拽添加更多素材</p>
        )}
      </div>

      {/* 媒体预览列表 */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((media, index) => (
            <div
              key={media.id}
              className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100"
            >
              {media.type === 'video' ? (
                <img
                  src={media.thumbnail}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={media.preview}
                  alt={media.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* 视频标识和时长 */}
              {media.type === 'video' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {formatDuration(media.duration)}
                  </div>
                </>
              )}

              {/* 水印标识 */}
              {settings.addWatermark && media.type !== 'video' && (
                <div
                  className={`absolute ${getWatermarkPositionClass(settings.watermarkPosition)} pointer-events-none`}
                  style={{ opacity: settings.watermarkOpacity || 0.8 }}
                >
                  {settings.watermarkType === 'image' && settings.watermarkImage ? (
                    <img src={settings.watermarkImage} alt="" className="h-3 object-contain" />
                  ) : (
                    <span
                      className="text-[8px] whitespace-nowrap"
                      style={{
                        color: settings.watermarkColor || '#FFFFFF',
                        textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {settings.watermarkText || '© Brand'}
                    </span>
                  )}
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
                  onClick={(e) => { e.stopPropagation(); removeImage(media.id); }}
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

      </div>

      {/* 水印设置 - 固定在底部 */}
      <div className="flex-shrink-0 px-4 border-t border-slate-100">
        <button
          onClick={() => setShowWatermarkModal(true)}
          className="w-full flex items-center justify-between py-3 text-sm text-slate-600 hover:text-slate-800"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <span>水印设置</span>
            {settings.addWatermark && (
              <span className="text-xs text-slate-400">
                · {settings.watermarkType === 'image' ? '图片水印' : (settings.watermarkText || '文字水印')}
              </span>
            )}
          </div>
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 水印设置 Modal */}
      <WatermarkModal
        isOpen={showWatermarkModal}
        onClose={() => setShowWatermarkModal(false)}
        settings={settings}
        setSettings={setSettings}
      />
    </div>
  );
}
