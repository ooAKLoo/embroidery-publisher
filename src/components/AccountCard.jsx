import { useState, useRef } from 'react';

export default function AccountCard({ accountProfile, setAccountProfile }) {
  const [isEditing, setIsEditing] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAccountProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4">
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="flex items-center gap-3">
        {/* 头像 */}
        <div
          className={`relative w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 overflow-hidden flex-shrink-0 ${isEditing ? 'cursor-pointer' : ''}`}
          onClick={() => isEditing && avatarInputRef.current?.click()}
        >
          {accountProfile?.avatar ? (
            <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
              {accountProfile?.displayName?.charAt(0) || 'Y'}
            </div>
          )}
          {isEditing && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* 名称区域 */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <>
              <input
                type="text"
                value={accountProfile?.displayName || ''}
                onChange={(e) => setAccountProfile(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="显示名称"
                className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-none leading-tight"
                autoFocus
              />
              <div className="flex items-center">
                <span className="text-xs text-slate-400">@</span>
                <input
                  type="text"
                  value={accountProfile?.username || ''}
                  onChange={(e) => setAccountProfile(prev => ({ ...prev, username: e.target.value.replace('@', '') }))}
                  placeholder="username"
                  className="flex-1 bg-transparent text-xs text-slate-400 focus:outline-none leading-tight"
                />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-800 leading-tight">{accountProfile?.displayName || 'Your Brand'}</p>
              <p className="text-xs text-slate-400 leading-tight">@{accountProfile?.username || 'yourbrand'}</p>
            </>
          )}
        </div>

        {/* 编辑/保存按钮 */}
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-slate-400 hover:text-slate-600 flex-shrink-0"
        >
          {isEditing ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
