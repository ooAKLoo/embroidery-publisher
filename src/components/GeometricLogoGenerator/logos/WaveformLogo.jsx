import { useMemo } from 'react';

// 波形Logo - 正弦波叠加、相位偏移
const WaveformLogo = ({
  waveCount = 3,               // 波形数量
  frequency = 2,               // 频率
  amplitude = 30,              // 振幅
  phase = 0,                   // 相位
  waveType = 'sine',           // 'sine' | 'square' | 'triangle' | 'sawtooth'
  orientation = 'horizontal',  // 'horizontal' | 'vertical' | 'circular'
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const waves = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 110;

    // 波形函数
    const waveFunc = (t, freq, ph) => {
      const x = t * freq * 2 * Math.PI + ph;
      switch (waveType) {
        case 'sine':
          return Math.sin(x);
        case 'square':
          return Math.sign(Math.sin(x));
        case 'triangle':
          return 2 * Math.abs(2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5))) - 1;
        case 'sawtooth':
          return 2 * (x / (2 * Math.PI) - Math.floor(x / (2 * Math.PI) + 0.5));
        default:
          return Math.sin(x);
      }
    };

    const phaseRad = (phase * Math.PI) / 180;

    for (let w = 0; w < waveCount; w++) {
      const wavePhase = phaseRad + (w * Math.PI) / waveCount;
      const offset = ((w - (waveCount - 1) / 2) / waveCount) * amplitude * 2;
      const points = [];

      if (orientation === 'horizontal') {
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const x = cx - size + t * size * 2;
          const y = cy + offset + waveFunc(t, frequency, wavePhase) * amplitude;
          points.push({ x, y });
        }
      } else if (orientation === 'vertical') {
        for (let i = 0; i <= 100; i++) {
          const t = i / 100;
          const y = cy - size + t * size * 2;
          const x = cx + offset + waveFunc(t, frequency, wavePhase) * amplitude;
          points.push({ x, y });
        }
      } else if (orientation === 'circular') {
        const baseR = 60 + w * 20;
        for (let i = 0; i <= 72; i++) {
          const angle = (i / 72) * 2 * Math.PI;
          const t = i / 72;
          const r = baseR + waveFunc(t * frequency, 1, wavePhase) * (amplitude * 0.4);
          points.push({
            x: cx + r * Math.cos(angle),
            y: cy + r * Math.sin(angle),
          });
        }
      }

      let d = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`;
      }
      if (orientation === 'circular') d += ' Z';

      result.push({
        id: w,
        d,
        opacity: 0.4 + (1 - Math.abs(w - (waveCount - 1) / 2) / waveCount) * 0.6,
      });
    }

    return result;
  }, [waveCount, frequency, amplitude, phase, waveType, orientation]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="20%" stopColor={color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} fill="none" strokeLinecap="round">
        {waves.map((wave) => (
          <path
            key={wave.id}
            d={wave.d}
            stroke={orientation === 'circular' ? color : 'url(#waveGrad)'}
            strokeWidth={strokeWidth}
            opacity={wave.opacity}
          />
        ))}
      </g>
    </svg>
  );
};

export default WaveformLogo;
