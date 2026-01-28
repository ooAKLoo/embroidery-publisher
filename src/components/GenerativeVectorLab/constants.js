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
  useNegativeSpace: true,
  invertFill: false,
  useGradient: false,
  gradientFrom: "#6366f1",
  gradientTo: "#22d3ee",
  strokeGradientFrom: "#6366f1",
  strokeGradientTo: "#22d3ee",
  gradientAngle: 45,
  gradientType: "linear",
  gradientFromPos: 0,
  gradientToPos: 1,
  gradientRadialCx: 0.5,
  gradientRadialCy: 0.5,
  gradientRadialR: 0.6,
  gradientRadialStrength: 0.6,
  gradientInvert: false,
  strokeUseGradient: false,
  strokeGradientType: "linear", // linear, radial-in, radial-out, array-cw, array-ccw

  // 填色风格
  styleMode: "custom",

  // 画布背景
  canvasBg: "#ffffff",

  // 描边样式
  strokeLinecap: "round",
  strokeDashEnabled: false,
  strokeDashLength: 8,
  strokeDashGap: 6,
  strokeDashOffset: 0,

  // 立体感
  shadowEnabled: false,
  shadowX: 10,
  shadowY: 12,
  shadowBlur: 16,
  shadowOpacity: 0.35,
  shadowColor: "#000000",
  innerShadowEnabled: false,
  innerShadowX: -6,
  innerShadowY: -6,
  innerShadowBlur: 12,
  innerShadowOpacity: 0.4,
  innerShadowColor: "#000000",
  doubleStrokeEnabled: false,
  doubleStrokeWidth: 3,
  doubleStrokeOpacity: 0.6,
  doubleStrokeColor: "#0f172a",
  extrudeEnabled: false,
  extrudeDepth: 10,
  extrudeOffsetX: 12,
  extrudeOffsetY: 12,
  extrudeOpacity: 0.5,
  extrudeFade: 0.7,
  extrudeColor: "#111827",
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
