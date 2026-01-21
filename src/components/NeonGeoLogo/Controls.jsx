import { ShapeType, PaletteType } from './constants';

// 滑块组件
function Slider({ label, value, min, max, step, onChange, suffix = '' }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <span className="text-xs text-gray-500">{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}{suffix}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step}
        value={value} 
        onChange={(e) => onChange(Number(e.target.value))} 
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400" 
      />
    </div>
  );
}

// 选择器组件
function Select({ label, value, options, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">{label}</label>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-900 border border-gray-600 rounded px-2 py-1 text-sm text-white"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

// 图标
const RefreshIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

function Controls({ config, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  const shapeOptions = [
    { value: ShapeType.SQUARE, label: '方形' },
    { value: ShapeType.TRIANGLE, label: '三角形' },
    { value: ShapeType.HEXAGON, label: '六边形' },
    { value: ShapeType.CIRCLE, label: '圆形' },
  ];

  const paletteOptions = [
    { value: PaletteType.NEON_SUNSET, label: '霓虹日落' },
    { value: PaletteType.CYBER_BLUE, label: '赛博蓝' },
    { value: PaletteType.ACID_GREEN, label: '酸性绿' },
    { value: PaletteType.HEATMAP, label: '热力图' },
    { value: PaletteType.MONOCHROME, label: '单色' },
  ];

  const groupClass = "bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm";

  return (
    <div className="flex flex-col gap-4 w-full h-full overflow-y-auto pr-2 pb-10">
      
      {/* 结构设置 */}
      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <RefreshIcon /> 结构
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select 
            label="形状" 
            value={config.shape} 
            options={shapeOptions}
            onChange={(v) => handleChange('shape', v)} 
          />
          <Select 
            label="色板" 
            value={config.palette} 
            options={paletteOptions}
            onChange={(v) => handleChange('palette', v)} 
          />
        </div>

        <div className="space-y-4">
          <Slider 
            label="迭代次数" 
            value={config.iterations} 
            min={3} max={60} step={1}
            onChange={(v) => handleChange('iterations', v)} 
          />
          <Slider 
            label="缩放比例" 
            value={config.scale} 
            min={0.5} max={0.99} step={0.01}
            onChange={(v) => handleChange('scale', v)} 
          />
          <Slider 
            label="旋转角度" 
            value={config.rotation} 
            min={-45} max={45} step={0.1}
            suffix="°"
            onChange={(v) => handleChange('rotation', v)} 
          />
        </div>
      </div>

      {/* 几何与轴心 */}
      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-white mb-4">几何与轴心</h3>
        <div className="space-y-4">
          <Slider 
            label="轴心偏移 X" 
            value={config.pivotOffsetX} 
            min={-100} max={100} step={1}
            onChange={(v) => handleChange('pivotOffsetX', v)} 
          />
          <Slider 
            label="轴心偏移 Y" 
            value={config.pivotOffsetY} 
            min={-100} max={100} step={1}
            onChange={(v) => handleChange('pivotOffsetY', v)} 
          />
          <Slider 
            label="圆角半径" 
            value={config.cornerRadius} 
            min={0} max={100} step={1}
            onChange={(v) => handleChange('cornerRadius', v)} 
          />
        </div>
      </div>

      {/* 样式 */}
      <div className={groupClass}>
        <h3 className="text-sm font-semibold text-white mb-4">样式</h3>
        <div className="space-y-4">
          <Slider 
            label="描边宽度" 
            value={config.strokeWidth} 
            min={0.5} max={20} step={0.5}
            suffix="px"
            onChange={(v) => handleChange('strokeWidth', v)} 
          />
          <Slider 
            label="发光强度" 
            value={config.glowStrength} 
            min={0} max={1} step={0.05}
            suffix="%"
            onChange={(v) => handleChange('glowStrength', v)} 
          />
          <Slider 
            label="噪点透明度" 
            value={config.noiseOpacity} 
            min={0} max={0.5} step={0.01}
            suffix="%"
            onChange={(v) => handleChange('noiseOpacity', v)} 
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-600 text-center pb-4">
        NeonGeo • 相似变换引擎
      </div>
    </div>
  );
}

export default Controls;
