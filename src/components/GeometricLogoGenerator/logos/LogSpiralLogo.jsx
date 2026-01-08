import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const LogSpiralLogo = ({
  a = 5,
  b = 0.15,
  turns = 4,
  rotation = 0,
  strokeWidth = 2,
  colors = ['#14b8a6', '#06b6d4', '#3b82f6'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('logspiral', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= turns * 2 * Math.PI; t += 0.03) {
      const r = a * Math.exp(b * t);
      const x = 150 + r * Math.cos(t);
      const y = 150 + r * Math.sin(t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [a, b, turns]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} {...renderProps} />
      </g>
    </svg>
  );
};

export default LogSpiralLogo;
