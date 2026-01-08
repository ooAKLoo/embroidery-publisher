import { useMemo } from 'react';
import { getRenderProps, DEFAULT_COMMON_STYLES } from '../constants/commonStyles';

// 断裂多边形Logo - 线段不连接 + 渐变消失效果
const SegmentedPolygonLogo = ({
  sides = 6,                    // 边数 3-12
  radius = 100,                 // 多边形半径
  rotation = -90,               // 整体旋转角度
  segmentRatio = 0.7,           // 线段占边长的比例 (0.3-0.95)
  gapPosition = 'end',          // 间隙位置: 'start' | 'center' | 'end'
  gradientDirection = 'clockwise', // 渐变方向: 'clockwise' | 'counterclockwise'
  roundCap = true,              // 是否圆角端点
  strokeWidth = 2,              // (被覆盖)
  thickness = 12,               // 实际线条粗细
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const renderMode = commonStyles.renderMode || DEFAULT_COMMON_STYLES.renderMode;
  const fillOpacity = commonStyles.fillOpacity || DEFAULT_COMMON_STYLES.fillOpacity;
  const segments = useMemo(() => {
    const result = [];
    const angleStep = (2 * Math.PI) / sides;
    const rotationRad = (rotation * Math.PI) / 180;
    const cx = 150, cy = 150;

    for (let i = 0; i < sides; i++) {
      const angle1 = i * angleStep + rotationRad;
      const angle2 = (i + 1) * angleStep + rotationRad;

      // 顶点位置
      const vx1 = cx + radius * Math.cos(angle1);
      const vy1 = cy + radius * Math.sin(angle1);
      const vx2 = cx + radius * Math.cos(angle2);
      const vy2 = cy + radius * Math.sin(angle2);

      // 根据间隙位置计算线段起止比例
      let startRatio, endRatio;
      switch (gapPosition) {
        case 'start':
          startRatio = 1 - segmentRatio;
          endRatio = 1;
          break;
        case 'center':
          const halfGap = (1 - segmentRatio) / 2;
          startRatio = halfGap;
          endRatio = 1 - halfGap;
          break;
        case 'end':
        default:
          startRatio = 0;
          endRatio = segmentRatio;
          break;
      }

      // 实际线段端点
      const x1 = vx1 + (vx2 - vx1) * startRatio;
      const y1 = vy1 + (vy2 - vy1) * startRatio;
      const x2 = vx1 + (vx2 - vx1) * endRatio;
      const y2 = vy1 + (vy2 - vy1) * endRatio;

      result.push({
        id: i,
        x1, y1, x2, y2,
        midAngle: angle1 + angleStep / 2,
      });
    }
    return result;
  }, [sides, radius, rotation, segmentRatio, gapPosition]);

  const gradientColor1 = colors[0] || '#1a1a1a';
  const gradientColor2 = colors.length > 1 ? colors[1] : '#ffffff';

  // 根据渲染模式决定透明度渐变
  const getOpacityForMode = (baseOpacity) => {
    if (renderMode === 'fill') return fillOpacity;
    if (renderMode === 'both') return Math.min(1, baseOpacity + fillOpacity * 0.5);
    return baseOpacity;
  };

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {segments.map((seg) => {
          // 根据渐变方向决定渐变起止点
          const isClockwise = gradientDirection === 'clockwise';
          return (
            <linearGradient
              key={`segPoly-grad-${seg.id}`}
              id={`segPoly-grad-${seg.id}`}
              x1={isClockwise ? seg.x1 : seg.x2}
              y1={isClockwise ? seg.y1 : seg.y2}
              x2={isClockwise ? seg.x2 : seg.x1}
              y2={isClockwise ? seg.y2 : seg.y1}
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor={gradientColor1} stopOpacity={getOpacityForMode(1)} />
              <stop offset="70%" stopColor={gradientColor1} stopOpacity={getOpacityForMode(0.6)} />
              <stop offset="100%" stopColor={gradientColor2} stopOpacity="0" />
            </linearGradient>
          );
        })}
      </defs>
      <g strokeLinecap={roundCap ? 'round' : 'butt'}>
        {segments.map((seg) => (
          <line
            key={seg.id}
            x1={seg.x1}
            y1={seg.y1}
            x2={seg.x2}
            y2={seg.y2}
            stroke={`url(#segPoly-grad-${seg.id})`}
            strokeWidth={thickness}
          />
        ))}
      </g>
    </svg>
  );
};

export default SegmentedPolygonLogo;
