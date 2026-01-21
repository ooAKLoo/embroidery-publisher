// 滑块组件
function Slider({ label, value, min, max, step, onChange }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-300">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
      />
    </div>
  );
}

// 区域分组组件
function Section({ title, icon, children }) {
  return (
    <div className="mb-6 pb-6 border-b border-zinc-800 last:border-0">
      <div className="flex items-center gap-2 mb-4 text-zinc-100 font-semibold text-sm uppercase tracking-wider">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

// 图标组件
const CircleIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={1.5} strokeDasharray="4 2" />
  </svg>
);

const RepeatIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const PaintIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
  </svg>
);

function ControlPanel({ config, onChange }) {
  return (
    <div className="h-full overflow-y-auto px-6 py-6 bg-zinc-900/50 backdrop-blur-md border-r border-zinc-800">
      <div className="mb-8">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Generative Lab
        </h1>
        <p className="text-xs text-zinc-500 mt-1">参数化矢量系统</p>
      </div>

      <Section title="原子几何" icon={<CircleIcon />}>
        <Slider
          label="基础半径"
          value={config.baseRadius}
          min={1} max={100} step={1}
          onChange={(v) => onChange({ baseRadius: v })}
        />
        <Slider
          label="频率 (花瓣数)"
          value={config.frequency}
          min={0} max={12} step={1}
          onChange={(v) => onChange({ frequency: v })}
        />
        <Slider
          label="振幅 (变形)"
          value={config.amplitude}
          min={0} max={2} step={0.01}
          onChange={(v) => onChange({ amplitude: v })}
        />
        <Slider
          label="圆度 (尖锐/圆滑)"
          value={config.roundness}
          min={0.01} max={1} step={0.01}
          onChange={(v) => onChange({ roundness: v })}
        />
        <Slider
          label="拉伸 (延长)"
          value={config.stretch}
          min={0.2} max={4} step={0.01}
          onChange={(v) => onChange({ stretch: v })}
        />
        <Slider
          label="相位 (局部旋转)"
          value={config.phase}
          min={0} max={Math.PI * 2} step={0.1}
          onChange={(v) => onChange({ phase: v })}
        />
      </Section>

      <Section title="复制阵列" icon={<RepeatIcon />}>
        <Slider
          label="数量"
          value={config.count}
          min={1} max={32} step={1}
          onChange={(v) => onChange({ count: v })}
        />
        <Slider
          label="阵列半径"
          value={config.arrayRadius}
          min={0} max={200} step={1}
          onChange={(v) => onChange({ arrayRadius: v })}
        />
        <Slider
          label="全局缩放"
          value={config.scale}
          min={0.1} max={3} step={0.1}
          onChange={(v) => onChange({ scale: v })}
        />
        <Slider
          label="全局旋转"
          value={config.rotation}
          min={0} max={360} step={1}
          onChange={(v) => onChange({ rotation: v })}
        />
      </Section>

      <Section title="样式属性" icon={<PaintIcon />}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">填充色</label>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={config.fill !== "none"} 
                onChange={(e) => onChange({ fill: e.target.checked ? "#6366f1" : "none" })} 
                className="rounded bg-zinc-700 border-zinc-600" 
              />
              <input 
                type="color" 
                value={config.fill === "none" ? "#000000" : config.fill} 
                disabled={config.fill === "none"} 
                onChange={(e) => onChange({ fill: e.target.value })} 
                className="bg-transparent h-6 w-full cursor-pointer" 
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">描边色</label>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={config.stroke !== "none"} 
                onChange={(e) => onChange({ stroke: e.target.checked ? "#e4e4e7" : "none" })} 
                className="rounded bg-zinc-700 border-zinc-600" 
              />
              <input 
                type="color" 
                value={config.stroke === "none" ? "#000000" : config.stroke} 
                disabled={config.stroke === "none"} 
                onChange={(e) => onChange({ stroke: e.target.value })} 
                className="bg-transparent h-6 w-full cursor-pointer" 
              />
            </div>
          </div>
        </div>
        <Slider
          label="描边宽度"
          value={config.strokeWidth}
          min={0.1} max={10} step={0.1}
          onChange={(v) => onChange({ strokeWidth: v })}
        />
        <Slider
          label="透明度"
          value={config.opacity}
          min={0} max={1} step={0.01}
          onChange={(v) => onChange({ opacity: v })}
        />
      </Section>
    </div>
  );
}

export default ControlPanel;
