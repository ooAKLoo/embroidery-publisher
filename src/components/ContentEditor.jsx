export default function ContentEditor({ masterText, setMasterText, onAIAdapt, isAdapting }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-slate-700">核心文案</h3>
        <span className="text-xs text-slate-400">{masterText.length} 字符</span>
      </div>

      <textarea
        value={masterText}
        onChange={(e) => setMasterText(e.target.value)}
        placeholder={'在这里输入作品描述...\n\n例如：这幅苏绣作品《猫戏蝶》采用了传统的劈丝工艺，由绣娘历时3个月纯手工完成。作品中猫咪的毛发根根分明，每一根丝线都被劈成1/16的细度，展现了苏绣「精、细、雅、洁」的艺术特色。'}
        className="w-full h-36 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          支持中文输入，AI将自动翻译并适配各平台风格
        </p>
        <button
          onClick={onAIAdapt}
          disabled={isAdapting || !masterText.trim()}
          className={`
            px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
            ${isAdapting || !masterText.trim()
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-600 hover:to-purple-600 shadow-sm'
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
  );
}
