import { useState } from "react";

// 滑块组件
function Slider({ label, value, min, max, step, onChange, disabled = false }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 text-zinc-600">
        <span>{label}</span>
        <span className="font-mono text-zinc-700">{Number(value).toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        disabled={disabled}
        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed"
      />
    </div>
  );
}

// 区域分组组件
function Section({ title, icon, children, divider = true }) {
  return (
    <div className="mb-6 pb-6">
      <div className="flex items-center gap-2 mb-4 text-zinc-800 font-semibold text-sm uppercase tracking-wider">
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

const DepthIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l8 4-8 4-8-4 8-4zm8 4v6l-8 4-8-4V7" />
  </svg>
);

const StrokeIcon = () => (
  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 20h16M6 16l10-10 2 2-10 10H6v-2z" />
  </svg>
);

function ControlPanel({ config, onChange }) {
  const [appearanceTab, setAppearanceTab] = useState("style");
  const styleOptions = [
    { key: "custom", label: "自定义" },
    { key: "glass", label: "玻璃" },
    { key: "gradient", label: "渐变" },
    { key: "mesh", label: "网格" },
    { key: "material", label: "材质" },
    { key: "minimal", label: "极简" },
  ];

  return (
    <div className="h-full overflow-y-auto px-6 py-6 bg-white">
      <div className="mb-8">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
          Generative Lab
        </h1>
        <p className="text-xs text-zinc-600 mt-1">参数化矢量系统</p>
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

      <Section title="立体感" icon={<DepthIcon />}>
        <div className="space-y-3">
          <label className="flex items-center justify-between text-xs text-zinc-700">
            <span>投影</span>
            <input
              type="checkbox"
              checked={Boolean(config.shadowEnabled)}
              onChange={(e) => onChange({ shadowEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
            />
          </label>
          {config.shadowEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">颜色</span>
                <input
                  type="color"
                  value={config.shadowColor}
                  onChange={(e) => onChange({ shadowColor: e.target.value })}
                  className="bg-transparent h-6 w-full cursor-pointer border-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="水平偏移"
                  value={config.shadowX}
                  min={-30} max={30} step={1}
                  onChange={(v) => onChange({ shadowX: v })}
                />
                <Slider
                  label="垂直偏移"
                  value={config.shadowY}
                  min={-30} max={30} step={1}
                  onChange={(v) => onChange({ shadowY: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="模糊"
                  value={config.shadowBlur}
                  min={0} max={40} step={1}
                  onChange={(v) => onChange({ shadowBlur: v })}
                />
                <Slider
                  label="强度"
                  value={config.shadowOpacity}
                  min={0} max={1} step={0.01}
                  onChange={(v) => onChange({ shadowOpacity: v })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between text-xs text-zinc-700">
            <span>内阴影</span>
            <input
              type="checkbox"
              checked={Boolean(config.innerShadowEnabled)}
              onChange={(e) => onChange({ innerShadowEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
            />
          </label>
          {config.innerShadowEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">颜色</span>
                <input
                  type="color"
                  value={config.innerShadowColor}
                  onChange={(e) => onChange({ innerShadowColor: e.target.value })}
                  className="bg-transparent h-6 w-full cursor-pointer border-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="水平偏移"
                  value={config.innerShadowX}
                  min={-30} max={30} step={1}
                  onChange={(v) => onChange({ innerShadowX: v })}
                />
                <Slider
                  label="垂直偏移"
                  value={config.innerShadowY}
                  min={-30} max={30} step={1}
                  onChange={(v) => onChange({ innerShadowY: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="模糊"
                  value={config.innerShadowBlur}
                  min={0} max={40} step={1}
                  onChange={(v) => onChange({ innerShadowBlur: v })}
                />
                <Slider
                  label="强度"
                  value={config.innerShadowOpacity}
                  min={0} max={1} step={0.01}
                  onChange={(v) => onChange({ innerShadowOpacity: v })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between text-xs text-zinc-700">
            <span>双描边</span>
            <input
              type="checkbox"
              checked={Boolean(config.doubleStrokeEnabled)}
              onChange={(e) => onChange({ doubleStrokeEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
            />
          </label>
          {config.doubleStrokeEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">外描边色</span>
                <input
                  type="color"
                  value={config.doubleStrokeColor}
                  onChange={(e) => onChange({ doubleStrokeColor: e.target.value })}
                  className="bg-transparent h-6 w-full cursor-pointer border-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="外描边增量"
                  value={config.doubleStrokeWidth}
                  min={0} max={12} step={0.5}
                  onChange={(v) => onChange({ doubleStrokeWidth: v })}
                />
                <Slider
                  label="外描边强度"
                  value={config.doubleStrokeOpacity}
                  min={0} max={1} step={0.01}
                  onChange={(v) => onChange({ doubleStrokeOpacity: v })}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between text-xs text-zinc-700">
            <span>挤出层</span>
            <input
              type="checkbox"
              checked={Boolean(config.extrudeEnabled)}
              onChange={(e) => onChange({ extrudeEnabled: e.target.checked })}
              className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
            />
          </label>
          {config.extrudeEnabled && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600">侧面色</span>
                <input
                  type="color"
                  value={config.extrudeColor}
                  onChange={(e) => onChange({ extrudeColor: e.target.value })}
                  className="bg-transparent h-6 w-full cursor-pointer border-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="层数"
                  value={config.extrudeDepth}
                  min={1} max={24} step={1}
                  onChange={(v) => onChange({ extrudeDepth: v })}
                />
                <Slider
                  label="衰减"
                  value={config.extrudeFade}
                  min={0} max={1} step={0.01}
                  onChange={(v) => onChange({ extrudeFade: v })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Slider
                  label="水平偏移"
                  value={config.extrudeOffsetX}
                  min={-30} max={30} step={1}
                  onChange={(v) => onChange({ extrudeOffsetX: v })}
                />
                <Slider
                  label="垂直偏移"
                  value={config.extrudeOffsetY}
                  min={-30} max={30} step={1}
                  onChange={(v) => onChange({ extrudeOffsetY: v })}
                />
              </div>
              <Slider
                label="整体强度"
                value={config.extrudeOpacity}
                min={0} max={1} step={0.01}
                onChange={(v) => onChange({ extrudeOpacity: v })}
              />
            </div>
          )}
        </div>
      </Section>

      <Section title="外观设置" icon={<PaintIcon />} divider={false}>
        <div className="mb-4">
          <div className="inline-flex rounded-lg bg-zinc-100 p-1 text-xs">
            <button
              type="button"
              onClick={() => setAppearanceTab("style")}
              className={`px-3 py-1 rounded-md transition-colors ${
                appearanceTab === "style"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              样式属性
            </button>
            <button
              type="button"
              onClick={() => setAppearanceTab("stroke")}
              className={`px-3 py-1 rounded-md transition-colors ${
                appearanceTab === "stroke"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-800"
              }`}
            >
              描边样式
            </button>
          </div>
        </div>

        {appearanceTab === "style" ? (
          <>
            <div className="mb-5">
              <div className="text-xs text-zinc-600 mb-2 uppercase tracking-wider">填色风格</div>
              <div className="grid grid-cols-3 gap-2">
                {styleOptions.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => onChange({ styleMode: option.key })}
                    className={`px-2 py-1 rounded-md text-xs transition-colors ${
                      config.styleMode === option.key
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-zinc-50">
                <div className="text-xs text-zinc-600 mb-2">填充</div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.fill !== "none"}
                    onChange={(e) => onChange({ fill: e.target.checked ? "#6366f1" : "none" })}
                    className="rounded border-0 bg-zinc-200"
                  />
                  <input
                    type="color"
                    value={config.fill === "none" ? "#000000" : config.fill}
                    onChange={(e) => onChange({ fill: e.target.value })}
                    className="bg-transparent h-7 w-full cursor-pointer border-0"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <label className="flex items-center justify-between text-xs text-zinc-700">
                <span>渐变填充</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.useGradient)}
                  onChange={(e) => onChange({ useGradient: e.target.checked })}
                  className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
                />
              </label>
              {config.useGradient && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-zinc-50">
                    <div className="text-xs text-zinc-600 mb-2">渐变起始</div>
                    <input
                      type="color"
                      value={config.gradientFrom ?? "#6366f1"}
                      onChange={(e) => onChange({ gradientFrom: e.target.value })}
                      className="bg-transparent h-7 w-full cursor-pointer border-0"
                    />
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50">
                    <div className="text-xs text-zinc-600 mb-2">渐变结束</div>
                    <input
                      type="color"
                      value={config.gradientTo ?? "#22d3ee"}
                      onChange={(e) => onChange({ gradientTo: e.target.value })}
                      className="bg-transparent h-7 w-full cursor-pointer border-0"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="flex items-center justify-between text-xs text-zinc-700">
              <span>考虑负空间</span>
              <input
                type="checkbox"
                checked={Boolean(config.useNegativeSpace)}
                onChange={(e) => onChange({ useNegativeSpace: e.target.checked })}
                className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-zinc-700">
              <span>反向填充</span>
              <input
                type="checkbox"
                checked={Boolean(config.invertFill)}
                onChange={(e) => onChange({ invertFill: e.target.checked })}
                className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
              />
            </label>

            <div className="mt-4 space-y-3">
              <Slider
                label="透明度"
                value={config.opacity}
                min={0} max={1} step={0.01}
                onChange={(v) => onChange({ opacity: v })}
              />
            </div>
          </>
        ) : (
          <>
            <div className="p-3 rounded-lg bg-zinc-50 mb-4">
              <div className="text-xs text-zinc-600 mb-2">描边</div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.stroke !== "none"}
                  onChange={(e) => onChange({ stroke: e.target.checked ? "#e4e4e7" : "none" })}
                  className="rounded border-0 bg-zinc-200"
                />
                <input
                  type="color"
                  value={config.stroke === "none" ? "#000000" : config.stroke}
                  onChange={(e) => onChange({ stroke: e.target.value })}
                  className="bg-transparent h-7 w-full cursor-pointer border-0"
                />
              </div>
            </div>

            <div className="mb-4 space-y-3">
              <label className="flex items-center justify-between text-xs text-zinc-700">
                <span>描边渐变</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.strokeUseGradient)}
                  onChange={(e) => onChange({ strokeUseGradient: e.target.checked })}
                  className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
                />
              </label>
              {config.strokeUseGradient && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-zinc-50">
                      <div className="text-xs text-zinc-600 mb-2">渐变起始</div>
                      <input
                        type="color"
                        value={config.strokeGradientFrom ?? "#6366f1"}
                        onChange={(e) => onChange({ strokeGradientFrom: e.target.value })}
                        className="bg-transparent h-7 w-full cursor-pointer border-0"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-50">
                      <div className="text-xs text-zinc-600 mb-2">渐变结束</div>
                      <input
                        type="color"
                        value={config.strokeGradientTo ?? "#22d3ee"}
                        onChange={(e) => onChange({ strokeGradientTo: e.target.value })}
                        className="bg-transparent h-7 w-full cursor-pointer border-0"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-700">
                    <span>渐变类型</span>
                    <select
                      value={config.strokeGradientType ?? "linear"}
                      onChange={(e) => onChange({ strokeGradientType: e.target.value })}
                      className="bg-zinc-100 border-0 rounded px-2 py-1 text-xs text-zinc-800"
                    >
                      <option value="linear">线性</option>
                      <option value="radial-in">径向 (内→外)</option>
                      <option value="radial-out">径向 (外→内)</option>
                      <option value="array-cw">阵列顺时针</option>
                      <option value="array-ccw">阵列逆时针</option>
                    </select>
                  </div>
                </>
              )}
              <label className="flex items-center justify-between text-xs text-zinc-700">
                <span>虚线</span>
                <input
                  type="checkbox"
                  checked={Boolean(config.strokeDashEnabled)}
                  onChange={(e) => onChange({ strokeDashEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-0 bg-zinc-200 text-indigo-600"
                />
              </label>
              {config.strokeDashEnabled && (
                <div className="grid grid-cols-2 gap-3">
                  <Slider
                    label="线段长度"
                    value={config.strokeDashLength}
                    min={1} max={40} step={1}
                    onChange={(v) => onChange({ strokeDashLength: v })}
                  />
                  <Slider
                    label="间距"
                    value={config.strokeDashGap}
                    min={1} max={40} step={1}
                    onChange={(v) => onChange({ strokeDashGap: v })}
                  />
                  <Slider
                    label="偏移"
                    value={config.strokeDashOffset}
                    min={-40} max={40} step={1}
                    onChange={(v) => onChange({ strokeDashOffset: v })}
                  />
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-zinc-700">
                <span>端点</span>
                <select
                  value={config.strokeLinecap ?? "round"}
                  onChange={(e) => onChange({ strokeLinecap: e.target.value })}
                  className="bg-zinc-100 border-0 rounded px-2 py-1 text-xs text-zinc-800"
                >
                  <option value="butt">平</option>
                  <option value="round">圆</option>
                  <option value="square">方</option>
                </select>
              </div>
            </div>

            <Slider
              label="描边宽度"
              value={config.strokeWidth}
              min={0.1} max={10} step={0.1}
              onChange={(v) => onChange({ strokeWidth: v })}
            />
          </>
        )}
      </Section>

    </div>
  );
}

export default ControlPanel;
