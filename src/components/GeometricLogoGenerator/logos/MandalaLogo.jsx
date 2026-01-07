import { useMemo } from 'react';

// 对称曼陀罗Logo - 多重对称、旋转重复
const MandalaLogo = ({
  symmetry = 8,                // 对称轴数
  layers = 4,                  // 层数
  complexity = 3,              // 复杂度(每层元素)
  style = 'petals',            // 'petals' | 'geometric' | 'dots' | 'mixed'
  innerRadius = 20,            // 内半径
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const maxRadius = 115;
    const layerStep = (maxRadius - innerRadius) / layers;

    for (let layer = 0; layer < layers; layer++) {
      const r1 = innerRadius + layer * layerStep;
      const r2 = innerRadius + (layer + 1) * layerStep;
      const rMid = (r1 + r2) / 2;

      for (let i = 0; i < symmetry; i++) {
        const baseAngle = (i * 2 * Math.PI) / symmetry;
        const halfAngle = Math.PI / symmetry;

        if (style === 'petals' || style === 'mixed') {
          // 花瓣形状
          const petalLength = layerStep * 0.8;
          const petalWidth = halfAngle * rMid * 0.6;

          const tipX = cx + (rMid + petalLength / 2) * Math.cos(baseAngle);
          const tipY = cy + (rMid + petalLength / 2) * Math.sin(baseAngle);
          const baseX = cx + (rMid - petalLength / 2) * Math.cos(baseAngle);
          const baseY = cy + (rMid - petalLength / 2) * Math.sin(baseAngle);

          const cp1X = cx + rMid * Math.cos(baseAngle - halfAngle * 0.3);
          const cp1Y = cy + rMid * Math.sin(baseAngle - halfAngle * 0.3);
          const cp2X = cx + rMid * Math.cos(baseAngle + halfAngle * 0.3);
          const cp2Y = cy + rMid * Math.sin(baseAngle + halfAngle * 0.3);

          result.push({
            type: 'path',
            id: `petal-${layer}-${i}`,
            d: `M ${baseX} ${baseY} Q ${cp1X} ${cp1Y} ${tipX} ${tipY} Q ${cp2X} ${cp2Y} ${baseX} ${baseY}`,
            layer,
          });
        }

        if (style === 'geometric' || style === 'mixed') {
          // 几何形状 - 菱形
          const angle1 = baseAngle - halfAngle * 0.5;
          const angle2 = baseAngle + halfAngle * 0.5;

          const p1 = { x: cx + r1 * Math.cos(baseAngle), y: cy + r1 * Math.sin(baseAngle) };
          const p2 = { x: cx + rMid * Math.cos(angle1), y: cy + rMid * Math.sin(angle1) };
          const p3 = { x: cx + r2 * Math.cos(baseAngle), y: cy + r2 * Math.sin(baseAngle) };
          const p4 = { x: cx + rMid * Math.cos(angle2), y: cy + rMid * Math.sin(angle2) };

          result.push({
            type: 'path',
            id: `geo-${layer}-${i}`,
            d: `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`,
            layer,
          });
        }

        if (style === 'dots' || style === 'mixed') {
          // 点阵
          for (let c = 0; c < complexity; c++) {
            const dotR = r1 + (layerStep / (complexity + 1)) * (c + 1);
            const dotAngle = baseAngle + (c % 2 === 0 ? halfAngle * 0.3 : -halfAngle * 0.3);

            result.push({
              type: 'circle',
              id: `dot-${layer}-${i}-${c}`,
              cx: cx + dotR * Math.cos(dotAngle),
              cy: cy + dotR * Math.sin(dotAngle),
              r: 3 + (layer * 0.5),
              layer,
            });
          }
        }
      }

      // 同心圆装饰
      result.push({
        type: 'ring',
        id: `ring-${layer}`,
        r: r1,
        layer,
      });
    }

    // 外圈
    result.push({
      type: 'ring',
      id: 'outer-ring',
      r: maxRadius,
      layer: layers,
    });

    // 中心点
    result.push({
      type: 'circle',
      id: 'center',
      cx,
      cy,
      r: innerRadius * 0.5,
      layer: -1,
    });

    return result;
  }, [symmetry, layers, complexity, style, innerRadius]);

  const color = colors[0] || '#1a1a1a';
  const cx = 150, cy = 150;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="mandalaGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.5" />
        </radialGradient>
      </defs>
      <g stroke={color} strokeWidth={strokeWidth} fill="none">
        {elements.map((el) => {
          const opacity = el.layer >= 0 ? 0.4 + (el.layer / layers) * 0.6 : 1;

          if (el.type === 'path') {
            return (
              <path
                key={el.id}
                d={el.d}
                opacity={opacity}
              />
            );
          } else if (el.type === 'circle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill="url(#mandalaGrad)"
                opacity={opacity}
              />
            );
          } else if (el.type === 'ring') {
            return (
              <circle
                key={el.id}
                cx={cx}
                cy={cy}
                r={el.r}
                opacity={opacity * 0.5}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default MandalaLogo;
