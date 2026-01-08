import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

const SierpinskiLogo = ({
  iterations = 5,
  size = 110,
  rotation = 0,
  strokeWidth = 1,
  colors = ['#ec4899', '#f43f5e'],
  commonStyles = {}
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const gradientId = generateGradientId('sierpinski', colors);
  const triangles = useMemo(() => {
    const result = [];
    const subdivide = (x1, y1, x2, y2, x3, y3, depth) => {
      if (depth === 0) {
        result.push(`M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`);
        return;
      }
      const mx1 = (x1 + x2) / 2, my1 = (y1 + y2) / 2;
      const mx2 = (x2 + x3) / 2, my2 = (y2 + y3) / 2;
      const mx3 = (x3 + x1) / 2, my3 = (y3 + y1) / 2;
      subdivide(x1, y1, mx1, my1, mx3, my3, depth - 1);
      subdivide(mx1, my1, x2, y2, mx2, my2, depth - 1);
      subdivide(mx3, my3, mx2, my2, x3, y3, depth - 1);
    };
    const h = size * Math.sqrt(3) / 2;
    subdivide(150, 150 - h * 2/3, 150 - size, 150 + h * 1/3, 150 + size, 150 + h * 1/3, iterations);
    return result;
  }, [iterations, size]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" {...strokeProps}>
        {triangles.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
};

export default SierpinskiLogo;
