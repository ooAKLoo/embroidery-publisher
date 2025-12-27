import { useState, useEffect } from 'react';
import { DEFAULT_BRAND_PROMPT, OUTPUT_FORMAT } from '../config/platforms';

export default function PromptModal({ isOpen, onClose, prompts, setPrompts, activePromptId, setActivePromptId }) {
  const [selectedId, setSelectedId] = useState(activePromptId);
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [showOutputFormat, setShowOutputFormat] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(activePromptId);
      const prompt = prompts.find(p => p.id === activePromptId);
      setEditingPrompt(prompt ? { ...prompt } : null);
    }
  }, [isOpen, activePromptId, prompts]);

  if (!isOpen) return null;

  const handleSelectPrompt = (prompt) => {
    setSelectedId(prompt.id);
    setEditingPrompt({ ...prompt });
  };

  const handleAddNew = () => {
    const newPrompt = {
      id: `prompt_${Date.now()}`,
      name: '新提示词',
      content: DEFAULT_BRAND_PROMPT
    };
    setPrompts([...prompts, newPrompt]);
    setSelectedId(newPrompt.id);
    setEditingPrompt({ ...newPrompt });
  };

  const handleSave = () => {
    if (!editingPrompt) return;

    setPrompts(prompts.map(p =>
      p.id === editingPrompt.id ? editingPrompt : p
    ));
  };

  const handleDelete = (id) => {
    if (prompts.length <= 1) return;

    const newPrompts = prompts.filter(p => p.id !== id);
    setPrompts(newPrompts);

    if (selectedId === id) {
      const firstPrompt = newPrompts[0];
      setSelectedId(firstPrompt.id);
      setEditingPrompt({ ...firstPrompt });
    }

    if (activePromptId === id) {
      setActivePromptId(newPrompts[0].id);
    }
  };

  const handleUseThis = () => {
    if (editingPrompt) {
      handleSave();
      setActivePromptId(editingPrompt.id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">提示词管理</h2>
            <p className="text-xs text-slate-400 mt-0.5">创建和管理多个提示词，选择一个用于 AI 润色</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F8F8F8] text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left - Prompt List */}
          <div className="w-56 border-r border-slate-100 flex flex-col">
            <div className="p-3 border-b border-slate-100">
              <button
                onClick={handleAddNew}
                className="w-full px-3 py-2 text-sm text-slate-600 hover:bg-[#F8F8F8] rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                添加提示词
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {prompts.map(prompt => (
                <div
                  key={prompt.id}
                  onClick={() => handleSelectPrompt(prompt)}
                  className={`
                    group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all mb-1
                    ${selectedId === prompt.id
                      ? 'bg-[#F8F8F8]'
                      : 'hover:bg-[#F8F8F8]/50'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {activePromptId === prompt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                    <span className={`text-sm truncate ${selectedId === prompt.id ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>
                      {prompt.name}
                    </span>
                  </div>
                  {prompts.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(prompt.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-slate-200 rounded transition-all"
                    >
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right - Edit Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {editingPrompt ? (
              <div className="flex-1 overflow-y-auto p-6">
                {/* Name */}
                <div className="mb-4">
                  <label className="text-sm font-medium text-slate-700 block mb-2">名称</label>
                  <input
                    type="text"
                    value={editingPrompt.name}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, name: e.target.value })}
                    onBlur={handleSave}
                    className="w-full px-3 py-2 bg-[#F8F8F8] border-0 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                    placeholder="提示词名称"
                  />
                </div>

                {/* Content */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">提示词内容</label>
                    <button
                      onClick={() => setEditingPrompt({ ...editingPrompt, content: DEFAULT_BRAND_PROMPT })}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      重置为默认
                    </button>
                  </div>
                  <textarea
                    value={editingPrompt.content}
                    onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                    onBlur={handleSave}
                    className="w-full h-[240px] px-4 py-3 bg-[#F8F8F8] border-0 rounded-xl text-sm text-slate-700 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  />
                </div>

                {/* Tips */}
                <div className="p-3 bg-amber-50 rounded-lg mb-4">
                  <p className="text-xs text-amber-800 font-medium mb-1">配置建议</p>
                  <ul className="text-xs text-amber-700 space-y-0.5">
                    <li>• 品牌定位：高端/亲民/专业/文艺</li>
                    <li>• 内容原则：简洁有力，100-150 字符</li>
                    <li>• 标签策略：5-8 个精准标签</li>
                  </ul>
                </div>

                {/* Output Format */}
                <div>
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
                    <pre className="mt-2 p-3 bg-[#F8F8F8] rounded-lg text-xs text-slate-500 font-mono whitespace-pre-wrap">
                      {OUTPUT_FORMAT.trim()}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                选择一个提示词进行编辑
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#F8F8F8]">
          <div className="text-xs text-slate-500">
            {activePromptId === selectedId ? (
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                当前正在使用此提示词
              </span>
            ) : (
              <span>点击"使用此提示词"切换</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleUseThis}
              className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              使用此提示词
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
