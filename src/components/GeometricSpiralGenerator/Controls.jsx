import { useState } from 'react';
import { Download, Shuffle, Circle, BoxSelect, RotateCcw } from 'lucide-react';
import { PRESETS, DEFAULT_CONFIG } from './constants';
import { describeArc, describeRibbon } from './utils';

const toRadians = (deg) => (deg * Math.PI) / 180;
const toDegrees = (rad) => (rad * 180) / Math.PI;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const computeArcLength = (radius, angleDeg) => radius * toRadians(angleDeg);
const computeArcAngle = (radius, length) => (radius > 0 ? toDegrees(length / radius) : 0);

const Slider = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>
      <span className="text-xs text-slate-600 font-mono">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white text-slate-700 text-sm rounded px-2 py-1.5 border border-zinc-200 focus:outline-none focus:border-indigo-300"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const PresetThumb = ({ config: c, bgColor }) => {
  const full = { ...DEFAULT_CONFIG, ...c };
  const halfAngle = full.arcAngle / 2;
  const pathD = full.shapeMode === 'ribbon'
    ? describeRibbon(0, 0, full.arcRadius, full.strokeWidth, -halfAngle, halfAngle, full.ribbonCap)
    : describeArc(0, 0, full.arcRadius, -halfAngle, halfAngle);
  const segments = Math.max(1, full.segments);
  const items = Array.from({ length: segments }, (_, i) => ({
    id: i,
    rotation: (360 / segments) * i + (full.rotation || 0)
  }));
  const gradId = `thumb-grad-${Math.random().toString(36).slice(2, 8)}`;
  const getFill = () => {
    if (full.fillMode === 'none') return 'none';
    if (full.fillMode === 'solid') return full.color;
    return `url(#${gradId})`;
  };
  return (
    <svg viewBox="-300 -300 600 600" className="w-full h-full">
      <rect x="-300" y="-300" width="600" height="600" fill={bgColor || '#000000'} />
      <defs>
        {full.fillMode === 'linear-gradient' && (
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            {full.glossy ? (
              <>
                <stop offset="0%" stopColor={full.color} />
                <stop offset="50%" stopColor={full.color2} />
                <stop offset="100%" stopColor={full.color} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor={full.color} />
                <stop offset="100%" stopColor={full.color2} />
              </>
            )}
          </linearGradient>
        )}
        {full.fillMode === 'radial-gradient' && (
          <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
            {full.glossy ? (
              <>
                <stop offset="0%" stopColor={full.color2} />
                <stop offset="50%" stopColor={full.color} />
                <stop offset="100%" stopColor={full.color2} />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor={full.color} />
                <stop offset="100%" stopColor={full.color2} stopOpacity="0" />
              </>
            )}
          </radialGradient>
        )}
      </defs>
      {items.map((item) => (
        <g key={item.id} transform={`rotate(${item.rotation})`}>
          <g transform={`translate(0, -${full.radius}) rotate(${full.tilt})`}>
            <path
              d={pathD}
              fill={getFill()}
              fillOpacity={full.fillMode === 'none' ? 0 : full.fillOpacity}
              stroke={full.color}
              strokeWidth={full.shapeMode === 'stroke' ? full.strokeWidth : 1}
              strokeLinecap="round"
              strokeOpacity={full.strokeOpacity}
              style={{ mixBlendMode: full.blendMode }}
            />
          </g>
        </g>
      ))}
    </svg>
  );
};

function Controls({ config, onChange, onRandomize, onDownload, onImport, onExportChange }) {
  const [presetName, setPresetName] = useState('custom');

  const update = (key, value) => {
    if (presetName !== 'custom') {
      setPresetName('custom');
    }
    const next = { ...config, [key]: value };

    if (key === 'lockArcLength') {
      if (value) {
        next.arcLength = computeArcLength(next.arcRadius, next.arcAngle);
      } else {
        next.arcAngle = clamp(computeArcAngle(next.arcRadius, next.arcLength), 1, 360);
      }
      onChange(next);
      return;
    }

    if (key === 'arcLength') {
      const maxLength = 2 * Math.PI * next.arcRadius;
      next.arcLength = clamp(value, 1, maxLength);
      next.arcAngle = clamp(computeArcAngle(next.arcRadius, next.arcLength), 1, 360);
    }

    if (key === 'arcRadius') {
      if (next.lockArcLength) {
        const maxLength = 2 * Math.PI * value;
        next.arcLength = clamp(next.arcLength, 1, maxLength);
        next.arcAngle = clamp(computeArcAngle(value, next.arcLength), 1, 360);
      } else {
        next.arcLength = computeArcLength(value, next.arcAngle);
      }
    }

    if (key === 'arcAngle' && !next.lockArcLength) {
      next.arcLength = computeArcLength(next.arcRadius, value);
    }

    onChange(next);
  };

  const applyPreset = (presetName) => {
    if (presetName === 'custom') {
      setPresetName('custom');
      return;
    }
    const preset = PRESETS[presetName];
    if (preset) {
      setPresetName(presetName);
      const presetConfig = preset.config ?? preset;
      const next = { ...config, ...presetConfig };
      if (!next.lockArcLength) {
        next.arcLength = computeArcLength(next.arcRadius, next.arcAngle);
      } else {
        const maxLength = 2 * Math.PI * next.arcRadius;
        next.arcLength = clamp(next.arcLength, 1, maxLength);
        next.arcAngle = clamp(computeArcAngle(next.arcRadius, next.arcLength), 1, 360);
      }
      onChange(next);
      if (preset.export && onExportChange) {
        onExportChange(preset.export);
      }
    }
  };

  return (
    <div className="p-6 rounded-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Spiral Generator</h2>
          <p className="text-xs text-slate-400 mt-1">几何螺旋图标生成</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRandomize}
            className="p-2 hover:bg-zinc-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
            title="随机生成"
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={onImport}
            className="p-2 hover:bg-zinc-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
            title="恢复参数"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onDownload}
            className="p-2 hover:bg-zinc-100 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
            title="下载 SVG"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="mb-6 border-b border-zinc-200 pb-4">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">预设样式</label>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {Object.entries(PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                className={`aspect-square rounded-lg border overflow-hidden transition-all ${
                  presetName === name
                    ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                    : 'border-zinc-200 hover:border-zinc-400'
                } bg-white`}
                title={name}
              >
                <PresetThumb config={preset.config ?? preset} bgColor={preset.export?.bgColor} />
              </button>
            ))}
          </div>

          <div className="flex bg-zinc-200 p-1 rounded-lg mb-4">
            <button
              onClick={() => update('shapeMode', 'stroke')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-all ${
                config.shapeMode === 'stroke'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Circle size={14} /> 线条
            </button>
            <button
              onClick={() => update('shapeMode', 'ribbon')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-all ${
                config.shapeMode === 'ribbon'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BoxSelect size={14} /> 丝带
            </button>
          </div>

          {config.shapeMode === 'ribbon' ? (
            <Select
              label="丝带端头"
              value={config.ribbonCap}
              onChange={(v) => update('ribbonCap', v)}
              options={[
                { label: '方形', value: 'flat' },
                { label: '圆角', value: 'round' }
              ]}
            />
          ) : null}

          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-500 uppercase mb-1">主色</label>
              <input
                type="color"
                value={config.color}
                onChange={(e) => update('color', e.target.value)}
                className="w-full h-8 bg-white rounded cursor-pointer border border-zinc-200"
              />
            </div>
            {String(config.fillMode).includes('gradient') ? (
              <div className="flex-1">
                <label className="block text-[10px] text-slate-500 uppercase mb-1">辅色</label>
                <input
                  type="color"
                  value={config.color2}
                  onChange={(e) => update('color2', e.target.value)}
                  className="w-full h-8 bg-white rounded cursor-pointer border border-zinc-200"
                />
              </div>
            ) : null}
          </div>

          {String(config.fillMode).includes('gradient') ? (
            <div className="mb-4 flex items-center justify-between">
              <label className="text-xs font-medium text-slate-500 uppercase">高光</label>
              <button
                onClick={() => update('glossy', !config.glossy)}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  config.glossy ? 'bg-purple-500' : 'bg-zinc-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${config.glossy ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="填充样式"
              value={config.fillMode}
              onChange={(v) => update('fillMode', v)}
              options={[
                { label: '无填充', value: 'none' },
                { label: '纯色填充', value: 'solid' },
                { label: '线性渐变', value: 'linear-gradient' },
                { label: '径向渐变', value: 'radial-gradient' }
              ]}
            />
            <Select
              label="混合模式"
              value={config.blendMode}
              onChange={(v) => update('blendMode', v)}
              options={[
                { label: '正常', value: 'normal' },
                { label: '屏幕 (发光)', value: 'screen' },
                { label: '叠加', value: 'overlay' },
                { label: '正片叠底', value: 'multiply' },
                { label: '差值', value: 'difference' }
              ]}
            />
          </div>
        </div>

        <Slider
          label="Segments"
          value={config.segments}
          min={1}
          max={60}
          onChange={(v) => update('segments', v)}
        />

        <div className="h-px bg-zinc-200 my-4" />

        <Slider
          label="Spread (Radius)"
          value={config.radius}
          min={0}
          max={300}
          onChange={(v) => update('radius', v)}
        />

        <Slider
          label="Tilt / Spin"
          value={config.tilt}
          min={-180}
          max={180}
          onChange={(v) => update('tilt', v)}
        />

        <Slider
          label="Rotation"
          value={config.rotation}
          min={0}
          max={360}
          onChange={(v) => update('rotation', v)}
        />

        <div className="h-px bg-zinc-200 my-4" />

        <Slider
          label="Curvature"
          value={config.arcRadius}
          min={10}
          max={500}
          onChange={(v) => update('arcRadius', v)}
        />

        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">锁定弧长</label>
          <button
            onClick={() => update('lockArcLength', !config.lockArcLength)}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              config.lockArcLength ? 'bg-purple-500' : 'bg-zinc-300'
            }`}
          >
            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${config.lockArcLength ? 'translate-x-5' : ''}`} />
          </button>
        </div>

        {config.lockArcLength ? (
          <Slider
            label="Arc Length"
            value={Math.round((config.arcLength ?? computeArcLength(config.arcRadius, config.arcAngle)) * 10) / 10}
            min={1}
            max={Math.max(10, Math.round(2 * Math.PI * config.arcRadius))}
            step={1}
            onChange={(v) => update('arcLength', v)}
          />
        ) : (
          <Slider
            label="Arc Angle"
            value={config.arcAngle}
            min={1}
            max={360}
            onChange={(v) => update('arcAngle', v)}
          />
        )}

        <div className="h-px bg-zinc-200 my-4" />

        <div className="grid grid-cols-2 gap-4">
          <Slider
            label={config.shapeMode === 'ribbon' ? 'Thickness' : 'Width'}
            value={config.strokeWidth}
            min={0}
            max={150}
            onChange={(v) => update('strokeWidth', v)}
          />
          <Slider
            label="Str. Opacity"
            value={config.strokeOpacity}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) => update('strokeOpacity', v)}
          />
        </div>

        {config.fillMode !== 'none' ? (
          <Slider
            label="Fill Opacity"
            value={config.fillOpacity}
            min={0}
            max={1}
            step={0.1}
            onChange={(v) => update('fillOpacity', v)}
          />
        ) : null}
      </div>

      <div className="mt-6 p-4 bg-zinc-100 rounded border border-zinc-200">
        <p className="text-xs text-slate-500 text-center">
          Tip: 试试 8 段 + 负角度倾斜，比较接近参考效果。
        </p>
      </div>
    </div>
  );
}

export default Controls;
