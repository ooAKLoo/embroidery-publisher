import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const AstroidLogo = ({
  scale = 90,
  rotation = 0,
  strokeWidth = 2.5,
  colors = ['#fbbf24', '#f97316'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('astroid', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 2 * Math.PI; t += 0.02) {
      const x = 150 + scale * Math.pow(Math.cos(t), 3);
      const y = 150 + scale * Math.pow(Math.sin(t), 3);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ') + ' Z';
  }, [scale]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} {...renderProps} />
      </g>
    </svg>
  );
};

export default AstroidLogo;
