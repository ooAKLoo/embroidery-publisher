import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const DragonCurveLogo = ({
  iterations = 12,
  size = 4,
  rotation = 0,
  strokeWidth = 1.5,
  colors = ['#f97316', '#ef4444'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('dragon', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const path = useMemo(() => {
    let sequence = [1];
    for (let i = 0; i < iterations; i++) {
      const copy = [...sequence].reverse().map(x => -x);
      sequence = [...sequence, 1, ...copy];
    }
    let x = 150, y = 200, dir = 0;
    const pts = [`M ${x} ${y}`];
    for (const turn of sequence) {
      dir = (dir + turn + 4) % 4;
      const dx = [size, 0, -size, 0][dir], dy = [0, -size, 0, size][dir];
      x += dx; y += dy;
      pts.push(`L ${x} ${y}`);
    }
    return pts.join(' ');
  }, [iterations, size]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} {...renderProps} />
      </g>
    </svg>
  );
};

export default DragonCurveLogo;
