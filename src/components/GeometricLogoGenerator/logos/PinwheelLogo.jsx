import React, { useMemo } from 'react';
import { GradientDefs, generateGradientId, getFill } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 风车叶片 (更简洁的旋转)
const PinwheelLogo = ({
  blades = 4,
  radius = 70,
  rotation = 0,
  curve = 0.3,
  colors = ['#f97316', '#ec4899'],
  strokeWidth = 1,
  commonStyles = {},
}) => {
  const gradientId = generateGradientId('pinwheel', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const fillColor = getFill(gradientId, colors);
  const bladePaths = useMemo(() => {
    const result = [];
    const rotationRad = (rotation * Math.PI) / 180;
    const angleStep = (2 * Math.PI) / blades;

    for (let i = 0; i < blades; i++) {
      const angle = i * angleStep + rotationRad;

      // 叶片从中心开始
      const tipX = 150 + radius * Math.cos(angle);
      const tipY = 150 + radius * Math.sin(angle);

      // 控制点（产生弯曲）
      const ctrlAngle = angle + Math.PI * curve;
      const ctrlDist = radius * 0.6;
      const ctrlX = 150 + ctrlDist * Math.cos(ctrlAngle);
      const ctrlY = 150 + ctrlDist * Math.sin(ctrlAngle);

      // 另一侧
      const sideAngle = angle + angleStep * 0.5;
      const sideX = 150 + radius * 0.3 * Math.cos(sideAngle);
      const sideY = 150 + radius * 0.3 * Math.sin(sideAngle);

      const path = `
        M 150 150
        Q ${ctrlX} ${ctrlY} ${tipX} ${tipY}
        Q ${sideX} ${sideY} 150 150
        Z
      `;

      result.push({ id: i, d: path });
    }
    return result;
  }, [blades, radius, rotation, curve]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      {bladePaths.map((b) => (
        <path key={b.id} d={b.d} fill={fillColor} {...strokeProps} />
      ))}
    </svg>
  );
};

export default PinwheelLogo;
