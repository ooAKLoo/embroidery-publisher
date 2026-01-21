import { BLEND_MODES, PRESETS } from './constants';

// 滑块组件
function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-zinc-400">{label}</label>
        <span className="text-xs text-zinc-500 font-mono">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
      />
    </div>
  );
}

// 分组组件
function Section({ title, children }) {
  return (
    <div className="mb-6 p-4 bg-[#1e1e22] rounded-lg border border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4 border-b border-zinc-700 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function Controls({ config, onChange, onPresetSelect }) {

  const updateShape = (key, val) => {
    onChange({ ...config, shape: { ...config.shape, [key]: val } });
  };

  const updateSymmetry = (key, val) => {
    onChange({ ...config, symmetry: { ...config.symmetry, [key]: val } });
  };

  const updateStyle = (key, val) => {
    onChange({ ...config, style: { ...config.style, [key]: val } });
  };

  return (
    <div className="h-full overflow-y-auto pr-2 pb-20">
      
      {/* 预设 */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {Object.keys(PRESETS).map((preset) => (
          <button
            key={preset}
            onClick={() => onPresetSelect(preset)}
            className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 rounded border border-zinc-700 transition-colors"
          >
            {preset}
          </button>
        ))}
      </div>

      <Section title="公式 (几何)">
        <Slider label="M (瓣数/对称)" value={config.shape.m} min={0} max={20} step={0.1} onChange={(v) => updateShape('m', v)} />
        <Slider label="N1 (挤压/膨胀)" value={config.shape.n1} min={0.1} max={30} step={0.1} onChange={(v) => updateShape('n1', v)} />
        <Slider label="N2 (角形状1)" value={config.shape.n2} min={0.1} max={30} step={0.1} onChange={(v) => updateShape('n2', v)} />
        <Slider label="N3 (角形状2)" value={config.shape.n3} min={0.1} max={30} step={0.1} onChange={(v) => updateShape('n3', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Slider label="缩放 X" value={config.shape.a} min={0.1} max={5} step={0.1} onChange={(v) => updateShape('a', v)} />
          <Slider label="缩放 Y" value={config.shape.b} min={0.1} max={5} step={0.1} onChange={(v) => updateShape('b', v)} />
        </div>
      </Section>

      <Section title="阵列与对称">
        <Slider label="数量" value={config.symmetry.count} min={1} max={12} step={1} onChange={(v) => updateSymmetry('count', v)} />
        <Slider label="半径" value={config.symmetry.radius} min={0} max={200} step={1} onChange={(v) => updateSymmetry('radius', v)} />
        <Slider label="旋转" value={config.symmetry.rotation} min={0} max={360} step={1} onChange={(v) => updateSymmetry('rotation', v)} />
        <Slider label="单项缩放" value={config.symmetry.scale} min={0.1} max={2} step={0.05} onChange={(v) => updateSymmetry('scale', v)} />
      </Section>

      <Section title="样式与混合">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">填充</label>
            <div className="flex gap-2">
              <input type="color" value={config.style.fillColor} onChange={(e) => updateStyle('fillColor', e.target.value)} className="h-8 w-8 bg-transparent border-0 cursor-pointer" />
              <input type="checkbox" checked={config.style.filled} onChange={(e) => updateStyle('filled', e.target.checked)} className="my-auto accent-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 block mb-1">描边</label>
            <input type="color" value={config.style.strokeColor} onChange={(e) => updateStyle('strokeColor', e.target.value)} className="h-8 w-full bg-transparent border-0 cursor-pointer" />
          </div>
        </div>
        <Slider label="描边宽度" value={config.style.strokeWidth} min={0} max={20} step={0.5} onChange={(v) => updateStyle('strokeWidth', v)} />
        
        <div className="mt-4">
          <label className="text-xs text-zinc-400 block mb-1">混合模式</label>
          <select 
            value={config.style.blendMode} 
            onChange={(e) => updateStyle('blendMode', e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded p-2 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {BLEND_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
          <p className="text-[10px] text-zinc-500 mt-1">尝试 'difference' 或 'screen' 配合高数量效果更佳</p>
        </div>
      </Section>
    </div>
  );
}

export default Controls;
