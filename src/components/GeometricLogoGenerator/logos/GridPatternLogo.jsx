import { useMemo } from 'react';

// 网格/线框Logo - 规则网格、等高线风格
const GridPatternLogo = ({
  gridType = 'square',         // 'square' | 'isometric' | 'radial' | 'contour'
  gridSize = 20,               // 网格大小
  lineCount = 8,               // 线条数量
  distortion = 0,              // 扭曲程度 0-50
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const paths = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 120;

    if (gridType === 'square') {
      // 方形网格
      const step = size * 2 / lineCount;
      for (let i = 0; i <= lineCount; i++) {
        const offset = -size + i * step;
        // 水平线
        result.push({
          id: `h-${i}`,
          d: `M ${cx - size} ${cy + offset} L ${cx + size} ${cy + offset}`,
          opacity: 1 - Math.abs(offset) / size * 0.5,
        });
        // 垂直线
        result.push({
          id: `v-${i}`,
          d: `M ${cx + offset} ${cy - size} L ${cx + offset} ${cy + size}`,
          opacity: 1 - Math.abs(offset) / size * 0.5,
        });
      }
    } else if (gridType === 'isometric') {
      // 等距网格(45度)
      const step = size * 2 / lineCount;
      for (let i = -lineCount; i <= lineCount; i++) {
        const offset = i * step * 0.7;
        // 对角线1
        result.push({
          id: `d1-${i}`,
          d: `M ${cx - size + offset} ${cy - size} L ${cx + size + offset} ${cy + size}`,
          opacity: 1 - Math.abs(i) / lineCount * 0.6,
        });
        // 对角线2
        result.push({
          id: `d2-${i}`,
          d: `M ${cx - size - offset} ${cy + size} L ${cx + size - offset} ${cy - size}`,
          opacity: 1 - Math.abs(i) / lineCount * 0.6,
        });
      }
    } else if (gridType === 'radial') {
      // 极坐标网格
      const rings = lineCount;
      const spokes = lineCount * 2;
      // 同心圆
      for (let i = 1; i <= rings; i++) {
        const r = (size / rings) * i;
        result.push({
          id: `ring-${i}`,
          d: `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`,
          opacity: 0.3 + (i / rings) * 0.7,
        });
      }
      // 辐射线
      for (let i = 0; i < spokes; i++) {
        const angle = (i * 2 * Math.PI) / spokes;
        result.push({
          id: `spoke-${i}`,
          d: `M ${cx} ${cy} L ${cx + size * Math.cos(angle)} ${cy + size * Math.sin(angle)}`,
          opacity: 0.5,
        });
      }
    } else if (gridType === 'contour') {
      // 等高线风格
      const rings = lineCount;
      for (let i = 1; i <= rings; i++) {
        const r = (size / rings) * i;
        const wobble = distortion * 0.02;
        const points = [];
        const segments = 36;
        for (let j = 0; j <= segments; j++) {
          const angle = (j * 2 * Math.PI) / segments;
          const noise = wobble > 0 ? Math.sin(angle * 3 + i) * wobble * r : 0;
          const x = cx + (r + noise) * Math.cos(angle);
          const y = cy + (r + noise) * Math.sin(angle);
          points.push(j === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        result.push({
          id: `contour-${i}`,
          d: points.join(' ') + ' Z',
          opacity: 0.3 + (i / rings) * 0.7,
        });
      }
    }

    return result;
  }, [gridType, gridSize, lineCount, distortion]);

  const gradientColor = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="gridGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={gradientColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientColor} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} fill="none" stroke="url(#gridGrad)" strokeWidth={strokeWidth}>
        {paths.map((p) => (
          <path key={p.id} d={p.d} opacity={p.opacity} />
        ))}
      </g>
    </svg>
  );
};

export default GridPatternLogo;
