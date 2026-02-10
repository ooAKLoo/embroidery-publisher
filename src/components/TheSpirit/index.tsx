import { useState, useMemo } from 'react';
import Scene from './components/Scene';
import { SpiritConfig } from './types';

const DEFAULT_CONFIG: SpiritConfig = {
  particleCount: 50000,
  speed: 1.0,
  turbulence: 0.5,
  curlScale: 0.02,
  curlStrength: 1.0,
  colorA: '#00d4ff',
  colorB: '#ff00ff',
  particleSize: 1.5,
  opacity: 0.8,
  trailLength: 0.95,
  mouseInfluence: 0.3,
  showBackground: true,
};

// 颜色预设
const COLOR_PRESETS = [
  { key: 'cyan-pink', label: '青粉', colors: ['#00d4ff', '#ff00ff'] },
  { key: 'blue-purple', label: '蓝紫', colors: ['#3b82f6', '#8b5cf6'] },
  { key: 'green-cyan', label: '绿青', colors: ['#10b981', '#06b6d4'] },
  { key: 'orange-red', label: '橙红', colors: ['#f97316', '#ef4444'] },
  { key: 'gold-amber', label: '金琥', colors: ['#eab308', '#f59e0b'] },
  { key: 'white-gray', label: '白灰', colors: ['#ffffff', '#9ca3af'] },
  { key: 'pink-rose', label: '粉玫', colors: ['#ec4899', '#f43f5e'] },
  { key: 'indigo-blue', label: '靛蓝', colors: ['#6366f1', '#3b82f6'] },
];

// 滑块组件
function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix = ''
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  const displayValue = step < 1 ? value.toFixed(2) : Math.round(value);
  return (
    <div className="flex-1 bg-neutral-50 rounded-lg p-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-medium text-neutral-500">{label}</span>
        <span className="text-[9px] font-semibold text-neutral-700">{displayValue}{suffix}</span>
      </div>
      <input
        type="range"
        className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// 开关按钮组件
function ToggleButton({
  label,
  enabled,
  onToggle
}: {
  label: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={`flex-1 py-1.5 px-2 text-[10px] font-medium rounded-lg transition-all ${
        enabled
          ? "bg-neutral-800 text-white"
          : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
      }`}
      onClick={onToggle}
    >
      {label}
    </button>
  );
}

const TheSpirit = () => {
  const [config, setConfig] = useState<SpiritConfig>(() => ({ ...DEFAULT_CONFIG }));

  const derivedConfig = useMemo(() => ({
    ...config,
    particleCount: Math.round(config.particleCount),
    speed: Math.max(0.1, Math.min(3, config.speed)),
    turbulence: Math.max(0, Math.min(2, config.turbulence)),
    curlScale: Math.max(0.001, Math.min(0.1, config.curlScale)),
    curlStrength: Math.max(0, Math.min(3, config.curlStrength)),
    particleSize: Math.max(0.5, Math.min(5, config.particleSize)),
    opacity: Math.max(0.1, Math.min(1, config.opacity)),
    trailLength: Math.max(0.5, Math.min(0.99, config.trailLength)),
    mouseInfluence: Math.max(0, Math.min(1, config.mouseInfluence)),
  }), [config]);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl">
      {/* 左侧预览区域 */}
      <div className="flex-1 bg-black overflow-hidden">
        <Scene config={derivedConfig} />
      </div>

      {/* 右侧控制面板 */}
      <div className="w-[280px] flex-shrink-0 bg-white flex flex-col overflow-hidden">
        <div className="flex-1 bg-neutral-100 flex flex-col overflow-hidden">
          <div className="p-3 overflow-y-auto flex-1 min-h-0">

            {/* 粒子数量卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Particles
              </div>
              <div className="flex gap-1 mb-2">
                {[
                  { value: 20000, label: '2万' },
                  { value: 50000, label: '5万' },
                  { value: 100000, label: '10万' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`flex-1 py-1.5 px-1 text-[10px] font-medium rounded-lg transition-all ${
                      config.particleCount === opt.value
                        ? "bg-neutral-800 text-white"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                    onClick={() => setConfig(prev => ({ ...prev, particleCount: opt.value }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <Slider
                label="粒子大小"
                value={config.particleSize}
                min={0.5}
                max={5}
                step={0.1}
                onChange={(v) => setConfig(prev => ({ ...prev, particleSize: v }))}
              />
            </div>

            {/* 运动参数卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Motion
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Slider
                    label="速度"
                    value={config.speed}
                    min={0.1}
                    max={3}
                    step={0.1}
                    onChange={(v) => setConfig(prev => ({ ...prev, speed: v }))}
                  />
                  <Slider
                    label="湍流"
                    value={config.turbulence}
                    min={0}
                    max={2}
                    step={0.1}
                    onChange={(v) => setConfig(prev => ({ ...prev, turbulence: v }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Slider
                    label="卷曲尺度"
                    value={config.curlScale * 100}
                    min={0.1}
                    max={10}
                    step={0.1}
                    onChange={(v) => setConfig(prev => ({ ...prev, curlScale: v / 100 }))}
                  />
                  <Slider
                    label="卷曲强度"
                    value={config.curlStrength}
                    min={0}
                    max={3}
                    step={0.1}
                    onChange={(v) => setConfig(prev => ({ ...prev, curlStrength: v }))}
                  />
                </div>
              </div>
            </div>

            {/* 颜色卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Colors
              </div>
              {/* 颜色预设 */}
              <div className="flex gap-1.5 mb-3">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.key}
                    className={`w-6 h-6 rounded-lg overflow-hidden transition-all flex-shrink-0 ${
                      config.colorA === preset.colors[0] && config.colorB === preset.colors[1]
                        ? "ring-2 ring-neutral-800 ring-offset-1 scale-110"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      colorA: preset.colors[0],
                      colorB: preset.colors[1],
                    }))}
                    title={preset.label}
                  >
                    <div
                      className="w-full h-full"
                      style={{ background: `linear-gradient(135deg, ${preset.colors.join(", ")})` }}
                    />
                  </button>
                ))}
              </div>
              {/* 自定义颜色 */}
              <div className="flex gap-2">
                <div className="flex-1 bg-neutral-50 rounded-lg p-2">
                  <div className="text-[9px] font-medium text-neutral-500 mb-1">颜色 A</div>
                  <input
                    type="color"
                    value={config.colorA}
                    onChange={(e) => setConfig(prev => ({ ...prev, colorA: e.target.value }))}
                    className="w-full h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex-1 bg-neutral-50 rounded-lg p-2">
                  <div className="text-[9px] font-medium text-neutral-500 mb-1">颜色 B</div>
                  <input
                    type="color"
                    value={config.colorB}
                    onChange={(e) => setConfig(prev => ({ ...prev, colorB: e.target.value }))}
                    className="w-full h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 视觉效果卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Visual
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Slider
                    label="透明度"
                    value={config.opacity}
                    min={0.1}
                    max={1}
                    step={0.05}
                    onChange={(v) => setConfig(prev => ({ ...prev, opacity: v }))}
                  />
                  <Slider
                    label="拖尾"
                    value={config.trailLength}
                    min={0.5}
                    max={0.99}
                    step={0.01}
                    onChange={(v) => setConfig(prev => ({ ...prev, trailLength: v }))}
                  />
                </div>
                <Slider
                  label="鼠标影响"
                  value={config.mouseInfluence}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => setConfig(prev => ({ ...prev, mouseInfluence: v }))}
                />
              </div>
            </div>

            {/* 开关卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Options
              </div>
              <div className="flex gap-1">
                <ToggleButton
                  label="背景"
                  enabled={config.showBackground}
                  onToggle={() => setConfig(prev => ({ ...prev, showBackground: !prev.showBackground }))}
                />
              </div>
            </div>

            {/* 重置按钮卡片 */}
            <div className="bg-white rounded-xl p-3">
              <button
                onClick={() => setConfig({ ...DEFAULT_CONFIG })}
                className="w-full py-1.5 text-[10px] font-medium bg-neutral-100 text-neutral-500 rounded-lg hover:bg-neutral-200 transition-all flex items-center justify-center gap-1.5"
              >
                <span>🎲</span>
                重置参数
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TheSpirit;
