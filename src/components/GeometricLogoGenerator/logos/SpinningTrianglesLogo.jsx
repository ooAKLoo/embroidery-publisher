import React, { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

// 旋转三角/箭头Logo
const SpinningTrianglesLogo = ({
  count = 6,
  innerRadius = 35,
  outerRadius = 80,
  rotation = 0,
  triangleRotation = 30,
  gap = 0.3,
  strokeWidth = 3,
  colors = ['#f97316', '#ec4899'],
  filled = false,
  centerDot = true,
  centerRadius = 6,
  commonStyles = {},
}) => {
  const gradientId = generateGradientId('spinningtriangles', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const triangles = useMemo(() => {
    const result = [];
    const rotationRad = (rotation * Math.PI) / 180;
    const triRotRad = (triangleRotation * Math.PI) / 180;
    const angleStep = (2 * Math.PI) / count;

    for (let i = 0; i < count; i++) {
      const baseAngle = i * angleStep + rotationRad;

      // 三角形中心位置
      const centerDist = (innerRadius + outerRadius) / 2;
      const cx = 150 + centerDist * Math.cos(baseAngle);
      const cy = 150 + centerDist * Math.sin(baseAngle);

      // 三角形大小
      const size = (outerRadius - innerRadius) / 2 * (1 - gap);

      // 三角形三个顶点（朝外的等腰三角形）
      const tipAngle = baseAngle + triRotRad;
      const baseAngle1 = tipAngle + (2.3 * Math.PI) / 3;
      const baseAngle2 = tipAngle + (3.7 * Math.PI) / 3;

      const tip = {
        x: cx + size * Math.cos(tipAngle),
        y: cy + size * Math.sin(tipAngle),
      };
      const base1 = {
        x: cx + size * 0.7 * Math.cos(baseAngle1),
        y: cy + size * 0.7 * Math.sin(baseAngle1),
      };
      const base2 = {
        x: cx + size * 0.7 * Math.cos(baseAngle2),
        y: cy + size * 0.7 * Math.sin(baseAngle2),
      };

      result.push({
        id: i,
        d: `M ${tip.x} ${tip.y} L ${base1.x} ${base1.y} L ${base2.x} ${base2.y} Z`,
      });
    }
    return result;
  }, [count, innerRadius, outerRadius, rotation, triangleRotation, gap]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      {triangles.map((t) => (
        <path
          key={t.id}
          d={t.d}
          strokeLinejoin="round"
          {...renderProps}
        />
      ))}
      {/* 中心圆点 */}
      {centerDot && <circle cx="150" cy="150" r={centerRadius} {...renderProps} />}
    </svg>
  );
};

export default SpinningTrianglesLogo;
