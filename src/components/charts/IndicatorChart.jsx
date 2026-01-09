import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// 指标颜色映射
const INDICATOR_COLORS = {
  // 美国核心
  CPI: '#f97316', // orange
  PPI: '#ef4444', // red
  PWI: '#22c55e', // green
  INDPRO: '#3b82f6', // blue
  IPMAN: '#0ea5e9', // sky
  DGORDER: '#14b8a6', // teal
  // 汇率
  'USD/CNY': '#8b5cf6', // purple
  'DXY': '#6366f1', // indigo
  // 中国
  'CN-CPI': '#ec4899', // pink
  'CN-PPI': '#f43f5e', // rose
};

// 参考线配置
const REFERENCE_LINES = {
  INDPRO: { value: 100, label: '基准线', stroke: '#6b7280' },
  IPMAN: { value: 100, label: '基准线', stroke: '#6b7280' },
  PWI: { value: 80, label: '乐观区', stroke: '#22c55e' },
  'USD/CNY': { value: 7.0, label: '7.0 关口', stroke: '#ef4444' },
};

export function IndicatorChart({ indicator, height = 200 }) {
  if (!indicator?.data?.length) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-400 text-sm">暂无数据</p>
      </div>
    );
  }

  // 将数据反转为时间正序 (FRED 返回的是倒序)
  const chartData = [...indicator.data].reverse().map((d) => ({
    date: formatDate(d.date),
    value: d.value,
    fullDate: d.date,
  }));

  const color = INDICATOR_COLORS[indicator.name] || '#6366f1';
  const referenceLine = REFERENCE_LINES[indicator.name];

  // 计算 Y 轴范围
  const values = chartData.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1 || 5;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minValue - padding, maxValue + padding]}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            width={45}
            tickFormatter={(v) => v.toFixed(1)}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 text-xs">
                    <p className="text-gray-500">{data.fullDate}</p>
                    <p className="font-medium" style={{ color }}>
                      {indicator.name}: {data.value.toFixed(2)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          {referenceLine && (
            <ReferenceLine
              y={referenceLine.value}
              stroke={referenceLine.stroke}
              strokeDasharray="5 5"
              label={{
                value: referenceLine.label,
                position: 'insideTopRight',
                fill: referenceLine.stroke,
                fontSize: 10,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 迷你趋势图 (用于卡片内)
export function MiniTrendChart({ data, color = '#6366f1', height = 40 }) {
  if (!data?.length) return null;

  const chartData = [...data].reverse().slice(-12); // 只显示最近12期

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// 格式化日期
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getFullYear().toString().slice(2)}`;
}

// 信号仪表盘组件
export function SignalDashboard({ signals, compact = false }) {
  const triggeredSignals = signals?.filter((s) => s.triggered) || [];

  if (triggeredSignals.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-2xl mb-2">
          <span role="img" aria-label="safe">
            ...
          </span>
        </div>
        <p className="text-sm text-gray-500">当前无触发信号</p>
        <p className="text-xs text-gray-400 mt-1">市场状态平稳</p>
      </div>
    );
  }

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          badge: 'bg-red-500',
          text: 'text-red-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-500',
          text: 'text-amber-700',
        };
      case 'caution':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          badge: 'bg-yellow-500',
          text: 'text-yellow-700',
        };
      case 'opportunity':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-500',
          text: 'text-green-700',
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-500',
          text: 'text-gray-700',
        };
    }
  };

  return (
    <div className="space-y-3">
      {triggeredSignals.map((signal, idx) => {
        const styles = getSeverityStyles(signal.severity);
        return (
          <div
            key={idx}
            className={`${styles.bg} ${styles.border} border rounded-lg p-3`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`${styles.badge} text-white text-xs px-2 py-0.5 rounded-full`}
              >
                {signal.label}
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {signal.combo}
              </span>
            </div>
            {!compact && (
              <>
                <p className={`text-sm ${styles.text} mb-1`}>{signal.meaning}</p>
                <p className="text-xs text-gray-600">
                  <strong>建议：</strong>
                  {signal.action}
                </p>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default IndicatorChart;
