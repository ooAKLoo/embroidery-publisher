import { useMemo } from 'react';

/**
 * 类似飞书项目管理的 SOP 流程进度组件
 */
function SOPProgress({ steps = [], currentStep, completedSteps = [], onStepClick }) {
  const currentIndex = useMemo(() => {
    return steps.findIndex(s => s.key === currentStep);
  }, [steps, currentStep]);

  const getStepStatus = (step, index) => {
    if (completedSteps.includes(step.key)) return 'completed';
    if (step.key === currentStep) return 'current';
    if (index < currentIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="flex items-center">
      {steps.map((step, index) => {
        const status = getStepStatus(step, index);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center flex-1">
            {/* 步骤节点 */}
            <div
              className={`flex items-center gap-2 transition-all ${
                onStepClick ? 'cursor-pointer hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-lg' : ''
              }`}
              onClick={() => onStepClick?.(step.key, index)}
            >
              {/* 圆形指示器 */}
              <div className={`
                relative w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium
                transition-all duration-300 flex-shrink-0
                ${status === 'completed'
                  ? 'bg-emerald-500 text-white'
                  : status === 'current'
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-200/60 text-slate-400'
                }
              `}>
                {status === 'completed' ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* 步骤文字 */}
              <span className={`
                text-[13px] font-medium transition-colors whitespace-nowrap
                ${status === 'completed'
                  ? 'text-emerald-600'
                  : status === 'current'
                    ? 'text-slate-800'
                    : 'text-slate-400'
                }
              `}>
                {step.label}
              </span>
            </div>

            {/* 连接线 */}
            {!isLast && (
              <div className="flex-1 mx-4 h-px relative">
                <div className="absolute inset-0 bg-slate-200/80" />
                <div
                  className={`
                    absolute inset-y-0 left-0 transition-all duration-500
                    ${status === 'completed' || index < currentIndex
                      ? 'bg-emerald-400 w-full'
                      : status === 'current'
                        ? 'bg-slate-400 w-1/3'
                        : 'w-0'
                    }
                  `}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SOPProgress;
