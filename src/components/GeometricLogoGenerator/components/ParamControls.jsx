import { getParamControls } from '../constants/paramControls';
import { PLATONIC_SOLIDS } from '../constants/polyhedra';

const ParamControls = ({ type, params, updateParam }) => {
  const controls = getParamControls(type);
  
  if (controls.length === 0) {
    return <p className="text-xs text-slate-400">暂无额外参数</p>;
  }

  return (
    <div className="space-y-3">
      {controls.map(ctrl => {
        const value = params[ctrl.key];
        
        if (ctrl.type === 'select') {
          return (
            <div key={ctrl.key}>
              <label className="block text-xs font-medium text-slate-600 mb-2">{ctrl.label}</label>
              <div className="flex flex-wrap gap-1">
                {ctrl.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateParam(ctrl.key, opt.value)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${value === opt.value ? 'bg-slate-900 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }
        
        if (ctrl.type === 'range') {
          const displayValue = typeof value === 'number' 
            ? (ctrl.step < 1 ? value.toFixed(2) : value) 
            : ctrl.min;
          return (
            <div key={ctrl.key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                {ctrl.label}: {displayValue}{ctrl.suffix || ''}
              </label>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={value ?? ctrl.min}
                onChange={(e) => updateParam(ctrl.key, parseFloat(e.target.value))}
                className="w-full accent-slate-900"
              />
              {ctrl.hint && <p className="text-[10px] text-slate-400 mt-0.5">{ctrl.hint}</p>}
            </div>
          );
        }
        
        if (ctrl.type === 'checkbox') {
          return (
            <div key={ctrl.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={value !== false}
                onChange={(e) => updateParam(ctrl.key, e.target.checked)}
                className="w-4 h-4 accent-slate-900"
              />
              <label className="text-xs text-slate-600">{ctrl.label}</label>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};

export default ParamControls;
