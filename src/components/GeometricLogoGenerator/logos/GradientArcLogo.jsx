import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';

// 弧线Logo - 圆弧段渐变，动态循环感
const GradientArcLogo = ({
  arcs = 6,                     // 弧线数量 2-12
  radius = 100,                 // 弧线半径
  arcSpan = 40,                 // 每段弧的角度跨度 15-90
  rotation = 0,                 // 整体旋转角度(度)
  gradientDirection = 'clockwise', // 渐变方向: 'clockwise' | 'counterclockwise'
  roundCap = true,              // 是否圆角端点
  thickness = 12,               // 线条粗细
  strokeWidth = 2,              // (被覆盖，兼容全局)
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = generateGradientId('arc', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const arcPaths = useMemo(() => {
    const result = [];
    const angleStep = 360 / arcs;
    const spanRad = (arcSpan * Math.PI) / 180;
    const rotationRad = (rotation * Math.PI) / 180;
    const cx = 150, cy = 150;

    for (let i = 0; i < arcs; i++) {
      const startAngle = (i * angleStep * Math.PI) / 180 + rotationRad;
      const endAngle = startAngle + spanRad;

      const x1 = cx + radius * Math.cos(startAngle);
      const y1 = cy + radius * Math.sin(startAngle);
      const x2 = cx + radius * Math.cos(endAngle);
      const y2 = cy + radius * Math.sin(endAngle);

      // 确定大弧还是小弧
      const largeArc = arcSpan > 180 ? 1 : 0;
      const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;

      result.push({
        id: i,
        path,
        x1, y1, x2, y2,
        midAngle: startAngle + spanRad / 2,
      });
    }
    return result;
  }, [arcs, radius, arcSpan, rotation]);

  const gradientColor1 = colors[0] || '#1a1a1a';
  const gradientColor2 = colors.length > 1 ? colors[1] : '#ffffff';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <defs>
        {arcPaths.map((arc) => {
          const isClockwise = gradientDirection === 'clockwise';
          return (
            <linearGradient
              key={`arc-grad-${arc.id}`}
              id={`arc-grad-${arc.id}`}
              x1={isClockwise ? arc.x1 : arc.x2}
              y1={isClockwise ? arc.y1 : arc.y2}
              x2={isClockwise ? arc.x2 : arc.x1}
              y2={isClockwise ? arc.y2 : arc.y1}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={gradientColor1} stopOpacity="1" />
              <stop offset="60%" stopColor={gradientColor1} stopOpacity="0.5" />
              <stop offset="100%" stopColor={gradientColor2} stopOpacity="0" />
            </linearGradient>
          );
        })}
      </defs>
      <g {...renderProps} strokeLinecap={roundCap ? 'round' : 'butt'}>
        {arcPaths.map((arc) => (
          <path
            key={arc.id}
            d={arc.path}
            stroke={`url(#arc-grad-${arc.id})`}
            strokeWidth={thickness}
          />
        ))}
      </g>
    </svg>
  );
};

export default GradientArcLogo;
