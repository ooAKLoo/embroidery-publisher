import { useMemo } from 'react';
import { getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

// 太极变体 Logo - 阴阳鱼的几何变体
const YinYangLogo = ({
  divisions = 2,              // 分割数 2-6 (2=传统太极, 3=三太极, 4=四太极等)
  innerDots = true,           // 显示内部小圆点
  dotSize = 0.15,             // 点大小比例
  rotation = 0,               // 旋转角度
  spiralEffect = 0,           // 螺旋效果 0-50
  outline = true,             // 显示外轮廓
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const stroke = getStroke(null, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const radius = 110;
    const rotRad = (rotation * Math.PI) / 180;
    const spiralFactor = spiralEffect / 100;

    // 旋转点辅助函数
    const rotatePoint = (x, y, angle = rotRad) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: cy + dx * Math.sin(angle) + dy * Math.cos(angle),
      };
    };

    // 主圆轮廓
    if (outline) {
      result.push({
        type: 'circle',
        id: 'outline',
        cx,
        cy,
        r: radius,
        isOutline: true,
      });
    }

    // 生成每个分区
    for (let i = 0; i < divisions; i++) {
      const sectionAngle = (2 * Math.PI) / divisions;
      const startAngle = i * sectionAngle + rotRad;
      const endAngle = (i + 1) * sectionAngle + rotRad;
      const midAngle = startAngle + sectionAngle / 2;

      // S曲线的控制点
      const halfRadius = radius / 2;

      // 螺旋效果调整
      const spiralOffset = spiralFactor * sectionAngle;

      // 计算曲线路径
      // 起点（外圆上）
      const startX = cx + radius * Math.cos(startAngle);
      const startY = cy + radius * Math.sin(startAngle);

      // 终点（外圆上）
      const endX = cx + radius * Math.cos(endAngle);
      const endY = cy + radius * Math.sin(endAngle);

      // 中间的S曲线 - 两个半圆弧
      const midRadius = halfRadius;

      // 第一个半圆的圆心（沿着起点方向）
      const arc1Cx = cx + midRadius * Math.cos(startAngle + sectionAngle / 4 + spiralOffset);
      const arc1Cy = cy + midRadius * Math.sin(startAngle + sectionAngle / 4 + spiralOffset);

      // 第二个半圆的圆心（沿着终点方向）
      const arc2Cx = cx + midRadius * Math.cos(endAngle - sectionAngle / 4 + spiralOffset);
      const arc2Cy = cy + midRadius * Math.sin(endAngle - sectionAngle / 4 + spiralOffset);

      // 构建路径：从外圆起点，通过S曲线到达外圆终点，然后沿外圆弧回来
      // 使用贝塞尔曲线模拟太极的S形
      const ctrlDist = radius * 0.5;
      const ctrl1X = cx + ctrlDist * Math.cos(startAngle + sectionAngle * 0.25);
      const ctrl1Y = cy + ctrlDist * Math.sin(startAngle + sectionAngle * 0.25);
      const ctrl2X = cx + ctrlDist * Math.cos(startAngle + sectionAngle * 0.75);
      const ctrl2Y = cy + ctrlDist * Math.sin(startAngle + sectionAngle * 0.75);

      // 计算内部小半圆
      const smallArcRadius = halfRadius * 0.5;
      const smallArc1Cx = cx + halfRadius * Math.cos(midAngle - sectionAngle / 4);
      const smallArc1Cy = cy + halfRadius * Math.sin(midAngle - sectionAngle / 4);
      const smallArc2Cx = cx + halfRadius * Math.cos(midAngle + sectionAngle / 4);
      const smallArc2Cy = cy + halfRadius * Math.sin(midAngle + sectionAngle / 4);

      // 路径: 外弧 + S曲线
      const path = createYinYangSection(
        cx, cy, radius, startAngle, endAngle, divisions, spiralFactor
      );

      result.push({
        type: 'section',
        id: `section-${i}`,
        d: path,
        fill: i % 2 === 0,
      });

      // 内部小圆点
      if (innerDots) {
        const dotRadius = radius * dotSize;
        const dotDist = radius * 0.4;
        const dotAngle = midAngle;

        const dotX = cx + dotDist * Math.cos(dotAngle);
        const dotY = cy + dotDist * Math.sin(dotAngle);

        result.push({
          type: 'dot',
          id: `dot-${i}`,
          cx: dotX,
          cy: dotY,
          r: dotRadius,
          fill: i % 2 !== 0, // 反色
        });
      }
    }

    return result;
  }, [divisions, innerDots, dotSize, rotation, spiralEffect, outline]);

  // 创建太极分区路径
  function createYinYangSection(cx, cy, radius, startAngle, endAngle, divisions, spiral) {
    const sectionAngle = endAngle - startAngle;
    const halfRadius = radius / 2;

    // 外圆弧起点和终点
    const outerStartX = cx + radius * Math.cos(startAngle);
    const outerStartY = cy + radius * Math.sin(startAngle);
    const outerEndX = cx + radius * Math.cos(endAngle);
    const outerEndY = cy + radius * Math.sin(endAngle);

    // 中心点（圆心）
    const centerX = cx;
    const centerY = cy;

    // S曲线的中间点
    const midAngle = startAngle + sectionAngle / 2;

    // 凸起半圆的圆心和终点
    const bulgeCx = cx + halfRadius * Math.cos(startAngle + sectionAngle / 4);
    const bulgeCy = cy + halfRadius * Math.sin(startAngle + sectionAngle / 4);
    const bulgeRadius = halfRadius * Math.sin(sectionAngle / 4);

    // 凹陷半圆的圆心
    const indentCx = cx + halfRadius * Math.cos(endAngle - sectionAngle / 4);
    const indentCy = cy + halfRadius * Math.sin(endAngle - sectionAngle / 4);

    // 简化版本：使用贝塞尔曲线创建流畅的S形
    const path = `
      M ${outerStartX} ${outerStartY}
      A ${radius} ${radius} 0 0 1 ${outerEndX} ${outerEndY}
      Q ${cx + halfRadius * 0.7 * Math.cos(endAngle - sectionAngle * 0.3)}
        ${cy + halfRadius * 0.7 * Math.sin(endAngle - sectionAngle * 0.3)}
        ${centerX} ${centerY}
      Q ${cx + halfRadius * 0.7 * Math.cos(startAngle + sectionAngle * 0.3)}
        ${cy + halfRadius * 0.7 * Math.sin(startAngle + sectionAngle * 0.3)}
        ${outerStartX} ${outerStartY}
      Z
    `;

    return path;
  }

  const primaryColor = colors[0] || '#1a1a1a';
  const secondaryColor = colors[1] || '#ffffff';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="yinYangGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <g>
        {elements.map((el) => {
          if (el.type === 'circle' && el.isOutline) {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                {...renderProps}
                fill="none"
              />
            );
          } else if (el.type === 'section') {
            return (
              <path
                key={el.id}
                d={el.d}
                {...renderProps}
                fill={el.fill ? primaryColor : 'none'}
              />
            );
          } else if (el.type === 'dot') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                {...renderProps}
                fill={el.fill ? primaryColor : 'none'}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default YinYangLogo;
