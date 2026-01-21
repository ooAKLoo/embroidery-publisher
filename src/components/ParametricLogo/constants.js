// 初始配置
export const INITIAL_CONFIG = {
  shape: {
    m: 0,    // 对称/瓣数 (0-20)
    n1: 1,   // 挤压/膨胀 (0.1-100)
    n2: 1,   // 角形状1 (0.1-100)
    n3: 1,   // 角形状2 (0.1-100)
    a: 1,    // X轴缩放 (0.1-5)
    b: 1,    // Y轴缩放 (0.1-5)
  },
  symmetry: {
    count: 1,     // 副本数量 (1-12)
    radius: 0,    // 中心距离 (0-200)
    rotation: 0,  // 基础旋转角度 (0-360)
    scale: 1,     // 单个缩放 (0.1-2)
  },
  style: {
    fillColor: '#3b82f6',
    strokeColor: '#ffffff',
    strokeWidth: 2,
    filled: false,
    blendMode: 'source-over',
  },
};

// 预设配置
export const PRESETS = {
  Circle: {
    shape: { m: 0, n1: 1, n2: 1, n3: 1, a: 1, b: 1 },
    symmetry: { count: 1, radius: 0, rotation: 0, scale: 1 }
  },
  Star: {
    shape: { m: 5, n1: 0.2, n2: 1.7, n3: 1.7, a: 1, b: 1 },
    symmetry: { count: 1, radius: 0, rotation: 0, scale: 1 }
  },
  Flower: {
    shape: { m: 6, n1: 0.15, n2: 0.5, n3: 0.5, a: 1, b: 1 },
    symmetry: { count: 1, radius: 0, rotation: 0, scale: 1 }
  },
  Shield: {
    shape: { m: 3, n1: 0.5, n2: 0.2, n3: 0.2, a: 1, b: 1 },
    symmetry: { count: 1, radius: 0, rotation: 180, scale: 1 }
  },
  Organic: {
    shape: { m: 7, n1: 0.5, n2: 0.3, n3: 1.5, a: 1, b: 1 },
    symmetry: { count: 1, radius: 0, rotation: 0, scale: 1 }
  },
  Atom: {
    shape: { m: 0, n1: 1, n2: 1, n3: 1, a: 0.5, b: 2 },
    symmetry: { count: 3, radius: 0, rotation: 0, scale: 1 }
  },
};

// 混合模式列表
export const BLEND_MODES = [
  'source-over',
  'multiply',
  'screen',
  'overlay',
  'darken',
  'lighten',
  'color-dodge',
  'color-burn',
  'hard-light',
  'soft-light',
  'difference',
  'exclusion',
  'hue',
  'saturation',
  'color',
  'luminosity',
];
