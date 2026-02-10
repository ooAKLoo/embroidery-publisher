function NavSidebar({ activeModule, setActiveModule }) {
  const modules = [
    {
      id: 'content',
      name: '内容发布',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      id: 'avatar',
      name: '头像预览',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 20a8 8 0 0116 0" />
        </svg>
      )
    },
    {
      id: 'products',
      name: '产品中心',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'logo',
      name: 'Logo生成',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      )
    },
    {
      id: 'market',
      name: '市场分析',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'motion',
      name: '动效演示',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12c2.5-4 5.5-6 9-6s6.5 2 9 6c-2.5 4-5.5 6-9 6s-6.5-2-9-6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9.5l1.2 2.4 2.6.4-1.9 1.9.4 2.6-2.3-1.2-2.3 1.2.4-2.6-1.9-1.9 2.6-.4L12 9.5z" />
        </svg>
      )
    },
    {
      id: 'music',
      name: '音乐列表',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    },
    {
      id: 'vector',
      name: '矢量Lab',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'neongeo',
      name: 'NeonGeo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'parametric',
      name: '参数Logo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'geogen',
      name: 'GeoGen',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      )
    },
    {
      id: 'spiral',
      name: '螺旋',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a8 8 0 1 0 8 8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8a4 4 0 1 0 4 4" />
          <circle cx="12" cy="12" r="1.2" strokeWidth={1.5} />
        </svg>
      )
    },
    {
      id: 'gravity',
      name: 'Gravity',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
        </svg>
      )
    },
    {
      id: 'gravity-layout',
      name: '布局',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h10M4 18h7" />
          <rect x="15" y="10" width="5" height="8" rx="1" strokeWidth={1.5} />
        </svg>
      )
    },
    {
      id: 'gravity-tunnel',
      name: '隧道',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <ellipse cx="12" cy="12" rx="8" ry="4.5" strokeWidth={1.5} />
          <ellipse cx="12" cy="12" rx="5" ry="2.8" strokeWidth={1.5} />
          <circle cx="12" cy="12" r="1.2" strokeWidth={1.5} />
        </svg>
      )
    },
    {
      id: 'orbit',
      name: 'Orbit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.5" strokeWidth={1.5} />
          <ellipse cx="12" cy="12" rx="8" ry="3.5" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 5l.01.01" />
        </svg>
      )
    },
    {
      id: 'stroke',
      name: '3D笔触',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      )
    },
    {
      id: 'tube',
      name: '管状渐变',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8c3-4 6-4 9 0s6 4 9 0" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16c3-4 6-4 9 0s6 4 9 0" />
          <circle cx="6" cy="8" r="1.2" strokeWidth={1.5} />
          <circle cx="18" cy="16" r="1.2" strokeWidth={1.5} />
        </svg>
      )
    },
    {
      id: 'vector2',
      name: '矢量2.0',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3l2.5 2.5M12 3L9.5 5.5M12 3v4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21l2.5-2.5M12 21l-2.5-2.5M12 21v-4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2.5 2.5M3 12l2.5-2.5M3 12h4" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12l-2.5 2.5M21 12l-2.5-2.5M21 12h-4" />
          <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
        </svg>
      )
    },
    {
      id: 'vtracer',
      name: 'VTracer',
      shortName: 'VT',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5h6l2 2h10v12a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 13l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'neural-core',
      name: 'Neural Core',
      shortName: 'NC',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.5" strokeWidth={1.5} />
          <circle cx="5" cy="6" r="1.5" strokeWidth={1.5} />
          <circle cx="19" cy="6" r="1.5" strokeWidth={1.5} />
          <circle cx="5" cy="18" r="1.5" strokeWidth={1.5} />
          <circle cx="19" cy="18" r="1.5" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.5 10L6.5 7.5M15.5 10l2-2.5M8.5 14l-2 2.5M15.5 14l2 2.5" />
        </svg>
      )
    },
    {
      id: 'spirit',
      name: 'The Spirit',
      shortName: '灵',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.5 2-3 4.5-3 7 0 3 1.5 5 3 7 1.5-2 3-4 3-7 0-2.5-1.5-5-3-7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 17c-2 1-4 2-5 4 2-1 4-1.5 5-1.5s3 .5 5 1.5c-1-2-3-3-5-4z" />
          <circle cx="12" cy="8" r="1" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeWidth={1} d="M8 5c1 .5 1.5 1 2 2M16 5c-1 .5-1.5 1-2 2M6 10c1 0 2 .5 3 1M18 10c-1 0-2 .5-3 1" opacity="0.5" />
        </svg>
      )
    },
    {
      id: 'music-narrative',
      name: '音乐叙事',
      shortName: '叙事',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2 12h2l3-7 3 14 3-10 3 6 2-3h4" />
          <circle cx="19" cy="12" r="2" strokeWidth={1.5} />
        </svg>
      )
    }
  ];

  return (
    <div className="w-20 flex-shrink-0 bg-white rounded-2xl flex flex-col items-center py-4 h-full overflow-hidden">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl overflow-hidden mb-4 flex-shrink-0">
        <img src="/icon.svg" alt="AppScope" className="w-full h-full" />
      </div>

      {/* Nav Items - Scrollable */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
        <div className="flex flex-col items-center gap-2 px-3">
          {modules.map(module => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all flex-shrink-0
                ${activeModule === module.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }
              `}
              title={module.name}
            >
              {module.icon}
              <span className="text-[10px] font-medium">{module.shortName ?? module.name.slice(0, 2)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <button
        className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 flex items-center justify-center transition-colors mt-2 flex-shrink-0"
        title="设置"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
}

export default NavSidebar;
