import { useState, useEffect } from 'react';
import { DEFAULT_BRAND_PROMPT, OUTPUT_FORMAT } from '../config/platforms';

export default function PromptModal({ isOpen, onClose, brandPrompt, setBrandPrompt }) {
  const [localPrompt, setLocalPrompt] = useState(brandPrompt);
  const [showOutputFormat, setShowOutputFormat] = useState(false);

  useEffect(() => {
    setLocalPrompt(brandPrompt);
  }, [brandPrompt]);

  if (!isOpen) return null;

  const handleSave = () => {
    setBrandPrompt(localPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">品牌声音配置</h2>
            <p className="text-xs text-slate-400 mt-0.5">统一调性，所有平台共用</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">品牌 Prompt</label>
            <button
              onClick={() => setLocalPrompt(DEFAULT_BRAND_PROMPT)}
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              重置为默认
            </button>
          </div>
          <textarea
            value={localPrompt}
            onChange={(e) => setLocalPrompt(e.target.value)}
            className="w-full h-[300px] px-4 py-3 bg-slate-50 border-0 rounded-xl text-sm text-slate-700 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
          />

          {/* Tips */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-800 font-medium mb-1">配置建议</p>
            <ul className="text-xs text-amber-700 space-y-0.5">
              <li>• 品牌定位：高端/亲民/专业/文艺</li>
              <li>• 内容原则：简洁有力，100-150 字符</li>
              <li>• 标签策略：5-8 个精准标签</li>
            </ul>
          </div>

          {/* Output Format */}
          <div className="mt-4">
            <button
              onClick={() => setShowOutputFormat(!showOutputFormat)}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
            >
              <svg
                className={`w-3 h-3 transition-transform ${showOutputFormat ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              查看固定输出格式
            </button>
            {showOutputFormat && (
              <pre className="mt-2 p-3 bg-slate-50 rounded-lg text-xs text-slate-500 font-mono whitespace-pre-wrap">
                {OUTPUT_FORMAT.trim()}
              </pre>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
