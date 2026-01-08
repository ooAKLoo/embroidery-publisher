import { useState, useMemo } from 'react';
import { LOGO_TYPES, getLogoType } from '../constants/logoTypes';

// 分类图标
const CategoryIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

// 收藏图标
const SavedIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
  </svg>
);

const CategoryNav = ({
  activeType,
  onSelect,
  colors,
  strokeWidth,
  bgColor,
  // 保存的样式相关
  savedConfigs = [],
  onLoadConfig,
  onDeleteConfig
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [viewMode, setViewMode] = useState('category'); // 'category' | 'saved'

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

  // 搜索过滤已保存样式
  const filteredSavedConfigs = useMemo(() => {
    if (!searchQuery.trim()) return savedConfigs;
    const query = searchQuery.toLowerCase();
    return savedConfigs.filter(c =>
      c.name.toLowerCase().includes(query)
    );
  }, [savedConfigs, searchQuery]);

  return (
    <nav className="w-64 flex-shrink-0 bg-[#f8f8f8] rounded-2xl p-4 flex flex-col overflow-hidden">
      {/* 模式切换按钮组 */}
      <div className="flex gap-1 p-1 bg-white rounded-xl mb-4">
        <button
          onClick={() => setViewMode('category')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            viewMode === 'category'
              ? 'bg-[#f8f8f8] text-slate-800'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <CategoryIcon />
          <span>分类</span>
        </button>
        <button
          onClick={() => setViewMode('saved')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            viewMode === 'saved'
              ? 'bg-[#f8f8f8] text-slate-800'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <SavedIcon />
          <span>已保存</span>
          {savedConfigs.length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-slate-600 text-white rounded-full">
              {savedConfigs.length}
            </span>
          )}
        </button>
      </div>

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
          placeholder={viewMode === 'category' ? '搜索图形...' : '搜索已保存样式...'}
          className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-slate-200 placeholder-slate-400"
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

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {viewMode === 'category' ? (
          // 分类列表
          <>
            {categories.map(cat => {
              const types = groupedTypes[cat];
              const isCollapsed = collapsedCategories[cat];
              const hasActiveType = types.some(t => t.id === activeType);

              if (types.length === 0) return null;

              return (
                <div key={cat} className="mb-1">
                  {/* 分类标题 */}
                  <button
                    onClick={() => toggleCategory(cat)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${
                      hasActiveType ? 'bg-slate-100' : 'hover:bg-slate-100'
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
                        hasActiveType ? 'text-slate-700' : 'text-slate-500'
                      }`}>
                        {cat}
                      </span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      hasActiveType ? 'bg-slate-200 text-slate-600' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {getCategoryCount(cat)}
                    </span>
                  </button>

                  {/* 类型列表 - 带缩略图 */}
                  {!isCollapsed && (
                    <div className="mt-1 ml-2 space-y-0.5">
                      {types.map(t => (
                        <button
                          key={t.id}
                          onClick={() => onSelect(t.id)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-lg transition-all ${
                            activeType === t.id
                              ? 'bg-slate-200 text-slate-800 font-medium'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded flex-shrink-0 overflow-hidden"
                            style={{ backgroundColor: bgColor }}
                          >
                            <t.Component
                              {...t.defaultProps}
                              colors={colors}
                              strokeWidth={Math.min(strokeWidth, 1.5)}
                            />
                          </div>
                          <span className="truncate">{t.name}</span>
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
          </>
        ) : (
          // 已保存样式列表
          <>
            {filteredSavedConfigs.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p className="text-xs text-slate-400">
                  {searchQuery ? '未找到匹配的样式' : '暂无保存的样式'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  点击工具栏的保存按钮收藏当前样式
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSavedConfigs.map((config) => {
                  const logoType = getLogoType(config.activeType);
                  return (
                    <div
                      key={config.id}
                      className="group relative p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {/* 缩略图 */}
                        <div
                          className="w-12 h-12 rounded-lg flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: config.bgColor }}
                        >
                          {config.thumbnail ? (
                            <img
                              src={config.thumbnail}
                              alt={config.name}
                              className="w-full h-full object-cover"
                            />
                          ) : logoType ? (
                            <logoType.Component
                              {...config.params}
                              colors={config.colors}
                              strokeWidth={Math.min(config.strokeWidth, 1.5)}
                            />
                          ) : null}
                        </div>

                        {/* 信息 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 truncate">
                            {config.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {logoType?.name || config.activeType}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(config.createdAt).toLocaleString('zh-CN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="flex gap-1 mt-2">
                        <button
                          onClick={() => onLoadConfig?.(config)}
                          className="flex-1 px-2 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          加载
                        </button>
                        <button
                          onClick={() => onDeleteConfig?.(config.id)}
                          className="px-2 py-1.5 text-xs text-slate-400 bg-slate-100 rounded-lg hover:text-slate-600 hover:bg-slate-200 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* 底部统计 */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 text-center">
          {viewMode === 'category'
            ? `共 ${LOGO_TYPES.length} 种图形`
            : `已保存 ${savedConfigs.length} 个样式`
          }
        </p>
      </div>
    </nav>
  );
};

export default CategoryNav;
