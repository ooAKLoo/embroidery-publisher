import { useState } from 'react';

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: 'Ins', color: 'from-purple-500 to-pink-500', limit: 2200 },
  { id: 'facebook', name: 'Facebook', icon: 'FB', color: 'from-fb to-blue-500', limit: 63206 },
  { id: 'twitter', name: 'X', icon: 'X', color: 'from-slate-800 to-slate-600', limit: 280 },
  { id: 'pinterest', name: 'Pinterest', icon: 'Pin', color: 'from-pinterest to-red-400', limit: 500 },
];

function InstagramPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-sm mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 overflow-hidden">
          {accountProfile.avatar ? (
            <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
              {accountProfile.displayName?.charAt(0) || 'Y'}
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium">{accountProfile.username}</p>
          <p className="text-xs text-slate-400">Sponsored</p>
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square bg-slate-100">
        {images.length > 0 ? (
          <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 p-3">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="输入Instagram文案..."
          className="w-full text-sm text-slate-700 resize-none border-0 focus:ring-0 p-0 min-h-[60px]"
          rows={3}
        />
        <textarea
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="#hashtags"
          className="w-full text-sm text-blue-500 resize-none border-0 focus:ring-0 p-0 mt-2"
          rows={2}
        />
      </div>
    </div>
  );
}

function FacebookPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 overflow-hidden">
          {accountProfile.avatar ? (
            <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {accountProfile.displayName?.charAt(0) || 'Y'}
            </div>
          )}
        </div>
        <div>
          <p className="font-medium">{accountProfile.displayName}</p>
          <p className="text-xs text-slate-400">Just now · Public</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="输入Facebook文案...（可以是长篇故事）"
          className="w-full text-sm text-slate-700 resize-none border-0 focus:ring-0 p-0 min-h-[80px]"
          rows={4}
        />
        <textarea
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="#hashtags"
          className="w-full text-sm text-blue-600 resize-none border-0 focus:ring-0 p-0 mt-2"
          rows={1}
        />
      </div>

      {/* Image */}
      <div className="aspect-video bg-slate-100">
        {images.length > 0 ? (
          <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-around p-3 border-t">
        <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg">
          <span>Like</span>
        </button>
        <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg">
          <span>Comment</span>
        </button>
        <button className="flex items-center gap-2 text-slate-500 hover:bg-slate-50 px-4 py-2 rounded-lg">
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}

function TwitterPreview({ images, text, tags, onTextChange, onTagsChange, accountProfile }) {
  const fullText = text + (tags ? '\n' + tags : '');
  const remaining = 280 - fullText.length;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-md mx-auto p-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 flex-shrink-0 overflow-hidden">
          {accountProfile.avatar ? (
            <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {accountProfile.displayName?.charAt(0) || 'Y'}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold">{accountProfile.displayName}</span>
            <span className="text-slate-400">@{accountProfile.username}</span>
          </div>

          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="输入推文...（限280字符）"
            className="w-full text-sm text-slate-700 resize-none border-0 focus:ring-0 p-0 mt-2 min-h-[40px]"
            rows={2}
          />
          <textarea
            value={tags}
            onChange={(e) => onTagsChange(e.target.value)}
            placeholder="#hashtags (1-2个)"
            className="w-full text-sm text-blue-500 resize-none border-0 focus:ring-0 p-0"
            rows={1}
          />

          {/* Image */}
          {images.length > 0 && (
            <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-slate-100">
              <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Character count */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className={`text-sm ${remaining < 0 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              {remaining}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PinterestPreview({ images, text, tags, onTextChange, onTagsChange }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm max-w-xs mx-auto">
      {/* Image - Pinterest uses 2:3 ratio */}
      <div className="aspect-[2/3] bg-slate-100">
        {images.length > 0 ? (
          <img src={images[0].preview} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Pin标题和描述...（关键词很重要）"
          className="w-full text-sm text-slate-700 resize-none border-0 focus:ring-0 p-0 font-medium min-h-[40px]"
          rows={2}
        />
        <textarea
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="关键词（搜索导向）"
          className="w-full text-xs text-slate-500 resize-none border-0 focus:ring-0 p-0 mt-2"
          rows={1}
        />
      </div>
    </div>
  );
}

export default function PlatformPreview({
  activePlatform,
  setActivePlatform,
  images,
  platformTexts,
  platformTags,
  updatePlatformText,
  updatePlatformTags,
  accountProfile
}) {
  const currentPlatform = platforms.find(p => p.id === activePlatform);
  const currentText = platformTexts[activePlatform] || '';
  const currentTags = platformTags[activePlatform] || '';
  const charCount = currentText.length + currentTags.length;

  return (
    <div className="flex flex-col h-full">
      {/* Platform Tabs */}
      <div className="flex items-center gap-2 p-4 bg-white border-b border-slate-200">
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => setActivePlatform(platform.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activePlatform === platform.id
                ? `bg-gradient-to-r ${platform.color} text-white shadow-sm`
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }
            `}
          >
            {platform.name}
          </button>
        ))}
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activePlatform === 'instagram' && (
          <InstagramPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('instagram', text)}
            onTagsChange={(tags) => updatePlatformTags('instagram', tags)}
            accountProfile={accountProfile}
          />
        )}
        {activePlatform === 'facebook' && (
          <FacebookPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('facebook', text)}
            onTagsChange={(tags) => updatePlatformTags('facebook', tags)}
            accountProfile={accountProfile}
          />
        )}
        {activePlatform === 'twitter' && (
          <TwitterPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('twitter', text)}
            onTagsChange={(tags) => updatePlatformTags('twitter', tags)}
            accountProfile={accountProfile}
          />
        )}
        {activePlatform === 'pinterest' && (
          <PinterestPreview
            images={images}
            text={currentText}
            tags={currentTags}
            onTextChange={(text) => updatePlatformText('pinterest', text)}
            onTagsChange={(tags) => updatePlatformTags('pinterest', tags)}
          />
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          {currentPlatform?.name} - {charCount}/{currentPlatform?.limit} 字符
        </span>
        {charCount > (currentPlatform?.limit || 0) && (
          <span className="text-xs text-red-500 font-medium">
            超出限制 {charCount - (currentPlatform?.limit || 0)} 字符
          </span>
        )}
      </div>
    </div>
  );
}
