import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 六边形/蜂窝Logo - 六边形网格、渐变填充
const HoneycombLogo = ({
  rings = 3,                   // 蜂窝环数
  cellSize = 25,               // 单元格大小
  fillMode = 'gradient',       // 'outline' | 'gradient' | 'alternating'
  gap = 3,                     // 单元格间距
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {}
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const hexagons = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = cellSize;
    const h = size * Math.sqrt(3);
    const w = size * 2;

    // 生成六边形路径
    const hexPath = (x, y, s) => {
      const points = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        points.push(`${x + s * Math.cos(angle)},${y + s * Math.sin(angle)}`);
      }
      return `M ${points.join(' L ')} Z`;
    };

    // 蜂窝布局 - 使用立方体坐标系
    const cubeToPixel = (q, r) => {
      const x = cx + size * (3 / 2 * q);
      const y = cy + size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
      return { x, y };
    };

    // 生成环形蜂窝
    let id = 0;
    // 中心
    const center = cubeToPixel(0, 0);
    result.push({
      id: id++,
      d: hexPath(center.x, center.y, size - gap),
      ring: 0,
      distance: 0,
    });

    // 外环
    for (let ring = 1; ring <= rings; ring++) {
      // 六个方向
      const directions = [
        [1, 0], [0, 1], [-1, 1],
        [-1, 0], [0, -1], [1, -1]
      ];

      let q = ring, r = -ring; // 起始位置

      for (let dir = 0; dir < 6; dir++) {
        for (let step = 0; step < ring; step++) {
          const pos = cubeToPixel(q, r);
          const dist = Math.sqrt((pos.x - cx) ** 2 + (pos.y - cy) ** 2);
          result.push({
            id: id++,
            d: hexPath(pos.x, pos.y, size - gap),
            ring,
            distance: dist,
          });
          q += directions[dir][0];
          r += directions[dir][1];
        }
      }
    }

    return result;
  }, [rings, cellSize, gap]);

  const color1 = colors[0] || '#1a1a1a';
  const color2 = colors.length > 1 ? colors[1] : '#ffffff';
  const maxRing = rings;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="honeycombGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color1} stopOpacity="1" />
          <stop offset="100%" stopColor={color1} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} {...strokeProps}>
        {hexagons.map((hex) => {
          let fill = 'none';
          let stroke = color1;
          let opacity = 1 - (hex.ring / (maxRing + 1)) * 0.6;

          if (fillMode === 'gradient') {
            fill = 'url(#honeycombGrad)';
            opacity = 1 - (hex.ring / (maxRing + 1)) * 0.7;
          } else if (fillMode === 'alternating') {
            fill = hex.id % 2 === 0 ? color1 : 'none';
            opacity = fill === 'none' ? 1 : 0.3;
          }

          return (
            <path
              key={hex.id}
              d={hex.d}
              fill={fill}
              stroke={stroke}
              strokeWidth={strokeWidth}
              opacity={opacity}
            />
          );
        })}
      </g>
    </svg>
  );
};

export default HoneycombLogo;
