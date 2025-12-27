import { platformConfigs } from '../../config/platforms';

export default function PromptPreview({ platformPrompts, activePlatform }) {
  const platformData = platformPrompts?.[activePlatform];
  const activePrompt = platformData?.list?.find(p => p.id === platformData?.activeId) || platformData?.list?.[0];
  const config = platformConfigs[activePlatform];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-slate-700">当前使用的提示词</span>
        </div>
        <span className="text-xs text-slate-500 bg-[#F8F8F8] px-2.5 py-1 rounded-full">
          {activePrompt?.name || '默认'}
        </span>
      </div>

      {/* System Prompt - 填充剩余空间 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">System Prompt</span>
        </div>
        <pre className="flex-1 text-sm text-slate-700 font-mono whitespace-pre-wrap bg-[#F8F8F8] rounded-xl p-5 leading-relaxed overflow-y-auto">
          {activePrompt?.content || config?.defaultSystemPrompt || '暂无提示词'}
        </pre>
      </div>

      {/* 输出格式提示 - 底部固定 */}
      <div className="mt-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">输出格式（固定附加，不可编辑）</span>
        </div>
        <pre className="text-xs text-slate-500 font-mono whitespace-pre-wrap bg-[#F8F8F8] rounded-lg p-3">
{`{"text": "生成的文案", "tags": "标签内容"}`}
        </pre>
      </div>
    </div>
  );
}
