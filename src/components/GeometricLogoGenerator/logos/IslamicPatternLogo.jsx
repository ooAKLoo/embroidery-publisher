import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const IslamicPatternLogo = ({
  rings = 3,
  petals = 8,
  rotation = 0,
  strokeWidth = 1.5,
  colors = ['#fbbf24', '#f59e0b'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('islamic', colors);
  const stroke = getStroke(gradientId, colors);
  const rotationRad = (rotation * Math.PI) / 180;
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const showOuterBorder = commonStyles.showOuterBorder !== false;

  const paths = useMemo(() => {
    const result = [];
    const startRing = showOuterBorder ? 1 : 2; // 如果隐藏外边界，从第2环开始
    const adjustedRings = showOuterBorder ? rings : Math.max(2, rings);

    for (let ring = startRing; ring <= adjustedRings; ring++) {
      const r = ring * 30;
      for (let i = 0; i < petals; i++) {
        const a1 = (i * 2 * Math.PI) / petals + rotationRad;
        const a2 = ((i + 0.5) * 2 * Math.PI) / petals + rotationRad;
        const a3 = ((i + 1) * 2 * Math.PI) / petals + rotationRad;
        const x1 = 150 + r * Math.cos(a1), y1 = 150 + r * Math.sin(a1);
        const x2 = 150 + (r + 15) * Math.cos(a2), y2 = 150 + (r + 15) * Math.sin(a2);
        const x3 = 150 + r * Math.cos(a3), y3 = 150 + r * Math.sin(a3);

        // 最外层环：根据 showOuterBorder 决定是否绘制弧线
        if (ring === adjustedRings && !showOuterBorder) {
          // 隐藏最外层时，不绘制最外层的弧线，但保留内部连线
          const ir = r * 0.6;
          const ix2 = 150 + ir * Math.cos(a3), iy2 = 150 + ir * Math.sin(a3);
          result.push(`M ${x1} ${y1} L ${ix2} ${iy2}`);
        } else {
          result.push(`M ${x1} ${y1} Q ${x2} ${y2} ${x3} ${y3}`);
          const ir = r * 0.6;
          const ix2 = 150 + ir * Math.cos(a3), iy2 = 150 + ir * Math.sin(a3);
          result.push(`M ${x1} ${y1} L ${ix2} ${iy2}`);
        }
      }
    }
    return result;
  }, [rings, petals, rotationRad, showOuterBorder]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g {...renderProps}>
        {paths.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
};

export default IslamicPatternLogo;
