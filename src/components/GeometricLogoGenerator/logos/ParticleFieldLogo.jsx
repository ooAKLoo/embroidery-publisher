import { useMemo } from 'react';

// 粒子/点阵Logo - 散点分布、密度渐变、连线粒子
const ParticleFieldLogo = ({
  particleCount = 50,          // 粒子数量
  distribution = 'random',     // 'random' | 'circular' | 'spiral' | 'grid'
  connectLines = true,         // 是否连线
  connectionDistance = 40,     // 连线距离阈值
  particleSize = 4,            // 粒子大小
  seed = 42,                   // 随机种子
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  // 简单的伪随机数生成器
  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const { particles, connections } = useMemo(() => {
    const pts = [];
    const cx = 150, cy = 150;
    const radius = 110;

    if (distribution === 'random') {
      for (let i = 0; i < particleCount; i++) {
        const angle = seededRandom(seed + i * 0.1) * Math.PI * 2;
        const r = Math.sqrt(seededRandom(seed + i * 0.2)) * radius;
        pts.push({
          id: i,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          size: particleSize * (0.5 + seededRandom(seed + i * 0.3) * 0.5),
        });
      }
    } else if (distribution === 'circular') {
      const rings = Math.ceil(Math.sqrt(particleCount));
      let idx = 0;
      for (let ring = 1; ring <= rings && idx < particleCount; ring++) {
        const r = (radius / rings) * ring;
        const count = Math.ceil(ring * 6);
        for (let j = 0; j < count && idx < particleCount; j++) {
          const angle = (j * 2 * Math.PI) / count + seededRandom(seed + idx) * 0.2;
          pts.push({
            id: idx,
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
            size: particleSize,
          });
          idx++;
        }
      }
    } else if (distribution === 'spiral') {
      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const angle = t * Math.PI * 6;
        const r = t * radius;
        pts.push({
          id: i,
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          size: particleSize * (0.5 + t * 0.5),
        });
      }
    } else if (distribution === 'grid') {
      const side = Math.ceil(Math.sqrt(particleCount));
      const step = (radius * 2) / (side - 1);
      let idx = 0;
      for (let i = 0; i < side && idx < particleCount; i++) {
        for (let j = 0; j < side && idx < particleCount; j++) {
          const x = cx - radius + j * step;
          const y = cy - radius + i * step;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
          if (dist <= radius) {
            pts.push({
              id: idx,
              x,
              y,
              size: particleSize,
            });
            idx++;
          }
        }
      }
    }

    // 计算连线
    const conns = [];
    if (connectLines) {
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dist = Math.sqrt((pts[i].x - pts[j].x) ** 2 + (pts[i].y - pts[j].y) ** 2);
          if (dist < connectionDistance) {
            conns.push({
              id: `${i}-${j}`,
              x1: pts[i].x,
              y1: pts[i].y,
              x2: pts[j].x,
              y2: pts[j].y,
              opacity: 1 - dist / connectionDistance,
            });
          }
        }
      }
    }

    return { particles: pts, connections: conns };
  }, [particleCount, distribution, connectLines, connectionDistance, particleSize, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="particleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <g>
        {/* 连线 */}
        {connections.map((c) => (
          <line
            key={c.id}
            x1={c.x1}
            y1={c.y1}
            x2={c.x2}
            y2={c.y2}
            stroke={color}
            strokeWidth={strokeWidth * 0.5}
            opacity={c.opacity * 0.5}
          />
        ))}
        {/* 粒子 */}
        {particles.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={p.y}
            r={p.size}
            fill="url(#particleGrad)"
          />
        ))}
      </g>
    </svg>
  );
};

export default ParticleFieldLogo;
