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
    <div className="bg-white rounded-2xl p-4 relative">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="w-full flex items-center justify-between hover:bg-[#F8F8F8] rounded-lg px-2 py-1.5 -mx-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 overflow-hidden flex-shrink-0">
            {accountProfile?.avatar ? (
              <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {accountProfile?.displayName?.charAt(0) || 'Y'}
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-800 leading-tight">{accountProfile?.displayName || 'Your Brand'}</p>
            <p className="text-xs text-slate-400 leading-tight">@{accountProfile?.username || 'yourbrand'}</p>
          </div>
        </div>
        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>

      {/* 编辑弹窗 */}
      {isEditing && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsEditing(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-4">
            <div className="flex items-start gap-4">
              {/* 头像上传 */}
              <div
                className="relative w-14 h-14 rounded-full bg-gradient-to-br from-rose-400 to-amber-300 flex-shrink-0 overflow-hidden cursor-pointer group"
                onClick={() => avatarInputRef.current?.click()}
              >
                {accountProfile?.avatar ? (
                  <img src={accountProfile.avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                    {accountProfile?.displayName?.charAt(0) || 'Y'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />

              {/* 名称输入 */}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={accountProfile?.displayName || ''}
                  onChange={(e) => setAccountProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  placeholder="显示名称"
                  className="w-full px-3 py-1.5 bg-[#F8F8F8] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                  <input
                    type="text"
                    value={accountProfile?.username || ''}
                    onChange={(e) => setAccountProfile(prev => ({ ...prev, username: e.target.value.replace('@', '') }))}
                    placeholder="username"
                    className="w-full pl-7 pr-3 py-1.5 bg-[#F8F8F8] border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
