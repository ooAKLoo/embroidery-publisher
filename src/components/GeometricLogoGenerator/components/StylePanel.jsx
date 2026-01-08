import { useState, useRef } from 'react';
import { COLOR_PRESETS } from '../constants/colors';
import { PARAM_CONTROLS } from '../constants/paramControls';
import {
  COMMON_STYLE_CONTROLS,
  DEFAULT_COMMON_STYLES,
  supportsBorderControl,
} from '../constants/commonStyles';

const StylePanel = ({
  colors,
  setColors,
  strokeWidth,
  setStrokeWidth,
  bgColor,
  setBgColor,
  activeType,
  params,
  updateParam,
  commonStyles = DEFAULT_COMMON_STYLES,
  setCommonStyles,
}) => {
  // 检查当前类型是否支持 rotation 参数（2D 图形的旋转）
  const rotationControl = PARAM_CONTROLS[activeType]?.find(c => c.key === 'rotation');
  const currentRotation = params?.rotation ?? rotationControl?.min ?? 0;
  const [colorMode, setColorMode] = useState(colors.length === 1 ? 'solid' : 'gradient');
  const [c1, setC1] = useState(colors[0] || '#6366f1');
  const [c2, setC2] = useState(colors[colors.length - 1] || '#f97316');
  
  // Hover 预览状态
  const [hoveredPreset, setHoveredPreset] = useState(null);
  const originalColorsRef = useRef(null);
  const originalBgRef = useRef(null);

  const handleModeChange = (mode) => {
    setColorMode(mode);
    setColors(mode === 'solid' ? [c1] : [c1, c2]);
  };

  // 悬停预览
  const handlePresetHover = (preset) => {
    if (!hoveredPreset) {
      originalColorsRef.current = colors;
      originalBgRef.current = bgColor;
    }
    setHoveredPreset(preset);
    setColors(preset.colors);
    setBgColor(preset.bgColor || (preset.bg === 'dark' ? '#0f172a' : '#f1f5f9'));
  };

  // 离开恢复
  const handlePresetLeave = () => {
    if (originalColorsRef.current) {
      setColors(originalColorsRef.current);
      setBgColor(originalBgRef.current);
    }
    setHoveredPreset(null);
    originalColorsRef.current = null;
    originalBgRef.current = null;
  };

  // 点击应用
  const handlePresetClick = (preset) => {
    setColors(preset.colors);
    setBgColor(preset.bgColor || (preset.bg === 'dark' ? '#0f172a' : '#f1f5f9'));
    setColorMode(preset.colors.length === 1 ? 'solid' : 'gradient');
    setC1(preset.colors[0]);
    setC2(preset.colors[preset.colors.length - 1]);
    setHoveredPreset(null);
    originalColorsRef.current = null;
    originalBgRef.current = null;
  };

  return (
    <div className="space-y-4 overflow-hidden">
      {/* 预设配色 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-slate-600">预设配色</label>
          {hoveredPreset && (
            <span className="text-[10px] text-slate-500 animate-pulse">预览中...</span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => handlePresetClick(p)}
              onMouseEnter={() => handlePresetHover(p)}
              onMouseLeave={handlePresetLeave}
              className="group relative h-8 rounded-lg overflow-hidden hover:ring-2 hover:ring-slate-400 hover:scale-105 transition-all"
              style={{ background: p.colors.length === 1 ? p.colors[0] : `linear-gradient(135deg, ${p.colors.join(', ')})` }}
              title={p.name}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 颜色模式 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">颜色模式</label>
        <div className="flex gap-2">
          {['solid', 'gradient'].map(m => (
            <button 
              key={m} 
              onClick={() => handleModeChange(m)} 
              className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${colorMode === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'solid' ? '纯色' : '渐变'}
            </button>
          ))}
        </div>
      </div>

      {/* 颜色选择器 */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">{colorMode === 'solid' ? '颜色' : '起始色'}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={c1}
              onChange={(e) => { setC1(e.target.value); setColors(colorMode === 'solid' ? [e.target.value] : [e.target.value, c2]); }}
              className="w-8 h-8 flex-shrink-0 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={c1}
              onChange={(e) => { setC1(e.target.value); setColors(colorMode === 'solid' ? [e.target.value] : [e.target.value, c2]); }}
              className="flex-1 min-w-0 px-2 py-1.5 bg-slate-100 rounded-lg text-xs font-mono"
            />
          </div>
        </div>
        {colorMode === 'gradient' && (
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">结束色</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={c2}
                onChange={(e) => { setC2(e.target.value); setColors([c1, e.target.value]); }}
                className="w-8 h-8 flex-shrink-0 rounded cursor-pointer border-0"
              />
              <input
                type="text"
                value={c2}
                onChange={(e) => { setC2(e.target.value); setColors([c1, e.target.value]); }}
                className="flex-1 min-w-0 px-2 py-1.5 bg-slate-100 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* 线条粗细 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">线条粗细: {strokeWidth}</label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(parseFloat(e.target.value))}
          className="w-full accent-slate-900"
        />
      </div>

      {/* 旋转角度 - 仅 2D 图形支持 */}
      {rotationControl && updateParam && (
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-2">
            旋转角度: {currentRotation}{rotationControl.suffix || '°'}
          </label>
          <input
            type="range"
            min={rotationControl.min}
            max={rotationControl.max}
            step={rotationControl.step}
            value={currentRotation}
            onChange={(e) => updateParam('rotation', parseFloat(e.target.value))}
            className="w-full accent-slate-900"
          />
        </div>
      )}

      {/* 通用样式控制 */}
      {setCommonStyles && (
        <div className="pt-4 border-t border-slate-200">
          <label className="block text-xs font-medium text-slate-600 mb-3">通用样式</label>
          <div className="space-y-3">
            {COMMON_STYLE_CONTROLS.map(control => (
              <div key={control.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">{control.label}</span>
                </div>
                <select
                  value={commonStyles[control.key] || DEFAULT_COMMON_STYLES[control.key]}
                  onChange={(e) => setCommonStyles({ ...commonStyles, [control.key]: e.target.value })}
                  className="w-full px-2 py-1.5 bg-slate-100 rounded-lg text-xs appearance-none cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  {control.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}

            {/* 显示外边界 - 仅部分图形支持 */}
            {supportsBorderControl(activeType) && (
              <label className="flex items-center justify-between cursor-pointer py-1">
                <span className="text-xs text-slate-500">显示外边界</span>
                <button
                  onClick={() => setCommonStyles({
                    ...commonStyles,
                    showOuterBorder: !commonStyles.showOuterBorder
                  })}
                  className={`relative w-9 h-5 rounded-full transition-colors ${
                    commonStyles.showOuterBorder !== false ? 'bg-slate-700' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      commonStyles.showOuterBorder !== false ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StylePanel;
