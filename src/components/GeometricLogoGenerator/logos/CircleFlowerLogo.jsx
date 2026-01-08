import React, { useMemo } from 'react';
import { GradientDefs, generateGradientId, getFill } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 圆形花朵（重叠圆形）
const CircleFlowerLogo = ({
  petals = 6,
  petalRadius = 35,
  centerRadius = 15,
  spread = 35,
  rotation = 0,
  colors = ['#f97316', '#ec4899'],
  strokeWidth = 1,
  commonStyles = {},
}) => {
  const gradientId = generateGradientId('circleflower', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const fillColor = getFill(gradientId, colors);
  const circles = useMemo(() => {
    const result = [];
    const rotationRad = (rotation * Math.PI) / 180;

    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals + rotationRad;
      result.push({
        id: i,
        cx: 150 + spread * Math.cos(angle),
        cy: 150 + spread * Math.sin(angle),
        r: petalRadius,
      });
    }
    return result;
  }, [petals, spread, rotation, petalRadius]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      {circles.map((c) => (
        <circle key={c.id} cx={c.cx} cy={c.cy} r={c.r} fill={fillColor} {...strokeProps} />
      ))}
      <circle cx="150" cy="150" r={centerRadius} fill={fillColor} {...strokeProps} />
    </svg>
  );
};

export default CircleFlowerLogo;
