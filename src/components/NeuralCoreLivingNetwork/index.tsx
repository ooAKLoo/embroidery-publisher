import { useMemo, useState } from 'react';
import Scene from './components/Scene';
import { GeometryType, NeuralCoreConfig } from './types';

const DEFAULT_CONFIG: NeuralCoreConfig = {
  geometry: 'sphere',
  smoothness: 0.85,
  noiseAmplitude: 0.24,
  noiseFrequency: 1.4,
  intensity: 0.9,
  rotationSpeed: 0.08,
  showStars: true,
  showParticles: false,
  enableOrbit: true,
  // 默认颜色（紫色主题）
  colorBase: '#1a0b36',
  colorAccent: '#3b27b5',
  colorGlow: '#8f00ff',
};

// 颜色预设
const COLOR_PRESETS = [
  { key: 'purple', label: '紫', colors: ['#1a0b36', '#3b27b5', '#8f00ff'] },
  { key: 'blue', label: '蓝', colors: ['#0a1628', '#1e40af', '#3b82f6'] },
  { key: 'cyan', label: '青', colors: ['#042f2e', '#0e7490', '#06b6d4'] },
  { key: 'green', label: '绿', colors: ['#052e16', '#15803d', '#22c55e'] },
  { key: 'orange', label: '橙', colors: ['#2a1a0a', '#c2410c', '#f97316'] },
  { key: 'pink', label: '粉', colors: ['#2a0a1e', '#be185d', '#ec4899'] },
  { key: 'red', label: '红', colors: ['#2a0a0a', '#b91c1c', '#ef4444'] },
  { key: 'gold', label: '金', colors: ['#1a1a0a', '#a16207', '#eab308'] },
];

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// 滑块组件 - 遵循设计规范
function Slider({
  label,
  value,
  onChange,
  suffix = '%'
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="flex-1 bg-neutral-50 rounded-lg p-2">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[9px] font-medium text-neutral-500">{label}</span>
        <span className="text-[9px] font-semibold text-neutral-700">{value}{suffix}</span>
      </div>
      <input
        type="range"
        className="w-full h-1 bg-neutral-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-800"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// 开关按钮组件 - 遵循设计规范
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

const NeuralCoreLivingNetwork = () => {
  const [config, setConfig] = useState(() => ({ ...DEFAULT_CONFIG }));

  const smoothnessValue = Math.round(config.smoothness * 100);
  const noiseAmpValue = Math.round((config.noiseAmplitude / 0.6) * 100);
  const noiseFreqValue = Math.round(((config.noiseFrequency - 0.6) / 2.4) * 100);
  const intensityValue = Math.round((config.intensity / 2) * 100);
  const rotationValue = Math.round((config.rotationSpeed / 0.2) * 100);

  const derivedConfig = useMemo(() => ({
    ...config,
    smoothness: clamp(config.smoothness, 0, 1),
    noiseAmplitude: clamp(config.noiseAmplitude, 0, 0.6),
    noiseFrequency: clamp(config.noiseFrequency, 0.6, 3.0),
    intensity: clamp(config.intensity, 0, 2),
    rotationSpeed: clamp(config.rotationSpeed, 0, 0.2),
  }), [config]);

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl">
      {/* 左侧预览区域 */}
      <div className="flex-1 bg-black overflow-hidden">
        <Scene config={derivedConfig} />
      </div>

      {/* 右侧控制面板 */}
      <div className="w-[280px] flex-shrink-0 bg-white flex flex-col overflow-hidden">
        {/* 控制面板整体容器 */}
        <div className="flex-1 bg-neutral-100 flex flex-col overflow-hidden">
          <div className="p-3 overflow-y-auto flex-1 min-h-0">

            {/* 几何形态卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Geometry
              </div>
              <div className="flex gap-1">
                {[
                  { value: 'sphere', label: '球体' },
                  { value: 'icosahedron', label: '多面体' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    className={`flex-1 py-1.5 px-1 text-[10px] font-medium rounded-lg transition-all ${
                      config.geometry === opt.value
                        ? "bg-neutral-800 text-white"
                        : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                    }`}
                    onClick={() => setConfig(prev => ({ ...prev, geometry: opt.value as GeometryType }))}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 形态参数卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Shape
              </div>
              <div className="space-y-2">
                <Slider
                  label="平滑度"
                  value={smoothnessValue}
                  onChange={(v) => setConfig(prev => ({ ...prev, smoothness: v / 100 }))}
                />
                <div className="flex gap-2">
                  <Slider
                    label="噪声强度"
                    value={noiseAmpValue}
                    onChange={(v) => setConfig(prev => ({ ...prev, noiseAmplitude: (v / 100) * 0.6 }))}
                  />
                  <Slider
                    label="噪声频率"
                    value={noiseFreqValue}
                    onChange={(v) => setConfig(prev => ({ ...prev, noiseFrequency: 0.6 + (v / 100) * 2.4 }))}
                  />
                </div>
              </div>
            </div>

            {/* 动态参数卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Dynamics
              </div>
              <div className="flex gap-2">
                <Slider
                  label="能量强度"
                  value={intensityValue}
                  onChange={(v) => setConfig(prev => ({ ...prev, intensity: (v / 100) * 2 }))}
                />
                <Slider
                  label="自转速度"
                  value={rotationValue}
                  onChange={(v) => setConfig(prev => ({ ...prev, rotationSpeed: (v / 100) * 0.2 }))}
                />
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
                      config.colorBase === preset.colors[0]
                        ? "ring-2 ring-neutral-800 ring-offset-1 scale-110"
                        : "opacity-70 hover:opacity-100 hover:scale-105"
                    }`}
                    onClick={() => setConfig(prev => ({
                      ...prev,
                      colorBase: preset.colors[0],
                      colorAccent: preset.colors[1],
                      colorGlow: preset.colors[2],
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
                  <div className="text-[9px] font-medium text-neutral-500 mb-1">基色</div>
                  <input
                    type="color"
                    value={config.colorBase}
                    onChange={(e) => setConfig(prev => ({ ...prev, colorBase: e.target.value }))}
                    className="w-full h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex-1 bg-neutral-50 rounded-lg p-2">
                  <div className="text-[9px] font-medium text-neutral-500 mb-1">中间色</div>
                  <input
                    type="color"
                    value={config.colorAccent}
                    onChange={(e) => setConfig(prev => ({ ...prev, colorAccent: e.target.value }))}
                    className="w-full h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
                <div className="flex-1 bg-neutral-50 rounded-lg p-2">
                  <div className="text-[9px] font-medium text-neutral-500 mb-1">发光色</div>
                  <input
                    type="color"
                    value={config.colorGlow}
                    onChange={(e) => setConfig(prev => ({ ...prev, colorGlow: e.target.value }))}
                    className="w-full h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 视觉效果卡片 */}
            <div className="bg-white rounded-xl p-3 mb-2">
              <div className="text-[9px] font-medium text-neutral-400 uppercase tracking-wide mb-2">
                Effects
              </div>
              <div className="flex gap-1">
                <ToggleButton
                  label="星空"
                  enabled={config.showStars}
                  onToggle={() => setConfig(prev => ({ ...prev, showStars: !prev.showStars }))}
                />
                <ToggleButton
                  label="粒子"
                  enabled={config.showParticles}
                  onToggle={() => setConfig(prev => ({ ...prev, showParticles: !prev.showParticles }))}
                />
                <ToggleButton
                  label="轨道"
                  enabled={config.enableOrbit}
                  onToggle={() => setConfig(prev => ({ ...prev, enableOrbit: !prev.enableOrbit }))}
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

export default NeuralCoreLivingNetwork;
