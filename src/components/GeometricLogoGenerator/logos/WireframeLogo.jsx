import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke, getFill } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

/**
 * 万能多边形生成器
 * 支持：正多边形、星形、圆角多边形 + 多种连接方式 + 层次嵌套
 */
const WireframeLogo = ({
  // 基础形状
  vertices = 6,
  radius = 100,
  rotation = 0,
  shapeType = 'regular',      // regular | star | rounded

  // 星形参数
  innerRadiusRatio = 0.4,     // 星形内圈半径比例

  // 圆角参数
  roundness = 0,              // 圆角程度 0-1

  // 连接样式
  connectionStyle = 'center', // center | adjacent | all | none
  showVertices = false,       // 显示顶点圆点
  vertexRadius = 4,           // 顶点圆点大小

  // 层次嵌套
  layers = 1,                 // 嵌套层数
  layerScale = 0.6,           // 每层缩放比例
  layerRotation = 0,          // 每层旋转偏移（度）

  // 原有参数（兼容）
  innerConnections = true,    // 保留兼容：映射到 connectionStyle

  // 样式
  strokeWidth = 2.5,
  colors = ['#f97316', '#c084fc', '#60a5fa'],
  commonStyles = {}
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const gradientId = generateGradientId('wireframe', colors);
  const cx = 150, cy = 150;

  // 兼容旧参数：innerConnections 映射到 connectionStyle
  const effectiveConnectionStyle = connectionStyle === 'center' && !innerConnections
    ? 'none'
    : connectionStyle;

  // 生成单层多边形的顶点
  const generatePolygonPoints = (vertexCount, outerRadius, rotationDeg, layerIndex = 0) => {
    const rotationRad = ((rotationDeg + layerIndex * layerRotation) * Math.PI) / 180;
    const points = [];

    if (shapeType === 'star') {
      // 星形：交替外圈和内圈顶点
      const innerRadius = outerRadius * innerRadiusRatio;
      for (let i = 0; i < vertexCount * 2; i++) {
        const angle = (i * Math.PI) / vertexCount - Math.PI / 2 + rotationRad;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          isOuter: i % 2 === 0
        });
      }
    } else {
      // 正多边形
      for (let i = 0; i < vertexCount; i++) {
        const angle = (i * 2 * Math.PI) / vertexCount - Math.PI / 2 + rotationRad;
        points.push({
          x: cx + outerRadius * Math.cos(angle),
          y: cy + outerRadius * Math.sin(angle),
          isOuter: true
        });
      }
    }

    return points;
  };

  // 生成圆角路径
  const generateRoundedPath = (points, roundnessFactor) => {
    if (roundnessFactor <= 0 || points.length < 3) {
      return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
    }

    const pathParts = [];
    const n = points.length;

    for (let i = 0; i < n; i++) {
      const prev = points[(i - 1 + n) % n];
      const curr = points[i];
      const next = points[(i + 1) % n];

      // 计算到前后顶点的向量
      const toPrev = { x: prev.x - curr.x, y: prev.y - curr.y };
      const toNext = { x: next.x - curr.x, y: next.y - curr.y };

      // 向量长度
      const lenPrev = Math.sqrt(toPrev.x * toPrev.x + toPrev.y * toPrev.y);
      const lenNext = Math.sqrt(toNext.x * toNext.x + toNext.y * toNext.y);

      // 圆角偏移量（不超过边长的一半）
      const maxOffset = Math.min(lenPrev, lenNext) * 0.5;
      const offset = maxOffset * roundnessFactor;

      // 圆角起点和终点
      const startX = curr.x + (toPrev.x / lenPrev) * offset;
      const startY = curr.y + (toPrev.y / lenPrev) * offset;
      const endX = curr.x + (toNext.x / lenNext) * offset;
      const endY = curr.y + (toNext.y / lenNext) * offset;

      if (i === 0) {
        pathParts.push(`M ${startX} ${startY}`);
      } else {
        pathParts.push(`L ${startX} ${startY}`);
      }

      // 二次贝塞尔曲线
      pathParts.push(`Q ${curr.x} ${curr.y} ${endX} ${endY}`);
    }

    pathParts.push('Z');
    return pathParts.join(' ');
  };

  // 生成连接线
  const generateConnections = (points, style) => {
    const lines = [];
    const outerPoints = points.filter(p => p.isOuter);

    switch (style) {
      case 'center':
        // 连接到中心
        outerPoints.forEach(p => {
          lines.push(`M ${p.x} ${p.y} L ${cx} ${cy}`);
        });
        break;

      case 'adjacent':
        // 连接相邻顶点（跳过边本身，连接隔一个的顶点）
        for (let i = 0; i < outerPoints.length; i++) {
          const next = outerPoints[(i + 2) % outerPoints.length];
          lines.push(`M ${outerPoints[i].x} ${outerPoints[i].y} L ${next.x} ${next.y}`);
        }
        break;

      case 'all':
        // 全连接（网络图效果）
        for (let i = 0; i < outerPoints.length; i++) {
          for (let j = i + 2; j < outerPoints.length; j++) {
            // 跳过相邻边
            if (j === (i + 1) % outerPoints.length) continue;
            lines.push(`M ${outerPoints[i].x} ${outerPoints[i].y} L ${outerPoints[j].x} ${outerPoints[j].y}`);
          }
        }
        break;

      case 'none':
      default:
        break;
    }

    return lines;
  };

  // 生成所有层
  const { allPaths, allConnections, allVertices } = useMemo(() => {
    const paths = [];
    const connections = [];
    const verticesList = [];

    for (let layer = 0; layer < layers; layer++) {
      const scale = Math.pow(layerScale, layer);
      const layerRadius = radius * scale;

      const points = generatePolygonPoints(vertices, layerRadius, rotation, layer);

      // 生成路径
      const path = shapeType === 'rounded' || roundness > 0
        ? generateRoundedPath(points, roundness)
        : points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

      paths.push(path);

      // 只为最外层生成连接线
      if (layer === 0) {
        connections.push(...generateConnections(points, effectiveConnectionStyle));
      }

      // 收集顶点用于显示
      if (showVertices) {
        points.filter(p => p.isOuter).forEach(p => {
          verticesList.push({ x: p.x, y: p.y, layer });
        });
      }
    }

    return { allPaths: paths, allConnections: connections, allVertices: verticesList };
  }, [vertices, radius, rotation, shapeType, innerRadiusRatio, roundness,
      effectiveConnectionStyle, layers, layerScale, layerRotation, showVertices]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g stroke={getStroke(gradientId, colors)} fill="none" {...strokeProps}>
        {/* 多边形路径 */}
        {allPaths.map((d, i) => (
          <path key={`path-${i}`} d={d} strokeWidth={strokeWidth} />
        ))}

        {/* 连接线 */}
        {allConnections.map((d, i) => (
          <path key={`conn-${i}`} d={d} strokeWidth={strokeWidth * 0.6} opacity={0.7} />
        ))}

        {/* 顶点圆点 */}
        {showVertices && allVertices.map((v, i) => (
          <circle
            key={`vertex-${i}`}
            cx={v.x}
            cy={v.y}
            r={vertexRadius * (1 - v.layer * 0.2)}
            fill={getFill(gradientId, colors)}
            stroke="none"
          />
        ))}
      </g>
    </svg>
  );
};

export default WireframeLogo;
