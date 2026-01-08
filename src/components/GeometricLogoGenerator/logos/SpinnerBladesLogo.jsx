import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { getStroke } from '../utils/gradient';

// 旋转叶片Logo - 弯曲线条渐变风格
const SpinnerBladesLogo = ({
  bladeCount = 6,           // 叶片数量
  curvature = 30,           // 弯曲度(角度)
  innerRadius = 30,         // 内半径
  outerRadius = 100,        // 外半径
  rotation = 0,             // 整体旋转角度
  strokeWidth = 8,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = 'spinnerGrad';
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const paths = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const rotationRad = (rotation * Math.PI) / 180;
    const curlRad = (curvature * Math.PI) / 180;

    for (let i = 0; i < bladeCount; i++) {
      const angle = (i * 2 * Math.PI) / bladeCount + rotationRad;
      const endAngle = angle + curlRad;

      // 起点
      const x1 = cx + innerRadius * Math.cos(angle);
      const y1 = cy + innerRadius * Math.sin(angle);

      // 终点(带弯曲)
      const x2 = cx + outerRadius * Math.cos(endAngle);
      const y2 = cy + outerRadius * Math.sin(endAngle);

      // 控制点 - 在中间位置，角度也在中间
      const midR = (innerRadius + outerRadius) / 2;
      const midAngle = angle + curlRad * 0.5;
      const ctrlX = cx + midR * Math.cos(midAngle);
      const ctrlY = cy + midR * Math.sin(midAngle);

      result.push({
        id: i,
        path: `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`,
        x1, y1, x2, y2,
      });
    }
    return result;
  }, [bladeCount, curvature, innerRadius, outerRadius, rotation]);

  // 颜色处理
  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {paths.map((p) => (
          <linearGradient
            key={`grad-${p.id}`}
            id={`spinnerGrad-${p.id}`}
            x1={p.x1} y1={p.y1}
            x2={p.x2} y2={p.y2}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      <g {...renderProps}>
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.path}
          />
        ))}
      </g>
    </svg>
  );
};

export default SpinnerBladesLogo;
