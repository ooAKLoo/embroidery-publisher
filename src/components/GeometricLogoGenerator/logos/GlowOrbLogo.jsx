import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { getStroke } from '../utils/gradient';

// 渐变光晕Logo - 高斯模糊圆、多层叠加
const GlowOrbLogo = ({
  orbCount = 3,                // 光球数量
  arrangement = 'center',      // 'center' | 'scattered' | 'orbital' | 'cluster'
  blurAmount = 20,             // 模糊程度
  intensity = 0.8,             // 强度
  orbSize = 60,                // 光球大小
  seed = 42,                   // 随机种子
  rotation = 0,                // 旋转角度
  strokeWidth = 0,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = 'glowGrad';
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const orbs = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const maxRadius = 100;

    if (arrangement === 'center') {
      // 中心叠加
      for (let i = 0; i < orbCount; i++) {
        const scale = 1 - (i * 0.2);
        result.push({
          id: i,
          cx,
          cy,
          r: orbSize * scale,
          opacity: intensity * (0.3 + (1 - i / orbCount) * 0.7),
          blur: blurAmount * (1 - i * 0.2),
        });
      }
    } else if (arrangement === 'scattered') {
      // 散布
      for (let i = 0; i < orbCount; i++) {
        const angle = seededRandom(seed + i * 0.1) * Math.PI * 2;
        const dist = seededRandom(seed + i * 0.2) * maxRadius * 0.6;
        const size = orbSize * (0.5 + seededRandom(seed + i * 0.3) * 0.5);

        result.push({
          id: i,
          cx: cx + dist * Math.cos(angle),
          cy: cy + dist * Math.sin(angle),
          r: size,
          opacity: intensity * (0.4 + seededRandom(seed + i * 0.4) * 0.6),
          blur: blurAmount * (0.5 + seededRandom(seed + i * 0.5) * 0.5),
        });
      }
    } else if (arrangement === 'orbital') {
      // 轨道排列
      for (let i = 0; i < orbCount; i++) {
        const angle = (i * 2 * Math.PI) / orbCount;
        const dist = maxRadius * 0.5;
        const size = orbSize * 0.6;

        result.push({
          id: i,
          cx: cx + dist * Math.cos(angle),
          cy: cy + dist * Math.sin(angle),
          r: size,
          opacity: intensity * 0.6,
          blur: blurAmount,
        });
      }
      // 中心光球
      result.push({
        id: 'center',
        cx,
        cy,
        r: orbSize * 0.8,
        opacity: intensity,
        blur: blurAmount * 0.8,
      });
    } else if (arrangement === 'cluster') {
      // 簇状
      const baseAngle = seededRandom(seed) * Math.PI * 2;
      for (let i = 0; i < orbCount; i++) {
        const angle = baseAngle + (i * 0.8) + seededRandom(seed + i) * 0.5;
        const dist = 20 + i * 15 + seededRandom(seed + i * 2) * 20;
        const size = orbSize * (0.8 - i * 0.1);

        result.push({
          id: i,
          cx: cx + dist * Math.cos(angle),
          cy: cy + dist * Math.sin(angle),
          r: Math.max(size, 20),
          opacity: intensity * (0.5 + (1 - i / orbCount) * 0.5),
          blur: blurAmount * (0.8 + seededRandom(seed + i * 3) * 0.4),
        });
      }
    }

    return result;
  }, [orbCount, arrangement, blurAmount, intensity, orbSize, seed]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {orbs.map((orb) => (
          <filter key={`blur-${orb.id}`} id={`glowBlur-${orb.id}`}>
            <feGaussianBlur stdDeviation={orb.blur} />
          </filter>
        ))}
        <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="50%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} {...renderProps}>
        {orbs.map((orb) => (
          <circle
            key={orb.id}
            cx={orb.cx}
            cy={orb.cy}
            r={orb.r}
            opacity={orb.opacity}
            filter={`url(#glowBlur-${orb.id})`}
          />
        ))}
      </g>
    </svg>
  );
};

export default GlowOrbLogo;
