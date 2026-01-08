import { useState } from 'react';

// 核心指标数据
const coreIndicators = [
  {
    id: 'ppi',
    name: 'PPI',
    fullName: '生产者价格指数',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    question: '原材料贵不贵？',
    perception: '代工厂是否喊着要涨价？芯片、布料、塑料原料的拿货价是否在跳动。',
    color: 'from-orange-500 to-amber-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-600',
    analysis: [
      { signal: 'PPI 持续上涨', meaning: '上游原材料（铜、锂、物流费）在涨', action: '提前锁价、囤一批核心耗材或零部件' },
      { signal: 'PPI 回落', meaning: '原材料成本下降', action: '减少库存，等待更便宜的代工价格' }
    ]
  },
  {
    id: 'cpi',
    name: 'CPI',
    fullName: '消费者价格指数',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    question: '生活成本贵不贵？',
    perception: '目标市场消费者的日常开支（房租、食品、交通）压力大不大？它决定了"基础购买力"。',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    analysis: [
      { signal: 'CPI 适度上涨 (2%)', meaning: '经济活跃，消费健康', action: '正常运营，可适度扩张' },
      { signal: 'CPI 过高（通胀）', meaning: '消费者把钱都花在必需品上', action: '走"极致性价比"或"极致高端"，切忌平庸' },
      { signal: 'CPI 负增长（通缩）', meaning: '市场极度内卷', action: '获客成本（CAC）会极高，谨慎投放' }
    ]
  },
  {
    id: 'pwi',
    name: 'PWI',
    fullName: '购买意愿指数',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    question: '用户想不想花钱？',
    perception: '这是一个心理指标。哪怕用户兜里有钱，如果他觉得未来会失业，他也不会买你的"非刚需"产品。',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    analysis: [
      { signal: 'PWI 高位', meaning: '消费者信心充足，愿意消费', action: '加大广告投放，推新品，尝试高溢价' },
      { signal: 'PWI 低迷', meaning: '大家预感经济不好，捂紧钱袋子', action: '收缩营销预算，优化产品细节，通过"小而美"留住老客户' }
    ]
  }
];

// 扩展指标
const extendedIndicators = [
  {
    id: 'pmi',
    name: 'PMI',
    fullName: '采购经理指数',
    description: '行业的"订单晴雨表"',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    keyPoint: '50 是荣枯线',
    signals: [
      { condition: '> 50', meaning: '大家都在扩张订单，市场有活力' },
      { condition: '< 50', meaning: '大家在收缩，工厂可能缺单，你有议价权' }
    ],
    focus: '关注"新订单"和"从业人员"子项'
  },
  {
    id: 'fx',
    name: '汇率与利率',
    fullName: '跨境生意与融资的"利润阀门"',
    description: '汇率波动就是你纯利润的直接增减',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    keyPoint: '关注 澳元/美元、人民币/美元',
    signals: [
      { condition: '加息（利率升）', meaning: '美元走强，换汇更多，但北美用户信用卡压力增大' },
      { condition: '降息（利率降）', meaning: '北美用户更愿意消费，但可能导致美元贬值' }
    ],
    focus: '利率下降通常是 SaaS 工具扩规模的好时机'
  },
  {
    id: 'retail',
    name: '零售销售',
    fullName: '用户的"剁手实况"',
    description: '这是"结果"指标，告诉你大家到底掏钱了没',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    keyPoint: '关注月度环比增长',
    signals: [
      { condition: '超预期', meaning: '消费者的信心比预想的要强，利好独立电商' },
      { condition: '线上强劲', meaning: '用户行为正在深度数字化，发力独立站' }
    ],
    focus: '关注"非耐用品"和"线上零售"的比例'
  },
  {
    id: 'cpm',
    name: 'CPM/CPC',
    fullName: '营销的"流量油价"',
    description: '对于独立开发者/电商来说，最落地的经济指标',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    keyPoint: '关注 Meta、Google、TikTok 广告大盘成本',
    signals: [
      { condition: '广告费疯涨', meaning: '大品牌在砸钱抢地盘，小众产品进场获客会很贵' },
      { condition: '广告费回落', meaning: '大厂在缩减开支，"小快灵"团队精准投放的好机会' }
    ],
    focus: 'CPM 异常走高时，转向 SEO 或社区营销'
  }
];

// 危机信号模型
const dangerSignals = [
  {
    combo: 'PPI ↑ + CPI — + PWI ↓',
    label: '危险信号',
    meaning: '造价在涨，生活压力大，消费者不想买非刚需品',
    action: '追求现金流和留存，砍掉不赚钱的产品线，不要降价换市场',
    severity: 'danger'
  },
  {
    combo: 'PMI ↑ + 零售 ↑',
    label: '过热信号',
    meaning: '市场过热，需求爆棚',
    action: '扩产能，敢于提价，加大库存',
    severity: 'warning'
  },
  {
    combo: '利率 ↑ + 零售 ↓',
    label: '萎缩信号',
    meaning: '目标市场消费者缺钱，消费萎缩',
    action: '降本增效，主打"性价比"或"耐用性"',
    severity: 'caution'
  },
  {
    combo: '汇率利好 + 广告费 ↓',
    label: '套利窗口',
    meaning: '出海套利空间大',
    action: '拉满投放，快速收割北美市场',
    severity: 'opportunity'
  },
  {
    combo: 'PMI ↓ + PPI ↓',
    label: '议价窗口',
    meaning: '供应链闲置',
    action: '谈价格，压低代工厂成本，优化利润率',
    severity: 'opportunity'
  }
];

// 感知渠道
const perceptionChannels = [
  {
    category: '巨头财报',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    items: ['Stripe 财报（全球消费情绪）', '苹果销售指引（高净值人群意愿）']
  },
  {
    category: '广告大盘',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    items: ['Meta/字节跳动 CPM 下降 → PWI 走低', '大厂撤预算时机 → 精准投放窗口']
  },
  {
    category: '社交情绪',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
      </svg>
    ),
    items: ['小红书/Twitter "抠门经济"、"平替"搜索量', 'CPI 压迫感传导到 PWI 的直观体现']
  }
];

function MarketAnalysis() {
  const [activeIndicator, setActiveIndicator] = useState('ppi');
  const [expandedSignal, setExpandedSignal] = useState(null);

  const selectedIndicator = coreIndicators.find(i => i.id === activeIndicator);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">市场分析</h1>
            <p className="text-sm text-slate-500 mt-1">宏观指标的落地化解读 · 从生产到兜售的"三道关卡"</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>市场的体温计 · 利润的预警灯</span>
          </div>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-3 gap-4">
          {coreIndicators.map(indicator => (
            <button
              key={indicator.id}
              onClick={() => setActiveIndicator(indicator.id)}
              className={`
                relative p-5 rounded-2xl text-left transition-all
                ${activeIndicator === indicator.id
                  ? 'bg-white shadow-lg ring-2 ring-slate-900'
                  : 'bg-white hover:shadow-md'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-3
                bg-gradient-to-br ${indicator.color} text-white
              `}>
                {indicator.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-slate-900">{indicator.name}</span>
                  <span className="text-xs text-slate-400">{indicator.fullName}</span>
                </div>
                <p className={`text-sm font-medium ${indicator.textColor}`}>
                  "{indicator.question}"
                </p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {indicator.perception}
                </p>
              </div>
              {activeIndicator === indicator.id && (
                <div className="absolute top-3 right-3">
                  <div className="w-2 h-2 rounded-full bg-slate-900" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 选中指标的详细分析 */}
        {selectedIndicator && (
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                bg-gradient-to-br ${selectedIndicator.color} text-white
              `}>
                {selectedIndicator.icon}
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">{selectedIndicator.name} 深度分析</h2>
                <p className="text-xs text-slate-500">利润的"紧箍咒" · 实战决策指南</p>
              </div>
            </div>
            <div className="space-y-3">
              {selectedIndicator.analysis.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl ${selectedIndicator.bgColor} border border-transparent hover:border-slate-200 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                      ${selectedIndicator.textColor} bg-white
                    `}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${selectedIndicator.textColor}`}>
                          {item.signal}
                        </span>
                        <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        <span className="text-sm text-slate-600">{item.meaning}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-xs text-slate-400 flex-shrink-0">行动:</span>
                        <span className="text-sm text-slate-700 font-medium">{item.action}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 危机信号模型 */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">危机感知模型</h2>
              <p className="text-xs text-slate-500">当观察到以下组合时，需要立即调整策略</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {dangerSignals.map((signal, idx) => (
              <div
                key={idx}
                className={`
                  p-4 rounded-xl border cursor-pointer transition-all
                  ${expandedSignal === idx ? 'ring-2 ring-slate-900' : ''}
                  ${signal.severity === 'danger' ? 'bg-red-50 border-red-100' :
                    signal.severity === 'warning' ? 'bg-amber-50 border-amber-100' :
                    signal.severity === 'caution' ? 'bg-yellow-50 border-yellow-100' :
                    'bg-green-50 border-green-100'
                  }
                `}
                onClick={() => setExpandedSignal(expandedSignal === idx ? null : idx)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <code className={`
                      px-2 py-1 rounded text-xs font-mono
                      ${signal.severity === 'danger' ? 'bg-red-100 text-red-700' :
                        signal.severity === 'warning' ? 'bg-amber-100 text-amber-700' :
                        signal.severity === 'caution' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }
                    `}>
                      {signal.combo}
                    </code>
                    <span className={`
                      text-xs font-medium px-2 py-0.5 rounded-full
                      ${signal.severity === 'danger' ? 'bg-red-200 text-red-800' :
                        signal.severity === 'warning' ? 'bg-amber-200 text-amber-800' :
                        signal.severity === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-green-200 text-green-800'
                      }
                    `}>
                      {signal.label}
                    </span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${expandedSignal === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {expandedSignal === idx && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium">含义：</span>{signal.meaning}
                    </p>
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">行动：</span>{signal.action}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 扩展指标 */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">其他关键指标</h2>
              <p className="text-xs text-slate-500">更具"导向性"的落地指标</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {extendedIndicators.map(indicator => (
              <div key={indicator.id} className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600">
                    {indicator.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900 text-sm">{indicator.name}</h3>
                    <p className="text-xs text-slate-500">{indicator.fullName}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 mb-3">{indicator.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-700 bg-white px-2 py-0.5 rounded">
                      {indicator.keyPoint}
                    </span>
                  </div>
                  {indicator.signals.map((sig, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs">
                      <code className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 flex-shrink-0">
                        {sig.condition}
                      </code>
                      <span className="text-slate-600">{sig.meaning}</span>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-200">
                    {indicator.focus}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 感知渠道 */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">如何获取"感知"？</h2>
              <p className="text-xs text-slate-500">独立开发者/小团队可观察的微观信号</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {perceptionChannels.map((channel, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-600">
                    {channel.icon}
                  </div>
                  <h3 className="font-medium text-slate-900 text-sm">{channel.category}</h3>
                </div>
                <ul className="space-y-2">
                  {channel.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-indigo-400 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* 底部提示 */}
        <div className="text-center py-4">
          <p className="text-xs text-slate-400">
            数据来源建议：国家统计局、美联储、各平台广告后台、行业分析报告
          </p>
        </div>
      </div>
    </div>
  );
}

export default MarketAnalysis;
