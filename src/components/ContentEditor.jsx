import { useState } from 'react';
import PromptModal from './PromptModal';

export default function ContentEditor({ masterText, setMasterText, onAIAdapt, isAdapting, brandPrompt, setBrandPrompt }) {
  const [showPromptModal, setShowPromptModal] = useState(false);

  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-800">核心文案</h3>
        <span className="text-xs text-slate-400">{masterText.length} 字符</span>
      </div>

      <textarea
        value={masterText}
        onChange={(e) => setMasterText(e.target.value)}
        placeholder={'在这里输入作品描述...\n\n例如：这幅苏绣作品《猫戏蝶》采用了传统的劈丝工艺，由绣娘历时3个月纯手工完成。作品中猫咪的毛发根根分明，每一根丝线都被劈成1/16的细度，展现了苏绣「精、细、雅、洁」的艺术特色。'}
        className="w-full h-40 px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
      />

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          统一品牌声音，AI 自动翻译、生成标题和标签
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPromptModal(true)}
            className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            品牌配置
          </button>
          <button
            onClick={onAIAdapt}
            disabled={isAdapting || !masterText.trim()}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${isAdapting || !masterText.trim()
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800'
              }
            `}
          >
            {isAdapting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                AI适配中...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI一键润色
              </>
            )}
          </button>
        </div>
      </div>

      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        brandPrompt={brandPrompt}
        setBrandPrompt={setBrandPrompt}
      />
    </div>
  );
}
