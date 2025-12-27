import { platformConfigs } from '../../config/platforms';
import { OUTPUT_FORMAT_INSTRUCTION, PINTEREST_OUTPUT_FORMAT_INSTRUCTION } from '../../config/platforms/base';

export default function PromptPreview({ platformPrompts, activePlatform, masterText, pinterestTitle }) {
  const platformData = platformPrompts?.[activePlatform];
  const activePrompt = platformData?.list?.find(p => p.id === platformData?.activeId) || platformData?.list?.[0];
  const config = platformConfigs[activePlatform];
  const isPinterest = activePlatform === 'pinterest';
  const outputFormatInstruction = isPinterest ? PINTEREST_OUTPUT_FORMAT_INSTRUCTION : OUTPUT_FORMAT_INSTRUCTION;

  // 构建 User 消息预览
  const userMessage = isPinterest && pinterestTitle
    ? `标题：${pinterestTitle}\n\n正文：${masterText}`
    : masterText;

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

      {/* System - 填充剩余空间 */}
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">System</span>
        </div>
        <div className="flex-1 min-h-0 bg-[#F8F8F8] rounded-xl p-4 overflow-y-auto">
          {/* 可编辑部分 */}
          <div className="mb-3">
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">可编辑</span>
            <pre className="mt-2 text-sm text-slate-700 font-mono whitespace-pre-wrap leading-relaxed">
              {activePrompt?.content || config?.defaultSystemPrompt || '暂无提示词'}
            </pre>
          </div>
          {/* 固定部分 */}
          <div className="pt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">固定</span>
            <pre className="mt-2 text-xs text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
              {outputFormatInstruction.trim()}
            </pre>
          </div>
        </div>
      </div>

      {/* User */}
      <div className="mt-3 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">User</span>
        </div>
        <pre className="text-sm text-slate-700 font-mono whitespace-pre-wrap bg-[#F8F8F8] rounded-lg px-4 py-3">
          {userMessage || <span className="text-slate-400 italic">等待输入...</span>}
        </pre>
      </div>
    </div>
  );
}
