import { useState, useEffect, useRef } from 'react';
import { exportAllFormats } from '../utils/export';

// 导出预览尺寸配置
const PREVIEW_SIZES = [
  { size: 16, label: '16', desc: 'Favicon' },
  { size: 32, label: '32', desc: 'Favicon' },
  { size: 64, label: '64', desc: 'Icon' },
  { size: 128, label: '128', desc: 'Icon' },
  { size: 180, label: '180', desc: 'Apple Touch' },
  { size: 512, label: '512', desc: 'Android/PWA' },
];

const PreviewToolbar = ({
  svgRef,
  logoName = 'logo',
  bgColor = '#0f172a',
  setBgColor,
  iconScale = 0.7,
  setIconScale
}) => {
  const [exporting, setExporting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const canvasRefs = useRef([]);

  // 生成预览图
  useEffect(() => {
    const svg = svgRef?.current?.querySelector('svg');
    if (!svg) return;

    const generatePreviews = async () => {
      const newPreviews = [];

      for (const { size } of PREVIEW_SIZES) {
        try {
          const canvas = document.createElement('canvas');
          const displaySize = Math.min(size, 64); // 预览最大 64px
          canvas.width = displaySize;
          canvas.height = displaySize;

          const ctx = canvas.getContext('2d');

          // 获取实际图形边界
          const contentElements = Array.from(svg.children).filter(
            child => child.tagName.toLowerCase() !== 'defs'
          );

          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
          contentElements.forEach(el => {
            if (el.getBBox) {
              try {
                const bbox = el.getBBox();
                minX = Math.min(minX, bbox.x);
                minY = Math.min(minY, bbox.y);
                maxX = Math.max(maxX, bbox.x + bbox.width);
                maxY = Math.max(maxY, bbox.y + bbox.height);
              } catch (e) {}
            }
          });

          if (minX === Infinity) {
            minX = 0; minY = 0; maxX = 300; maxY = 300;
          }

          const contentWidth = maxX - minX;
          const contentHeight = maxY - minY;
          const contentSize = Math.max(contentWidth, contentHeight);

          // 创建导出 SVG
          const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          exportSvg.setAttribute('width', displaySize);
          exportSvg.setAttribute('height', displaySize);
          exportSvg.setAttribute('viewBox', `0 0 ${displaySize} ${displaySize}`);

          // 背景
          const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bgRect.setAttribute('width', displaySize);
          bgRect.setAttribute('height', displaySize);
          bgRect.setAttribute('fill', bgColor);
          exportSvg.appendChild(bgRect);

          // 计算缩放
          const targetIconSize = displaySize * iconScale;
          const scaleRatio = targetIconSize / contentSize;
          const scaledWidth = contentWidth * scaleRatio;
          const scaledHeight = contentHeight * scaleRatio;
          const offsetX = (displaySize - scaledWidth) / 2 - minX * scaleRatio;
          const offsetY = (displaySize - scaledHeight) / 2 - minY * scaleRatio;

          // 复制 defs
          const defs = svg.querySelector('defs');
          if (defs) {
            exportSvg.appendChild(defs.cloneNode(true));
          }

          // 内容组
          const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          contentGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scaleRatio})`);

          Array.from(svg.children).forEach(child => {
            if (child.tagName.toLowerCase() !== 'defs') {
              contentGroup.appendChild(child.cloneNode(true));
            }
          });

          exportSvg.appendChild(contentGroup);

          // 转为图片
          const svgData = new XMLSerializer().serializeToString(exportSvg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
              ctx.fillStyle = bgColor;
              ctx.fillRect(0, 0, displaySize, displaySize);
              ctx.drawImage(img, 0, 0, displaySize, displaySize);
              URL.revokeObjectURL(url);
              resolve();
            };
            img.src = url;
          });

          newPreviews.push(canvas.toDataURL('image/png'));
        } catch (e) {
          newPreviews.push(null);
        }
      }

      setPreviews(newPreviews);
    };

    // 延迟执行避免频繁更新
    const timer = setTimeout(generatePreviews, 100);
    return () => clearTimeout(timer);
  }, [svgRef, bgColor, iconScale]);

  const handleExport = async () => {
    const svg = svgRef?.current?.querySelector('svg');
    if (!svg || exporting) return;

    setExporting(true);
    try {
      await exportAllFormats(svg, logoName, bgColor, iconScale);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f8f8f8] rounded-xl">
        <div className="flex items-center gap-4">
          {/* 背景色控制 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 whitespace-nowrap">背景</span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0"
            />
            <button
              onClick={() => setBgColor('#000000')}
              className="w-5 h-5 rounded bg-black border border-slate-300 hover:ring-2 hover:ring-slate-400 transition-all"
              title="黑色"
            />
            <button
              onClick={() => setBgColor('#ffffff')}
              className="w-5 h-5 rounded bg-white border border-slate-300 hover:ring-2 hover:ring-slate-400 transition-all"
              title="白色"
            />
          </div>

          <div className="w-px h-4 bg-slate-300" />

          {/* 导出图标占比控制 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-slate-500 whitespace-nowrap">占比</span>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.05"
              value={iconScale}
              onChange={(e) => setIconScale(parseFloat(e.target.value))}
              className="w-16 accent-slate-600"
            />
            <span className="text-xs text-slate-500 w-8">{Math.round(iconScale * 100)}%</span>
          </div>
        </div>

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {exporting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>导出中...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>下载全部资源</span>
            </>
          )}
        </button>
      </div>

      {/* 导出预览 Gallery */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f8f8] rounded-xl overflow-x-auto">
        <span className="text-[10px] text-slate-400 flex-shrink-0">预览</span>
        <div className="flex items-end gap-2">
          {PREVIEW_SIZES.map((item, index) => (
            <div key={item.size} className="flex flex-col items-center gap-1">
              <div
                className="rounded overflow-hidden flex-shrink-0 bg-slate-200"
                style={{
                  width: Math.min(item.size, 48),
                  height: Math.min(item.size, 48),
                }}
              >
                {previews[index] && (
                  <img
                    src={previews[index]}
                    alt={`${item.size}x${item.size}`}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: item.size <= 32 ? 'pixelated' : 'auto' }}
                  />
                )}
              </div>
              <span className="text-[9px] text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PreviewToolbar;
