import { useState, useEffect, useRef } from 'react';
import { LOGO_TYPES, getLogoType } from './constants/logoTypes';
import CategoryNav from './components/CategoryNav';
import PreviewToolbar from './components/PreviewToolbar';
import ControlTabs from './components/ControlTabs';

export default function GeometricLogoGenerator() {
  const [activeType, setActiveType] = useState('platonic');
  const [globalColors, setGlobalColors] = useState(['#f97316', '#ec4899', '#a855f7', '#6366f1']);
  const [globalStrokeWidth, setGlobalStrokeWidth] = useState(2.5);
  const [bgColor, setBgColor] = useState('#0f172a');
  const [autoRotate, setAutoRotate] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const previewRef = useRef(null);
  const fullscreenRef = useRef(null);

  // 动态参数状态
  const [params, setParams] = useState(() => {
    const initial = {};
    LOGO_TYPES.forEach(t => { initial[t.id] = { ...t.defaultProps }; });
    return initial;
  });

  // 自动旋转
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setParams(prev => {
        const updated = { ...prev };
        if (activeType === 'platonic') updated.platonic = { ...prev.platonic, rotationY: (prev.platonic.rotationY || 0) + 0.02 };
        if (activeType === 'tesseract') updated.tesseract = { ...prev.tesseract, rotationXW: (prev.tesseract.rotationXW || 0) + 0.02 };
        if (activeType === 'mobius') updated.mobius = { ...prev.mobius, rotationY: (prev.mobius.rotationY || 0) + 0.02 };
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate, activeType]);

  // 全屏快捷键
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) {
        const active = document.activeElement;
        if (active.tagName !== 'INPUT' && active.tagName !== 'TEXTAREA') {
          setIsFullscreen(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const activeConfig = getLogoType(activeType);

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [activeType]: { ...prev[activeType], [key]: value } }));
  };

  const resetParams = () => {
    if (activeConfig) {
      setParams(prev => ({ ...prev, [activeType]: { ...activeConfig.defaultProps } }));
    }
  };

  // 计算预览尺寸
  const previewSize = Math.round(320 * (zoom / 100));

  return (
    <>
      <div className="h-full bg-white rounded-2xl p-5 overflow-hidden flex flex-col">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">几何 Logo 生成器</h1>
            <p className="text-xs text-slate-400 mt-0.5">选择图形样式，调整参数，导出你的设计</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">F</kbd>
            <span>全屏</span>
          </div>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
          {/* 左侧：分类导航 */}
          <CategoryNav activeType={activeType} onSelect={setActiveType} />

          {/* 中间：预览区 */}
          <div className="flex-1 flex flex-col min-w-0 gap-3">
            {/* 主预览区 */}
            <div
              className="rounded-2xl flex-1 flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: bgColor }}
            >
              {/* Logo 预览 */}
              <div 
                ref={previewRef}
                className="relative z-10 transition-all duration-200"
                style={{ width: previewSize, height: previewSize }}
              >
                {activeConfig && <activeConfig.Component {...params[activeType]} colors={globalColors} strokeWidth={globalStrokeWidth} />}
              </div>
            </div>
            
            {/* 工具栏 */}
            <PreviewToolbar
              zoom={zoom}
              setZoom={setZoom}
              onFullscreen={() => setIsFullscreen(true)}
              svgRef={previewRef}
              logoName={activeConfig?.name || 'logo'}
              bgColor={bgColor}
            />
            
            {/* 快速预览缩略图 */}
            <div className="flex-shrink-0">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {LOGO_TYPES.slice(0, 12).map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveType(t.id)}
                    className={`rounded-lg p-2 flex-shrink-0 transition-all ${activeType === t.id ? 'ring-2 ring-purple-500 scale-105' : 'hover:ring-2 hover:ring-slate-400'}`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <div className="w-10 h-10">
                      <t.Component {...t.defaultProps} colors={globalColors} strokeWidth={Math.min(globalStrokeWidth, 1.5)} />
                    </div>
                  </button>
                ))}
                {LOGO_TYPES.length > 12 && (
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-xs text-slate-400">
                    +{LOGO_TYPES.length - 12}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：控制面板 */}
          <div className="w-72 flex-shrink-0 bg-slate-50 rounded-2xl p-4 overflow-hidden">
            <ControlTabs
              colors={globalColors}
              setColors={setGlobalColors}
              strokeWidth={globalStrokeWidth}
              setStrokeWidth={setGlobalStrokeWidth}
              bgColor={bgColor}
              setBgColor={setBgColor}
              activeType={activeType}
              activeConfig={activeConfig}
              params={params[activeType] || {}}
              updateParam={updateParam}
              resetParams={resetParams}
              autoRotate={autoRotate}
              setAutoRotate={setAutoRotate}
            />
          </div>
        </div>
      </div>

      {/* 全屏预览模态框 */}
      {isFullscreen && (
        <div
          ref={fullscreenRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
          onClick={() => setIsFullscreen(false)}
        >
          <div 
            className="relative"
            style={{ width: '60vmin', height: '60vmin' }}
            onClick={(e) => e.stopPropagation()}
          >
            {activeConfig && <activeConfig.Component {...params[activeType]} colors={globalColors} strokeWidth={globalStrokeWidth} />}
          </div>
          
          {/* 关闭按钮 */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* 信息 */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
            <p className="text-white/80 text-sm font-medium">{activeConfig?.name}</p>
            <p className="text-white/50 text-xs mt-1">按 ESC 或点击任意处退出</p>
          </div>
        </div>
      )}
    </>
  );
}
