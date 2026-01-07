import React, { useMemo } from 'react';

// 花瓣/水滴形Logo
const PetalLogo = ({
  petals = 8,
  petalLength = 45,
  petalWidth = 20,
  centerRadius = 8,
  rotation = 0,
  spread = 25, // 花瓣起始距离中心的距离
  color = '#ffffff',
  petalShape = 'ellipse', // ellipse, teardrop, round
}) => {
  const petalPaths = useMemo(() => {
    const result = [];
    const rotationRad = (rotation * Math.PI) / 180;

    for (let i = 0; i < petals; i++) {
      const angle = (i * 2 * Math.PI) / petals + rotationRad;

      // 花瓣中心位置
      const cx = 150 + (spread + petalLength / 2) * Math.cos(angle);
      const cy = 150 + (spread + petalLength / 2) * Math.sin(angle);

      // 根据形状生成路径
      let path;
      const angleDeg = (angle * 180) / Math.PI;

      if (petalShape === 'ellipse') {
        // 椭圆花瓣
        path = {
          type: 'ellipse',
          cx, cy,
          rx: petalLength / 2,
          ry: petalWidth / 2,
          rotate: angleDeg,
        };
      } else if (petalShape === 'teardrop') {
        // 水滴形
        const tipX = 150 + spread * Math.cos(angle);
        const tipY = 150 + spread * Math.sin(angle);
        const endX = 150 + (spread + petalLength) * Math.cos(angle);
        const endY = 150 + (spread + petalLength) * Math.sin(angle);

        const perpAngle = angle + Math.PI / 2;
        const midX = 150 + (spread + petalLength * 0.6) * Math.cos(angle);
        const midY = 150 + (spread + petalLength * 0.6) * Math.sin(angle);
        const bulge1X = midX + petalWidth * 0.5 * Math.cos(perpAngle);
        const bulge1Y = midY + petalWidth * 0.5 * Math.sin(perpAngle);
        const bulge2X = midX - petalWidth * 0.5 * Math.cos(perpAngle);
        const bulge2Y = midY - petalWidth * 0.5 * Math.sin(perpAngle);

        path = {
          type: 'path',
          d: `M ${tipX} ${tipY}
              Q ${bulge1X} ${bulge1Y} ${endX} ${endY}
              Q ${bulge2X} ${bulge2Y} ${tipX} ${tipY} Z`,
        };
      } else {
        // 圆形花瓣
        path = {
          type: 'circle',
          cx: 150 + (spread + petalWidth / 2) * Math.cos(angle),
          cy: 150 + (spread + petalWidth / 2) * Math.sin(angle),
          r: petalWidth / 2,
        };
      }

      result.push({ id: i, ...path });
    }
    return result;
  }, [petals, petalLength, petalWidth, spread, rotation, petalShape]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      {petalPaths.map((p) => {
        if (p.type === 'ellipse') {
          return (
            <ellipse
              key={p.id}
              cx={p.cx}
              cy={p.cy}
              rx={p.rx}
              ry={p.ry}
              fill={color}
              transform={`rotate(${p.rotate} ${p.cx} ${p.cy})`}
            />
          );
        } else if (p.type === 'circle') {
          return <circle key={p.id} cx={p.cx} cy={p.cy} r={p.r} fill={color} />;
        } else {
          return <path key={p.id} d={p.d} fill={color} />;
        }
      })}
      {/* 中心圆 */}
      <circle cx="150" cy="150" r={centerRadius} fill={color} />
    </svg>
  );
};

export default PetalLogo;
