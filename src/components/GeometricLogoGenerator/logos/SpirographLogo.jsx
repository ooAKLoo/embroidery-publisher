import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

const SpirographLogo = ({
  R = 80,
  r = 35,
  d = 50,
  rotation = 0,
  strokeWidth = 1.5,
  colors = ['#1a1a1a'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('spiro', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const path = useMemo(() => {
    // 计算最大公约数
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    
    // 计算完整闭合需要的圈数
    // 螺旋图闭合条件: t = 2π × LCM(R, r) / r
    const absR = Math.abs(Math.round(R));
    const absr = Math.abs(Math.round(r)) || 1; // 防止除零
    const lcm = (absR * absr) / gcd(absR, absr);
    const fullRevolutions = lcm / absr;
    
    // 限制最大圈数以避免性能问题，同时确保闭合
    const maxT = Math.min(2 * Math.PI * fullRevolutions, 100 * Math.PI);
    
    const pts = [];
    for (let t = 0; t <= maxT; t += 0.02) {
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
        <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" {...strokeProps} />
      </g>
    </svg>
  );
};

export default SpirographLogo;
