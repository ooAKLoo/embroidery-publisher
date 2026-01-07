import { useState, useEffect } from 'react';
import { LOGO_TYPES, getLogoType } from './constants/logoTypes';
import StylePanel from './components/StylePanel';
import CategoryNav from './components/CategoryNav';
import ParamControls from './components/ParamControls';

export default function GeometricLogoGenerator() {
  const [activeType, setActiveType] = useState('platonic');
  const [globalColors, setGlobalColors] = useState(['#f97316', '#ec4899', '#a855f7', '#6366f1']);
  const [globalStrokeWidth, setGlobalStrokeWidth] = useState(2.5);
  const [bgMode, setBgMode] = useState('dark');
  const [autoRotate, setAutoRotate] = useState(false);

  // 动态参数状态
  const [params, setParams] = useState(() => {
    const initial = {};
    LOGO_TYPES.forEach(t => { initial[t.id] = { ...t.defaultProps }; });
    return initial;
  });

  // 自动旋转
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setParams(prev => {
        const updated = { ...prev };
        if (activeType === 'platonic') updated.platonic = { ...prev.platonic, rotationY: (prev.platonic.rotationY || 0) + 0.02 };
        if (activeType === 'tesseract') updated.tesseract = { ...prev.tesseract, rotationXW: (prev.tesseract.rotationXW || 0) + 0.02 };
        if (activeType === 'mobius') updated.mobius = { ...prev.mobius, rotationY: (prev.mobius.rotationY || 0) + 0.02 };
        return updated;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate, activeType]);

  const activeConfig = getLogoType(activeType);
  const bgClass = bgMode === 'dark' ? 'bg-slate-900' : 'bg-slate-100';
  const textClass = bgMode === 'dark' ? 'text-slate-400' : 'text-slate-600';

  const updateParam = (key, value) => {
    setParams(prev => ({ ...prev, [activeType]: { ...prev[activeType], [key]: value } }));
  };

  const resetParams = () => {
    if (activeConfig) {
      setParams(prev => ({ ...prev, [activeType]: { ...activeConfig.defaultProps } }));
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl p-6 overflow-hidden flex flex-col">
      <h1 className="text-lg font-semibold text-slate-800 mb-4 flex-shrink-0">几何 Logo 生成器</h1>

      <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
        {/* 左侧：分类导航 */}
        <CategoryNav activeType={activeType} onSelect={setActiveType} />

        {/* 中间：预览区 */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className={`${bgClass} rounded-2xl p-6 flex-1 flex items-center justify-center relative`}>
            {/* 网格背景 */}
            <div 
              className="absolute inset-0 opacity-10" 
              style={{ 
                backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} 
            />
            {/* Logo 预览 */}
            <div className="w-80 h-80 relative z-10">
              {activeConfig && <activeConfig.Component {...params[activeType]} colors={globalColors} strokeWidth={globalStrokeWidth} />}
            </div>
          </div>
          
          {/* 快速预览缩略图 */}
          <div className="mt-4 flex-shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {LOGO_TYPES.map(t => (
                <button 
                  key={t.id} 
                  onClick={() => setActiveType(t.id)}
                  className={`${bgClass} rounded-lg p-2 flex-shrink-0 transition-all ${activeType === t.id ? 'ring-2 ring-purple-500' : 'hover:ring-2 hover:ring-slate-400'}`}
                >
                  <div className="w-12 h-12">
                    <t.Component {...t.defaultProps} colors={globalColors} strokeWidth={Math.min(globalStrokeWidth, 1.5)} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧：控制面板 */}
        <div className="w-72 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
          {/* 全局样式 */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <h2 className="text-sm font-medium text-slate-700 mb-3">全局样式</h2>
            <StylePanel 
              colors={globalColors} 
              setColors={setGlobalColors} 
              strokeWidth={globalStrokeWidth} 
              setStrokeWidth={setGlobalStrokeWidth} 
              bgMode={bgMode} 
              setBgMode={setBgMode} 
            />
            {activeConfig?.has3D && (
              <button 
                onClick={() => setAutoRotate(!autoRotate)} 
                className={`w-full mt-4 py-2 text-xs font-medium rounded-lg transition-colors ${autoRotate ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                {autoRotate ? '停止旋转' : '自动旋转'}
              </button>
            )}
          </div>

          {/* 类型参数 */}
          <div className="bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-slate-700">{activeConfig?.name}参数</h2>
              <button 
                onClick={resetParams}
                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
              >
                重置
              </button>
            </div>
            <ParamControls type={activeType} params={params[activeType] || {}} updateParam={updateParam} />
          </div>
        </div>
      </div>
    </div>
  );
}
