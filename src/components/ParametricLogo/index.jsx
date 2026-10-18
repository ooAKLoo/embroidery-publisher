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
    <div className="h-full bg-white rounded-2xl p-5 overflow-hidden flex flex-col">
      {/* 顶部标题栏 */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-lg font-semibold text-neutral-700">参数化 LOGO 引擎</h1>
          <p className="text-xs text-neutral-400 mt-0.5">Superformula · 调整参数创建独特图形</p>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
        {/* 左侧：控制面板 */}
        <div className="w-72 flex-shrink-0 bg-neutral-100 rounded-2xl p-4 overflow-hidden flex flex-col">
          <Controls
            config={config}
            onChange={setConfig}
            onPresetSelect={handlePresetSelect}
          />
        </div>

        {/* 中心画布区 */}
        <div className="flex-1 flex flex-col min-w-0 gap-3">
          <div className="rounded-2xl flex-1 flex items-center justify-center relative overflow-hidden bg-neutral-100">
            <LogoCanvas config={config} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParametricLogo;
