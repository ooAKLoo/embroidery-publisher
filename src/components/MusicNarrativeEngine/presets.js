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

// ─── Formation Types ────────────────────────────────────────────
export const FORMATIONS = {
  grid:          { name: 'Grid',          transitionSpeed: 0.045 },
  scatter:       { name: 'Scatter',       transitionSpeed: 0.03  },
  waveSurface:   { name: 'Wave Surface',  transitionSpeed: 0.05  },
  converge:      { name: 'Converge',      transitionSpeed: 0.06  },
  explode:       { name: 'Explode',       transitionSpeed: 0.08  },
  constellation: { name: 'Constellation', transitionSpeed: 0.025 },
};

// ─── Auto-choreography energy thresholds ────────────────────────
export const ENERGY_MAP = [
  { max: 0.025, formation: 'constellation' },
  { max: 0.07,  formation: 'grid' },
  { max: 0.16,  formation: 'waveSurface' },
  { max: 0.24,  formation: 'converge' },
  { max: 1.0,   formation: 'explode' },
];

// ─── Default configuration ──────────────────────────────────────
export const DEFAULT_CONFIG = {
  cols: 30,
  rows: 27,
  palette: 'cosmic',
  formation: 'grid',
  autoChoreography: true,
  intensity: 0.75,
  showConnections: true,
  trailEffect: true,
  showColumns: true,
  modifiers: {
    pulse: true,
    ripple: true,
    highlight: true,
    breath: true,
    bassWarp: true,
    shimmer: true,
    wavePropagation: true,
    columnHeight: true,
  },
};
