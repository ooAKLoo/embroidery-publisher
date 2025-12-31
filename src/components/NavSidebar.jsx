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
      id: 'products',
      name: '产品中心',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    }
  ];

  return (
    <div className="w-20 flex-shrink-0 bg-white rounded-2xl flex flex-col items-center py-4 gap-2">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {/* Nav Items */}
      {modules.map(module => (
        <button
          key={module.id}
          onClick={() => setActiveModule(module.id)}
          className={`
            w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all
            ${activeModule === module.id
              ? 'bg-slate-900 text-white'
              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }
          `}
          title={module.name}
        >
          {module.icon}
          <span className="text-[10px] font-medium">{module.name.slice(0, 2)}</span>
        </button>
      ))}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <button
        className="w-10 h-10 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 flex items-center justify-center transition-colors"
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
