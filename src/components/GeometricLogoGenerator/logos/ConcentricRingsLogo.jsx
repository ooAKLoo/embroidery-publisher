import { useMemo } from 'react';

// 同心圆Logo - 多层圆环、波纹扩散
const ConcentricRingsLogo = ({
  ringCount = 6,               // 圆环数量
  maxRadius = 120,             // 最大半径
  ringStyle = 'solid',         // 'solid' | 'dashed' | 'dotted' | 'wave'
  spacing = 'equal',           // 'equal' | 'fibonacci' | 'exponential'
  waveAmplitude = 0,           // 波动幅度 (wave样式)
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const rings = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;

    // 计算每个环的半径
    const radii = [];
    for (let i = 1; i <= ringCount; i++) {
      let r;
      if (spacing === 'equal') {
        r = (maxRadius / ringCount) * i;
      } else if (spacing === 'fibonacci') {
        // 斐波那契比例
        const fib = [1, 1];
        for (let j = 2; j <= i; j++) fib.push(fib[j - 1] + fib[j - 2]);
        const total = fib.slice(1, ringCount + 1).reduce((a, b) => a + b, 0);
        const sum = fib.slice(1, i + 1).reduce((a, b) => a + b, 0);
        r = (sum / total) * maxRadius;
      } else if (spacing === 'exponential') {
        r = maxRadius * Math.pow(i / ringCount, 1.5);
      }
      radii.push(r);
    }

    radii.forEach((r, i) => {
      let d;
      const opacity = 0.3 + (i / ringCount) * 0.7;

      if (ringStyle === 'wave' && waveAmplitude > 0) {
        // 波浪形圆环
        const points = [];
        const segments = 72;
        for (let j = 0; j <= segments; j++) {
          const angle = (j * 2 * Math.PI) / segments;
          const wave = Math.sin(angle * 6 + i) * waveAmplitude;
          const x = cx + (r + wave) * Math.cos(angle);
          const y = cy + (r + wave) * Math.sin(angle);
          points.push(j === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
        }
        d = points.join(' ') + ' Z';
      } else {
        // 标准圆
        d = `M ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`;
      }

      result.push({
        id: i,
        d,
        radius: r,
        opacity,
        dashArray: ringStyle === 'dashed' ? '10,5' : ringStyle === 'dotted' ? '2,4' : 'none',
      });
    });

    return result;
  }, [ringCount, maxRadius, ringStyle, spacing, waveAmplitude]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <radialGradient id="concentricGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </radialGradient>
      </defs>
      <g fill="none">
        {rings.map((ring) => (
          <path
            key={ring.id}
            d={ring.d}
            stroke="url(#concentricGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={ring.dashArray}
            opacity={ring.opacity}
          />
        ))}
      </g>
    </svg>
  );
};

export default ConcentricRingsLogo;
