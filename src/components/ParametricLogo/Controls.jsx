import { BLEND_MODES, PRESETS } from './constants';

// 滑块组件
function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide">{label}</span>
        <span className="text-[9px] font-semibold text-neutral-700 tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer"
      />
    </div>
  );
}

// 分组组件
function Section({ title, children }) {
  return (
    <div className="mb-4 p-3 bg-white rounded-xl">
      <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-3">{title}</div>
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
    <div className="h-full overflow-y-auto pr-1 pb-20">

      {/* 预设 */}
      <div className="mb-4 p-3 bg-white rounded-xl">
        <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">预设</div>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(PRESETS).map((preset) => (
            <button
              key={preset}
              onClick={() => onPresetSelect(preset)}
              className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
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
            <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide block mb-1">填充</span>
            <div className="flex gap-2 items-center">
              <input type="color" value={config.style.fillColor} onChange={(e) => updateStyle('fillColor', e.target.value)} className="h-6 w-6 bg-transparent border-0 cursor-pointer rounded" />
              <input type="checkbox" checked={config.style.filled} onChange={(e) => updateStyle('filled', e.target.checked)} className="my-auto accent-neutral-800" />
            </div>
          </div>
          <div>
            <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide block mb-1">描边</span>
            <input type="color" value={config.style.strokeColor} onChange={(e) => updateStyle('strokeColor', e.target.value)} className="h-6 w-6 bg-transparent border-0 cursor-pointer rounded" />
          </div>
        </div>
        <Slider label="描边宽度" value={config.style.strokeWidth} min={0} max={20} step={0.5} onChange={(v) => updateStyle('strokeWidth', v)} />

        <div className="mt-3">
          <span className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide block mb-1">混合模式</span>
          <select
            value={config.style.blendMode}
            onChange={(e) => updateStyle('blendMode', e.target.value)}
            className="w-full bg-neutral-100 text-neutral-700 text-[10px] font-medium rounded-lg p-2 outline-none"
          >
            {BLEND_MODES.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
          <p className="text-[8px] text-neutral-400 mt-1">尝试 'difference' 或 'screen' 配合高数量效果更佳</p>
        </div>
      </Section>
    </div>
  );
}

export default Controls;
