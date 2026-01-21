/**
 * 极坐标转笛卡尔坐标, 带拉伸因子
 */
function polarToCartesian(centerX, centerY, radius, angleInRadians, stretch) {
  return {
    x: centerX + radius * Math.cos(angleInRadians) * (1 / stretch),
    y: centerY + radius * Math.sin(angleInRadians) * stretch,
  };
}

/**
 * 生成原子路径的 SVG path 数据
 */
export const generateAtomPath = (config, cx, cy) => {
  const { baseRadius, frequency, amplitude, roundness, phase, stretch } = config;
  
  const steps = 120;
  const pathPoints = [];

  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * 2 * Math.PI;
    
    const osc = Math.cos(frequency * theta);
    
    let shapedOsc = osc;
    if (roundness !== 0.5) {
      const power = roundness < 0.5 ? 0.2 + roundness : 1 + (roundness - 0.5) * 4;
      const sign = osc >= 0 ? 1 : -1;
      shapedOsc = sign * Math.pow(Math.abs(osc), power);
    }

    const r = baseRadius + (amplitude * 50) * shapedOsc;
    const safeR = Math.max(0, r);

    const point = polarToCartesian(cx, cy, safeR, theta + phase, stretch);
    pathPoints.push(point);
  }

  if (pathPoints.length === 0) return "";

  const d = pathPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`;
  }, "");

  return `${d} Z`;
};

/**
 * 生成配置变体
 */
export const generateVariation = (base, intensity = 0.2) => {
  const jitter = (val, range) => {
    const delta = (Math.random() - 0.5) * 2 * range;
    return val + delta;
  };

  return {
    ...base,
    frequency: Math.random() > 0.8 ? Math.max(2, Math.round(jitter(base.frequency, 2))) : base.frequency,
    amplitude: Math.max(0, Math.min(2, jitter(base.amplitude, intensity))),
    roundness: Math.max(0.1, Math.min(1, jitter(base.roundness, intensity * 0.5))),
    stretch: Math.max(0.5, Math.min(3, jitter(base.stretch, intensity))),
    phase: jitter(base.phase, Math.PI / 4),
    arrayRadius: Math.max(0, jitter(base.arrayRadius, 50 * intensity)),
    rotation: jitter(base.rotation, 45),
  };
};
