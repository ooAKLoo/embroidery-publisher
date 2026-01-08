import { useState } from 'react';
import StylePanel from './StylePanel';
import ParamControls from './ParamControls';

const TABS = [
  { id: 'style', label: '样式', icon: '🎨' },
  { id: 'animation', label: '动画', icon: '🔄' },
];

const ControlTabs = ({
  // Style props
  colors,
  setColors,
  strokeWidth,
  setStrokeWidth,
  bgColor,
  setBgColor,
  // Common styles props
  commonStyles,
  setCommonStyles,
  // Param props
  activeType,
  activeConfig,
  params,
  updateParam,
  resetParams,
  // Animation props
  autoRotate,
  setAutoRotate,
}) => {
  const [activeTab, setActiveTab] = useState('style');

  return (
    <div className="flex flex-col h-full">
      {/* Tab 导航 */}
      <div className="flex gap-1 p-1 bg-white rounded-xl mb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-[#f8f8f8] text-slate-800'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'style' && (
          <div className="space-y-4">
            <StylePanel
              colors={colors}
              setColors={setColors}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              bgColor={bgColor}
              setBgColor={setBgColor}
              activeType={activeType}
              params={params}
              updateParam={updateParam}
              commonStyles={commonStyles}
              setCommonStyles={setCommonStyles}
            />

            {/* 图形参数 */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-medium text-slate-600">
                  {activeConfig?.name || '图形参数'}
                </h3>
                <button
                  onClick={resetParams}
                  className="text-[10px] px-2 py-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                >
                  重置
                </button>
              </div>
              <ParamControls
                type={activeType}
                params={params}
                updateParam={updateParam}
              />
            </div>
          </div>
        )}

        {activeTab === 'animation' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <h3 className="text-sm font-medium text-slate-700 mb-3">动画控制</h3>

              {activeConfig?.has3D ? (
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-slate-600">自动旋转</span>
                    <button
                      onClick={() => setAutoRotate(!autoRotate)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        autoRotate ? 'bg-slate-700' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          autoRotate ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </label>
                  <p className="text-[11px] text-slate-400">
                    开启后 3D 图形将自动旋转展示
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">
                  当前图形暂不支持动画
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ControlTabs;
