// 默认配置
export const DEFAULT_CONFIG = {
  // 原子几何
  baseRadius: 40,
  frequency: 1,      // 花瓣数量
  amplitude: 0,
  roundness: 0.5,
  stretch: 1,
  phase: 0,

  // 阵列
  count: 8,
  arrayRadius: 80,
  scale: 1,
  rotation: 0,

  // 样式
  fill: "none",
  stroke: "#e4e4e7",
  strokeWidth: 2,
  opacity: 1,
};

// 预设配置
export const PRESETS = {
  "Flower": {
    ...DEFAULT_CONFIG,
    baseRadius: 30,
    frequency: 5,
    amplitude: 0.5,
    roundness: 0.8,
    count: 1,
    arrayRadius: 0,
    fill: "#f472b6",
    stroke: "#db2777",
    scale: 2
  },
  "Propeller": {
    ...DEFAULT_CONFIG,
    baseRadius: 10,
    frequency: 1,
    amplitude: 0,
    stretch: 3,
    count: 3,
    arrayRadius: 0,
    rotation: 45,
    fill: "#60a5fa",
    stroke: "none"
  },
  "Mandala": {
    ...DEFAULT_CONFIG,
    baseRadius: 20,
    frequency: 3,
    amplitude: 0.4,
    roundness: 0.2,
    count: 12,
    arrayRadius: 100,
    scale: 0.8,
    stroke: "#34d399",
  }
};
