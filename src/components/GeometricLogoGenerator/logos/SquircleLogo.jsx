import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const SquircleLogo = ({
  n = 4,
  size = 100,
  rotation = 0,
  strokeWidth = 3,
  colors = ['#6366f1', '#8b5cf6'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('squircle', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const path = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 360; i += 2) {
      const t = (i * Math.PI) / 180;
      const x = 150 + size * Math.sign(Math.cos(t)) * Math.pow(Math.abs(Math.cos(t)), 2/n);
      const y = 150 + size * Math.sign(Math.sin(t)) * Math.pow(Math.abs(Math.sin(t)), 2/n);
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return points.join(' ') + ' Z';
  }, [n, size]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} {...renderProps} />
      </g>
    </svg>
  );
};

export default SquircleLogo;
