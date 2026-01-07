import { LOGO_TYPES } from '../constants/logoTypes';

const CategoryNav = ({ activeType, onSelect }) => {
  // 按分类分组
  const categories = [...new Set(LOGO_TYPES.map(t => t.category))];
  
  return (
    <nav className="w-48 flex-shrink-0 bg-slate-50 rounded-2xl p-4 mr-4 overflow-y-auto">
      <h2 className="text-sm font-semibold text-slate-800 mb-4">图形类型</h2>
      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat}>
            <h3 className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-2">{cat}</h3>
            <div className="space-y-1">
              {LOGO_TYPES.filter(t => t.category === cat).map(t => (
                <button 
                  key={t.id} 
                  onClick={() => onSelect(t.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all ${
                    activeType === t.id 
                      ? 'bg-slate-900 text-white font-medium' 
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
};

export default CategoryNav;
