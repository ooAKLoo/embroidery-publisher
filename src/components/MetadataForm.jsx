const craftOptions = [
  { value: '', label: '选择针法' },
  { value: 'random_stitch', label: '乱针绣 Random Stitch' },
  { value: 'ping_stitch', label: '平针绣 Flat Stitch' },
  { value: 'dicing', label: '打籽绣 Seed Stitch' },
  { value: 'gold_couching', label: '盘金绣 Gold Couching' },
  { value: 'double_sided', label: '双面绣 Double-sided' },
  { value: 'hair', label: '发绣 Hair Embroidery' },
  { value: 'mixed', label: '混合针法 Mixed Techniques' },
];

export default function MetadataForm({ metadata, setMetadata }) {
  const updateField = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <h3 className="font-medium text-slate-700 mb-3">作品信息</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* 尺寸 */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">尺寸 Size</label>
          <input
            type="text"
            value={metadata.size}
            onChange={(e) => updateField('size', e.target.value)}
            placeholder="如: 40cm x 50cm"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>

        {/* 针法 */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">针法 Craft</label>
          <select
            value={metadata.craft}
            onChange={(e) => updateField('craft', e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
          >
            {craftOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* 耗时 */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">耗时 Hours</label>
          <div className="relative">
            <input
              type="text"
              value={metadata.hours}
              onChange={(e) => updateField('hours', e.target.value)}
              placeholder="如: 3个月 / 500小时"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
        </div>

        {/* 购买链接 */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">购买链接 Link</label>
          <input
            type="text"
            value={metadata.link}
            onChange={(e) => updateField('link', e.target.value)}
            placeholder="Etsy/官网链接"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
        </div>
      </div>

      {/* 快捷提示 */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
        <p className="text-xs text-amber-700">
          <strong>提示：</strong>详细的耗时信息能显著提升作品的溢价空间。例如"历时6个月，共计1200小时纯手工"比简单的"手工制作"更具说服力。
        </p>
      </div>
    </div>
  );
}
