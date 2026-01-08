import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 梅塔特隆立方 Logo - 神圣几何学图案，包含柏拉图立体
const MetatronCubeLogo = ({
  showCircles = true,         // 显示基础圆
  showConnections = true,     // 显示连接线
  showInnerPatterns = true,   // 显示内部图案（立方体等）
  circleStyle = 'solid',      // 'solid' | 'dashed' | 'dotted'
  complexity = 3,             // 复杂度 1-4
  rotation = 0,               // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const radius = 35; // 基础圆半径
    const rotRad = (rotation * Math.PI) / 180;

    // 旋转点辅助函数
    const rotatePoint = (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * Math.cos(rotRad) - dy * Math.sin(rotRad),
        y: cy + dx * Math.sin(rotRad) + dy * Math.cos(rotRad),
      };
    };

    // 13个圆的中心点（梅塔特隆立方的基础）
    const centers = [];

    // 中心圆
    centers.push({ x: cx, y: cy, layer: 0 });

    // 第一圈 - 6个圆（六边形排列）
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      centers.push({
        x: cx + radius * 2 * Math.cos(angle),
        y: cy + radius * 2 * Math.sin(angle),
        layer: 1,
      });
    }

    // 第二圈 - 6个圆（偏移六边形）
    if (complexity >= 2) {
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + Math.PI / 6;
        centers.push({
          x: cx + radius * 2 * Math.sqrt(3) * Math.cos(angle),
          y: cy + radius * 2 * Math.sqrt(3) * Math.sin(angle),
          layer: 2,
        });
      }
    }

    // 旋转所有中心点
    const rotatedCenters = centers.map(c => {
      const rp = rotatePoint(c.x, c.y);
      return { ...c, x: rp.x, y: rp.y };
    });

    // 添加圆
    if (showCircles) {
      rotatedCenters.forEach((c, i) => {
        if (c.layer <= complexity - 1 || c.layer === 0) {
          result.push({
            type: 'circle',
            id: `circle-${i}`,
            cx: c.x,
            cy: c.y,
            r: radius,
            layer: c.layer,
          });
        }
      });
    }

    // 添加连接线（所有中心点之间的连接）
    if (showConnections) {
      const maxLayer = complexity >= 2 ? 2 : 1;
      const visibleCenters = rotatedCenters.filter(c => c.layer <= maxLayer);

      for (let i = 0; i < visibleCenters.length; i++) {
        for (let j = i + 1; j < visibleCenters.length; j++) {
          const c1 = visibleCenters[i];
          const c2 = visibleCenters[j];

          // 只连接相邻的圆（距离约等于2*radius）
          const dist = Math.sqrt((c2.x - c1.x) ** 2 + (c2.y - c1.y) ** 2);
          const maxDist = complexity >= 3 ? radius * 5 : radius * 2.5;

          if (dist <= maxDist) {
            result.push({
              type: 'line',
              id: `line-${i}-${j}`,
              x1: c1.x,
              y1: c1.y,
              x2: c2.x,
              y2: c2.y,
              dist,
            });
          }
        }
      }
    }

    // 内部图案 - 六边形和立方体投影
    if (showInnerPatterns) {
      // 中心六边形
      const hexPoints = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3 + rotRad;
        hexPoints.push({
          x: cx + radius * Math.cos(angle),
          y: cy + radius * Math.sin(angle),
        });
      }

      result.push({
        type: 'polygon',
        id: 'inner-hex',
        points: hexPoints,
        isInner: true,
      });

      // 立方体投影（如果复杂度足够）
      if (complexity >= 2) {
        // 立方体的3D投影 - 等轴测视图
        const cubeSize = radius * 0.8;
        const cubeAngle = Math.PI / 6; // 30度

        // 立方体8个顶点的2D投影
        const cubeVertices = [
          // 前面4个顶点
          { x: cx - cubeSize * 0.5, y: cy + cubeSize * 0.3 },
          { x: cx + cubeSize * 0.5, y: cy + cubeSize * 0.3 },
          { x: cx + cubeSize * 0.5, y: cy - cubeSize * 0.3 },
          { x: cx - cubeSize * 0.5, y: cy - cubeSize * 0.3 },
          // 后面4个顶点（向上偏移）
          { x: cx - cubeSize * 0.3, y: cy + cubeSize * 0.1 },
          { x: cx + cubeSize * 0.7, y: cy + cubeSize * 0.1 },
          { x: cx + cubeSize * 0.7, y: cy - cubeSize * 0.5 },
          { x: cx - cubeSize * 0.3, y: cy - cubeSize * 0.5 },
        ];

        // 旋转立方体顶点
        const rotatedCube = cubeVertices.map(v => rotatePoint(v.x, v.y));

        // 立方体的边
        const cubeEdges = [
          [0, 1], [1, 2], [2, 3], [3, 0], // 前面
          [4, 5], [5, 6], [6, 7], [7, 4], // 后面
          [0, 4], [1, 5], [2, 6], [3, 7], // 连接边
        ];

        cubeEdges.forEach(([i, j], idx) => {
          result.push({
            type: 'line',
            id: `cube-edge-${idx}`,
            x1: rotatedCube[i].x,
            y1: rotatedCube[i].y,
            x2: rotatedCube[j].x,
            y2: rotatedCube[j].y,
            isCube: true,
          });
        });
      }

      // 六芒星（如果复杂度最高）
      if (complexity >= 4) {
        // 上三角
        const tri1Points = [];
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2 + rotRad;
          tri1Points.push({
            x: cx + radius * 1.5 * Math.cos(angle),
            y: cy + radius * 1.5 * Math.sin(angle),
          });
        }
        result.push({
          type: 'polygon',
          id: 'star-tri-1',
          points: tri1Points,
          isStar: true,
        });

        // 下三角
        const tri2Points = [];
        for (let i = 0; i < 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 + Math.PI / 2 + rotRad;
          tri2Points.push({
            x: cx + radius * 1.5 * Math.cos(angle),
            y: cy + radius * 1.5 * Math.sin(angle),
          });
        }
        result.push({
          type: 'polygon',
          id: 'star-tri-2',
          points: tri2Points,
          isStar: true,
        });
      }
    }

    // 外圈
    result.push({
      type: 'outerCircle',
      id: 'outer-circle',
      cx,
      cy,
      r: radius * (complexity >= 2 ? 3.5 : 2.5),
    });

    return result;
  }, [showCircles, showConnections, showInnerPatterns, circleStyle, complexity, rotation]);

  const color = colors[0] || '#1a1a1a';

  // 根据圆样式生成stroke-dasharray
  const getDashArray = (style) => {
    switch (style) {
      case 'dashed': return '8,4';
      case 'dotted': return '2,4';
      default: return 'none';
    }
  };

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="metatronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g stroke={color} fill="none" {...strokeProps}>
        {elements.map((el) => {
          if (el.type === 'circle') {
            const dash = getDashArray(circleStyle);
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                strokeWidth={strokeWidth}
                strokeDasharray={dash !== 'none' ? dash : undefined}
                opacity={0.3 + el.layer * 0.2}
              />
            );
          } else if (el.type === 'line') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
                strokeWidth={el.isCube ? strokeWidth * 0.8 : strokeWidth * 0.5}
                opacity={el.isCube ? 0.8 : 0.4}
              />
            );
          } else if (el.type === 'polygon') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                strokeWidth={el.isStar ? strokeWidth : strokeWidth * 0.8}
                opacity={el.isStar ? 0.6 : 0.5}
                fill={el.isInner ? 'url(#metatronGrad)' : 'none'}
              />
            );
          } else if (el.type === 'outerCircle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                strokeWidth={strokeWidth}
                opacity={0.3}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default MetatronCubeLogo;
