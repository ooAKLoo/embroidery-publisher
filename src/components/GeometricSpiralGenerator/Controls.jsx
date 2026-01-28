import { useState } from 'react';
import { Download, Shuffle, Circle, BoxSelect, RotateCcw } from 'lucide-react';
import { PRESETS } from './constants';

const toRadians = (deg) => (deg * Math.PI) / 180;
const toDegrees = (rad) => (rad * 180) / Math.PI;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const computeArcLength = (radius, angleDeg) => radius * toRadians(angleDeg);
const computeArcAngle = (radius, length) => (radius > 0 ? toDegrees(length / radius) : 0);

const Slider = ({ label, value, min, max, step = 1, onChange }) => (
  <div className="mb-4">
    <div className="flex justify-between mb-1">
      <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{label}</label>
      <span className="text-xs text-zinc-300 font-mono">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-zinc-300 transition-all"
    />
  </div>
);

const Select = ({ label, value, options, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-800 text-zinc-200 text-sm rounded px-2 py-1.5 border border-zinc-700 focus:outline-none focus:border-zinc-500"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

function Controls({ config, onChange, onRandomize, onDownload, onImport }) {
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
      const next = { ...config, ...preset };
      if (!next.lockArcLength) {
        next.arcLength = computeArcLength(next.arcRadius, next.arcAngle);
      } else {
        const maxLength = 2 * Math.PI * next.arcRadius;
        next.arcLength = clamp(next.arcLength, 1, maxLength);
        next.arcAngle = clamp(computeArcAngle(next.arcRadius, next.arcLength), 1, 360);
      }
      onChange(next);
    }
  };

  return (
    <div className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-6 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-white">Spiral Generator</h2>
          <p className="text-xs text-zinc-500 mt-1">几何螺旋图标生成</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRandomize}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="随机生成"
          >
            <Shuffle size={18} />
          </button>
          <button
            onClick={onImport}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="恢复参数"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onDownload}
            className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
            title="下载 SVG"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="mb-6 border-b border-zinc-800 pb-4">
          <Select
            label="填色方案"
            value={presetName}
            onChange={applyPreset}
            options={[
              { label: '自定义', value: 'custom' },
              ...Object.keys(PRESETS).map((name) => ({ label: name, value: name }))
            ]}
          />

          <div className="flex bg-zinc-800 p-1 rounded-lg mb-4">
            <button
              onClick={() => update('shapeMode', 'stroke')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-all ${
                config.shapeMode === 'stroke'
                  ? 'bg-zinc-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Circle size={14} /> 线条
            </button>
            <button
              onClick={() => update('shapeMode', 'ribbon')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded text-xs font-medium transition-all ${
                config.shapeMode === 'ribbon'
                  ? 'bg-zinc-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
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
              <label className="block text-[10px] text-zinc-500 uppercase mb-1">主色</label>
              <input
                type="color"
                value={config.color}
                onChange={(e) => update('color', e.target.value)}
                className="w-full h-8 bg-zinc-800 rounded cursor-pointer border border-zinc-700"
              />
            </div>
            {String(config.fillMode).includes('gradient') ? (
              <div className="flex-1">
                <label className="block text-[10px] text-zinc-500 uppercase mb-1">辅色</label>
                <input
                  type="color"
                  value={config.color2}
                  onChange={(e) => update('color2', e.target.value)}
                  className="w-full h-8 bg-zinc-800 rounded cursor-pointer border border-zinc-700"
                />
              </div>
            ) : null}
          </div>

          {String(config.fillMode).includes('gradient') ? (
            <div className="mb-4 flex items-center justify-between">
              <label className="text-xs font-medium text-zinc-400 uppercase">高光</label>
              <button
                onClick={() => update('glossy', !config.glossy)}
                className={`w-10 h-5 rounded-full relative transition-colors ${
                  config.glossy ? 'bg-purple-500' : 'bg-zinc-700'
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

        <div className="h-px bg-zinc-800 my-4" />

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

        <div className="h-px bg-zinc-800 my-4" />

        <Slider
          label="Curvature"
          value={config.arcRadius}
          min={10}
          max={500}
          onChange={(v) => update('arcRadius', v)}
        />

        <div className="mb-3 flex items-center justify-between">
          <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">锁定弧长</label>
          <button
            onClick={() => update('lockArcLength', !config.lockArcLength)}
            className={`w-10 h-5 rounded-full relative transition-colors ${
              config.lockArcLength ? 'bg-purple-500' : 'bg-zinc-700'
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

        <div className="h-px bg-zinc-800 my-4" />

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

      <div className="mt-6 p-4 bg-zinc-950 rounded border border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          Tip: 试试 8 段 + 负角度倾斜，比较接近参考效果。
        </p>
      </div>
    </div>
  );
}

export default Controls;
