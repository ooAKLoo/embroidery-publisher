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
    // 使用更多采样点获得更平滑的曲线
    const numPoints = 360;
    // 对指数进行限制，避免数值不稳定
    const exponent = Math.min(Math.max(2 / n, 0.1), 10);
    
    for (let i = 0; i <= numPoints; i++) {
      const t = (i * 2 * Math.PI) / numPoints;
      const cosT = Math.cos(t);
      const sinT = Math.sin(t);
      
      // 使用 epsilon 避免在接近0时的数值问题
      const absCos = Math.max(Math.abs(cosT), 1e-10);
      const absSin = Math.max(Math.abs(sinT), 1e-10);
      
      const x = 150 + size * Math.sign(cosT) * Math.pow(absCos, exponent);
      const y = 150 + size * Math.sign(sinT) * Math.pow(absSin, exponent);
      
      points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(3)} ${y.toFixed(3)}`);
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
