import { useMemo } from 'react';

// 星座/连接点Logo - 随机点+最近邻连线
const ConstellationLogo = ({
  starCount = 20,              // 星星数量
  connectionMethod = 'nearest', // 'nearest' | 'delaunay' | 'all'
  maxConnections = 3,          // 最大连接数(nearest模式)
  maxDistance = 80,            // 最大连接距离
  starSize = 4,                // 星星大小
  glowEffect = true,           // 发光效果
  seed = 42,                   // 随机种子
  rotation = 0,                // 旋转角度
  strokeWidth = 1,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const { stars, connections } = useMemo(() => {
    const pts = [];
    const cx = 150, cy = 150;
    const radius = 110;

    // 生成星星位置
    for (let i = 0; i < starCount; i++) {
      const angle = seededRandom(seed + i * 0.1) * Math.PI * 2;
      const r = Math.sqrt(seededRandom(seed + i * 0.2)) * radius;
      pts.push({
        id: i,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        size: starSize * (0.5 + seededRandom(seed + i * 0.3) * 0.8),
        brightness: 0.5 + seededRandom(seed + i * 0.4) * 0.5,
      });
    }

    // 计算连接
    const conns = [];

    if (connectionMethod === 'nearest') {
      // 每个点连接最近的N个点
      for (let i = 0; i < pts.length; i++) {
        const distances = [];
        for (let j = 0; j < pts.length; j++) {
          if (i !== j) {
            const dist = Math.sqrt((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2);
            if (dist < maxDistance) {
              distances.push({ j, dist });
            }
          }
        }
        distances.sort((a, b) => a.dist - b.dist);

        for (let k = 0; k < Math.min(maxConnections, distances.length); k++) {
          const j = distances[k].j;
          // 避免重复连接
          const exists = conns.some(c =>
            (c.i === i && c.j === j) || (c.i === j && c.j === i)
          );
          if (!exists) {
            conns.push({
              id: `${i}-${j}`,
              i, j,
              x1: pts[i].x,
              y1: pts[i].y,
              x2: pts[j].x,
              y2: pts[j].y,
              opacity: 1 - distances[k].dist / maxDistance,
            });
          }
        }
      }
    } else if (connectionMethod === 'all') {
      // 距离内全部连接
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dist = Math.sqrt((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2);
          if (dist < maxDistance) {
            conns.push({
              id: `${i}-${j}`,
              i, j,
              x1: pts[i].x,
              y1: pts[i].y,
              x2: pts[j].x,
              y2: pts[j].y,
              opacity: 1 - dist / maxDistance,
            });
          }
        }
      }
    } else if (connectionMethod === 'delaunay') {
      // 简化的Delaunay - 按距离排序后连接
      const allPairs = [];
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dist = Math.sqrt((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2);
          allPairs.push({ i, j, dist });
        }
      }
      allPairs.sort((a, b) => a.dist - b.dist);

      const connectionCount = new Array(pts.length).fill(0);
      for (const pair of allPairs) {
        if (connectionCount[pair.i] < 4 && connectionCount[pair.j] < 4 && pair.dist < maxDistance) {
          conns.push({
            id: `${pair.i}-${pair.j}`,
            ...pair,
            x1: pts[pair.i].x,
            y1: pts[pair.i].y,
            x2: pts[pair.j].x,
            y2: pts[pair.j].y,
            opacity: 1 - pair.dist / maxDistance,
          });
          connectionCount[pair.i]++;
          connectionCount[pair.j]++;
        }
      }
    }

    return { stars: pts, connections: conns };
  }, [starCount, connectionMethod, maxConnections, maxDistance, starSize, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {glowEffect && (
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        <radialGradient id="starGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`}>
        {/* 连接线 */}
        {connections.map((c) => (
          <line
            key={c.id}
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke={color}
            strokeWidth={strokeWidth}
            opacity={c.opacity * 0.6}
          />
        ))}
        {/* 星星 */}
        {stars.map((star) => (
          <g key={star.id} filter={glowEffect ? 'url(#starGlow)' : undefined}>
            <circle
              cx={star.x}
              cy={star.y}
              r={star.size}
              fill="url(#starGrad)"
              opacity={star.brightness}
            />
            {/* 十字光芒 */}
            {star.size > starSize * 0.7 && (
              <>
                <line
                  x1={star.x - star.size * 1.5}
                  y1={star.y}
                  x2={star.x + star.size * 1.5}
                  y2={star.y}
                  stroke={color}
                  strokeWidth={0.5}
                  opacity={star.brightness * 0.5}
                />
                <line
                  x1={star.x}
                  y1={star.y - star.size * 1.5}
                  x2={star.x}
                  y2={star.y + star.size * 1.5}
                  stroke={color}
                  strokeWidth={0.5}
                  opacity={star.brightness * 0.5}
                />
              </>
            )}
          </g>
        ))}
      </g>
    </svg>
  );
};

export default ConstellationLogo;
