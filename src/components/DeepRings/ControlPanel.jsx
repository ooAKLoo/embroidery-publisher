function Slider({ label, value, min, max, step = 1, onChange, disabled }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 text-zinc-600">
        <span>{label}</span>
        <span className="font-mono text-zinc-700">
          {typeof step === 'number' && step < 1 ? value.toFixed(2) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4 text-zinc-800 font-semibold text-sm uppercase tracking-wider">
      {icon}
      {title}
    </div>
  );
}

const PRESETS = [
  {
    name: '经典',
    config: {
      circleSize: 150, spreadDistance: 0.5, layerCount: 8, circlesPerLayer: 8,
      borderWidth: 10, borderColor: '#ffffff', fillOpacity: 0.05, fillColor: '#000000',
      bgColor: '#111111', baseSpeed: 1.5, speedMultiplier: 1, animationEasing: 'ease-in-out',
      globalScale: 1, rotationRange: 1,
    },
  },
  {
    name: '花瓣',
    config: {
      circleSize: 120, spreadDistance: 0.35, layerCount: 12, circlesPerLayer: 6,
      borderWidth: 4, borderColor: '#f472b6', fillOpacity: 0.08, fillColor: '#ec4899',
      bgColor: '#1a0a14', baseSpeed: 2, speedMultiplier: 0.8, animationEasing: 'ease-in-out',
      globalScale: 1.2, rotationRange: 1.5,
    },
  },
  {
    name: '星云',
    config: {
      circleSize: 200, spreadDistance: 0.6, layerCount: 6, circlesPerLayer: 12,
      borderWidth: 2, borderColor: '#818cf8', fillOpacity: 0.03, fillColor: '#6366f1',
      bgColor: '#0a0a1a', baseSpeed: 3, speedMultiplier: 1.2, animationEasing: 'linear',
      globalScale: 0.8, rotationRange: 2,
    },
  },
  {
    name: '极简',
    config: {
      circleSize: 180, spreadDistance: 0.4, layerCount: 3, circlesPerLayer: 4,
      borderWidth: 16, borderColor: '#27272a', fillOpacity: 0, fillColor: '#000000',
      bgColor: '#fafafa', baseSpeed: 2, speedMultiplier: 1.5, animationEasing: 'ease',
      globalScale: 1, rotationRange: 0.5,
    },
  },
  {
    name: '金属',
    config: {
      circleSize: 140, spreadDistance: 0.45, layerCount: 10, circlesPerLayer: 8,
      borderWidth: 6, borderColor: '#d4a574', fillOpacity: 0.04, fillColor: '#92702a',
      bgColor: '#0d0d0d', baseSpeed: 1.8, speedMultiplier: 0.6, animationEasing: 'ease-in-out',
      globalScale: 1.1, rotationRange: 0.8,
    },
  },
  {
    name: '霓虹',
    config: {
      circleSize: 130, spreadDistance: 0.55, layerCount: 8, circlesPerLayer: 10,
      borderWidth: 3, borderColor: '#22d3ee', fillOpacity: 0.06, fillColor: '#06b6d4',
      bgColor: '#020617', baseSpeed: 1, speedMultiplier: 1, animationEasing: 'ease-in-out',
      globalScale: 1, rotationRange: 1.2,
    },
  },
];

function ControlPanel({ config, onChange, onReset }) {
  return (
    <div className="w-80 flex-shrink-0 border-r border-zinc-200 overflow-y-auto bg-white">
      <div className="px-6 py-6">
        {/* 预设 */}
        <div className="mb-6 pb-6 border-b border-zinc-100">
          <SectionTitle
            icon={
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
            title="预设"
          />
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onChange({ ...preset.config, paused: config.paused })}
                className="px-2 py-1.5 rounded-md text-xs transition-colors bg-zinc-100 text-zinc-700 hover:bg-indigo-100 hover:text-indigo-700"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 几何参数 */}
        <div className="mb-6 pb-6 border-b border-zinc-100">
          <SectionTitle
            icon={
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
                <circle cx="12" cy="12" r="4" strokeWidth={1.5} />
              </svg>
            }
            title="几何参数"
          />
          <Slider label="圆环尺寸" value={config.circleSize} min={40} max={300} step={5} onChange={(v) => onChange({ circleSize: v })} />
          <Slider label="扩散距离" value={config.spreadDistance} min={0.1} max={1.5} step={0.05} onChange={(v) => onChange({ spreadDistance: v })} />
          <Slider label="图层数量" value={config.layerCount} min={1} max={16} step={1} onChange={(v) => onChange({ layerCount: v })} />
          <Slider label="每层圆环数" value={config.circlesPerLayer} min={2} max={16} step={1} onChange={(v) => onChange({ circlesPerLayer: v })} />
          <Slider label="全局缩放" value={config.globalScale} min={0.3} max={2} step={0.05} onChange={(v) => onChange({ globalScale: v })} />
        </div>

        {/* 外观设置 */}
        <div className="mb-6 pb-6 border-b border-zinc-100">
          <SectionTitle
            icon={
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            }
            title="外观设置"
          />
          <Slider label="边框宽度" value={config.borderWidth} min={1} max={30} step={1} onChange={(v) => onChange({ borderWidth: v })} />

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-lg bg-zinc-50">
              <div className="text-xs text-zinc-600 mb-2">边框颜色</div>
              <input
                type="color"
                value={config.borderColor}
                onChange={(e) => onChange({ borderColor: e.target.value })}
                className="bg-transparent h-7 w-full cursor-pointer border-0"
              />
            </div>
            <div className="p-3 rounded-lg bg-zinc-50">
              <div className="text-xs text-zinc-600 mb-2">背景颜色</div>
              <input
                type="color"
                value={config.bgColor}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                className="bg-transparent h-7 w-full cursor-pointer border-0"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-50 mb-4">
            <div className="text-xs text-zinc-600 mb-2">填充颜色</div>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={config.fillColor}
                onChange={(e) => onChange({ fillColor: e.target.value })}
                className="bg-transparent h-7 w-10 cursor-pointer border-0 flex-shrink-0"
              />
              <div className="flex-1">
                <Slider label="填充透明度" value={config.fillOpacity} min={0} max={0.5} step={0.01} onChange={(v) => onChange({ fillOpacity: v })} />
              </div>
            </div>
          </div>
        </div>

        {/* 动画控制 */}
        <div className="mb-6 pb-6 border-b border-zinc-100">
          <SectionTitle
            icon={
              <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="动画控制"
          />

          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => onChange({ paused: !config.paused })}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                config.paused
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {config.paused ? '▶ 继续播放' : '⏸ 暂停动画'}
            </button>
          </div>

          <Slider label="基础速度" value={config.baseSpeed} min={0.5} max={5} step={0.1} onChange={(v) => onChange({ baseSpeed: v })} />
          <Slider label="速度系数" value={config.speedMultiplier} min={0.2} max={3} step={0.1} onChange={(v) => onChange({ speedMultiplier: v })} />
          <Slider label="旋转范围" value={config.rotationRange} min={0.1} max={3} step={0.1} onChange={(v) => onChange({ rotationRange: v })} />

          <div className="mb-4">
            <div className="text-xs text-zinc-600 mb-2">缓动函数</div>
            <select
              value={config.animationEasing}
              onChange={(e) => onChange({ animationEasing: e.target.value })}
              className="w-full px-3 py-1.5 rounded-md text-xs bg-zinc-100 border-0 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            >
              <option value="linear">Linear</option>
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In-Out</option>
            </select>
          </div>
        </div>

        {/* 重置 */}
        <button
          onClick={onReset}
          className="w-full px-3 py-2 rounded-lg text-xs font-medium transition-colors bg-zinc-100 text-zinc-500 hover:bg-red-50 hover:text-red-600"
        >
          重置为默认
        </button>
      </div>
    </div>
  );
}

export default ControlPanel;
