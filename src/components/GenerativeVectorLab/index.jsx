import { useState, useCallback, useRef } from "react";
import { DEFAULT_CONFIG, PRESETS } from "./constants";
import ControlPanel from "./ControlPanel";
import ShapeRenderer from "./ShapeRenderer";
import { generateVariation } from "./utils/math";

// 图标组件
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ShuffleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function GenerativeVectorLab() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [variations, setVariations] = useState([]);
  const [viewMode, setViewMode] = useState("single");
  const svgRef = useRef(null);

  // 更新配置
  const handleConfigChange = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  // 生成变体系列
  const generateFamily = useCallback(() => {
    const family = Array.from({ length: 12 }).map(() =>
      generateVariation(config, 0.3)
    );
    setVariations(family);
    setViewMode("grid");
  }, [config]);

  // 导出 SVG
  const handleExport = () => {
    if (!svgRef.current) return;
    const svgEl = svgRef.current.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gen-shape-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-full w-full bg-zinc-950 text-zinc-200 overflow-hidden font-sans rounded-2xl">
      
      {/* 左侧: 控制面板 */}
      <div className="w-80 flex-shrink-0 border-r border-zinc-800 z-10 relative">
        <ControlPanel config={config} onChange={handleConfigChange} />
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 工具栏 */}
        <div className="h-14 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between px-6">
          
          <div className="flex items-center gap-4">
            {/* 预设按钮 */}
            {Object.entries(PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => {
                  setConfig(preset);
                  if(viewMode === 'grid') generateFamily();
                }}
                className="px-3 py-1 text-xs rounded-full border border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* 视图切换 */}
            <div className="bg-zinc-800 p-1 rounded-lg flex mr-4">
              <button 
                onClick={() => setViewMode("single")}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'single' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="编辑视图"
              >
                <MonitorIcon />
              </button>
              <button 
                onClick={() => {
                  if (variations.length === 0) generateFamily();
                  setViewMode("grid");
                }}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-zinc-600 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                title="系列视图"
              >
                <GridIcon />
              </button>
            </div>

            <button
              onClick={() => handleConfigChange(generateVariation(config, 0.5))}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-xs font-medium transition-colors"
            >
              <ShuffleIcon />
              随机
            </button>
            <button
              onClick={generateFamily}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors shadow-lg shadow-indigo-900/20"
            >
              <SparklesIcon />
              生成系列
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-700 hover:bg-zinc-800 rounded-md text-xs font-medium transition-colors"
              disabled={viewMode === 'grid'}
              title={viewMode === 'grid' ? "选择一个图形后导出" : "导出 SVG"}
            >
              <DownloadIcon />
              导出 SVG
            </button>
          </div>
        </div>

        {/* 画布区域 */}
        <div className="flex-1 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] relative overflow-hidden">
          
          {viewMode === "single" ? (
            <div 
              ref={svgRef} 
              className="w-full h-full flex items-center justify-center p-12"
            >
              <div className="relative w-full h-full max-w-3xl max-h-3xl aspect-square bg-zinc-900/30 border border-zinc-800 rounded-xl shadow-2xl backdrop-blur-sm flex items-center justify-center group">
                <ShapeRenderer 
                  config={config} 
                  width={800} 
                  height={800} 
                  className="w-full h-full drop-shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                />
                <div className="absolute bottom-4 right-4 text-zinc-600 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {config.count} 个副本 • {config.frequency} 频率
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                {variations.map((v, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setConfig(v);
                      setViewMode("single");
                    }}
                    className="aspect-square bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:bg-zinc-800/80 transition-all hover:scale-[1.02] group"
                  >
                    <ShapeRenderer 
                      config={v} 
                      width={200} 
                      height={200} 
                      className="w-full h-full pointer-events-none" 
                    />
                    <div className="mt-2 text-center text-xs text-zinc-500 group-hover:text-indigo-400">
                      选择变体
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GenerativeVectorLab;
