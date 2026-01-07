import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [iconScale, setIconScale] = useState(0.7); // 导出时图标占画布比例
  const [borderRadius, setBorderRadius] = useState(0.22); // 导出圆角比例，0.22 为 macOS 风格

  const previewRef = useRef(null);
  const previewAreaRef = useRef(null);

  // 缩放状态：zoom 用于实际渲染尺寸，保证 SVG 清晰
  const [zoom, setZoom] = useState(100);
  const zoomRef = useRef(100); // 用于手势过程中的临时值
  const renderZoomRef = useRef(100); // 当前已渲染的 zoom 值
  const zoomUpdateTimeoutRef = useRef(null);

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

  // Figma 风格缩放：手势过程中用 transform 实现流畅动画，停止后用真实尺寸渲染保证清晰
  useEffect(() => {
    const el = previewAreaRef.current;
    if (!el) return;

    const wheelHandler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        // 使用指数缩放，体验更自然
        const zoomFactor = 1 - e.deltaY * 0.003;
        const newZoom = Math.min(400, Math.max(25, zoomRef.current * zoomFactor));
        zoomRef.current = newZoom;

        // 手势过程中：用 transform 实现即时视觉反馈（基于已渲染尺寸的相对缩放）
        if (previewRef.current) {
          const relativeScale = newZoom / renderZoomRef.current;
          previewRef.current.style.transform = `scale(${relativeScale})`;
        }

        // 防抖：停止滚动后更新真实渲染尺寸（SVG 会重新按新尺寸渲染，保证清晰）
        if (zoomUpdateTimeoutRef.current) {
          clearTimeout(zoomUpdateTimeoutRef.current);
        }
        zoomUpdateTimeoutRef.current = setTimeout(() => {
          const finalZoom = Math.round(zoomRef.current);
          renderZoomRef.current = finalZoom;
          // 重置 transform，因为新尺寸会直接应用到容器
          if (previewRef.current) {
            previewRef.current.style.transform = 'scale(1)';
          }
          setZoom(finalZoom);
        }, 150); // 停止滚动 150ms 后重新渲染
      }
    };

    // passive: false 是关键，否则 preventDefault 在现代浏览器中不生效
    el.addEventListener('wheel', wheelHandler, { passive: false });

    return () => {
      el.removeEventListener('wheel', wheelHandler);
      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }
    };
  }, []);

  const activeConfig = getLogoType(activeType);

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [activeType]: { ...prev[activeType], [key]: value } }));
  };

  const resetParams = () => {
    if (activeConfig) {
      setParams(prev => ({ ...prev, [activeType]: { ...activeConfig.defaultProps } }));
    }
  };

  // 重置缩放
  const resetZoom = useCallback(() => {
    zoomRef.current = 100;
    renderZoomRef.current = 100;
    if (previewRef.current) {
      previewRef.current.style.transform = 'scale(1)';
    }
    setZoom(100);
  }, []);

  // 计算预览尺寸：基于 zoom 值动态计算，保证 SVG 始终清晰渲染
  const baseSize = 320;
  const previewSize = Math.round(baseSize * (zoom / 100));

  return (
    <div className="h-full bg-white rounded-2xl p-5 overflow-hidden flex flex-col">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">几何 Logo 生成器</h1>
          <p className="text-xs text-slate-400 mt-0.5">选择图形样式，调整参数，导出你的设计</p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
        {/* 左侧：分类导航 */}
        <CategoryNav
          activeType={activeType}
          onSelect={setActiveType}
          colors={globalColors}
          strokeWidth={globalStrokeWidth}
          bgColor={bgColor}
        />

        {/* 中间：预览区 */}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          {/* 主预览区 */}
          <div
            ref={previewAreaRef}
            className="rounded-2xl flex-1 flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            {/* Logo 预览 - 真实尺寸渲染保证清晰，手势过程用 transform 过渡 */}
            <div
              ref={previewRef}
              className="relative z-10"
              style={{
                width: previewSize,
                height: previewSize,
                willChange: 'transform',
                transformOrigin: 'center center',
              }}
            >
              {activeConfig && <activeConfig.Component {...params[activeType]} colors={globalColors} strokeWidth={globalStrokeWidth} />}
            </div>
            {/* 缩放提示 - 点击可重置 */}
            {zoom !== 100 && (
              <button
                onClick={resetZoom}
                className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg transition-colors cursor-pointer"
                title="点击重置缩放"
              >
                {zoom}%
              </button>
            )}
          </div>

          {/* 工具栏 */}
          <PreviewToolbar
            svgRef={previewRef}
            logoName={activeConfig?.name || 'logo'}
            bgColor={bgColor}
            setBgColor={setBgColor}
            iconScale={iconScale}
            setIconScale={setIconScale}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
          />
        </div>

          {/* 右侧：控制面板 */}
          <div className="w-72 flex-shrink-0 bg-[#f8f8f8] rounded-2xl p-4 overflow-hidden">
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
  );
}
