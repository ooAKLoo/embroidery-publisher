import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const RoseCurveLogo = ({
  k = 5,
  radius = 100,
  rotation = 0,
  strokeWidth = 2,
  colors = ['#1a1a1a'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('rose', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const path = useMemo(() => {
    const pts = [];
    
    // 玫瑰曲线闭合周期计算:
    // - k 为整数且为奇数: 周期 = π (k个花瓣)
    // - k 为整数且为偶数: 周期 = 2π (2k个花瓣)
    // - k 为分数 p/q (最简形式): 周期 = π × q (若 p 和 q 都是奇数) 或 2π × q
    let maxT;
    if (k % 1 === 0) {
      // 整数 k
      maxT = (k % 2 === 0 ? 2 : 1) * Math.PI;
    } else {
      // 分数 k - 需要找到闭合周期
      // 对于常见的半整数如 2.5, 3.5 等，周期是 2π × 2 = 4π
      const decimal = k % 1;
      if (Math.abs(decimal - 0.5) < 0.01) {
        maxT = 4 * Math.PI; // 半整数
      } else {
        maxT = 20 * Math.PI; // 其他分数，用足够大的值确保闭合
      }
    }
    
    for (let t = 0; t <= maxT; t += 0.01) {
      const r = radius * Math.cos(k * t);
      const x = 150 + r * Math.cos(t);
      const y = 150 + r * Math.sin(t);
      pts.push(`${pts.length === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
    }
    
    // 闭合路径
    return pts.join(' ') + ' Z';
  }, [k, radius]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} {...renderProps} />
      </g>
    </svg>
  );
};

export default RoseCurveLogo;
