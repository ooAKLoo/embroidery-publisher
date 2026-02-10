// ─── Color Palettes ─────────────────────────────────────────────
export const PALETTES = {
  cosmic:  { name: 'Cosmic',  bg: '#08081a', node: '#c4b5fd', line: '#6366f1', accent: '#f0abfc', glow: '#8b5cf6', warm: '#a78bfa' },
  ocean:   { name: 'Ocean',   bg: '#071520', node: '#7dd3fc', line: '#0284c7', accent: '#67e8f9', glow: '#0ea5e9', warm: '#38bdf8' },
  ember:   { name: 'Ember',   bg: '#1a0808', node: '#fca5a5', line: '#dc2626', accent: '#fbbf24', glow: '#ef4444', warm: '#f97316' },
  aurora:  { name: 'Aurora',  bg: '#0a1210', node: '#86efac', line: '#16a34a', accent: '#a3e635', glow: '#22c55e', warm: '#4ade80' },
  neon:    { name: 'Neon',    bg: '#10061a', node: '#f9a8d4', line: '#db2777', accent: '#a78bfa', glow: '#ec4899', warm: '#818cf8' },
  mono:    { name: 'Mono',    bg: '#0a0a0a', node: '#d4d4d4', line: '#525252', accent: '#ffffff', glow: '#a3a3a3', warm: '#e5e5e5' },
  astral:  { name: 'Astral',  bg: '#060614', node: '#4d80cc', line: '#1a3a6b', accent: '#6699dd', glow: '#3366bb', warm: '#5588cc' },
};

// ─── Visualization Modes ────────────────────────────────────────
export const VIZ_MODES = {
  ripple:       { id: 0, name: '涟漪',     fftWeight: 0.15, globalWeight: 0.6  },
  spectralRing: { id: 1, name: '频谱环',   fftWeight: 0.5,  globalWeight: 0.3  },
  logSpiral:    { id: 2, name: '对数螺旋', fftWeight: 0.5,  globalWeight: 0.3  },
  unified:      { id: 3, name: '统一场',   fftWeight: 0.0,  globalWeight: 1.0  },
  aurora:       { id: 4, name: '极光',     fftWeight: 0.15, globalWeight: 0.5  },
};

// ─── Layout Shapes ──────────────────────────────────────────────
export const LAYOUT_SHAPES = {
  disc:   { name: '圆盘' },
  square: { name: '方阵' },
  hex:    { name: '蜂巢' },
  ring:   { name: '环形' },
  star:   { name: '星形' },
  heart:  { name: '心形' },
};

// ─── Default configuration ──────────────────────────────────────
export const DEFAULT_CONFIG = {
  palette: 'cosmic',
  vizMode: 'logSpiral',
  layoutShape: 'disc',
  bloomIntensity: 1.5,
  bloomThreshold: 0.3,
  bloomRadius: 0.4,
  columnCount: 2500,
  discRadius: 5.0,
  maxColumnHeight: 3.0,
  cameraOrbitSpeed: 0.1,
  cameraDistance: 10.0,
  cameraHeight: 5.5,
};
