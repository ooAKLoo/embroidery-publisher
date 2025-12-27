import { useState, useEffect } from 'react';
import { platformConfigs } from '../config/platforms';
import { OUTPUT_FORMAT_INSTRUCTION } from '../config/platforms/base';

export default function PromptModal({ isOpen, onClose, prompts, setPrompts }) {
  const [activePlatform, setActivePlatform] = useState('instagram');
  const [localPrompts, setLocalPrompts] = useState(prompts);
  const [showOutputFormat, setShowOutputFormat] = useState(false);
  const [editingName, setEditingName] = useState(null); // 正在编辑名称的提示词ID

  // 同步外部 prompts 变化
  useEffect(() => {
    setLocalPrompts(prompts);
  }, [prompts]);

  if (!isOpen) return null;

  const currentConfig = platformConfigs[activePlatform];
  const platformData = localPrompts[activePlatform] || { activeId: 'default', list: [] };
  const activePrompt = platformData.list.find(p => p.id === platformData.activeId) || platformData.list[0];

  const handleSave = () => {
    setPrompts(localPrompts);
    onClose();
  };

  // 切换选中的提示词
  const handleSelectPrompt = (promptId) => {
    setLocalPrompts(prev => ({
      ...prev,
      [activePlatform]: {
        ...prev[activePlatform],
        activeId: promptId,
      }
    }));
  };

  // 修改提示词内容
  const handleContentChange = (value) => {
    setLocalPrompts(prev => ({
      ...prev,
      [activePlatform]: {
        ...prev[activePlatform],
        list: prev[activePlatform].list.map(p =>
          p.id === platformData.activeId ? { ...p, content: value } : p
        ),
      }
    }));
  };

  // 修改提示词名称
  const handleNameChange = (promptId, newName) => {
    setLocalPrompts(prev => ({
      ...prev,
      [activePlatform]: {
        ...prev[activePlatform],
        list: prev[activePlatform].list.map(p =>
          p.id === promptId ? { ...p, name: newName } : p
        ),
      }
    }));
  };

  // 添加新提示词
  const handleAddPrompt = () => {
    const newId = `prompt_${Date.now()}`;
    const newPrompt = {
      id: newId,
      name: `提示词 ${platformData.list.length + 1}`,
      content: currentConfig?.defaultSystemPrompt || '',
    };

    setLocalPrompts(prev => ({
      ...prev,
      [activePlatform]: {
        activeId: newId, // 自动选中新创建的
        list: [...prev[activePlatform].list, newPrompt],
      }
    }));
    setEditingName(newId); // 自动进入编辑名称模式
  };

  // 删除提示词
  const handleDeletePrompt = (promptId) => {
    if (platformData.list.length <= 1) return; // 至少保留一个

    const newList = platformData.list.filter(p => p.id !== promptId);
    const newActiveId = platformData.activeId === promptId ? newList[0].id : platformData.activeId;

    setLocalPrompts(prev => ({
      ...prev,
      [activePlatform]: {
        activeId: newActiveId,
        list: newList,
      }
    }));
  };

  // 重置当前提示词为默认值
  const handleResetCurrent = () => {
    const defaultContent = currentConfig?.defaultSystemPrompt || '';
    handleContentChange(defaultContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">AI 提示词管理</h2>
            <p className="text-xs text-slate-400 mt-0.5">为每个平台创建和管理多个提示词模板</p>
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

        {/* Platform Tabs */}
        <div className="flex gap-1 px-6 py-3 border-b border-slate-100 overflow-x-auto flex-shrink-0">
          {Object.keys(platformConfigs).map(platform => (
            <button
              key={platform}
              onClick={() => setActivePlatform(platform)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                ${activePlatform === platform
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-[#F8F8F8]'
                }
              `}
            >
              {platformConfigs[platform].name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Prompt List */}
          <div className="w-48 border-r border-slate-100 flex flex-col bg-[#F8F8F8]">
            <div className="p-3 border-b border-slate-100">
              <button
                onClick={handleAddPrompt}
                className="w-full px-3 py-2 bg-white border border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-slate-400 hover:text-slate-800 transition-colors flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                新建提示词
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {platformData.list.map(prompt => (
                <div
                  key={prompt.id}
                  className={`
                    group relative mb-1 rounded-lg transition-all cursor-pointer
                    ${platformData.activeId === prompt.id
                      ? 'bg-white shadow-sm ring-1 ring-slate-200'
                      : 'hover:bg-white/60'
                    }
                  `}
                >
                  <div
                    className="flex items-center gap-2 px-3 py-2"
                    onClick={() => handleSelectPrompt(prompt.id)}
                  >
                    {/* Radio */}
                    <div className={`
                      w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${platformData.activeId === prompt.id
                        ? 'border-slate-900'
                        : 'border-slate-300'
                      }
                    `}>
                      {platformData.activeId === prompt.id && (
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                      )}
                    </div>

                    {/* Name */}
                    {editingName === prompt.id ? (
                      <input
                        type="text"
                        value={prompt.name}
                        onChange={(e) => handleNameChange(prompt.id, e.target.value)}
                        onBlur={() => setEditingName(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingName(null)}
                        autoFocus
                        className="flex-1 min-w-0 text-sm bg-transparent border-b border-slate-300 focus:border-slate-600 outline-none py-0.5"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 min-w-0 text-sm text-slate-700 truncate"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingName(prompt.id);
                        }}
                      >
                        {prompt.name}
                      </span>
                    )}

                    {/* Actions */}
                    {platformData.list.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePrompt(prompt.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  {activePrompt?.name || '提示词'} - {currentConfig?.name}
                </label>
                <button
                  onClick={handleResetCurrent}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  重置为默认
                </button>
              </div>
              <textarea
                value={activePrompt?.content || ''}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-[280px] px-4 py-3 bg-[#F8F8F8] border-0 rounded-xl text-sm text-slate-700 font-mono leading-relaxed placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                placeholder="输入该平台的系统提示词..."
              />

              {/* Output Format Info */}
              <div className="mt-3">
                <button
                  onClick={() => setShowOutputFormat(!showOutputFormat)}
                  className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${showOutputFormat ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  查看固定输出格式（自动附加，不可编辑）
                </button>
                {showOutputFormat && (
                  <pre className="mt-2 p-3 bg-[#F8F8F8] rounded-lg text-xs text-slate-500 font-mono whitespace-pre-wrap">
                    {OUTPUT_FORMAT_INSTRUCTION.trim()}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 bg-[#F8F8F8] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-[#F8F8F8] rounded-lg transition-colors"
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
