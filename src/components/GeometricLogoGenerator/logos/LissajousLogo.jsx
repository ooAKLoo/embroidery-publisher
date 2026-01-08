import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

const LissajousLogo = ({
  a = 3,
  b = 4,
  delta = Math.PI / 2,
  radius = 100,
  rotation = 0,
  strokeWidth = 2.5,
  colors = ['#1a1a1a'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('lissajous', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 2 * Math.PI; t += 0.02) {
      const x = 150 + radius * Math.sin(a * t + delta);
      const y = 150 + radius * Math.sin(b * t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [a, b, delta, radius]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" {...strokeProps} />
      </g>
    </svg>
  );
};

export default LissajousLogo;
