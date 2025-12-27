import { useState } from 'react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { platforms } from '../config/platforms';
import {
  InstagramPreview,
  FacebookPreview,
  TwitterPreview,
  PinterestPreview,
  TikTokPreview,
  EtsyPreview,
  PromptPreview,
  InstagramIcon,
  FacebookIcon,
  XIcon,
  PinterestIcon,
  TikTokIcon,
  EtsyIcon,
} from './previews';

// 平台 UI 配置
const platformUI = {
  instagram: { Icon: InstagramIcon, color: '#E4405F', url: 'https://www.instagram.com/' },
  facebook: { Icon: FacebookIcon, color: '#1877F2', url: 'https://www.facebook.com/' },
  twitter: { Icon: XIcon, color: '#000000', url: 'https://twitter.com/compose/tweet' },
  pinterest: { Icon: PinterestIcon, color: '#E60023', url: 'https://www.pinterest.com/pin-builder/' },
  tiktok: { Icon: TikTokIcon, color: '#000000', url: 'https://www.tiktok.com/upload' },
  etsy: { Icon: EtsyIcon, color: '#F56400', url: 'https://www.etsy.com/your/shops/me/tools/listings' },
};

export default function PlatformPreview({
  activePlatform,
  setActivePlatform,
  images,
  platformTexts,
  generatedTitle,
  accountProfile,
  brandPrompt,
  masterText
}) {
  const [previewMode, setPreviewMode] = useState('social');
  const hasVideo = images.some(m => m.type === 'video');
  const visiblePlatforms = platforms.filter(p => !p.videoOnly || hasVideo);
  const currentText = platformTexts[activePlatform] || '';

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="p-4 space-y-3">
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#F8F8F8] rounded-lg p-1 w-fit">
          <button
            onClick={() => setPreviewMode('social')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              previewMode === 'social' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            社交预览
          </button>
          <button
            onClick={() => setPreviewMode('list')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              previewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            文案列表
          </button>
          <button
            onClick={() => setPreviewMode('prompt')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              previewMode === 'prompt' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            提示词
          </button>
        </div>

        {/* Platform Tabs - 仅社交预览模式显示 */}
        {previewMode === 'social' && (
          <div className="flex items-center gap-2">
            {visiblePlatforms.map(platform => {
              const ui = platformUI[platform.id];
              const Icon = ui.Icon;
              const isActive = activePlatform === platform.id;
              return (
                <button
                  key={platform.id}
                  onClick={() => setActivePlatform(platform.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-800'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" style={isActive ? { color: ui.color } : { opacity: 0.7 }} />
                  <span className="hidden sm:inline">{platform.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {previewMode === 'prompt' ? (
          <PromptPreview brandPrompt={brandPrompt} masterText={masterText} />
        ) : previewMode === 'list' ? (
          <div className="space-y-4">
            {visiblePlatforms.map(platform => {
              const ui = platformUI[platform.id];
              const Icon = ui.Icon;
              const text = platformTexts[platform.id] || '';
              return (
                <div key={platform.id} className="bg-[#F8F8F8] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: ui.color }} />
                    <span className="text-sm font-medium text-slate-700">{platform.name}</span>
                    {platform.id === 'pinterest' && generatedTitle && (
                      <span className="text-xs text-slate-400 ml-auto">标题: {generatedTitle}</span>
                    )}
                  </div>
                  <pre className="text-sm text-slate-600 whitespace-pre-wrap font-sans leading-relaxed">
                    {text || <span className="text-slate-400 italic">等待 AI 生成...</span>}
                  </pre>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            {activePlatform === 'instagram' && <InstagramPreview images={images} text={currentText} accountProfile={accountProfile} />}
            {activePlatform === 'facebook' && <FacebookPreview images={images} text={currentText} accountProfile={accountProfile} />}
            {activePlatform === 'twitter' && <TwitterPreview images={images} text={currentText} accountProfile={accountProfile} />}
            {activePlatform === 'pinterest' && <PinterestPreview images={images} text={currentText} title={generatedTitle} accountProfile={accountProfile} />}
            {activePlatform === 'tiktok' && <TikTokPreview images={images} text={currentText} accountProfile={accountProfile} />}
            {activePlatform === 'etsy' && <EtsyPreview images={images} text={currentText} accountProfile={accountProfile} />}
          </>
        )}
      </div>

      {/* Status Bar - 仅社交预览模式显示 */}
      {previewMode === 'social' && (
        <div className="px-5 py-3 flex items-center justify-end">
          <div className="flex items-center gap-1">
            {visiblePlatforms.map(platform => {
              const ui = platformUI[platform.id];
              const Icon = ui.Icon;
              return (
                <button
                  key={platform.id}
                  onClick={() => openUrl(ui.url)}
                  className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors rounded hover:bg-slate-100"
                  title={`打开 ${platform.name}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
