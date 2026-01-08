import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';

const CardioidLogo = ({
  scale = 50,
  rotation = 0,
  strokeWidth = 2.5,
  colors = ['#f43f5e', '#ec4899']
}) => {
  const gradientId = generateGradientId('cardioid', colors);
  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 2 * Math.PI; t += 0.02) {
      const r = scale * (1 - Math.cos(t));
      const x = 150 + r * Math.cos(t);
      const y = 170 - r * Math.sin(t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ') + ' Z';
  }, [scale]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" />
      </g>
    </svg>
  );
};

export default CardioidLogo;
