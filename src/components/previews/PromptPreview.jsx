import { OUTPUT_FORMAT } from '../../config/platforms';

export default function PromptPreview({ brandPrompt, masterText }) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700">统一品牌 Prompt</span>
        </div>
        <span className="text-xs text-slate-500 bg-[#F8F8F8] px-2.5 py-1 rounded-full">
          所有平台共用
        </span>
      </div>

      {/* System */}
      <div className="flex-1 min-h-0 flex flex-col">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">System</span>
        <div className="flex-1 min-h-0 bg-[#F8F8F8] rounded-xl p-4 overflow-y-auto">
          <div className="mb-3">
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">品牌声音</span>
            <pre className="mt-2 text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
              {brandPrompt || '暂无配置'}
            </pre>
          </div>
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 bg-[#F8F8F8] px-1.5 py-0.5 rounded">固定格式</span>
            <pre className="mt-2 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
              {OUTPUT_FORMAT.trim()}
            </pre>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="mt-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">User</span>
        <pre className="text-sm text-slate-700 font-mono whitespace-pre-wrap bg-[#F8F8F8] rounded-lg px-4 py-3">
          {masterText || <span className="text-slate-400 italic">等待输入...</span>}
        </pre>
      </div>
    </div>
  );
}
