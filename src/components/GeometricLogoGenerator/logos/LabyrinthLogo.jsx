import { useMemo } from 'react';

// 迷宫 Logo - 单一路径迷宫（与 Maze 不同，迷宫是单一路径）
const LabyrinthLogo = ({
  labyrinthType = 'chartres',  // 'chartres' | 'classical' | 'meander' | 'roman'
  circuits = 7,                // 回路数（层数）
  rotation = 0,                // 旋转角度
  showCenter = true,           // 显示中心
  pathWidth = 8,               // 路径宽度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const maxRadius = 110;
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

    const circuitSpacing = maxRadius / (circuits + 1);

    if (labyrinthType === 'chartres') {
      // 沙特尔大教堂风格迷宫 - 11回路经典设计（简化版）
      const actualCircuits = Math.min(circuits, 11);

      // 生成同心圆弧
      for (let i = 1; i <= actualCircuits; i++) {
        const r = i * circuitSpacing;

        // 每层分成4个象限，某些位置有缺口
        const quadrants = 4;
        const gapPattern = [
          i % 2 === 0 ? 0 : 2,  // 缺口在的象限
          i % 2 === 0 ? 1 : 3,
        ];

        for (let q = 0; q < quadrants; q++) {
          const startAngle = (q * Math.PI) / 2 - Math.PI / 2;
          const endAngle = ((q + 1) * Math.PI) / 2 - Math.PI / 2;

          // 检查是否有缺口
          const hasGap = gapPattern.includes(q);
          const gapSize = Math.PI / 12;

          if (hasGap) {
            // 分成两段
            const midAngle = (startAngle + endAngle) / 2;

            // 第一段
            const s1 = rotatePoint(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
            const e1 = rotatePoint(cx + r * Math.cos(midAngle - gapSize), cy + r * Math.sin(midAngle - gapSize));

            result.push({
              type: 'arc',
              id: `arc-${i}-${q}-1`,
              cx, cy, r,
              x1: s1.x, y1: s1.y,
              x2: e1.x, y2: e1.y,
              startAngle: startAngle + rotRad,
              endAngle: midAngle - gapSize + rotRad,
            });

            // 第二段
            const s2 = rotatePoint(cx + r * Math.cos(midAngle + gapSize), cy + r * Math.sin(midAngle + gapSize));
            const e2 = rotatePoint(cx + r * Math.cos(endAngle), cy + r * Math.sin(endAngle));

            result.push({
              type: 'arc',
              id: `arc-${i}-${q}-2`,
              cx, cy, r,
              x1: s2.x, y1: s2.y,
              x2: e2.x, y2: e2.y,
              startAngle: midAngle + gapSize + rotRad,
              endAngle: endAngle + rotRad,
            });
          } else {
            const s = rotatePoint(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle));
            const e = rotatePoint(cx + r * Math.cos(endAngle), cy + r * Math.sin(endAngle));

            result.push({
              type: 'arc',
              id: `arc-${i}-${q}`,
              cx, cy, r,
              x1: s.x, y1: s.y,
              x2: e.x, y2: e.y,
              startAngle: startAngle + rotRad,
              endAngle: endAngle + rotRad,
            });
          }
        }

        // 连接不同层的径向墙壁
        if (i < actualCircuits) {
          const wallAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
          wallAngles.forEach((angle, idx) => {
            // 根据层数决定哪些墙壁存在
            const shouldDraw = (i + idx) % 2 === 0;
            if (shouldDraw) {
              const innerR = i * circuitSpacing;
              const outerR = (i + 1) * circuitSpacing;

              const p1 = rotatePoint(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
              const p2 = rotatePoint(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));

              result.push({
                type: 'wall',
                id: `wall-${i}-${idx}`,
                x1: p1.x, y1: p1.y,
                x2: p2.x, y2: p2.y,
              });
            }
          });
        }
      }

    } else if (labyrinthType === 'classical') {
      // 经典7回路克里特迷宫
      const actualCircuits = Math.min(circuits, 7);

      // 种子图案：十字和四个L形
      const seedSize = circuitSpacing * 0.8;

      // 中心十字
      const cross = [
        { x1: cx, y1: cy - seedSize, x2: cx, y2: cy + seedSize },
        { x1: cx - seedSize, y1: cy, x2: cx + seedSize, y2: cy },
      ];

      cross.forEach((line, i) => {
        const p1 = rotatePoint(line.x1, line.y1);
        const p2 = rotatePoint(line.x2, line.y2);
        result.push({
          type: 'line',
          id: `cross-${i}`,
          x1: p1.x, y1: p1.y,
          x2: p2.x, y2: p2.y,
        });
      });

      // 从种子向外扩展的同心弧
      for (let i = 1; i <= actualCircuits; i++) {
        const r = i * circuitSpacing + seedSize;

        // 交替的弧线
        const arcStart = ((i % 2) * Math.PI) - Math.PI / 2;
        const arcEnd = arcStart + Math.PI;

        const s = rotatePoint(cx + r * Math.cos(arcStart), cy + r * Math.sin(arcStart));
        const e = rotatePoint(cx + r * Math.cos(arcEnd), cy + r * Math.sin(arcEnd));

        result.push({
          type: 'arc',
          id: `classical-arc-${i}`,
          cx, cy, r,
          x1: s.x, y1: s.y,
          x2: e.x, y2: e.y,
          startAngle: arcStart + rotRad,
          endAngle: arcEnd + rotRad,
        });
      }

    } else if (labyrinthType === 'meander') {
      // 希腊回纹迷宫（方形）
      const size = maxRadius * 0.85;
      const step = size / (circuits + 1);

      // 从外向内的方形螺旋
      let currentSize = size;
      let currentX = cx - size;
      let currentY = cy - size;

      let path = `M ${rotatePoint(currentX, currentY).x} ${rotatePoint(currentX, currentY).y}`;

      for (let i = 0; i < circuits; i++) {
        const direction = i % 4;

        // 每层画三条边，留一个缺口
        const moves = [
          { dx: currentSize * 2, dy: 0 },      // 右
          { dx: 0, dy: currentSize * 2 },       // 下
          { dx: -currentSize * 2, dy: 0 },     // 左
          { dx: 0, dy: -currentSize * 2 + step }, // 上（留缺口）
        ];

        moves.forEach((move, idx) => {
          currentX += move.dx;
          currentY += move.dy;
          const rp = rotatePoint(currentX, currentY);
          path += ` L ${rp.x} ${rp.y}`;
        });

        currentSize -= step;
        currentX = cx - currentSize;
        currentY = cy - currentSize + step * (i + 1);

        if (i < circuits - 1) {
          const rp = rotatePoint(currentX, currentY);
          path += ` L ${rp.x} ${rp.y}`;
        }
      }

      result.push({
        type: 'path',
        id: 'meander-path',
        d: path,
      });

    } else if (labyrinthType === 'roman') {
      // 罗马迷宫 - 分成4个象限的设计
      const quadrantSize = maxRadius * 0.45;

      for (let q = 0; q < 4; q++) {
        const qAngle = (q * Math.PI) / 2;
        const qCx = cx + quadrantSize * 0.7 * Math.cos(qAngle + Math.PI / 4);
        const qCy = cy + quadrantSize * 0.7 * Math.sin(qAngle + Math.PI / 4);

        // 每个象限画一个小型螺旋迷宫
        const spiralCircuits = Math.min(circuits, 4);

        for (let i = 1; i <= spiralCircuits; i++) {
          const r = (i / spiralCircuits) * quadrantSize * 0.6;
          const startAngle = qAngle;
          const endAngle = qAngle + Math.PI * 1.5;

          const s = rotatePoint(qCx + r * Math.cos(startAngle), qCy + r * Math.sin(startAngle));
          const e = rotatePoint(qCx + r * Math.cos(endAngle), qCy + r * Math.sin(endAngle));

          result.push({
            type: 'arc',
            id: `roman-${q}-${i}`,
            cx: qCx, cy: qCy, r,
            x1: s.x, y1: s.y,
            x2: e.x, y2: e.y,
            startAngle: startAngle + rotRad,
            endAngle: endAngle + rotRad,
          });
        }
      }

      // 连接四个象限的通道
      const connectorAngles = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
      connectorAngles.forEach((angle, i) => {
        const p1 = rotatePoint(cx + 10 * Math.cos(angle), cy + 10 * Math.sin(angle));
        const p2 = rotatePoint(cx + (maxRadius - 10) * Math.cos(angle), cy + (maxRadius - 10) * Math.sin(angle));

        result.push({
          type: 'line',
          id: `connector-${i}`,
          x1: p1.x, y1: p1.y,
          x2: p2.x, y2: p2.y,
        });
      });
    }

    // 中心
    if (showCenter) {
      const rp = rotatePoint(cx, cy);
      result.push({
        type: 'center',
        id: 'center',
        cx: rp.x,
        cy: rp.y,
        r: circuitSpacing * 0.4,
      });
    }

    // 外圈
    result.push({
      type: 'outerCircle',
      id: 'outer',
      cx,
      cy,
      r: maxRadius,
    });

    return result;
  }, [labyrinthType, circuits, rotation, showCenter, pathWidth]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="labyrinthGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <g stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round">
        {elements.map((el) => {
          if (el.type === 'arc') {
            const sweepAngle = el.endAngle - el.startAngle;
            const largeArc = Math.abs(sweepAngle) > Math.PI ? 1 : 0;
            const sweep = sweepAngle > 0 ? 1 : 0;

            return (
              <path
                key={el.id}
                d={`M ${el.x1} ${el.y1} A ${el.r} ${el.r} 0 ${largeArc} ${sweep} ${el.x2} ${el.y2}`}
              />
            );
          } else if (el.type === 'line' || el.type === 'wall') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
              />
            );
          } else if (el.type === 'path') {
            return (
              <path
                key={el.id}
                d={el.d}
              />
            );
          } else if (el.type === 'center') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill="url(#labyrinthGrad)"
                stroke={color}
                strokeWidth={strokeWidth}
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
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default LabyrinthLogo;
