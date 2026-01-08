import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const ButterflyCurveLogo = ({
  scale = 35,
  rotation = 0,
  strokeWidth = 1.5,
  colors = ['#f472b6', '#e879f9', '#a855f7'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('butterfly', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const path = useMemo(() => {
    const pts = [];
    for (let t = 0; t <= 12 * Math.PI; t += 0.02) {
      const r = Math.exp(Math.sin(t)) - 2 * Math.cos(4 * t) + Math.pow(Math.sin((2 * t - Math.PI) / 24), 5);
      const x = 150 + scale * r * Math.cos(t);
      const y = 150 - scale * r * Math.sin(t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ');
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

export default ButterflyCurveLogo;
