import { useState } from 'react';
import LogoCanvas from './LogoCanvas';
import Controls from './Controls';
import { INITIAL_CONFIG, PRESETS } from './constants';

function ParametricLogo() {
  const [config, setConfig] = useState(INITIAL_CONFIG);

  const handlePresetSelect = (name) => {
    const preset = PRESETS[name];
    setConfig(prev => ({
      ...prev,
      ...preset,
      shape: { ...prev.shape, ...preset.shape },
      symmetry: { ...prev.symmetry, ...preset.symmetry },
    }));
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#09090b] text-white overflow-hidden rounded-2xl">
      {/* 头部 */}
      <header className="flex-none h-14 border-b border-zinc-800 flex items-center px-6 justify-between bg-[#0f0f11]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xs text-white">f(x)</div>
          <h1 className="font-semibold text-sm tracking-wide text-zinc-200">参数化 LOGO 引擎</h1>
        </div>
        <div className="text-xs text-zinc-500 font-mono">Superformula</div>
      </header>

      {/* 主内容 */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 左侧控制面板 */}
        <aside className="w-80 flex-none bg-[#121214] border-r border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-zinc-800">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">数学参数</h2>
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              调整超公式方程的变量来变换基础图元。
            </p>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <Controls 
              config={config} 
              onChange={setConfig} 
              onPresetSelect={handlePresetSelect} 
            />
          </div>
        </aside>

        {/* 中心画布区 */}
        <main className="flex-1 flex flex-col relative bg-[#09090b]">
          <div className="flex-1 p-8 flex items-center justify-center relative">
            <LogoCanvas config={config} />
          </div>
          
          {/* 底部提示 */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
              使用预设快速开始，或调整参数创建独特图形
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ParametricLogo;
