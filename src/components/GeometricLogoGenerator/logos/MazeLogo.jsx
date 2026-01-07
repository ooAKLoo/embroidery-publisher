import { useMemo } from 'react';

// 迷宫/回路Logo - 路径生成、循环结构
const MazeLogo = ({
  mazeType = 'concentric',     // 'concentric' | 'rectangular' | 'hexagonal'
  layers = 4,                  // 层数/复杂度
  openings = 2,                // 每层开口数
  lineWeight = 'medium',       // 'thin' | 'medium' | 'thick'
  seed = 42,                   // 随机种子
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const paths = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const maxRadius = 115;
    const weights = { thin: 0.6, medium: 1, thick: 1.5 };
    const weight = weights[lineWeight] || 1;

    if (mazeType === 'concentric') {
      // 同心圆迷宫
      for (let layer = 1; layer <= layers; layer++) {
        const r = (maxRadius / layers) * layer;
        const segments = 8 + layer * 4; // 每层分段数
        const gapWidth = Math.PI * 2 / segments * 1.5;

        // 随机选择开口位置
        const gapPositions = [];
        for (let i = 0; i < openings; i++) {
          let pos;
          do {
            pos = Math.floor(seededRandom(seed + layer * 100 + i * 10) * segments);
          } while (gapPositions.includes(pos));
          gapPositions.push(pos);
        }

        // 绘制带开口的圆弧
        let currentAngle = 0;
        for (let seg = 0; seg < segments; seg++) {
          const segmentAngle = (Math.PI * 2) / segments;

          if (!gapPositions.includes(seg)) {
            const startAngle = currentAngle;
            const endAngle = currentAngle + segmentAngle;

            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);

            result.push({
              type: 'arc',
              id: `arc-${layer}-${seg}`,
              d: `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`,
              layer,
            });
          }

          // 添加连接墙
          if (layer < layers && seededRandom(seed + layer * 200 + seg) > 0.6) {
            const wallAngle = currentAngle + segmentAngle / 2;
            const r1 = r;
            const r2 = r + (maxRadius / layers);

            result.push({
              type: 'wall',
              id: `wall-${layer}-${seg}`,
              d: `M ${cx + r1 * Math.cos(wallAngle)} ${cy + r1 * Math.sin(wallAngle)} L ${cx + r2 * Math.cos(wallAngle)} ${cy + r2 * Math.sin(wallAngle)}`,
              layer,
            });
          }

          currentAngle += segmentAngle;
        }
      }
    } else if (mazeType === 'rectangular') {
      // 矩形迷宫
      const cellSize = (maxRadius * 2) / (layers * 2);
      const gridSize = layers * 2;
      const startX = cx - maxRadius;
      const startY = cy - maxRadius;

      // 生成简单的迷宫墙壁
      for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
          const x = startX + j * cellSize;
          const y = startY + i * cellSize;
          const dist = Math.sqrt((x + cellSize / 2 - cx) ** 2 + (y + cellSize / 2 - cy) ** 2);

          if (dist < maxRadius) {
            // 右边墙
            if (j < gridSize && seededRandom(seed + i * 100 + j) > 0.4) {
              result.push({
                type: 'wall',
                id: `h-${i}-${j}`,
                d: `M ${x + cellSize} ${y} L ${x + cellSize} ${y + cellSize}`,
                layer: Math.floor(dist / cellSize),
              });
            }
            // 下边墙
            if (i < gridSize && seededRandom(seed + i * 200 + j) > 0.4) {
              result.push({
                type: 'wall',
                id: `v-${i}-${j}`,
                d: `M ${x} ${y + cellSize} L ${x + cellSize} ${y + cellSize}`,
                layer: Math.floor(dist / cellSize),
              });
            }
          }
        }
      }
    } else if (mazeType === 'hexagonal') {
      // 六边形迷宫
      const hexSize = maxRadius / (layers + 1);

      const hexPath = (hx, hy, size, sides = []) => {
        const points = [];
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          points.push({
            x: hx + size * Math.cos(angle),
            y: hy + size * Math.sin(angle),
          });
        }

        const paths = [];
        for (let i = 0; i < 6; i++) {
          if (!sides.includes(i)) {
            paths.push(`M ${points[i].x} ${points[i].y} L ${points[(i + 1) % 6].x} ${points[(i + 1) % 6].y}`);
          }
        }
        return paths;
      };

      // 生成六边形网格
      for (let ring = 1; ring <= layers; ring++) {
        const positions = [];
        // 六边形环上的位置
        for (let side = 0; side < 6; side++) {
          for (let step = 0; step < ring; step++) {
            const angle1 = (Math.PI / 3) * side;
            const angle2 = (Math.PI / 3) * ((side + 2) % 6);
            const r = ring * hexSize * Math.sqrt(3);

            const baseX = cx + r * Math.cos(angle1 - Math.PI / 6);
            const baseY = cy + r * Math.sin(angle1 - Math.PI / 6);

            const stepX = (hexSize * Math.sqrt(3)) * Math.cos(angle2 - Math.PI / 6);
            const stepY = (hexSize * Math.sqrt(3)) * Math.sin(angle2 - Math.PI / 6);

            positions.push({
              x: baseX + step * stepX,
              y: baseY + step * stepY,
            });
          }
        }

        positions.forEach((pos, idx) => {
          // 随机选择要移除的边
          const openSides = [];
          for (let s = 0; s < 6; s++) {
            if (seededRandom(seed + ring * 1000 + idx * 10 + s) > 0.6) {
              openSides.push(s);
            }
          }

          const hexPaths = hexPath(pos.x, pos.y, hexSize * 0.9, openSides);
          hexPaths.forEach((d, pathIdx) => {
            result.push({
              type: 'hex',
              id: `hex-${ring}-${idx}-${pathIdx}`,
              d,
              layer: ring,
            });
          });
        });
      }
    }

    return result;
  }, [mazeType, layers, openings, lineWeight, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="mazeGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g fill="none" stroke="url(#mazeGrad)" strokeWidth={strokeWidth} strokeLinecap="round">
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            opacity={0.5 + (p.layer / layers) * 0.5}
          />
        ))}
      </g>
    </svg>
  );
};

export default MazeLogo;
