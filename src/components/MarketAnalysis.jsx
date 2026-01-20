import { useState } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { IndicatorChart, MiniTrendChart } from './charts/IndicatorChart';

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

function MarketAnalysis() {
  const [expandedSignal, setExpandedSignal] = useState(null);
  const [insightTab, setInsightTab] = useState('crisis'); // 'crisis' | 'indicators' | 'analysis'
  const [region, setRegion] = useState('us'); // 'us' | 'cn' - 中美数据切换
  const [activeIndicator, setActiveIndicator] = useState('ppi'); // 用于深度分析

  const {
    indicators: liveIndicators,
    signals: liveSignals,
    loading,
    error,
    lastUpdated,
    hasApiKey,
    fetchAllIndicators,
    getIndicator,
    getTriggeredSignals,
    getTrendArrow,
    getTrendColor,
  } = useMarketData();

  const selectedIndicator = coreIndicators.find(i => i.id === activeIndicator);

  // 获取实时数据的辅助函数
  const getLiveData = (name, forRegion = region) => {
    if (!name) return null;
    const prefix = forRegion === 'cn' ? 'CN-' : '';
    const searchName = prefix + name.toUpperCase();
    return liveIndicators.find(i => i.name === searchName) || liveIndicators.find(i => i.name === name.toUpperCase());
  };

  // 获取三大核心指标（根据当前选择的地区）
  const getCoreIndicatorData = (name) => {
    if (region === 'cn') {
      return liveIndicators.find(i => i.name === `CN-${name}`);
    }
    return liveIndicators.find(i => i.name === name);
  };

  // 获取其他指标（排除三大核心指标）
  const getOtherIndicators = () => {
    const coreNames = region === 'cn'
      ? ['CN-CPI', 'CN-PPI', 'CN-PWI']
      : ['CPI', 'PPI', 'PWI'];
    return liveIndicators.filter(i => !coreNames.includes(i.name) && !i.name.startsWith(region === 'cn' ? '' : 'CN-'));
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Header */}
      <div className="flex-shrink-0 bg-white rounded-2xl px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">市场分析</h1>
              <p className="text-sm text-slate-500">宏观指标 Dashboard</p>
            </div>
            {/* 实时预警（如有） */}
            {liveSignals.length > 0 && getTriggeredSignals().length > 0 && (
              <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg px-3 py-1.5 text-white flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs font-medium">{getTriggeredSignals()[0]?.label}</span>
                <code className="text-xs font-mono bg-white/20 px-1.5 py-0.5 rounded">{getTriggeredSignals()[0]?.combo}</code>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-400">更新于 {lastUpdated}</span>
            )}
            {/* API Key 提示 */}
            {!hasApiKey && (
              <div className="flex items-center gap-2 bg-amber-50 rounded-lg px-3 py-1.5">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-xs text-amber-700">需配置 FRED API Key</span>
                <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 underline">申请</a>
              </div>
            )}
            <button
              onClick={fetchAllIndicators}
              disabled={loading || !hasApiKey}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                loading ? 'bg-slate-100 text-slate-400' :
                hasApiKey ? 'bg-slate-900 text-white hover:bg-slate-800' :
                'bg-slate-100 text-slate-400'
              }`}
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )}
              <span>{loading ? '获取中...' : '刷新'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard 主体：三个独立 card */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4">

          {/* 左侧：三大核心指标 */}
          <div className="col-span-5 bg-white rounded-2xl p-4 flex flex-col">
            {/* 标题 + 中美切换 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-900">核心指标</span>
              </div>
              {/* 中美切换 */}
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setRegion('us')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    region === 'us' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>🇺🇸</span>
                  <span>美国</span>
                </button>
                <button
                  onClick={() => setRegion('cn')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                    region === 'cn' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span>🇨🇳</span>
                  <span>中国</span>
                </button>
              </div>
            </div>

            {/* 三大指标列表 */}
            <div className="flex-1 flex flex-col gap-3 overflow-auto">
              {coreIndicators.map(indicator => {
                const liveData = getCoreIndicatorData(indicator.name);
                const colors = {
                  ppi: { bg: 'bg-orange-50', text: 'text-orange-600', chart: '#f97316' },
                  cpi: { bg: 'bg-blue-50', text: 'text-blue-600', chart: '#3b82f6' },
                  pwi: { bg: 'bg-purple-50', text: 'text-purple-600', chart: '#a855f7' }
                };
                const color = colors[indicator.id];

                return (
                  <div
                    key={indicator.id}
                    className={`flex-1 min-h-0 p-3 rounded-xl ${color.bg} flex flex-col`}
                  >
                    {/* 头部：名称 + 数值 + minimap */}
                    <div className="flex items-start justify-between mb-2 flex-shrink-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-base font-bold ${color.text}`}>{indicator.name}</span>
                          <span className="text-xs text-slate-500">{indicator.fullName}</span>
                          {liveData && (
                            <span className={`text-sm font-medium ${getTrendColor(liveData.trend, indicator.name === 'PPI')}`}>
                              {getTrendArrow(liveData.trend)}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs ${color.text} mt-0.5`}>"{indicator.question}"</p>
                      </div>
                      {liveData && (
                        <div className="flex items-center gap-3">
                          {/* Minimap 趋势线 */}
                          {liveData.data?.length > 0 && (
                            <div className="w-16 bg-white/50 rounded-lg p-1">
                              <MiniTrendChart data={liveData.data} color={color.chart} height={24} />
                            </div>
                          )}
                          <div className="text-right">
                            <span className="text-xl font-bold text-slate-900">{liveData.latestValue.toFixed(1)}</span>
                            <span className={`text-xs font-medium ml-1 ${getTrendColor(liveData.trend, indicator.name === 'PPI')}`}>
                              {liveData.changePercent > 0 ? '+' : ''}{liveData.changePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 主图表区域 */}
                    {liveData ? (
                      <div className="flex-1 min-h-0 relative">
                        <div className="absolute inset-0">
                          {liveData.data?.length > 0 && (
                            <IndicatorChart indicator={liveData} height="100%" />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-sm text-slate-400">暂无数据</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 右侧区域 */}
          <div className="col-span-7 flex flex-col gap-4">

            {/* 右上：其他指标 */}
            <div className="bg-white rounded-2xl p-4 flex-shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-900">其他指标</span>
                <span className="text-xs text-slate-400">汇率 · 工业 · 国际</span>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-2">
                  {getOtherIndicators().map(indicator => (
                    <div
                      key={indicator.seriesId}
                      className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-slate-600 truncate">{indicator.name}</span>
                        <span className={`text-xs font-medium ${getTrendColor(indicator.trend)}`}>
                          {getTrendArrow(indicator.trend)}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-900">
                          {indicator.latestValue.toFixed(indicator.name.includes('USD') ? 2 : 1)}
                        </span>
                        <span className={`text-xs ${getTrendColor(indicator.trend)}`}>
                          {indicator.changePercent > 0 ? '+' : ''}{indicator.changePercent.toFixed(1)}%
                        </span>
                      </div>
                      {indicator.data?.length > 0 && (
                        <div className="mt-2">
                          <MiniTrendChart
                            data={indicator.data}
                            color={
                              indicator.name.includes('CN-') ? '#ec4899' :
                              indicator.name.includes('USD') || indicator.name === 'DXY' ? '#8b5cf6' :
                              '#6366f1'
                            }
                            height={24}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                {getOtherIndicators().length === 0 && (
                  <div className="col-span-full text-center py-8 text-sm text-slate-400">
                    点击「刷新」获取实时数据
                  </div>
                )}
              </div>
            </div>

            {/* 右下：解读卡片（tab切换） */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl p-4 flex flex-col">
              {/* Tab 切换 */}
              <div className="flex items-center gap-1 mb-3 flex-shrink-0">
                <button
                  onClick={() => setInsightTab('crisis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    insightTab === 'crisis' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  危机感知
                </button>
                <button
                  onClick={() => setInsightTab('indicators')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    insightTab === 'indicators' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  关键指标
                </button>
                <button
                  onClick={() => setInsightTab('analysis')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    insightTab === 'analysis' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  深度分析
                </button>
                {/* 深度分析时显示指标切换 */}
                {insightTab === 'analysis' && (
                  <div className="ml-auto flex items-center gap-1">
                    {coreIndicators.map(ind => {
                      const colors = {
                        ppi: { active: 'bg-orange-500 text-white', inactive: 'bg-slate-100 text-slate-500' },
                        cpi: { active: 'bg-blue-500 text-white', inactive: 'bg-slate-100 text-slate-500' },
                        pwi: { active: 'bg-purple-500 text-white', inactive: 'bg-slate-100 text-slate-500' }
                      };
                      return (
                        <button
                          key={ind.id}
                          onClick={() => setActiveIndicator(ind.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                            activeIndicator === ind.id ? colors[ind.id].active : colors[ind.id].inactive
                          }`}
                        >
                          {ind.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tab 内容 */}
              <div className="flex-1 min-h-0 overflow-auto">
                {insightTab === 'crisis' ? (
                  <div className="h-full grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] auto-rows-fr gap-2 content-start">
                    {dangerSignals.map((signal, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          signal.severity === 'danger' ? 'bg-red-50' :
                          signal.severity === 'warning' ? 'bg-amber-50' :
                          signal.severity === 'caution' ? 'bg-yellow-50' :
                          'bg-green-50'
                        } ${expandedSignal === signal.combo ? 'ring-2 ring-slate-400' : 'hover:shadow-md'}`}
                        onClick={() => setExpandedSignal(expandedSignal === signal.combo ? null : signal.combo)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                            signal.severity === 'danger' ? 'bg-red-200 text-red-800' :
                            signal.severity === 'warning' ? 'bg-amber-200 text-amber-800' :
                            signal.severity === 'caution' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {signal.label}
                          </span>
                        </div>
                        <code className={`block text-xs font-mono mb-1 ${
                          signal.severity === 'danger' ? 'text-red-700' :
                          signal.severity === 'warning' ? 'text-amber-700' :
                          signal.severity === 'caution' ? 'text-yellow-700' :
                          'text-green-700'
                        }`}>
                          {signal.combo}
                        </code>
                        <p className="text-xs text-slate-600">{signal.meaning}</p>
                        {expandedSignal === signal.combo && (
                          <p className="text-xs text-slate-700 mt-2 pt-2 font-medium">{signal.action}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : insightTab === 'indicators' ? (
                  <div className="h-full grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] grid-rows-2 gap-3">
                    {extendedIndicators.map(indicator => (
                      <div key={indicator.id} className="p-3 rounded-xl bg-slate-50 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-sm flex-shrink-0">
                            {indicator.icon}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-slate-900">{indicator.name}</h3>
                            <p className="text-xs text-slate-500 truncate">{indicator.description}</p>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {indicator.signals.map((sig, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <code className="text-xs px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 flex-shrink-0">
                                {sig.condition}
                              </code>
                              <span className="text-xs text-slate-600">{sig.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col gap-3">
                    {selectedIndicator && (
                      <>
                        <div className={`flex-shrink-0 p-4 rounded-xl ${selectedIndicator.bgColor}`}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedIndicator.color} flex items-center justify-center text-white`}>
                              {selectedIndicator.icon}
                            </div>
                            <div>
                              <h3 className="font-semibold text-slate-900">{selectedIndicator.name} - {selectedIndicator.fullName}</h3>
                              <p className={`text-sm ${selectedIndicator.textColor}`}>"{selectedIndicator.question}"</p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600">{selectedIndicator.perception}</p>
                        </div>
                        <div className="flex-1 grid grid-cols-1 auto-rows-fr gap-2">
                          {selectedIndicator.analysis.map((item, idx) => (
                            <div key={idx} className={`p-3 rounded-xl ${selectedIndicator.bgColor}`}>
                              <div className="flex items-start gap-3 h-full">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-lg text-xs font-bold ${selectedIndicator.textColor} bg-white shadow-sm flex items-center justify-center`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 flex flex-col">
                                  <p className={`text-sm font-semibold ${selectedIndicator.textColor}`}>{item.signal}</p>
                                  <p className="text-sm text-slate-600 my-1 flex-1">{item.meaning}</p>
                                  <p className="text-sm text-slate-700 font-medium bg-white/60 rounded-lg px-2 py-1.5">{item.action}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default MarketAnalysis;
