import { getParamControls } from '../constants/paramControls';
import { PLATONIC_SOLIDS } from '../constants/polyhedra';

const ParamControls = ({ type, params, updateParam }) => {
  const controls = getParamControls(type);

  if (controls.length === 0) {
    return <p className="text-xs text-slate-400">暂无额外参数</p>;
  }

  // 检查控件是否应该显示
  const shouldShow = (ctrl) => {
    if (!ctrl.showWhen) return true;
    // 支持函数形式的条件
    if (typeof ctrl.showWhen === 'function') {
      return ctrl.showWhen(params);
    }
    // 支持对象形式的条件 { key: value }
    return Object.entries(ctrl.showWhen).every(([key, val]) => params[key] === val);
  };

  return (
    <div className="space-y-3">
      {controls.map(ctrl => {
        // 条件显示检查
        if (!shouldShow(ctrl)) return null;

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

        if (ctrl.type === 'text') {
          // 根据 hint 确定最大长度：字母组合用3个，字体排版用8个
          const maxLen = ctrl.hint?.includes('1-8') ? 8 : 3;
          return (
            <div key={ctrl.key}>
              <label className="block text-xs font-medium text-slate-600 mb-1">{ctrl.label}</label>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => updateParam(ctrl.key, e.target.value.toUpperCase().slice(0, maxLen))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-slate-900"
                placeholder={ctrl.hint || ''}
                maxLength={maxLen}
              />
              {ctrl.hint && <p className="text-[10px] text-slate-400 mt-0.5">{ctrl.hint}</p>}
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};

export default ParamControls;
