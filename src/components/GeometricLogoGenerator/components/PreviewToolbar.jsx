import { useState } from 'react';
import { exportAllFormats } from '../utils/export';

const PreviewToolbar = ({
  zoom,
  setZoom,
  onFullscreen,
  svgRef,
  logoName = 'logo',
  bgColor = '#0f172a'
}) => {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    const svg = svgRef?.current?.querySelector('svg');
    if (!svg || exporting) return;

    setExporting(true);
    try {
      await exportAllFormats(svg, logoName, bgColor);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-xl">
      {/* 缩放控制 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setZoom(Math.max(50, zoom - 25))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <div className="flex items-center gap-2 min-w-[100px]">
          <input
            type="range"
            min="50"
            max="200"
            step="25"
            value={zoom}
            onChange={(e) => setZoom(parseInt(e.target.value))}
            className="w-16 accent-purple-500"
          />
          <span className="text-xs text-slate-400 w-10 text-center">{zoom}%</span>
        </div>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 25))}
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="px-4 py-1.5 text-xs font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
        <button
          onClick={onFullscreen}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-600 transition-colors"
          title="全屏预览"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PreviewToolbar;
