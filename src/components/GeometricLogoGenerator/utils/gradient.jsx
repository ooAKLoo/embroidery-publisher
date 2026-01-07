// 生成渐变ID
export const generateGradientId = (prefix, colors) => `${prefix}-${colors.join('-').replace(/#/g, '')}`;

// 渐变定义组件
export const GradientDefs = ({ id, colors, angle = 135 }) => {
  if (colors.length === 1) return null;
  const rad = (angle * Math.PI) / 180;
  const x1 = 50 - 50 * Math.cos(rad), y1 = 50 + 50 * Math.sin(rad);
  const x2 = 50 + 50 * Math.cos(rad), y2 = 50 - 50 * Math.sin(rad);
  return (
    <defs>
      <linearGradient id={id} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
        {colors.map((c, i) => <stop key={i} offset={`${(i / (colors.length - 1)) * 100}%`} stopColor={c} />)}
      </linearGradient>
    </defs>
  );
};

// 根据颜色数组获取stroke属性
export const getStroke = (gradientId, colors) => colors.length === 1 ? colors[0] : `url(#${gradientId})`;
