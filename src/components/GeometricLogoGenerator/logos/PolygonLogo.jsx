import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

/**
 * 通用多边形 Logo 组件
 * 通过参数化设计，一个组件覆盖多种基础形状需求
 */
const PolygonLogo = ({
  // 基础形状参数
  sides = 6,              // 边数: 3=三角, 4=方形, 5=五边形, 6=六边形...
  radius = 100,           // 外半径
  roundness = 0,          // 圆角程度: 0=尖角, 1=完全圆滑
  hollowRatio = 0,        // 镂空比例: 0=实心, 0.5=50%镂空

  // 变形参数
  rotation = 0,           // 旋转角度
  skewX = 0,              // X轴倾斜
  skewY = 0,              // Y轴倾斜
  scaleX = 1,             // X轴缩放
  scaleY = 1,             // Y轴缩放

  // 切割/负空间参数
  splitMode = 'none',     // 切割模式: none, horizontal, vertical, diagonal, radial
  splitGap = 10,          // 切割间隙
  splitOffset = 0,        // 切割偏移

  // 装饰参数
  innerPolygons = 0,      // 内部嵌套多边形数量
  innerRotation = 15,     // 内部多边形相对旋转
  showVertices = false,   // 显示顶点圆点
  vertexSize = 6,         // 顶点大小

  // 样式参数
  strokeWidth = 2.5,
  colors = ['#6366f1', '#8b5cf6'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('polygon', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const cx = 150, cy = 150; // 中心点

  // 生成圆角多边形路径
  const generatePolygonPath = useMemo(() => {
    return (r, offsetRotation = 0, centerX = cx, centerY = cy) => {
      if (sides < 3) return '';

      const angleStep = (2 * Math.PI) / sides;
      const startAngle = -Math.PI / 2 + (offsetRotation * Math.PI) / 180;

      // 计算所有顶点
      const vertices = [];
      for (let i = 0; i < sides; i++) {
        const angle = startAngle + i * angleStep;
        vertices.push({
          x: centerX + r * Math.cos(angle),
          y: centerY + r * Math.sin(angle)
        });
      }

      if (roundness === 0) {
        // 尖角多边形
        return vertices.map((v, i) =>
          `${i === 0 ? 'M' : 'L'} ${v.x.toFixed(2)} ${v.y.toFixed(2)}`
        ).join(' ') + ' Z';
      }

      // 圆角多边形 - 使用二次贝塞尔曲线
      const cornerRadius = roundness * r * 0.3; // 圆角半径
      let path = '';

      for (let i = 0; i < sides; i++) {
        const curr = vertices[i];
        const next = vertices[(i + 1) % sides];
        const prev = vertices[(i - 1 + sides) % sides];

        // 计算当前顶点到前后顶点的方向向量
        const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
        const toNext = { x: next.x - curr.x, y: next.y - curr.y };

        // 归一化
        const lenPrev = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
        const lenNext = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

        const normPrev = { x: toPrev.x / lenPrev, y: toPrev.y / lenPrev };
        const normNext = { x: toNext.x / lenNext, y: toNext.y / lenNext };

        // 圆角起点和终点
        const actualRadius = Math.min(cornerRadius, lenPrev / 2, lenNext / 2);
        const startPt = {
          x: curr.x + normPrev.x * actualRadius,
          y: curr.y + normPrev.y * actualRadius
        };
        const endPt = {
          x: curr.x + normNext.x * actualRadius,
          y: curr.y + normNext.y * actualRadius
        };

        if (i === 0) {
          path = `M ${startPt.x.toFixed(2)} ${startPt.y.toFixed(2)}`;
        } else {
          path += ` L ${startPt.x.toFixed(2)} ${startPt.y.toFixed(2)}`;
        }

        // 二次贝塞尔曲线绘制圆角
        path += ` Q ${curr.x.toFixed(2)} ${curr.y.toFixed(2)} ${endPt.x.toFixed(2)} ${endPt.y.toFixed(2)}`;
      }

      // 连接回起点
      const firstVertex = vertices[0];
      const lastVertex = vertices[sides - 1];
      const secondVertex = vertices[1];

      const toFirst = { x: firstVertex.x - lastVertex.x, y: firstVertex.y - lastVertex.y };
      const lenFirst = Math.sqrt(toFirst.x * toFirst.x + toFirst.y * toFirst.y);
      const normFirst = { x: toFirst.x / lenFirst, y: toFirst.y / lenFirst };

      const actualRadiusFirst = Math.min(cornerRadius, lenFirst / 2);
      const closePt = {
        x: firstVertex.x - normFirst.x * actualRadiusFirst,
        y: firstVertex.y - normFirst.y * actualRadiusFirst
      };

      path += ` L ${closePt.x.toFixed(2)} ${closePt.y.toFixed(2)}`;

      // 闭合处的圆角
      const toSecond = { x: secondVertex.x - firstVertex.x, y: secondVertex.y - firstVertex.y };
      const lenSecond = Math.sqrt(toSecond.x * toSecond.x + toSecond.y * toSecond.y);
      const normSecond = { x: toSecond.x / lenSecond, y: toSecond.y / lenSecond };
      const actualRadiusSecond = Math.min(cornerRadius, lenSecond / 2);
      const finalPt = {
        x: firstVertex.x + normSecond.x * actualRadiusSecond,
        y: firstVertex.y + normSecond.y * actualRadiusSecond
      };

      path += ` Q ${firstVertex.x.toFixed(2)} ${firstVertex.y.toFixed(2)} ${finalPt.x.toFixed(2)} ${finalPt.y.toFixed(2)} Z`;

      return path;
    };
  }, [sides, roundness, cx, cy]);

  // 生成切割后的路径
  const splitPaths = useMemo(() => {
    if (splitMode === 'none') return null;

    const halfGap = splitGap / 2;
    const offset = splitOffset;

    switch (splitMode) {
      case 'horizontal':
        return [
          { clipPath: `polygon(0 0, 100% 0, 100% ${50 - halfGap + offset}%, 0 ${50 - halfGap + offset}%)` },
          { clipPath: `polygon(0 ${50 + halfGap + offset}%, 100% ${50 + halfGap + offset}%, 100% 100%, 0 100%)` }
        ];
      case 'vertical':
        return [
          { clipPath: `polygon(0 0, ${50 - halfGap + offset}% 0, ${50 - halfGap + offset}% 100%, 0 100%)` },
          { clipPath: `polygon(${50 + halfGap + offset}% 0, 100% 0, 100% 100%, ${50 + halfGap + offset}% 100%)` }
        ];
      case 'diagonal':
        return [
          { clipPath: `polygon(0 0, 100% 0, 0 100%)`, transform: `translate(${-halfGap}, ${-halfGap})` },
          { clipPath: `polygon(100% 0, 100% 100%, 0 100%)`, transform: `translate(${halfGap}, ${halfGap})` }
        ];
      case 'radial':
        // 径向切割 - 创建多个扇形
        const segments = Math.max(2, Math.floor(sides / 2));
        const segmentAngle = 360 / segments;
        const gapAngle = (splitGap / radius) * (180 / Math.PI);
        return Array.from({ length: segments }, (_, i) => ({
          clipPath: `conic-gradient(from ${i * segmentAngle + gapAngle/2 + offset}deg, transparent 0deg, black ${segmentAngle - gapAngle}deg, transparent 0deg)`,
          isRadial: true,
          startAngle: i * segmentAngle + gapAngle/2 + offset,
          endAngle: (i + 1) * segmentAngle - gapAngle/2 + offset
        }));
      default:
        return null;
    }
  }, [splitMode, splitGap, splitOffset, sides, radius]);

  // 生成所有多边形（包括嵌套）
  const polygons = useMemo(() => {
    const result = [];
    const totalPolygons = 1 + innerPolygons;

    for (let i = 0; i < totalPolygons; i++) {
      const ratio = 1 - (i / totalPolygons) * (1 - hollowRatio);
      const r = radius * ratio;
      const rot = i * innerRotation;

      if (r > 5) { // 确保半径大于最小值
        result.push({
          path: generatePolygonPath(r, rot),
          radius: r,
          rotation: rot,
          opacity: 1 - (i * 0.15) // 内层逐渐变淡
        });
      }
    }

    // 如果有镂空，添加内部路径
    if (hollowRatio > 0 && innerPolygons === 0) {
      const innerR = radius * hollowRatio;
      if (innerR > 5) {
        result.push({
          path: generatePolygonPath(innerR, 0),
          radius: innerR,
          rotation: 0,
          isHollow: true
        });
      }
    }

    return result;
  }, [generatePolygonPath, radius, hollowRatio, innerPolygons, innerRotation]);

  // 生成顶点位置
  const vertices = useMemo(() => {
    if (!showVertices) return [];

    const angleStep = (2 * Math.PI) / sides;
    const startAngle = -Math.PI / 2;

    return Array.from({ length: sides }, (_, i) => {
      const angle = startAngle + i * angleStep;
      return {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle)
      };
    });
  }, [showVertices, sides, radius, cx, cy]);

  // 变换字符串
  const transformStr = `
    rotate(${rotation}, ${cx}, ${cy})
    ${skewX !== 0 || skewY !== 0 ? `skewX(${skewX}) skewY(${skewY})` : ''}
    ${scaleX !== 1 || scaleY !== 1 ? `translate(${cx}, ${cy}) scale(${scaleX}, ${scaleY}) translate(${-cx}, ${-cy})` : ''}
  `.trim();

  // 渲染单个多边形
  const renderPolygon = (polygon, index, clipStyle = null) => {
    const pathProps = {
      d: polygon.path,
      ...(polygon.isHollow
        ? { stroke: 'none', strokeWidth: 0, fill: renderProps.fill !== 'none' ? 'var(--bg-color, #0f172a)' : 'none', fillOpacity: 1 }
        : renderProps),
      opacity: polygon.opacity || 1,
    };

    if (clipStyle) {
      return (
        <g key={`${index}-${clipStyle.clipPath}`} style={{ clipPath: clipStyle.clipPath }}>
          <g transform={clipStyle.transform || ''}>
            <path {...pathProps} />
          </g>
        </g>
      );
    }

    return <path key={index} {...pathProps} />;
  };

  // 径向切割的特殊渲染
  const renderRadialSplit = (polygon, index) => {
    if (!splitPaths || splitMode !== 'radial') return null;

    const angleStep = (2 * Math.PI) / sides;
    const startAngle = -Math.PI / 2 + (rotation * Math.PI) / 180;
    const segments = splitPaths.length;
    const segmentAngle = (2 * Math.PI) / segments;
    const gapAngle = (splitGap / radius) * 0.5;

    return splitPaths.map((_, segIdx) => {
      const startA = segIdx * segmentAngle + gapAngle;
      const endA = (segIdx + 1) * segmentAngle - gapAngle;

      // 创建扇形路径
      const r = polygon.radius;
      const innerR = hollowRatio > 0 ? r * hollowRatio : 0;

      const x1 = cx + r * Math.cos(startA - Math.PI/2);
      const y1 = cy + r * Math.sin(startA - Math.PI/2);
      const x2 = cx + r * Math.cos(endA - Math.PI/2);
      const y2 = cy + r * Math.sin(endA - Math.PI/2);

      const x3 = cx + innerR * Math.cos(endA - Math.PI/2);
      const y3 = cy + innerR * Math.sin(endA - Math.PI/2);
      const x4 = cx + innerR * Math.cos(startA - Math.PI/2);
      const y4 = cy + innerR * Math.sin(startA - Math.PI/2);

      const largeArc = endA - startA > Math.PI ? 1 : 0;

      let sectorPath;
      if (innerR > 0) {
        sectorPath = `
          M ${x1.toFixed(2)} ${y1.toFixed(2)}
          A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}
          L ${x3.toFixed(2)} ${y3.toFixed(2)}
          A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4.toFixed(2)} ${y4.toFixed(2)}
          Z
        `;
      } else {
        sectorPath = `
          M ${cx} ${cy}
          L ${x1.toFixed(2)} ${y1.toFixed(2)}
          A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}
          Z
        `;
      }

      return (
        <path
          key={`${index}-radial-${segIdx}`}
          d={sectorPath}
          {...renderProps}
        />
      );
    });
  };

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />

      <g transform={transformStr}>
        {/* 渲染多边形 */}
        {polygons.map((polygon, index) => {
          if (splitMode === 'radial' && !polygon.isHollow) {
            return renderRadialSplit(polygon, index);
          }

          if (splitPaths && splitMode !== 'radial' && !polygon.isHollow) {
            return splitPaths.map((clipStyle, clipIdx) =>
              renderPolygon(polygon, `${index}-${clipIdx}`, clipStyle)
            );
          }

          return renderPolygon(polygon, index);
        })}

        {/* 渲染顶点 */}
        {vertices.map((v, i) => (
          <circle
            key={`vertex-${i}`}
            cx={v.x}
            cy={v.y}
            r={vertexSize}
            fill={renderProps.stroke !== 'none' ? renderProps.stroke : renderProps.fill}
          />
        ))}
      </g>
    </svg>
  );
};

export default PolygonLogo;
