import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 欧普艺术 Logo - 利用视觉错觉的几何图案
const OpArtLogo = ({
  pattern = 'checkerboard',    // 'checkerboard' | 'stripes' | 'circles' | 'bulge' | 'spiral'
  density = 10,                // 密度/线条数
  distortion = 0.5,            // 扭曲程度
  rotation = 0,                // 旋转角度
  contrast = true,             // 高对比度（交替填充）
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 110;
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

    if (pattern === 'checkerboard') {
      // 扭曲的棋盘格
      const gridSize = density;
      const cellSize = (size * 2) / gridSize;

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const baseX = cx - size + col * cellSize;
          const baseY = cy - size + row * cellSize;

          // 中心点距离影响扭曲
          const cellCx = baseX + cellSize / 2;
          const cellCy = baseY + cellSize / 2;
          const dist = Math.sqrt((cellCx - cx) ** 2 + (cellCy - cy) ** 2);
          const maxDist = size * Math.sqrt(2);
          const distFactor = 1 - (dist / maxDist) * distortion;

          // 计算四个角点（带扭曲）
          const corners = [
            { x: baseX, y: baseY },
            { x: baseX + cellSize, y: baseY },
            { x: baseX + cellSize, y: baseY + cellSize },
            { x: baseX, y: baseY + cellSize },
          ].map(p => {
            // 向中心收缩
            const dx = p.x - cx;
            const dy = p.y - cy;
            const pDist = Math.sqrt(dx ** 2 + dy ** 2);
            const pFactor = 1 - (pDist / maxDist) * distortion * 0.5;

            const newX = cx + dx * pFactor;
            const newY = cy + dy * pFactor;

            return rotatePoint(newX, newY);
          });

          // 只有在圆形范围内的格子才绘制
          if (dist < size) {
            const shouldFill = contrast && (row + col) % 2 === 0;

            result.push({
              type: 'cell',
              id: `cell-${row}-${col}`,
              points: corners,
              fill: shouldFill,
            });
          }
        }
      }

    } else if (pattern === 'stripes') {
      // 波浪条纹
      const lineCount = density;
      const spacing = (size * 2) / lineCount;

      for (let i = 0; i < lineCount; i++) {
        const baseY = cy - size + i * spacing;
        const points = [];

        const steps = 50;
        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const x = cx - size + t * size * 2;

          // 波浪效果
          const waveAmp = distortion * 20;
          const waveFreq = 3;
          const wave = Math.sin(t * Math.PI * waveFreq) * waveAmp;

          // 从中心向外膨胀效果
          const dist = Math.abs(x - cx) / size;
          const bulge = (1 - dist) * distortion * 15;

          const y = baseY + wave + (i % 2 === 0 ? bulge : -bulge);

          points.push(rotatePoint(x, y));
        }

        result.push({
          type: 'stripe',
          id: `stripe-${i}`,
          points,
          fill: contrast && i % 2 === 0,
          index: i,
        });
      }

    } else if (pattern === 'circles') {
      // 同心圆错觉
      const circleCount = density;
      const radiusStep = size / circleCount;

      for (let i = 1; i <= circleCount; i++) {
        const baseRadius = i * radiusStep;

        // 生成波浪形的圆
        const points = [];
        const steps = 60;

        for (let j = 0; j <= steps; j++) {
          const angle = (j / steps) * Math.PI * 2;

          // 添加径向波动
          const waveCount = 6 + i * 2;
          const waveAmp = distortion * radiusStep * 0.3;
          const wave = Math.sin(angle * waveCount) * waveAmp;

          const r = baseRadius + wave;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);

          points.push(rotatePoint(x, y));
        }

        result.push({
          type: 'wavy-circle',
          id: `circle-${i}`,
          points,
          baseRadius,
          fill: contrast && i % 2 === 0,
        });
      }

    } else if (pattern === 'bulge') {
      // 膨胀/凹陷格子
      const gridSize = density;
      const cellSize = (size * 2) / gridSize;

      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const cellCx = cx - size + (col + 0.5) * cellSize;
          const cellCy = cy - size + (row + 0.5) * cellSize;

          const dist = Math.sqrt((cellCx - cx) ** 2 + (cellCy - cy) ** 2);
          if (dist > size) continue;

          // 根据距离中心的位置调整大小
          const maxDist = size;
          const sizeFactor = 1 + (1 - dist / maxDist) * distortion;
          const adjustedSize = cellSize * sizeFactor * 0.4;

          const rp = rotatePoint(cellCx, cellCy);

          result.push({
            type: 'bulge-cell',
            id: `bulge-${row}-${col}`,
            cx: rp.x,
            cy: rp.y,
            size: adjustedSize,
            fill: contrast && (row + col) % 2 === 0,
          });
        }
      }

    } else if (pattern === 'spiral') {
      // 螺旋错觉
      const armCount = Math.max(2, Math.floor(density / 3));
      const turns = 2 + distortion * 3;

      for (let arm = 0; arm < armCount; arm++) {
        const points = [];
        const startAngle = (arm * 2 * Math.PI) / armCount;
        const steps = 80;

        // 外边缘
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const angle = startAngle + t * turns * Math.PI * 2;
          const r = 10 + t * (size - 10);

          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          points.push(rotatePoint(x, y));
        }

        // 内边缘（反向）
        const innerPoints = [];
        const armWidth = Math.PI / armCount * 0.8;

        for (let i = steps; i >= 0; i--) {
          const t = i / steps;
          const angle = startAngle + t * turns * Math.PI * 2 + armWidth * (1 - t * 0.5);
          const r = 10 + t * (size - 10);

          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          innerPoints.push(rotatePoint(x, y));
        }

        result.push({
          type: 'spiral-arm',
          id: `arm-${arm}`,
          outer: points,
          inner: innerPoints,
          fill: contrast && arm % 2 === 0,
        });
      }
    }

    // 外圈遮罩
    result.push({
      type: 'mask-circle',
      id: 'mask',
      cx,
      cy,
      r: size,
    });

    return result;
  }, [pattern, density, distortion, rotation, contrast]);

  const primaryColor = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <clipPath id="opArtClip">
          <circle cx="150" cy="150" r="110" />
        </clipPath>
        <linearGradient id="opArtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <g clipPath="url(#opArtClip)" {...strokeProps}>
        {elements.map((el) => {
          if (el.type === 'cell') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                fill={el.fill ? primaryColor : 'none'}
                stroke={primaryColor}
                strokeWidth={strokeWidth * 0.5}
              />
            );
          } else if (el.type === 'stripe') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')}`;
            return (
              <path
                key={el.id}
                d={d}
                fill="none"
                stroke={primaryColor}
                strokeWidth={el.fill ? strokeWidth * 2 : strokeWidth}
                opacity={el.fill ? 1 : 0.5}
              />
            );
          } else if (el.type === 'wavy-circle') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                fill={el.fill ? 'url(#opArtGrad)' : 'none'}
                stroke={primaryColor}
                strokeWidth={strokeWidth}
                opacity={el.fill ? 0.3 : 1}
              />
            );
          } else if (el.type === 'bulge-cell') {
            return (
              <rect
                key={el.id}
                x={el.cx - el.size / 2}
                y={el.cy - el.size / 2}
                width={el.size}
                height={el.size}
                fill={el.fill ? primaryColor : 'none'}
                stroke={primaryColor}
                strokeWidth={strokeWidth * 0.5}
              />
            );
          } else if (el.type === 'spiral-arm') {
            const d = `M ${el.outer.map(p => `${p.x} ${p.y}`).join(' L ')} L ${el.inner.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                fill={el.fill ? primaryColor : 'none'}
                stroke={primaryColor}
                strokeWidth={strokeWidth * 0.5}
                opacity={el.fill ? 0.8 : 0.3}
              />
            );
          }
          return null;
        })}
      </g>
      {/* 外圈 */}
      <circle
        cx="150"
        cy="150"
        r="110"
        fill="none"
        stroke={primaryColor}
        strokeWidth={strokeWidth * 1.5}
        opacity={0.8}
        {...strokeProps}
      />
    </svg>
  );
};

export default OpArtLogo;
