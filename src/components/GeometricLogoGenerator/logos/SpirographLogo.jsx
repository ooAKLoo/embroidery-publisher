import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';

const SpirographLogo = ({
  R = 80,
  r = 35,
  d = 50,
  rotation = 0,
  strokeWidth = 1.5,
  colors = ['#1a1a1a']
}) => {
  const gradientId = generateGradientId('spiro', colors);
  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 16 * Math.PI; t += 0.02) {
      const x = 150 + (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t);
      const y = 150 + (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [R, r, d]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" />
      </g>
    </svg>
  );
};

export default SpirographLogo;
