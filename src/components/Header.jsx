import { useState } from 'react';

const platforms = [
  { id: 'instagram', name: 'Instagram', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
  { id: 'facebook', name: 'Facebook', color: 'bg-fb' },
  { id: 'twitter', name: 'X', color: 'bg-twitter' },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-pinterest' },
];

export default function Header({ connectedAccounts, setConnectedAccounts }) {
  const toggleAccount = (platform) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }));
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-amber-300 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-slate-800">苏绣出海</h1>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Beta</span>
      </div>

      {/* 账号连接状态 */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 mr-2">已连接:</span>
        {platforms.map(platform => (
          <button
            key={platform.id}
            onClick={() => toggleAccount(platform.id)}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${connectedAccounts[platform.id]
                ? `${platform.color} text-white shadow-sm`
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }
            `}
            title={`点击${connectedAccounts[platform.id] ? '断开' : '连接'} ${platform.name}`}
          >
            {platform.name}
            {connectedAccounts[platform.id] && (
              <svg className="w-3 h-3 ml-1 inline" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </header>
  );
}
