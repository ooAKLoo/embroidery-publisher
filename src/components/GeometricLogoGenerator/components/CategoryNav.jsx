import { useState, useMemo } from 'react';
import { LOGO_TYPES } from '../constants/logoTypes';

const CategoryNav = ({ activeType, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // 分类分组
  const categories = useMemo(() => {
    return [...new Set(LOGO_TYPES.map(t => t.category))];
  }, []);

  // 搜索过滤
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return LOGO_TYPES;
    const query = searchQuery.toLowerCase();
    return LOGO_TYPES.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // 按分类分组
  const groupedTypes = useMemo(() => {
    const groups = {};
    categories.forEach(cat => {
      groups[cat] = filteredTypes.filter(t => t.category === cat);
    });
    return groups;
  }, [categories, filteredTypes]);

  // 切换分类折叠
  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // 计算分类数量
  const getCategoryCount = (cat) => {
    return LOGO_TYPES.filter(t => t.category === cat).length;
  };

  return (
    <nav className="w-52 flex-shrink-0 bg-slate-50 rounded-2xl p-4 mr-4 flex flex-col overflow-hidden">
      {/* 搜索框 */}
      <div className="relative mb-4">
        <svg 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索图形..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder-slate-400"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* 分类列表 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {categories.map(cat => {
          const types = groupedTypes[cat];
          const isCollapsed = collapsedCategories[cat];
          const hasActiveType = types.some(t => t.id === activeType);
          
          // 搜索时隐藏空分类
          if (types.length === 0) return null;

          return (
            <div key={cat} className="mb-1">
              {/* 分类标题 */}
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${
                  hasActiveType ? 'bg-purple-50' : 'hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg 
                    className={`w-3 h-3 text-slate-400 transition-transform ${isCollapsed ? '' : 'rotate-90'}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                    hasActiveType ? 'text-purple-600' : 'text-slate-500'
                  }`}>
                    {cat}
                  </span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  hasActiveType ? 'bg-purple-100 text-purple-600' : 'bg-slate-200 text-slate-500'
                }`}>
                  {getCategoryCount(cat)}
                </span>
              </button>

              {/* 类型列表 */}
              {!isCollapsed && (
                <div className="mt-1 ml-2 space-y-0.5">
                  {types.map(t => (
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
              )}
            </div>
          );
        })}

        {/* 搜索无结果 */}
        {searchQuery && filteredTypes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400">未找到匹配的图形</p>
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center">
          共 {LOGO_TYPES.length} 种图形
        </p>
      </div>
    </nav>
  );
};

export default CategoryNav;
