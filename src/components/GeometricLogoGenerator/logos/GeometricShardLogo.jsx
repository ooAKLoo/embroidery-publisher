import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 几何碎片Logo - 三角形镶嵌、低多边形风格
const GeometricShardLogo = ({
  shardCount = 12,             // 碎片数量
  layers = 3,                  // 层数
  irregularity = 0.3,          // 不规则程度 0-1
  fillOpacity = 0.3,           // 填充透明度
  seed = 42,                   // 随机种子
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const shards = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const maxRadius = 120;

    // 生成顶点
    const vertices = [{ x: cx, y: cy }]; // 中心点

    // 按层生成顶点
    for (let layer = 1; layer <= layers; layer++) {
      const r = (maxRadius / layers) * layer;
      const count = shardCount;
      for (let i = 0; i < count; i++) {
        const baseAngle = (i * 2 * Math.PI) / count;
        const angleOffset = (seededRandom(seed + layer * 100 + i) - 0.5) * irregularity;
        const radiusOffset = (seededRandom(seed + layer * 200 + i) - 0.5) * irregularity * r * 0.3;
        const angle = baseAngle + angleOffset;
        vertices.push({
          x: cx + (r + radiusOffset) * Math.cos(angle),
          y: cy + (r + radiusOffset) * Math.sin(angle),
          layer,
          index: i,
        });
      }
    }

    // 生成三角形碎片
    let shardId = 0;

    // 中心到第一层的三角形
    for (let i = 0; i < shardCount; i++) {
      const v1 = vertices[0]; // 中心
      const v2 = vertices[1 + i];
      const v3 = vertices[1 + (i + 1) % shardCount];
      result.push({
        id: shardId++,
        d: `M ${v1.x} ${v1.y} L ${v2.x} ${v2.y} L ${v3.x} ${v3.y} Z`,
        layer: 0,
        brightness: seededRandom(seed + shardId),
      });
    }

    // 层与层之间的三角形
    for (let layer = 1; layer < layers; layer++) {
      const innerStart = 1 + (layer - 1) * shardCount;
      const outerStart = 1 + layer * shardCount;

      for (let i = 0; i < shardCount; i++) {
        const inner1 = vertices[innerStart + i];
        const inner2 = vertices[innerStart + (i + 1) % shardCount];
        const outer1 = vertices[outerStart + i];
        const outer2 = vertices[outerStart + (i + 1) % shardCount];

        // 两个三角形组成一个四边形区域
        result.push({
          id: shardId++,
          d: `M ${inner1.x} ${inner1.y} L ${outer1.x} ${outer1.y} L ${outer2.x} ${outer2.y} Z`,
          layer,
          brightness: seededRandom(seed + shardId),
        });
        result.push({
          id: shardId++,
          d: `M ${inner1.x} ${inner1.y} L ${outer2.x} ${outer2.y} L ${inner2.x} ${inner2.y} Z`,
          layer,
          brightness: seededRandom(seed + shardId),
        });
      }
    }

    return result;
  }, [shardCount, layers, irregularity, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="shardGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} {...strokeProps}>
        {shards.map((shard) => (
          <path
            key={shard.id}
            d={shard.d}
            fill={color}
            fillOpacity={fillOpacity * (0.3 + shard.brightness * 0.7)}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeOpacity={0.8}
          />
        ))}
      </g>
    </svg>
  );
};

export default GeometricShardLogo;
