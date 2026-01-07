import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';

const LemniscateLogo = ({ 
  scale = 80, 
  strokeWidth = 3, 
  colors = ['#6366f1', '#8b5cf6'] 
}) => {
  const gradientId = generateGradientId('lemniscate', colors);
  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 2 * Math.PI; t += 0.02) {
      const denom = 1 + Math.sin(t) ** 2;
      const x = 150 + scale * Math.cos(t) / denom;
      const y = 150 + scale * Math.sin(t) * Math.cos(t) / denom;
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ') + ' Z';
  }, [scale]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" />
    </svg>
  );
};

export default LemniscateLogo;
