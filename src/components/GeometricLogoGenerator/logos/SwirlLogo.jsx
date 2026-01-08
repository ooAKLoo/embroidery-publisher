import React, { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

// 旋涡叶片Logo (Samyang/漩涡风格)
const SwirlLogo = ({
  blades = 4,
  innerRadius = 25,
  outerRadius = 70,
  rotation = 0,
  twist = 60,
  bladeWidth = 0.6,
  colors = ['#f97316', '#ec4899'],
  strokeWidth = 1,
  commonStyles = {},
}) => {
  const gradientId = generateGradientId('swirl', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const bladePaths = useMemo(() => {
    const result = [];
    const rotationRad = (rotation * Math.PI) / 180;
    const twistRad = (twist * Math.PI) / 180;
    const angleStep = (2 * Math.PI) / blades;
    const bladeAngle = angleStep * bladeWidth;

    for (let i = 0; i < blades; i++) {
      const startAngle = i * angleStep + rotationRad;

      // 内圆起点
      const innerStart = startAngle;
      const innerEnd = startAngle + bladeAngle;

      // 外圆终点（加上扭曲）
      const outerStart = startAngle + twistRad;
      const outerEnd = startAngle + bladeAngle + twistRad;

      // 构建路径
      const ix1 = 150 + innerRadius * Math.cos(innerStart);
      const iy1 = 150 + innerRadius * Math.sin(innerStart);
      const ix2 = 150 + innerRadius * Math.cos(innerEnd);
      const iy2 = 150 + innerRadius * Math.sin(innerEnd);

      const ox1 = 150 + outerRadius * Math.cos(outerStart);
      const oy1 = 150 + outerRadius * Math.sin(outerStart);
      const ox2 = 150 + outerRadius * Math.cos(outerEnd);
      const oy2 = 150 + outerRadius * Math.sin(outerEnd);

      // 使用贝塞尔曲线创建平滑的旋涡效果
      const midRadius = (innerRadius + outerRadius) / 2;
      const midAngle1 = (innerStart + outerStart) / 2;
      const midAngle2 = (innerEnd + outerEnd) / 2;

      const path = `
        M ${ix1} ${iy1}
        Q ${150 + midRadius * Math.cos(midAngle1 - 0.1)} ${150 + midRadius * Math.sin(midAngle1 - 0.1)} ${ox1} ${oy1}
        A ${outerRadius} ${outerRadius} 0 0 1 ${ox2} ${oy2}
        Q ${150 + midRadius * Math.cos(midAngle2 + 0.1)} ${150 + midRadius * Math.sin(midAngle2 + 0.1)} ${ix2} ${iy2}
        A ${innerRadius} ${innerRadius} 0 0 0 ${ix1} ${iy1}
        Z
      `;

      result.push({ id: i, d: path });
    }
    return result;
  }, [blades, innerRadius, outerRadius, rotation, twist, bladeWidth]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      {bladePaths.map((b) => (
        <path key={b.id} d={b.d} {...renderProps} />
      ))}
    </svg>
  );
};

export default SwirlLogo;
