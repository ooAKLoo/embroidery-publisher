import { useState } from 'react';
import Controls from './Controls';
import Artboard from './Artboard';
import { DEFAULT_CONFIG, PRESETS } from './constants';

// 图标
const SparklesIcon = () => (
  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

function NeonGeoLogo() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  return (
    <div className="h-full w-full bg-black flex overflow-hidden rounded-2xl">
      {/* 左侧控制面板 */}
      <aside className="w-80 flex-shrink-0 bg-[#0f0f0f] border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <SparklesIcon />
            NeonGeo
          </h1>
          <p className="text-xs text-gray-500 mt-1">生成式 Logo 引擎</p>
        </div>
        
        {/* 预设按钮 */}
        <div className="px-4 py-3 border-b border-gray-800 flex flex-wrap gap-2">
          {Object.entries(PRESETS).map(([name, preset]) => (
            <button
              key={name}
              onClick={() => setConfig(preset)}
              className="px-3 py-1 text-xs rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>
        
        <div className="flex-1 overflow-hidden p-4">
          <Controls 
            config={config} 
            onChange={setConfig} 
          />
        </div>
      </aside>

      {/* 主预览区 */}
      <main 
        className="flex-1 p-8 flex flex-col items-center justify-center relative"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <div className="w-full h-full max-w-4xl max-h-[800px] aspect-square">
          <Artboard config={config} width={1024} height={1024} />
        </div>
      </main>
    </div>
  );
}

export default NeonGeoLogo;
