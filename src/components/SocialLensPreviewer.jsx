import React, { useState } from 'react';
import {
  TwitterPreview,
  WeChatPreview,
  TikTokPreview,
  BilibiliPreview,
  YouTubePreview
} from './sociallens/Previews';
import { Camera, Trash2, User, Layout, Grid } from 'lucide-react';

const Platform = {
  TWITTER: 'twitter',
  WECHAT: 'wechat',
  TIKTOK: 'tiktok',
  BILIBILI: 'bilibili',
  YOUTUBE: 'youtube'
};

const SocialLensPreviewer = () => {
  const [images, setImages] = useState([]);
  const [mode, setMode] = useState('post');

  const handleImageUpload = e => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (e, index) => {
    e.stopPropagation();
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const selectImage = index => {
    if (index === 0) return;
    setImages(prev => {
      const newImages = [...prev];
      const [selected] = newImages.splice(index, 1);
      newImages.unshift(selected);
      return newImages;
    });
  };

  const renderPreviewCard = platform => {
    const props = {
      images: images.length > 0 ? images : ['https://picsum.photos/800/600', 'https://picsum.photos/800/601'],
      caption: '',
      date: new Date().toLocaleDateString(),
      mode
    };

    let Component;
    switch (platform) {
      case Platform.TWITTER:
        Component = TwitterPreview;
        break;
      case Platform.WECHAT:
        Component = WeChatPreview;
        break;
      case Platform.TIKTOK:
        Component = TikTokPreview;
        break;
      case Platform.BILIBILI:
        Component = BilibiliPreview;
        break;
      case Platform.YOUTUBE:
        Component = YouTubePreview;
        break;
      default:
        Component = TwitterPreview;
    }

    return (
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-semibold text-gray-700 capitalize flex items-center gap-2">{platform}</h3>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">{mode} Preview</span>
        </div>
        <div className="p-4 bg-gray-50/30 flex-1 flex items-start justify-center overflow-auto">
          <div className="w-full max-w-[400px]">
            <Component {...props} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col md:flex-row text-gray-800 font-sans overflow-hidden bg-gray-100 rounded-2xl">
      {/* LEFT SIDEBAR: Controls */}
      <div className="w-full md:w-[380px] bg-white border-r border-gray-200 flex flex-col h-full z-20 shadow-xl shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 flex items-center gap-2">
            <Grid className="text-blue-600" /> SocialLens
          </h1>
          <p className="text-sm text-gray-500 mt-1">Multi-platform Previewer</p>
        </div>

        <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-8">
          {/* Mode Selector */}
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 block">Preview Mode</label>
            <div className="bg-gray-100 p-1 rounded-xl flex">
              <button
                onClick={() => setMode('post')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'post' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Layout size={16} /> Post
              </button>
              <button
                onClick={() => setMode('avatar')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'avatar' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User size={16} /> Profile
              </button>
            </div>
          </div>

          {/* Image Uploader */}
          <div>
            <label className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3 block">Media</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer relative group">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="flex flex-col items-center gap-3 transition-transform group-hover:scale-105 duration-200">
                <div className="p-3 bg-blue-50 text-blue-500 rounded-full">
                  <Camera size={24} />
                </div>
                <div>
                  <span className="text-sm text-gray-700 font-semibold block">Click to Upload</span>
                  <span className="text-xs text-gray-400 mt-1 block">
                    {mode === 'avatar' ? 'First image used as Avatar' : 'Supports multiple images'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 0 && (
              <div className="flex flex-col gap-2 mt-4">
                <p className="text-xs text-gray-400">Click an image to set as main/avatar</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => selectImage(idx)}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden group border cursor-pointer transition-all ${
                        idx === 0
                          ? 'border-blue-500 ring-2 ring-blue-200 opacity-100'
                          : 'border-gray-200 hover:border-blue-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} className="w-full h-full object-cover" alt="thumb" />
                      <button
                        onClick={e => removeImage(e, idx)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm hover:bg-red-500"
                      >
                        <Trash2 size={10} />
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 w-full bg-blue-500/80 text-white text-[8px] text-center font-bold py-0.5">
                          MAIN
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Preview Grid */}
      <div className="flex-1 bg-gray-100 h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-20">
            {Object.values(Platform).map(p => (
              <React.Fragment key={p}>{renderPreviewCard(p)}</React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLensPreviewer;
