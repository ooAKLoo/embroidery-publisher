import { useMemo } from 'react';

// 禅圆 Logo - 日本书法风格的单笔圆，带有自然的不完美感
const EnsoCircleLogo = ({
  openingSize = 15,           // 开口大小 (度数)
  openingPosition = 45,       // 开口位置 (度数)
  brushWidth = 20,            // 笔刷宽度
  taperStart = 0.3,           // 起笔渐变
  taperEnd = 0.3,             // 收笔渐变
  roughness = 0.02,           // 笔触粗糙度
  inkSplash = false,          // 墨迹飞溅效果
  innerCircle = false,        // 内圈装饰
  seed = 42,                  // 随机种子
  rotation = 0,               // 整体旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const radius = 100;

    // 伪随机数生成器
    const random = (s) => {
      const x = Math.sin(s) * 10000;
      return x - Math.floor(x);
    };

    // 开口位置（弧度）
    const openingRad = (openingPosition * Math.PI) / 180;
    const openingSizeRad = (openingSize * Math.PI) / 180;

    // 起点和终点
    const startAngle = openingRad + openingSizeRad / 2;
    const endAngle = openingRad - openingSizeRad / 2 + Math.PI * 2;

    // 生成圆弧路径点（带有自然的不规则感）
    const points = [];
    const steps = 100;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const angle = startAngle + t * (endAngle - startAngle - openingSizeRad);

      // 添加自然的波动
      const noise = roughness * radius * (random(seed + i * 0.1) - 0.5);
      const r = radius + noise;

      // 笔刷宽度变化（起笔和收笔渐变）
      let width = brushWidth;
      if (t < taperStart) {
        width = brushWidth * (t / taperStart) * 0.5 + brushWidth * 0.5;
      } else if (t > 1 - taperEnd) {
        width = brushWidth * ((1 - t) / taperEnd) * 0.5 + brushWidth * 0.5;
      }

      // 添加一些随机的宽度变化，模拟墨水浓淡
      width += (random(seed + i * 0.2) - 0.5) * brushWidth * 0.2;

      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      points.push({ x, y, width, angle });
    }

    // 构建主圆弧路径（使用变宽笔触模拟）
    // 外边缘
    let outerPath = 'M ';
    let innerPath = 'M ';

    points.forEach((p, i) => {
      const perpAngle = p.angle + Math.PI / 2;
      const outerX = p.x + (p.width / 2) * Math.cos(perpAngle);
      const outerY = p.y + (p.width / 2) * Math.sin(perpAngle);
      const innerX = p.x - (p.width / 2) * Math.cos(perpAngle);
      const innerY = p.y - (p.width / 2) * Math.sin(perpAngle);

      if (i === 0) {
        outerPath += `${outerX} ${outerY} `;
        innerPath += `${innerX} ${innerY} `;
      } else {
        outerPath += `L ${outerX} ${outerY} `;
        innerPath = `L ${innerX} ${innerY} ` + innerPath.slice(2);
      }
    });

    // 闭合成一个填充区域
    const reversedInner = points.slice().reverse().map(p => {
      const perpAngle = p.angle + Math.PI / 2;
      return {
        x: p.x - (p.width / 2) * Math.cos(perpAngle),
        y: p.y - (p.width / 2) * Math.sin(perpAngle),
      };
    });

    let fullPath = outerPath;
    reversedInner.forEach((p, i) => {
      fullPath += `L ${p.x} ${p.y} `;
    });
    fullPath += 'Z';

    result.push({
      type: 'enso',
      id: 'enso-main',
      d: fullPath,
    });

    // 简单的中心线（用于描边效果）
    let centerPath = 'M ';
    points.forEach((p, i) => {
      if (i === 0) {
        centerPath += `${p.x} ${p.y} `;
      } else {
        centerPath += `L ${p.x} ${p.y} `;
      }
    });

    result.push({
      type: 'centerLine',
      id: 'center-line',
      d: centerPath,
      avgWidth: brushWidth,
    });

    // 墨迹飞溅效果
    if (inkSplash) {
      const splashCount = 5 + Math.floor(random(seed) * 5);
      for (let i = 0; i < splashCount; i++) {
        const baseAngle = startAngle + random(seed + i * 10) * (endAngle - startAngle);
        const dist = radius + brushWidth / 2 + random(seed + i * 20) * 30;
        const splashX = cx + dist * Math.cos(baseAngle);
        const splashY = cy + dist * Math.sin(baseAngle);
        const splashR = 1 + random(seed + i * 30) * 3;

        result.push({
          type: 'splash',
          id: `splash-${i}`,
          cx: splashX,
          cy: splashY,
          r: splashR,
        });
      }

      // 起笔和收笔处的飞白效果
      for (let end = 0; end < 2; end++) {
        const basePoint = end === 0 ? points[0] : points[points.length - 1];
        const flyWhiteCount = 3;
        for (let i = 0; i < flyWhiteCount; i++) {
          const offset = (random(seed + end * 100 + i) - 0.5) * brushWidth * 0.8;
          const perpAngle = basePoint.angle + Math.PI / 2;
          const fwX = basePoint.x + offset * Math.cos(perpAngle);
          const fwY = basePoint.y + offset * Math.sin(perpAngle);

          result.push({
            type: 'flyWhite',
            id: `flywhite-${end}-${i}`,
            cx: fwX,
            cy: fwY,
            r: 1 + random(seed + end * 100 + i * 10) * 2,
          });
        }
      }
    }

    // 内圈装饰
    if (innerCircle) {
      const innerRadius = radius * 0.3;
      result.push({
        type: 'innerCircle',
        id: 'inner-circle',
        cx,
        cy,
        r: innerRadius,
      });
    }

    return result;
  }, [openingSize, openingPosition, brushWidth, taperStart, taperEnd, roughness, inkSplash, innerCircle, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <filter id="inkTexture" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`}>
        {elements.map((el) => {
          if (el.type === 'enso') {
            return (
              <path
                key={el.id}
                d={el.d}
                fill={color}
                stroke="none"
                opacity={0.95}
              />
            );
          } else if (el.type === 'centerLine') {
            // 不渲染中心线，仅用于参考
            return null;
          } else if (el.type === 'splash' || el.type === 'flyWhite') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill={color}
                opacity={el.type === 'splash' ? 0.7 : 0.5}
              />
            );
          } else if (el.type === 'innerCircle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
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

export default EnsoCircleLogo;
