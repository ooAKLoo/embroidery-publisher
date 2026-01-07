import { useState } from 'react';

/**
 * SOP 配置详情面板
 */
function SOPConfigPanel({ stepKey, onClose, config, onSave }) {
  const [localConfig, setLocalConfig] = useState(config || {});

  const handleSave = () => {
    onSave?.(stepKey, localConfig);
    onClose();
  };

  // 各步骤的配置表单
  const renderStepConfig = () => {
    switch (stepKey) {
      case 'schema':
        return <SchemaConfig config={localConfig} onChange={setLocalConfig} />;
      case 'supabase':
        return <SupabaseConfig config={localConfig} onChange={setLocalConfig} />;
      case 'storage':
        return <StorageConfig config={localConfig} onChange={setLocalConfig} />;
      case 'fields':
        return <FieldsConfig config={localConfig} onChange={setLocalConfig} />;
      case 'ready':
        return <ReadyConfig config={localConfig} />;
      default:
        return null;
    }
  };

  const stepTitles = {
    schema: '导入 Schema',
    supabase: '配置 Supabase',
    storage: '配置 R2 存储',
    fields: '字段映射',
    ready: '开始使用',
  };

  const stepDescriptions = {
    schema: '粘贴 Supabase Table 链接或 Schema SQL，系统将自动解析字段结构',
    supabase: '配置 Supabase 数据库连接信息',
    storage: '配置 Cloudflare R2 对象存储用于图片上传',
    fields: '将解析出的字段映射到表单组件',
    ready: '配置已完成，可以开始使用',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 面板 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex-shrink-0 flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {stepTitles[stepKey]}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {stepDescriptions[stepKey]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-y-auto p-5">
          {renderStepConfig()}
        </div>

        {/* 底部按钮 */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 p-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
          >
            保存配置
          </button>
        </div>
      </div>
    </div>
  );
}

// Schema 配置
function SchemaConfig({ config, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Supabase Table 链接
        </label>
        <input
          type="url"
          value={config.tableUrl || ''}
          onChange={(e) => onChange({ ...config, tableUrl: e.target.value })}
          className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
          placeholder="https://supabase.com/dashboard/project/xxx/editor/xxx"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400">或</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">
          Schema SQL
        </label>
        <textarea
          value={config.schemaSql || ''}
          onChange={(e) => onChange({ ...config, schemaSql: e.target.value })}
          rows={6}
          className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-mono"
          placeholder={`CREATE TABLE products (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER,
  ...
);`}
        />
      </div>

      {config.parsedFields && config.parsedFields.length > 0 && (
        <div className="p-3 bg-emerald-50 rounded-xl">
          <p className="text-xs font-medium text-emerald-700 mb-2">已解析字段：</p>
          <div className="flex flex-wrap gap-1.5">
            {config.parsedFields.map((field, i) => (
              <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 带复制按钮的输入框
function CopyableInput({ label, value, onChange, type = 'text', placeholder, showToggle = false }) {
  const [showValue, setShowValue] = useState(!showToggle);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1.5">
        {label}
      </label>
      <div className="relative flex gap-1.5">
        <input
          type={showToggle && !showValue ? 'password' : 'text'}
          value={value || ''}
          onChange={onChange}
          className="flex-1 px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all font-mono"
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setShowValue(!showValue)}
            className="px-2.5 bg-[#F8F8F8] rounded-xl hover:bg-slate-200 transition-colors"
            title={showValue ? '隐藏' : '显示'}
          >
            {showValue ? (
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
        <button
          type="button"
          onClick={handleCopy}
          className={`px-2.5 rounded-xl transition-colors ${
            copied ? 'bg-emerald-100 text-emerald-600' : 'bg-[#F8F8F8] hover:bg-slate-200 text-slate-500'
          }`}
          title="复制"
        >
          {copied ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

// Supabase 配置
function SupabaseConfig({ config, onChange }) {
  return (
    <div className="space-y-4">
      <CopyableInput
        label="Project URL"
        value={config.projectUrl}
        onChange={(e) => onChange({ ...config, projectUrl: e.target.value })}
        placeholder="https://xxx.supabase.co"
      />

      <CopyableInput
        label="Anon Key"
        value={config.anonKey}
        onChange={(e) => onChange({ ...config, anonKey: e.target.value })}
        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        showToggle
      />

      <CopyableInput
        label="Table Name"
        value={config.tableName}
        onChange={(e) => onChange({ ...config, tableName: e.target.value })}
        placeholder="products"
      />

      {config.projectUrl && config.anonKey && (
        <button className="w-full py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
          测试连接
        </button>
      )}
    </div>
  );
}

// R2 存储配置
function StorageConfig({ config, onChange }) {
  return (
    <div className="space-y-4">
      <CopyableInput
        label="Account ID"
        value={config.accountId}
        onChange={(e) => onChange({ ...config, accountId: e.target.value })}
        placeholder="Cloudflare Account ID"
      />

      <CopyableInput
        label="Access Key ID"
        value={config.accessKeyId}
        onChange={(e) => onChange({ ...config, accessKeyId: e.target.value })}
        placeholder="Access Key ID"
      />

      <CopyableInput
        label="Secret Access Key"
        value={config.secretAccessKey}
        onChange={(e) => onChange({ ...config, secretAccessKey: e.target.value })}
        placeholder="Secret Access Key"
        showToggle
      />

      <CopyableInput
        label="Bucket Name"
        value={config.bucketName}
        onChange={(e) => onChange({ ...config, bucketName: e.target.value })}
        placeholder="my-bucket"
      />

      <CopyableInput
        label="Public URL (CDN)"
        value={config.publicUrl}
        onChange={(e) => onChange({ ...config, publicUrl: e.target.value })}
        placeholder="https://cdn.example.com"
      />
    </div>
  );
}

// 字段映射配置
function FieldsConfig({ config, onChange }) {
  const fieldTypes = [
    { value: 'text', label: '单行文本' },
    { value: 'textarea', label: '多行文本' },
    { value: 'number', label: '数字' },
    { value: 'price', label: '价格' },
    { value: 'images', label: '图片上传' },
    { value: 'select', label: '下拉选择' },
    { value: 'checkbox', label: '开关' },
    { value: 'tags', label: '标签' },
  ];

  const fields = config.fields || [
    { name: 'title', type: 'text', label: '标题', required: true },
    { name: 'description', type: 'textarea', label: '描述', required: false },
    { name: 'price', type: 'price', label: '价格', required: true },
    { name: 'images', type: 'images', label: '图片', required: false },
  ];

  const updateField = (index, key, value) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    onChange({ ...config, fields: newFields });
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={index} className="p-3 bg-slate-50 rounded-xl space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={field.name}
              onChange={(e) => updateField(index, 'name', e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-white rounded-lg text-xs text-slate-600 font-mono border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="字段名"
            />
            <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField(index, 'label', e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-white rounded-lg text-xs text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
              placeholder="显示名称"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={field.type}
              onChange={(e) => updateField(index, 'type', e.target.value)}
              className="flex-1 px-2.5 py-1.5 bg-white rounded-lg text-xs text-slate-600 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {fieldTypes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-slate-500">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(index, 'required', e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300"
              />
              必填
            </label>
          </div>
        </div>
      ))}

      <button
        onClick={() => onChange({ ...config, fields: [...fields, { name: '', type: 'text', label: '', required: false }] })}
        className="w-full py-2 text-xs font-medium text-slate-500 border border-dashed border-slate-300 rounded-xl hover:border-slate-400 hover:text-slate-600 transition-colors"
      >
        + 添加字段
      </button>
    </div>
  );
}

// 开始使用
function ReadyConfig({ config }) {
  const checks = [
    { label: 'Schema 已解析', done: true },
    { label: 'Supabase 已连接', done: true },
    { label: 'R2 存储已配置', done: true },
    { label: '字段映射完成', done: true },
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-emerald-50 rounded-xl text-center">
        <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-medium text-emerald-800">配置已完成</p>
        <p className="text-xs text-emerald-600 mt-1">所有步骤已完成，可以开始使用</p>
      </div>

      <div className="space-y-2">
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2.5 text-sm">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              check.done ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              {check.done && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={check.done ? 'text-slate-700' : 'text-slate-400'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SOPConfigPanel;
