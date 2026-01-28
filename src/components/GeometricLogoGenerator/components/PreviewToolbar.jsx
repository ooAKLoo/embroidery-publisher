import { useState, useEffect, useRef } from 'react';
import { exportAllFormats } from '../utils/export';

// 导出预览尺寸配置
const PREVIEW_SIZES = [
  { size: 16, label: '16', desc: 'Favicon' },
  { size: 32, label: '32', desc: 'Favicon' },
  { size: 64, label: '64', desc: 'Icon' },
  { size: 128, label: '128', desc: 'macOS' },
  { size: 180, label: '180', desc: 'Apple' },
  { size: 512, label: '512', desc: 'App' },
];

// 圆角预设
const RADIUS_PRESETS = [
  { value: 0, label: '无', desc: '方形' },
  { value: 0.1, label: '小', desc: '10%' },
  { value: 0.22, label: 'macOS', desc: '22%' },
  { value: 0.5, label: '圆', desc: '50%' },
];

const parseHexColor = (color) => {
  if (typeof color !== 'string') return null;
  const hex = color.trim().replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }
  return null;
};

const isDarkColor = (color) => {
  const rgb = parseHexColor(color);
  if (!rgb) return false;
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
  return luminance < 0.35;
};

const getBBoxWithPadding = (svg) => {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const applyBBox = (bbox) => {
    if (!bbox || !Number.isFinite(bbox.width) || bbox.width <= 0) return;
    minX = Math.min(minX, bbox.x);
    minY = Math.min(minY, bbox.y);
    maxX = Math.max(maxX, bbox.x + bbox.width);
    maxY = Math.max(maxY, bbox.y + bbox.height);
  };

  let rootBBox;
  try {
    try {
      rootBBox = svg.getBBox({ stroke: true });
    } catch (e) {
      rootBBox = svg.getBBox();
    }
  } catch (e) {
    rootBBox = null;
  }
  applyBBox(rootBBox);

  const contentElements = Array.from(svg.children).filter(
    child => child.tagName.toLowerCase() !== 'defs'
  );
  contentElements.forEach(el => {
    if (!el.getBBox) return;
    try {
      let bbox;
      try {
        bbox = el.getBBox({ stroke: true });
      } catch (e) {
        bbox = el.getBBox();
      }
      applyBBox(bbox);
    } catch (e) {}
  });

  if (minX === Infinity) {
    const viewBox = svg?.viewBox?.baseVal;
    if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
      return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
    }
    return { x: 0, y: 0, width: 300, height: 300 };
  }

  let strokePadding = 0;
  try {
    const strokeEls = svg.querySelectorAll('[stroke-width], [style]');
    strokeEls.forEach(el => {
      let width = 0;
      const attr = el.getAttribute('stroke-width');
      if (attr) {
        width = parseFloat(attr);
      } else if (el.style && el.style.strokeWidth) {
        width = parseFloat(el.style.strokeWidth);
      } else if (typeof window !== 'undefined' && window.getComputedStyle) {
        const computed = window.getComputedStyle(el);
        if (computed && computed.strokeWidth) {
          width = parseFloat(computed.strokeWidth);
        }
      }
      if (Number.isFinite(width)) {
        strokePadding = Math.max(strokePadding, width / 2);
      }
    });
  } catch (e) {
    strokePadding = 0;
  }

  if (strokePadding > 0) {
    minX -= strokePadding;
    minY -= strokePadding;
    maxX += strokePadding;
    maxY += strokePadding;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    const viewBox = svg?.viewBox?.baseVal;
    if (viewBox && viewBox.width > 0 && viewBox.height > 0) {
      return { x: viewBox.x, y: viewBox.y, width: viewBox.width, height: viewBox.height };
    }
    return { x: 0, y: 0, width: 300, height: 300 };
  }

  return {
    x: minX,
    y: minY,
    width,
    height
  };
};

const normalizeBlendModes = (svgElement, fallback = 'normal') => {
  if (!svgElement?.querySelectorAll) return;
  svgElement.querySelectorAll('*').forEach((el) => {
    if (!el?.style?.mixBlendMode) return;
    if (el.style.mixBlendMode !== fallback) {
      el.style.mixBlendMode = fallback;
    }
  });
};

const hasBlendModes = (svgElement) => {
  if (!svgElement?.querySelectorAll) return false;
  return Array.from(svgElement.querySelectorAll('*')).some((el) => {
    const mode = el?.style?.mixBlendMode;
    return mode && mode !== 'normal';
  });
};

const svgToDataUrl = (svgData) => {
  try {
    return `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svgData)))}`;
  } catch (e) {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgData)}`;
  }
};

const PreviewToolbar = ({
  svgRef,
  logoName = 'logo',
  bgColor = '#0f172a',
  setBgColor,
  iconScale = 0.7,
  setIconScale,
  borderRadius = 0.22,
  setBorderRadius,
  readmeMeta,
  // 保存相关
  onSave,
  saving = false
}) => {
  const [exporting, setExporting] = useState(false);
  const [previews, setPreviews] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const isDarkBg = isDarkColor(bgColor);

  // 生成预览图
  useEffect(() => {
    const svg = svgRef?.current?.querySelector('svg');
    if (!svg) return;

    const generatePreviews = async () => {
      const newPreviews = [];
      const useVectorPreview = hasBlendModes(svg);

      for (const { size } of PREVIEW_SIZES) {
        try {
          const displaySize = Math.min(size, 64);

          const bbox = getBBoxWithPadding(svg);
          const contentWidth = bbox.width;
          const contentHeight = bbox.height;
          const contentSize = Math.max(contentWidth, contentHeight);

          // 创建导出 SVG
          const exportSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          exportSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          exportSvg.setAttribute('width', displaySize);
          exportSvg.setAttribute('height', displaySize);
          exportSvg.setAttribute('viewBox', `0 0 ${displaySize} ${displaySize}`);
          exportSvg.style.isolation = 'isolate';

          // 圆角裁剪
          if (borderRadius > 0) {
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
            clipPath.setAttribute('id', 'preview-clip');
            const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const radius = displaySize * borderRadius;
            clipRect.setAttribute('width', displaySize);
            clipRect.setAttribute('height', displaySize);
            clipRect.setAttribute('rx', radius);
            clipRect.setAttribute('ry', radius);
            clipPath.appendChild(clipRect);
            defs.appendChild(clipPath);
            exportSvg.appendChild(defs);
          }

          // 主内容组
          const mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          mainGroup.setAttribute('style', 'isolation:isolate;');
          if (borderRadius > 0) {
            mainGroup.setAttribute('clip-path', 'url(#preview-clip)');
          }

          // 背景
          const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          bgRect.setAttribute('width', displaySize);
          bgRect.setAttribute('height', displaySize);
          bgRect.setAttribute('fill', bgColor);
          if (borderRadius > 0) {
            const radius = displaySize * borderRadius;
            bgRect.setAttribute('rx', radius);
            bgRect.setAttribute('ry', radius);
          }
          mainGroup.appendChild(bgRect);

          // 计算缩放
          const targetIconSize = displaySize * iconScale;
          const scaleRatio = targetIconSize / contentSize;
          const scaledWidth = contentWidth * scaleRatio;
          const scaledHeight = contentHeight * scaleRatio;
          const offsetX = (displaySize - scaledWidth) / 2 - bbox.x * scaleRatio;
          const offsetY = (displaySize - scaledHeight) / 2 - bbox.y * scaleRatio;

          // 复制 defs
          const originalDefs = svg.querySelector('defs');
          if (originalDefs) {
            let existingDefs = exportSvg.querySelector('defs');
            if (!existingDefs) {
              existingDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
              exportSvg.insertBefore(existingDefs, exportSvg.firstChild);
            }
            Array.from(originalDefs.children).forEach(child => {
              existingDefs.appendChild(child.cloneNode(true));
            });
          }

          // 内容组
          const contentGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          contentGroup.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scaleRatio})`);

          Array.from(svg.children).forEach(child => {
            if (child.tagName.toLowerCase() !== 'defs') {
              contentGroup.appendChild(child.cloneNode(true));
            }
          });

          mainGroup.appendChild(contentGroup);
          exportSvg.appendChild(mainGroup);

          if (useVectorPreview) {
            const svgData = new XMLSerializer().serializeToString(exportSvg);
            const svgUrl = svgToDataUrl(svgData);
            newPreviews.push(svgUrl);
            continue;
          }

          const canvas = document.createElement('canvas');
          canvas.width = displaySize;
          canvas.height = displaySize;

          const ctx = canvas.getContext('2d');

          normalizeBlendModes(exportSvg);

          // 转为图片
          const svgData = new XMLSerializer().serializeToString(exportSvg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
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

    const timer = setTimeout(generatePreviews, 100);
    return () => clearTimeout(timer);
  }, [svgRef, bgColor, iconScale, borderRadius]);

  const handleExport = async () => {
    const svg = svgRef?.current?.querySelector('svg');
    if (!svg || exporting) return;

    setExporting(true);
    try {
      await exportAllFormats(svg, logoName, bgColor, iconScale, borderRadius, readmeMeta);
    } finally {
      setExporting(false);
    }
  };

  // 处理保存
  const handleSave = async () => {
    if (!saveName.trim() || !onSave) return;
    await onSave(saveName.trim());
    setSaveName('');
    setShowSaveDialog(false);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f8f8f8] rounded-xl">
        <div className="flex items-center gap-3">
          {/* 背景色控制 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-slate-400 whitespace-nowrap">背景</span>
            <input
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border-0"
            />
            <button
              onClick={() => setBgColor('#000000')}
              className="w-4 h-4 rounded bg-black border border-slate-300 hover:ring-1 hover:ring-slate-400 transition-all"
              title="黑色"
            />
            <button
              onClick={() => setBgColor('#ffffff')}
              className="w-4 h-4 rounded bg-white border border-slate-300 hover:ring-1 hover:ring-slate-400 transition-all"
              title="白色"
            />
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {/* 图标占比控制 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-slate-400 whitespace-nowrap">占比</span>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.05"
              value={iconScale}
              onChange={(e) => setIconScale(parseFloat(e.target.value))}
              className="w-12 accent-slate-500"
            />
            <span className="text-[10px] text-slate-500 w-6">{Math.round(iconScale * 100)}%</span>
          </div>

          <div className="w-px h-4 bg-slate-200" />

          {/* 圆角控制 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-slate-400 whitespace-nowrap">圆角</span>
            <div className="flex gap-0.5">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setBorderRadius(preset.value)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-all ${
                    borderRadius === preset.value
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="flex items-center gap-2">
          {/* 保存按钮 */}
          <div className="relative">
            <button
              onClick={() => setShowSaveDialog(!showSaveDialog)}
              disabled={saving}
              className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  <span>保存样式</span>
                </>
              )}
            </button>

            {/* 保存对话框 */}
            {showSaveDialog && (
              <div className="absolute right-0 bottom-full mb-2 w-64 p-3 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
                <h4 className="text-sm font-medium text-slate-700 mb-2">保存当前样式</h4>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="输入样式名称..."
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200 mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveDialog(false)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!saveName.trim()}
                    className="flex-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 导出按钮 */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {exporting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>导出中...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>下载资源包</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 导出预览 Gallery */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f8f8] rounded-xl overflow-x-auto">
        <span className="text-[10px] text-slate-400 flex-shrink-0">预览</span>
        <div className="flex items-end gap-2">
          {PREVIEW_SIZES.map((item, index) => (
            <div key={item.size} className="flex flex-col items-center gap-1">
              <div
                className="flex-shrink-0 bg-slate-200 overflow-hidden"
                style={{
                  width: Math.min(item.size, 48),
                  height: Math.min(item.size, 48),
                  borderRadius: borderRadius > 0 ? `${borderRadius * Math.min(item.size, 48)}px` : '4px',
                  boxShadow: isDarkBg
                    ? 'inset 0 0 0 1px rgba(255,255,255,0.18)'
                    : 'inset 0 0 0 1px rgba(15,23,42,0.08)',
                }}
              >
                {previews[index] && (
                  <img
                    src={previews[index]}
                    alt={`${item.size}x${item.size}`}
                    className="w-full h-full object-cover"
                    style={{
                      imageRendering: item.size <= 32 ? 'pixelated' : 'auto',
                      filter: isDarkBg ? 'drop-shadow(0 0 6px rgba(255,255,255,0.35))' : 'none'
                    }}
                  />
                )}
              </div>
              <span className="text-[9px] text-slate-400">{item.label}</span>
            </div>
          ))}
        </div>
        {/* 导出格式提示 */}
        <div className="flex-shrink-0 ml-auto flex items-center gap-1.5 text-[10px] text-slate-400">
          <span className="px-1.5 py-0.5 bg-slate-200 rounded">SVG</span>
          <span className="px-1.5 py-0.5 bg-slate-200 rounded">PNG</span>
          <span className="px-1.5 py-0.5 bg-slate-200 rounded">ICO</span>
          <span className="px-1.5 py-0.5 bg-slate-200 rounded">ICNS</span>
        </div>
      </div>
    </div>
  );
};

export default PreviewToolbar;
