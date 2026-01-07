import { useState } from 'react';
import { COLOR_PRESETS } from '../constants/colors';

const StylePanel = ({ colors, setColors, strokeWidth, setStrokeWidth, bgMode, setBgMode }) => {
  const [colorMode, setColorMode] = useState(colors.length === 1 ? 'solid' : 'gradient');
  const [c1, setC1] = useState(colors[0] || '#6366f1');
  const [c2, setC2] = useState(colors[colors.length - 1] || '#f97316');

  const handleModeChange = (mode) => {
    setColorMode(mode);
    setColors(mode === 'solid' ? [c1] : [c1, c2]);
  };

  return (
    <div className="space-y-4">
      {/* 预设配色 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">预设配色</label>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PRESETS.map((p) => (
            <button 
              key={p.name} 
              onClick={() => { setColors(p.colors); setBgMode(p.bg); setColorMode(p.colors.length === 1 ? 'solid' : 'gradient'); }}
              className="group relative h-8 rounded-lg overflow-hidden hover:ring-2 hover:ring-slate-400 transition-all"
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
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 mb-1.5">{colorMode === 'solid' ? '颜色' : '起始色'}</label>
          <div className="flex items-center gap-2">
            <input 
              type="color" 
              value={c1} 
              onChange={(e) => { setC1(e.target.value); setColors(colorMode === 'solid' ? [e.target.value] : [e.target.value, c2]); }} 
              className="w-8 h-8 rounded cursor-pointer border-0" 
            />
            <input 
              type="text" 
              value={c1} 
              onChange={(e) => { setC1(e.target.value); setColors(colorMode === 'solid' ? [e.target.value] : [e.target.value, c2]); }} 
              className="flex-1 px-2 py-1.5 bg-slate-100 rounded-lg text-xs font-mono" 
            />
          </div>
        </div>
        {colorMode === 'gradient' && (
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">结束色</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={c2} 
                onChange={(e) => { setC2(e.target.value); setColors([c1, e.target.value]); }} 
                className="w-8 h-8 rounded cursor-pointer border-0" 
              />
              <input 
                type="text" 
                value={c2} 
                onChange={(e) => { setC2(e.target.value); setColors([c1, e.target.value]); }} 
                className="flex-1 px-2 py-1.5 bg-slate-100 rounded-lg text-xs font-mono" 
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

      {/* 背景切换 */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-2">背景</label>
        <div className="flex gap-2">
          {['dark', 'light'].map(m => (
            <button 
              key={m} 
              onClick={() => setBgMode(m)} 
              className={`flex-1 py-1.5 text-xs rounded-lg transition-colors ${bgMode === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {m === 'dark' ? '深色' : '浅色'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StylePanel;
