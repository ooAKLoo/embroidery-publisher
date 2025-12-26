import { useState } from 'react';

export default function ActionBar({ connectedAccounts, hasContent }) {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const connectedCount = Object.values(connectedAccounts).filter(Boolean).length;
  const canPublish = hasContent && connectedCount > 0;

  const handlePublish = async () => {
    if (!canPublish) return;

    setIsPublishing(true);
    // 模拟发布过程
    setTimeout(() => {
      setIsPublishing(false);
      alert('发布成功！（演示）');
    }, 2000);
  };

  const handleSchedule = () => {
    if (!canPublish || !scheduleDate) return;
    alert(`已设置定时发布: ${scheduleDate}（演示）`);
    setIsScheduling(false);
  };

  return (
    <footer className="h-16 bg-white border-t border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* 左侧状态 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-500">
          {connectedCount > 0 ? (
            <>将发布到 <strong className="text-slate-700">{connectedCount}</strong> 个平台</>
          ) : (
            <span className="text-amber-600">请先连接至少一个社交账号</span>
          )}
        </span>
      </div>

      {/* 右侧操作按钮 */}
      <div className="flex items-center gap-3">
        {/* 定时发布 */}
        {isScheduling ? (
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              onClick={handleSchedule}
              disabled={!scheduleDate}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确定
            </button>
            <button
              onClick={() => setIsScheduling(false)}
              className="px-4 py-2 text-slate-500 hover:text-slate-700"
            >
              取消
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => setIsScheduling(true)}
              disabled={!canPublish}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${canPublish
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              定时发布
            </button>

            <button
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              className={`
                px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${canPublish && !isPublishing
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }
              `}
            >
              {isPublishing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  发布中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  立即发布
                </>
              )}
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
