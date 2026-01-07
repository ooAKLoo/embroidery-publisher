import { useMemo } from 'react';

// 生命之花 Logo - 多重重叠圆形组成的神圣几何学经典图案
const FlowerOfLifeLogo = ({
  pattern = 'flower',         // 'seed' | 'flower' | 'fruit' | 'full'
  rings = 3,                  // 圈数
  showOuterCircle = true,     // 显示外圈
  fillPetals = false,         // 填充花瓣
  rotation = 0,               // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const baseRadius = pattern === 'seed' ? 40 : 25;
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

    // 存储所有圆的中心点（避免重复）
    const addedCenters = new Set();
    const centers = [];

    const addCenter = (x, y, ring) => {
      const key = `${Math.round(x * 10)},${Math.round(y * 10)}`;
      if (!addedCenters.has(key)) {
        addedCenters.add(key);
        centers.push({ x, y, ring });
      }
    };

    if (pattern === 'seed') {
      // 生命种子 - 7个圆
      // 中心圆
      addCenter(cx, cy, 0);

      // 6个周围的圆
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        addCenter(
          cx + baseRadius * Math.cos(angle),
          cy + baseRadius * Math.sin(angle),
          1
        );
      }

    } else {
      // 生命之花/果实/完整版
      // 中心圆
      addCenter(cx, cy, 0);

      // 根据圈数生成圆
      const actualRings = pattern === 'full' ? Math.max(rings, 4) : rings;

      for (let ring = 1; ring <= actualRings; ring++) {
        // 每一圈有 6 * ring 个圆的位置
        // 使用六边形格点系统

        // 六个方向
        const directions = [
          { dx: 1, dy: 0 },
          { dx: 0.5, dy: Math.sqrt(3) / 2 },
          { dx: -0.5, dy: Math.sqrt(3) / 2 },
          { dx: -1, dy: 0 },
          { dx: -0.5, dy: -Math.sqrt(3) / 2 },
          { dx: 0.5, dy: -Math.sqrt(3) / 2 },
        ];

        // 沿每个方向放置圆
        for (let d = 0; d < 6; d++) {
          const dir = directions[d];
          const nextDir = directions[(d + 1) % 6];

          // 每条边上的点
          for (let i = 0; i < ring; i++) {
            const t = i / ring;
            const x = cx + baseRadius * (ring * dir.dx + i * (nextDir.dx - dir.dx));
            const y = cy + baseRadius * (ring * dir.dy + i * (nextDir.dy - dir.dy));
            addCenter(x, y, ring);
          }
        }

        // 果实和完整版添加额外的交叉点圆
        if ((pattern === 'fruit' || pattern === 'full') && ring < actualRings) {
          // 在交叉点添加圆
          for (let d = 0; d < 6; d++) {
            const angle = (d * Math.PI) / 3 + Math.PI / 6;
            const dist = baseRadius * Math.sqrt(3) * ring;
            addCenter(
              cx + dist * Math.cos(angle),
              cy + dist * Math.sin(angle),
              ring
            );
          }
        }
      }
    }

    // 旋转所有中心点并添加圆
    centers.forEach((c, i) => {
      const rp = rotatePoint(c.x, c.y);
      result.push({
        type: 'circle',
        id: `circle-${i}`,
        cx: rp.x,
        cy: rp.y,
        r: baseRadius,
        ring: c.ring,
      });
    });

    // 花瓣填充效果
    if (fillPetals && centers.length > 1) {
      // 找到所有的"花瓣"交叉区域
      // 简化版本：只在中心区域绘制花瓣形状
      const petalCount = 6;
      for (let i = 0; i < petalCount; i++) {
        const angle = (i * Math.PI) / 3 + rotRad;
        const nextAngle = ((i + 1) * Math.PI) / 3 + rotRad;

        // 花瓣使用镜头形状（两个圆弧的交叉）
        const petalCx = cx + baseRadius * 0.5 * Math.cos(angle + Math.PI / 6);
        const petalCy = cy + baseRadius * 0.5 * Math.sin(angle + Math.PI / 6);

        // 近似花瓣路径
        const p1 = { x: cx, y: cy };
        const p2 = {
          x: cx + baseRadius * Math.cos(angle),
          y: cy + baseRadius * Math.sin(angle),
        };

        const arc1End = {
          x: cx + baseRadius * 0.5 * Math.cos(angle + Math.PI / 3),
          y: cy + baseRadius * 0.5 * Math.sin(angle + Math.PI / 3),
        };

        result.push({
          type: 'petal',
          id: `petal-${i}`,
          cx: petalCx,
          cy: petalCy,
          angle,
          r: baseRadius * 0.4,
        });
      }
    }

    // 外圈
    if (showOuterCircle) {
      const maxRing = pattern === 'seed' ? 1 : rings;
      const outerRadius = baseRadius * (maxRing + 0.5) + baseRadius;

      result.push({
        type: 'outerCircle',
        id: 'outer',
        cx,
        cy,
        r: Math.min(outerRadius, 115),
      });

      // 第二层外圈（某些变体）
      if (pattern === 'fruit' || pattern === 'full') {
        result.push({
          type: 'outerCircle',
          id: 'outer-2',
          cx,
          cy,
          r: Math.min(outerRadius - 5, 110),
        });
      }
    }

    return result;
  }, [pattern, rings, showOuterCircle, fillPetals, rotation]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="flowerGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </radialGradient>
        <clipPath id="flowerClip">
          <circle cx="150" cy="150" r="115" />
        </clipPath>
      </defs>
      <g stroke={color} fill="none" clipPath="url(#flowerClip)">
        {elements.map((el) => {
          if (el.type === 'circle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                strokeWidth={strokeWidth}
                opacity={Math.max(0.3, 1 - el.ring * 0.15)}
              />
            );
          } else if (el.type === 'petal') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill="url(#flowerGrad)"
                stroke="none"
              />
            );
          } else if (el.type === 'outerCircle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                strokeWidth={strokeWidth * 1.5}
                opacity={0.5}
                clipPath="none"
              />
            );
          }
          return null;
        })}
      </g>
      {/* 外圈不受裁剪影响 */}
      {elements.filter(el => el.type === 'outerCircle').map(el => (
        <circle
          key={`${el.id}-outer`}
          cx={el.cx}
          cy={el.cy}
          r={el.r}
          stroke={color}
          strokeWidth={strokeWidth * 1.5}
          fill="none"
          opacity={0.5}
        />
      ))}
    </svg>
  );
};

export default FlowerOfLifeLogo;
