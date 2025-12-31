import { useState, useRef } from 'react';
import { productsApi } from '../lib/supabase';
import { uploadImages } from '../lib/r2';

function ProductManager() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock: '0',
    category: '',
    images: [], // {file, preview} 本地预览，保存时才上传
    is_active: true,
    metadata: {
      longDescription: '',
      materials: '',
      dimensions: '',
      careInstructions: ''
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith('metadata.')) {
      const metaKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, [metaKey]: value }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // 选择文件 - 只做本地预览，不上传
  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;

    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const newImages = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  // 拖拽
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 删除图片
  const removeImage = (index) => {
    setFormData(prev => {
      const removed = prev.images[index];
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return {
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      };
    });
  };

  // 移动图片顺序
  const moveImage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.images.length) return;

    setFormData(prev => {
      const newImages = [...prev.images];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return { ...prev, images: newImages };
    });
  };

  // 提交 - 先上传图片到 R2，再保存产品
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    try {
      let imageUrls = [];

      // 如果有图片，先上传到 R2
      if (formData.images.length > 0) {
        setMessage({ type: 'info', text: '正在上传图片...' });

        const files = formData.images.map(img => img.file);
        const results = await uploadImages(files, 'products');
        imageUrls = results.map(r => r.url);
      }

      setMessage({ type: 'info', text: '正在保存产品...' });

      const productData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: Math.round(parseFloat(formData.price) * 100),
        compare_at_price: formData.compare_at_price
          ? Math.round(parseFloat(formData.compare_at_price) * 100)
          : null,
        stock: parseInt(formData.stock) || 0,
        category: formData.category.trim() || null,
        images: imageUrls,
        is_active: formData.is_active,
        metadata: {
          longDescription: formData.metadata.longDescription.trim() || undefined,
          materials: formData.metadata.materials
            ? formData.metadata.materials.split(',').map(m => m.trim()).filter(Boolean)
            : undefined,
          dimensions: formData.metadata.dimensions.trim() || undefined,
          careInstructions: formData.metadata.careInstructions.trim() || undefined
        }
      };

      Object.keys(productData.metadata).forEach(key => {
        if (productData.metadata[key] === undefined) {
          delete productData.metadata[key];
        }
      });

      await productsApi.create(productData);

      // 清理预览 URL
      formData.images.forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });

      // 重置表单
      setFormData({
        title: '',
        description: '',
        price: '',
        compare_at_price: '',
        stock: '0',
        category: '',
        images: [],
        is_active: true,
        metadata: {
          longDescription: '',
          materials: '',
          dimensions: '',
          careInstructions: ''
        }
      });

      setMessage({ type: 'success', text: '产品添加成功' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || '添加失败' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-5 border-b border-slate-100">
        <div>
          <h2 className="text-base font-semibold text-slate-800">添加产品</h2>
          <p className="text-xs text-slate-400 mt-0.5">填写产品信息并保存到数据库</p>
        </div>
        {message && (
          <div className={`px-4 py-2 rounded-xl text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-700' :
            message.type === 'error' ? 'bg-red-50 text-red-600' :
            'bg-slate-100 text-slate-600'
          }`}>
            {message.type === 'info' && (
              <svg className="w-4 h-4 inline mr-1.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {message.text}
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-8 h-full">
          {/* 左列：基本信息 */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">基本信息</h3>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                placeholder="产品标题"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">简短描述</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                placeholder="简短的产品描述"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">
                  价格 (¥) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">原价 (¥)</label>
                <input
                  type="number"
                  name="compare_at_price"
                  value={formData.compare_at_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  placeholder="划线价"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">库存</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">分类</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  placeholder="wall-art"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-200"
              />
              <span className="text-sm text-slate-700">上架</span>
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">详细描述</label>
              <textarea
                name="metadata.longDescription"
                value={formData.metadata.longDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                placeholder="产品的详细描述..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">材质</label>
                <input
                  type="text"
                  name="metadata.materials"
                  value={formData.metadata.materials}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  placeholder="丝线, 棉布"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">尺寸</label>
                <input
                  type="text"
                  name="metadata.dimensions"
                  value={formData.metadata.dimensions}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                  placeholder="60x40cm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">护理说明</label>
              <input
                type="text"
                name="metadata.careInstructions"
                value={formData.metadata.careInstructions}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#F8F8F8] rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white transition-all"
                placeholder="避免阳光直射"
              />
            </div>
          </div>

          {/* 右列：图片 */}
          <div className="space-y-5 flex flex-col">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">产品图片</h3>

            {/* 上传区域 */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all border-slate-200 hover:border-slate-400 hover:bg-slate-50"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-slate-600 font-medium">点击或拖拽添加图片</p>
              <p className="text-xs text-slate-400 mt-1">保存时自动上传到云端</p>
            </div>

            {/* 图片列表 */}
            {formData.images.length > 0 && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((img, index) => (
                    <div key={img.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={img.preview}
                          alt={`图片 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium">
                        {index === 0 ? '主图' : index === 1 ? 'Hover' : index + 1}
                      </div>

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, -1)}
                            className="p-1.5 bg-white rounded-lg hover:bg-slate-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        {index < formData.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, 1)}
                            className="p-1.5 bg-white rounded-lg hover:bg-slate-100"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.images.length > 0 && (
              <p className="text-xs text-slate-400">
                已选择 {formData.images.length} 张图片 · 点击保存时上传
              </p>
            )}

            <div className="flex-1 min-h-4" />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 text-sm font-medium text-white bg-slate-900 rounded-xl hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? '保存中...' : '保存产品'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ProductManager;
