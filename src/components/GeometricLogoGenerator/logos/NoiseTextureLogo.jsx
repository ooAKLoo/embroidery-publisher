import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { getStroke } from '../utils/gradient';

// 噪声纹理Logo - Perlin风格噪声图案
const NoiseTextureLogo = ({
  resolution = 20,             // 分辨率(点数)
  noiseScale = 0.1,            // 噪声缩放
  noiseType = 'circles',       // 'circles' | 'lines' | 'mesh' | 'cloud'
  intensity = 1,               // 强度
  seed = 42,                   // 随机种子
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = 'noiseGrad';
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  // 简单2D噪声函数
  const noise2D = (x, y, s) => {
    const n = Math.sin(x * 12.9898 + y * 78.233 + s) * 43758.5453;
    return n - Math.floor(n);
  };

  // 平滑噪声
  const smoothNoise = (x, y, s) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = x - x0;
    const fy = y - y0;

    const n00 = noise2D(x0, y0, s);
    const n10 = noise2D(x0 + 1, y0, s);
    const n01 = noise2D(x0, y0 + 1, s);
    const n11 = noise2D(x0 + 1, y0 + 1, s);

    const nx0 = n00 * (1 - fx) + n10 * fx;
    const nx1 = n01 * (1 - fx) + n11 * fx;

    return nx0 * (1 - fy) + nx1 * fy;
  };

  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 110;
    const step = (size * 2) / resolution;

    if (noiseType === 'circles') {
      for (let i = 0; i < resolution; i++) {
        for (let j = 0; j < resolution; j++) {
          const x = cx - size + j * step + step / 2;
          const y = cy - size + i * step + step / 2;
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

          if (dist <= size) {
            const n = smoothNoise(j * noiseScale, i * noiseScale, seed);
            const r = (n * intensity * step * 0.4) + 1;
            const opacity = 0.3 + n * 0.7;

            result.push({
              type: 'circle',
              id: `${i}-${j}`,
              cx: x,
              cy: y,
              r,
              opacity: opacity * (1 - dist / size * 0.5),
            });
          }
        }
      }
    } else if (noiseType === 'lines') {
      for (let i = 0; i < resolution; i++) {
        const y = cy - size + i * step + step / 2;
        const points = [];

        for (let j = 0; j <= resolution; j++) {
          const x = cx - size + j * step;
          const n = smoothNoise(j * noiseScale, i * noiseScale, seed);
          const yOffset = (n - 0.5) * intensity * step * 2;
          points.push({ x, y: y + yOffset });
        }

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let k = 1; k < points.length; k++) {
          d += ` L ${points[k].x} ${points[k].y}`;
        }

        result.push({
          type: 'path',
          id: `line-${i}`,
          d,
          opacity: 0.5 + (1 - Math.abs(i - resolution / 2) / resolution) * 0.5,
        });
      }
    } else if (noiseType === 'mesh') {
      const points = [];
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const baseX = cx - size + j * step;
          const baseY = cy - size + i * step;
          const n = smoothNoise(j * noiseScale, i * noiseScale, seed);
          const offset = (n - 0.5) * intensity * step;
          points.push({
            x: baseX + offset,
            y: baseY + offset,
            i, j
          });
        }
      }

      // 连接相邻点
      for (let i = 0; i <= resolution; i++) {
        for (let j = 0; j <= resolution; j++) {
          const idx = i * (resolution + 1) + j;
          const p = points[idx];
          const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);

          if (dist <= size * 1.1) {
            // 水平连接
            if (j < resolution) {
              const p2 = points[idx + 1];
              result.push({
                type: 'line',
                id: `h-${i}-${j}`,
                x1: p.x, y1: p.y,
                x2: p2.x, y2: p2.y,
                opacity: 0.5,
              });
            }
            // 垂直连接
            if (i < resolution) {
              const p2 = points[idx + resolution + 1];
              result.push({
                type: 'line',
                id: `v-${i}-${j}`,
                x1: p.x, y1: p.y,
                x2: p2.x, y2: p2.y,
                opacity: 0.5,
              });
            }
          }
        }
      }
    } else if (noiseType === 'cloud') {
      // 云状图案 - 使用不同大小的圆
      for (let i = 0; i < resolution * 2; i++) {
        const angle = noise2D(i, 0, seed) * Math.PI * 2;
        const dist = noise2D(i, 1, seed) * size * 0.8;
        const x = cx + dist * Math.cos(angle);
        const y = cy + dist * Math.sin(angle);
        const r = 5 + noise2D(i, 2, seed) * intensity * 20;

        result.push({
          type: 'circle',
          id: `cloud-${i}`,
          cx: x,
          cy: y,
          r,
          opacity: 0.1 + noise2D(i, 3, seed) * 0.3,
          blur: true,
        });
      }
    }

    return result;
  }, [resolution, noiseScale, noiseType, intensity, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <filter id="noiseBlur">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <radialGradient id="noiseGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.3" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} {...renderProps}>
        {elements.map((el) => {
          if (el.type === 'circle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                opacity={el.opacity}
                filter={el.blur ? 'url(#noiseBlur)' : undefined}
              />
            );
          } else if (el.type === 'path') {
            return (
              <path
                key={el.id}
                d={el.d}
                opacity={el.opacity}
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
                opacity={el.opacity}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default NoiseTextureLogo;
