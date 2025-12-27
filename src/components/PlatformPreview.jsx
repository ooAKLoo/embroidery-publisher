import { useState } from 'react';
import { platformConfigs } from '../config/platforms';
import {
  InstagramPreview,
  FacebookPreview,
  TwitterPreview,
  PinterestPreview,
  TikTokPreview,
  PromptPreview,
  InstagramIcon,
  FacebookIcon,
  XIcon,
  PinterestIcon,
  TikTokIcon,
} from './previews';

// 平台UI配置
const platformUIConfigs = {
  instagram: { Icon: InstagramIcon, gradient: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
  facebook: { Icon: FacebookIcon, activeColor: '#1877F2' },
  twitter: { Icon: XIcon, activeColor: '#000000' },
  pinterest: { Icon: PinterestIcon, activeColor: '#E60023' },
  tiktok: { Icon: TikTokIcon, activeColor: '#000000', videoOnly: true },
};

// 合并平台配置和UI配置
const platforms = Object.keys(platformConfigs).map(id => ({
  id,
  name: platformConfigs[id].name,
  limit: platformConfigs[id].constraints.maxTextLength,
  ...platformUIConfigs[id],
}));

export default function PlatformPreview({
  activePlatform,
  setActivePlatform,
  images,
  platformTexts,
  pinterestTitle,
  accountProfile,
  platformPrompts
}) {
  const [previewMode, setPreviewMode] = useState('social'); // 'social' | 'prompt'
  const hasVideo = images.some(m => m.type === 'video');
  const visiblePlatforms = platforms.filter(p => !p.videoOnly || hasVideo);
  const currentPlatform = platforms.find(p => p.id === activePlatform);
  const currentText = platformTexts[activePlatform] || '';
  const charCount = currentText.length;

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar: Mode Toggle + Platform Tabs */}
      <div className="p-4 space-y-3">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-[#F8F8F8] rounded-lg p-1">
            <button
              onClick={() => setPreviewMode('social')}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${previewMode === 'social'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              社交预览
            </button>
            <button
              onClick={() => setPreviewMode('prompt')}
              className={`
                px-3 py-1.5 rounded-md text-xs font-medium transition-all
                ${previewMode === 'prompt'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              提示词预览
            </button>
          </div>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-2">
          {visiblePlatforms.map(platform => {
            const Icon = platform.Icon;
            const isActive = activePlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setActivePlatform(platform.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-slate-800'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? '' : 'opacity-70'}`} style={isActive ? { color: platform.activeColor || '#000' } : {}} />
                <span className="hidden sm:inline">{platform.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {previewMode === 'prompt' ? (
          <PromptPreview
            platformPrompts={platformPrompts}
            activePlatform={activePlatform}
          />
        ) : (
          <>
            {activePlatform === 'instagram' && (
              <InstagramPreview
                images={images}
                text={currentText}
                accountProfile={accountProfile}
              />
            )}
            {activePlatform === 'facebook' && (
              <FacebookPreview
                images={images}
                text={currentText}
                accountProfile={accountProfile}
              />
            )}
            {activePlatform === 'twitter' && (
              <TwitterPreview
                images={images}
                text={currentText}
                accountProfile={accountProfile}
              />
            )}
            {activePlatform === 'pinterest' && (
              <PinterestPreview
                images={images}
                text={currentText}
                title={pinterestTitle}
                accountProfile={accountProfile}
              />
            )}
            {activePlatform === 'tiktok' && (
              <TikTokPreview
                images={images}
                text={currentText}
                accountProfile={accountProfile}
              />
            )}
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-5 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {charCount}/{currentPlatform?.limit} 字符
        </span>
        {charCount > (currentPlatform?.limit || 0) && (
          <span className="text-xs text-red-500 font-medium">
            超出 {charCount - (currentPlatform?.limit || 0)} 字符
          </span>
        )}
      </div>
    </div>
  );
}
