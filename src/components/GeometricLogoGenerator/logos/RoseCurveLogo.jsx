import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

const RoseCurveLogo = ({
  k = 5,
  radius = 100,
  rotation = 0,
  strokeWidth = 2,
  colors = ['#1a1a1a'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('rose', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const path = useMemo(() => {
    const pts = [];
    const maxT = k % 1 === 0 ? (k % 2 === 0 ? 2 : 1) * Math.PI : 2 * Math.PI * 10;
    for (let t = 0; t <= maxT; t += 0.02) {
      const r = radius * Math.cos(k * t);
      const x = 150 + r * Math.cos(t);
      const y = 150 + r * Math.sin(t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    return pts.join(' ');
  }, [k, radius]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" {...strokeProps} />
      </g>
    </svg>
  );
};

export default RoseCurveLogo;
