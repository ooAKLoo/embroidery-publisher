import { useState, useRef } from 'react';

const positions = [
  { id: 'top-left', label: '左上' },
  { id: 'top-center', label: '上中' },
  { id: 'top-right', label: '右上' },
  { id: 'center-left', label: '左中' },
  { id: 'center', label: '居中' },
  { id: 'center-right', label: '右中' },
  { id: 'bottom-left', label: '左下' },
  { id: 'bottom-center', label: '下中' },
  { id: 'bottom-right', label: '右下' },
];

const getPositionStyle = (posId) => {
  const styles = {
    'top-left': 'top-2 left-2',
    'top-center': 'top-2 left-1/2 -translate-x-1/2',
    'top-right': 'top-2 right-2',
    'center-left': 'top-1/2 left-2 -translate-y-1/2',
    'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'center-right': 'top-1/2 right-2 -translate-y-1/2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-center': 'bottom-2 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-2 right-2',
  };
  return styles[posId] || styles['bottom-right'];
};

export default function WatermarkModal({ isOpen, onClose, settings, setSettings }) {
  const [activeTab, setActiveTab] = useState(settings.watermarkType || 'text');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({
          ...prev,
          watermarkImage: reader.result,
          watermarkType: 'image'
        }));
        setActiveTab('image');
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal 内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">水印设置</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6">
            {/* 左侧：设置项 */}
            <div className="flex-1 space-y-6">
              {/* 启用开关 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">启用水印</h3>
                  <p className="text-sm text-slate-500">在发布的图片上添加水印</p>
                </div>
                <button
                  onClick={() => updateSetting('addWatermark', !settings.addWatermark)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    settings.addWatermark ? 'bg-blue-500' : 'bg-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    settings.addWatermark ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {settings.addWatermark && (
                <>
                  {/* 水印类型选择 */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-slate-800">水印类型</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('text');
                          updateSetting('watermarkType', 'text');
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                          activeTab === 'text'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        文字水印
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('image');
                          updateSetting('watermarkType', 'image');
                        }}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                          activeTab === 'image'
                            ? 'bg-blue-500 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        图片水印
                      </button>
                    </div>
                  </div>

                  {/* 文字水印设置 */}
                  {activeTab === 'text' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">水印文字</label>
                        <input
                          type="text"
                          value={settings.watermarkText || ''}
                          onChange={(e) => updateSetting('watermarkText', e.target.value)}
                          placeholder="例如：© Your Brand"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-slate-700">字体大小</label>
                          <span className="text-sm text-slate-500">{settings.watermarkFontSize || 14}px</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="32"
                          step="1"
                          value={settings.watermarkFontSize || 14}
                          onChange={(e) => updateSetting('watermarkFontSize', Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">文字颜色</label>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(8, 1fr)',
                            gap: '0.35rem',
                          }}
                        >
                          {[
                            '#FFFFFF', '#000000', '#FF0000', '#FF6B00',
                            '#FFD600', '#00C853', '#0066FF', '#AA00FF',
                            '#E0E0E0', '#424242', '#FF5252', '#FF9100',
                            '#FFEA00', '#69F0AE', '#448AFF', '#E040FB'
                          ].map(color => (
                            <button
                              key={color}
                              onClick={() => updateSetting('watermarkColor', color)}
                              style={{
                                width: '1.75rem',
                                height: '1.75rem',
                                backgroundColor: color,
                                borderRadius: '50%',
                                border: (settings.watermarkColor || '#FFFFFF') === color
                                  ? '3px solid #000'
                                  : '2px solid white',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                          ))}
                          {/* Custom color picker */}
                          <label
                            style={{
                              width: '1.75rem',
                              height: '1.75rem',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
                              border: '2px solid white',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              overflow: 'hidden',
                            }}
                          >
                            <span style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>+</span>
                            <input
                              type="color"
                              value={settings.watermarkColor || '#FFFFFF'}
                              onChange={(e) => updateSetting('watermarkColor', e.target.value)}
                              style={{
                                position: 'absolute',
                                inset: 0,
                                opacity: 0,
                                cursor: 'pointer',
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 图片水印设置 */}
                  {activeTab === 'image' && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">上传水印图片</label>
                        <p className="text-xs text-slate-500">支持 PNG（推荐透明背景）、SVG 格式</p>
                      </div>

                      {settings.watermarkImage ? (
                        <div className="relative">
                          <div className="p-4 bg-slate-100 rounded-lg flex items-center justify-center">
                            <img
                              src={settings.watermarkImage}
                              alt="水印预览"
                              className="max-h-20 object-contain"
                            />
                          </div>
                          <button
                            onClick={() => updateSetting('watermarkImage', null)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-8 border-2 border-dashed border-slate-300 rounded-lg hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                        >
                          <div className="flex flex-col items-center gap-2 text-slate-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">点击上传水印图片</span>
                          </div>
                        </button>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/svg+xml"
                        onChange={handleImageUpload}
                        className="hidden"
                      />

                      {settings.watermarkImage && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">水印大小</label>
                          <select
                            value={settings.watermarkSize || 'medium'}
                            onChange={(e) => updateSetting('watermarkSize', e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="small">小</option>
                            <option value="medium">中</option>
                            <option value="large">大</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 透明度 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-slate-700">透明度</label>
                      <span className="text-sm text-slate-500">{Math.round((settings.watermarkOpacity || 0.8) * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={settings.watermarkOpacity || 0.8}
                      onChange={(e) => updateSetting('watermarkOpacity', parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* 位置选择 */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">水印位置</label>
                    <div className="grid grid-cols-3 gap-2">
                      {positions.map(pos => (
                        <button
                          key={pos.id}
                          onClick={() => updateSetting('watermarkPosition', pos.id)}
                          className={`py-2 px-3 rounded-lg text-sm transition-all ${
                            (settings.watermarkPosition || 'bottom-right') === pos.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {pos.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 右侧：预览 */}
            <div className="w-64 flex-shrink-0">
              <h3 className="text-sm font-medium text-slate-700 mb-3">预览</h3>
              <div className="aspect-square bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl overflow-hidden relative">
                {/* 模拟图片 */}
                <div className="absolute inset-4 bg-slate-100 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {/* 水印预览 */}
                {settings.addWatermark && (
                  <div
                    className={`absolute ${getPositionStyle(settings.watermarkPosition || 'bottom-right')}`}
                    style={{ opacity: settings.watermarkOpacity || 0.8 }}
                  >
                    {(settings.watermarkType || 'text') === 'text' ? (
                      <span
                        className="text-shadow"
                        style={{
                          fontSize: `${(settings.watermarkFontSize || 14) * 0.8}px`,
                          color: settings.watermarkColor || '#FFFFFF',
                          textShadow: settings.watermarkColor === '#FFFFFF' ? '0 1px 2px rgba(0,0,0,0.5)' : 'none'
                        }}
                      >
                        {settings.watermarkText || '© Your Brand'}
                      </span>
                    ) : settings.watermarkImage ? (
                      <img
                        src={settings.watermarkImage}
                        alt="水印"
                        className={`object-contain ${
                          settings.watermarkSize === 'small' ? 'h-4' :
                          settings.watermarkSize === 'large' ? 'h-10' : 'h-6'
                        }`}
                      />
                    ) : (
                      <span className="text-xs text-white bg-black/30 px-1 rounded">水印</span>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-2 text-center">
                实际效果以发布后为准
              </p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
          >
            取消
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
