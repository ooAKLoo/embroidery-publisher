// 形状类型
export const ShapeType = {
  SQUARE: 'SQUARE',
  TRIANGLE: 'TRIANGLE',
  HEXAGON: 'HEXAGON',
  CIRCLE: 'CIRCLE'
};

// 色板类型
export const PaletteType = {
  NEON_SUNSET: 'NEON_SUNSET',
  CYBER_BLUE: 'CYBER_BLUE',
  ACID_GREEN: 'ACID_GREEN',
  MONOCHROME: 'MONOCHROME',
  HEATMAP: 'HEATMAP'
};

// 默认配置
export const DEFAULT_CONFIG = {
  shape: ShapeType.SQUARE,
  iterations: 16,
  scale: 0.92,
  rotation: 5,
  pivotOffsetX: 0,
  pivotOffsetY: 0,
  cornerRadius: 20,
  strokeWidth: 2,
  palette: PaletteType.NEON_SUNSET,
  glowStrength: 0.6,
  noiseOpacity: 0.15,
};

// 预设配置
export const PRESETS = {
  "霓虹隧道": {
    ...DEFAULT_CONFIG,
    shape: ShapeType.SQUARE,
    iterations: 24,
    scale: 0.92,
    rotation: 3,
    palette: PaletteType.NEON_SUNSET,
    glowStrength: 0.7,
  },
  "赛博螺旋": {
    ...DEFAULT_CONFIG,
    shape: ShapeType.TRIANGLE,
    iterations: 30,
    scale: 0.94,
    rotation: 8,
    pivotOffsetX: 15,
    pivotOffsetY: 10,
    palette: PaletteType.CYBER_BLUE,
    glowStrength: 0.8,
  },
  "热力涡旋": {
    ...DEFAULT_CONFIG,
    shape: ShapeType.HEXAGON,
    iterations: 20,
    scale: 0.90,
    rotation: 6,
    pivotOffsetX: -10,
    pivotOffsetY: 5,
    palette: PaletteType.HEATMAP,
    cornerRadius: 10,
  },
  "极简波纹": {
    ...DEFAULT_CONFIG,
    shape: ShapeType.CIRCLE,
    iterations: 12,
    scale: 0.88,
    rotation: 0,
    palette: PaletteType.MONOCHROME,
    strokeWidth: 1.5,
    glowStrength: 0.3,
  },
};
