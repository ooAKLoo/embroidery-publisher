import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

const FractalTreeLogo = ({
  iterations = 9,
  angle = 25,
  shrink = 0.7,
  rotation = 0,
  strokeWidth = 2,
  colors = ['#84cc16', '#22c55e', '#14b8a6'],
  commonStyles = {}
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const gradientId = generateGradientId('tree', colors);
  const lines = useMemo(() => {
    const result = [];
    const branch = (x, y, len, a, depth) => {
      if (depth === 0 || len < 2) return;
      const x2 = x + len * Math.cos(a), y2 = y - len * Math.sin(a);
      result.push({ x1: x, y1: y, x2, y2, depth });
      const angleRad = (angle * Math.PI) / 180;
      branch(x2, y2, len * shrink, a - angleRad, depth - 1);
      branch(x2, y2, len * shrink, a + angleRad, depth - 1);
    };
    branch(150, 280, 60, Math.PI / 2, iterations);
    return result;
  }, [iterations, angle, shrink]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`} stroke={getStroke(gradientId, colors)} fill="none" strokeLinecap="round" {...strokeProps}>
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            strokeWidth={Math.max(0.5, strokeWidth * (l.depth / iterations))}
            opacity={0.5 + 0.5 * (l.depth / iterations)} />
        ))}
      </g>
    </svg>
  );
};

export default FractalTreeLogo;
