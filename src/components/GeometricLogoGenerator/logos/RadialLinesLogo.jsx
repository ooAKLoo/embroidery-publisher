import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';

// 放射状渐变线条 - 从中心向外发散，支持螺旋偏移
const RadialLinesLogo = ({
  lines = 6,                    // 线条数量 3-16
  length = 60,                  // 线条长度
  thickness = 12,               // 线条粗细
  gap = 30,                     // 中心间距(内半径)
  rotation = 0,                 // 整体旋转角度(度数)
  spiral = 0,                   // 螺旋偏移角度(度) -45 到 45
  gradientDirection = 'outward', // 渐变方向: 'outward' | 'inward'
  roundCap = true,              // 是否圆角端点
  strokeWidth = 2,              // (被覆盖，兼容全局)
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = generateGradientId('radial', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const segments = useMemo(() => {
    const result = [];
    const spiralRad = (spiral * Math.PI) / 180;
    const rotationRad = (rotation * Math.PI) / 180;

    for (let i = 0; i < lines; i++) {
      const baseAngle = (i * 2 * Math.PI) / lines + rotationRad;
      const startR = gap;
      const endR = gap + length;

      // 起点使用基础角度，终点加上螺旋偏移
      const x1 = 150 + startR * Math.cos(baseAngle);
      const y1 = 150 + startR * Math.sin(baseAngle);
      const x2 = 150 + endR * Math.cos(baseAngle + spiralRad);
      const y2 = 150 + endR * Math.sin(baseAngle + spiralRad);

      result.push({
        id: `radial-grad-${i}`,
        x1, y1, x2, y2,
        angle: (baseAngle * 180 / Math.PI)
      });
    }
    return result;
  }, [lines, length, gap, rotation, spiral]);

  const gradientColor1 = colors[0] || '#1a1a1a';
  const gradientColor2 = colors.length > 1 ? colors[1] : '#ffffff';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <defs>
        {segments.map((seg, i) => {
          // 计算渐变方向：从线段起点到终点
          const dx = seg.x2 - seg.x1;
          const dy = seg.y2 - seg.y1;
          const len = Math.sqrt(dx * dx + dy * dy);
          
          // 使用 objectBoundingBox 会按比例计算
          if (gradientDirection === 'outward') {
            return (
              <linearGradient 
                key={seg.id} 
                id={seg.id}
                x1="0%" y1="0%" x2="100%" y2="0%"
                gradientTransform={`rotate(${seg.angle}, 0.5, 0.5)`}
              >
                <stop offset="0%" stopColor={gradientColor2} stopOpacity="0" />
                <stop offset="30%" stopColor={gradientColor1} stopOpacity="0.5" />
                <stop offset="100%" stopColor={gradientColor1} stopOpacity="1" />
              </linearGradient>
            );
          } else {
            return (
              <linearGradient 
                key={seg.id} 
                id={seg.id}
                x1="0%" y1="0%" x2="100%" y2="0%"
                gradientTransform={`rotate(${seg.angle}, 0.5, 0.5)`}
              >
                <stop offset="0%" stopColor={gradientColor1} stopOpacity="1" />
                <stop offset="70%" stopColor={gradientColor1} stopOpacity="0.5" />
                <stop offset="100%" stopColor={gradientColor2} stopOpacity="0" />
              </linearGradient>
            );
          }
        })}
      </defs>
      <g {...renderProps} strokeLinecap={roundCap ? 'round' : 'butt'}>
        {segments.map((seg, i) => (
          <line
            key={i}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={`url(#${seg.id})`}
            strokeWidth={thickness}
          />
        ))}
      </g>
    </svg>
  );
};

export default RadialLinesLogo;
