import { FORMATIONS } from './presets';

/**
 * ParticleSystem — Formation + Modifier dual-layer architecture.
 *
 * Formation  → sets each node's targetX/targetY (macro shape)
 * Lerp       → smoothly interpolates x/y toward target each frame
 * Modifiers  → accumulate offsets onto renderX/renderY + visual props
 */

// ═══════════════════════════════════════════════════════════════════
//  Noise functions (ported from GLSL shader)
// ═══════════════════════════════════════════════════════════════════
function rand(x, y) {
  return ((Math.sin(x * 12.9898 + y * 4.1414) * 43758.5453) % 1 + 1) % 1;
}

function noise(px, py) {
  const ix = Math.floor(px), iy = Math.floor(py);
  let ux = px - ix, uy = py - iy;
  ux = ux * ux * (3 - 2 * ux);
  uy = uy * uy * (3 - 2 * uy);
  const a = rand(ix, iy);
  const b = rand(ix + 1, iy);
  const c = rand(ix, iy + 1);
  const d = rand(ix + 1, iy + 1);
  const res = a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
  return res * res;
}

function fbm(px, py) {
  let r = 0, amp = 1, freq = 1;
  for (let i = 0; i < 3; i++) {
    r += amp * noise(freq * px, freq * py);
    amp *= 0.5;
    freq *= 2;
  }
  return r;
}

function remap(val, im, ix, om, ox) {
  return Math.max(om, Math.min(ox, om + (val - im) * (ox - om) / (ix - im)));
}

function cio(t) {
  return t < 0.5
    ? 0.5 * (1 - Math.sqrt(1 - 4 * t * t))
    : 0.5 * (Math.sqrt((3 - 2 * t) * (2 * t - 1)) + 1);
}

// ═══════════════════════════════════════════════════════════════════
//  Node factory
// ═══════════════════════════════════════════════════════════════════
function createNode(id, col, row, x, y) {
  return {
    id, col, row,
    // grid home (never changes unless reconfigure)
    baseX: x, baseY: y,
    // formation target
    targetX: x, targetY: y,
    // current interpolated position
    x, y,
    // render position (after modifiers)
    renderX: x, renderY: y,
    // visual
    scale: 1, renderScale: 1,
    opacity: 0.55, renderOpacity: 0.55,
    highlighted: false,
    highlightAge: 0,
    // height dimension (shader-inspired)
    height: 0,
    targetHeight: 0,
    renderHeight: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  Formations — each sets targetX, targetY for all nodes
// ═══════════════════════════════════════════════════════════════════
const formationFns = {
  grid(nodes, w, h, cols, rows) {
    const sx = w / (cols + 1), sy = h / (rows + 1);
    for (const n of nodes) {
      n.targetX = sx * (n.col + 1);
      n.targetY = sy * (n.row + 1);
    }
  },

  scatter(nodes, w, h, _c, _r, seed) {
    // deterministic-ish random per node
    for (const n of nodes) {
      const hash = Math.sin(n.id * 9137.17 + (seed || 0)) * 43758.5453;
      const rx = (hash - Math.floor(hash));
      const hash2 = Math.sin(n.id * 2654.43 + (seed || 0)) * 28461.321;
      const ry = (hash2 - Math.floor(hash2));
      n.targetX = 40 + rx * (w - 80);
      n.targetY = 40 + ry * (h - 80);
    }
  },

  waveSurface(nodes, w, h, cols, rows, time) {
    const sx = w / (cols + 1), sy = h / (rows + 1);
    for (const n of nodes) {
      const bx = sx * (n.col + 1);
      const by = sy * (n.row + 1);
      const wave = Math.sin((n.col / cols) * Math.PI * 2 + (time || 0) * 0.02) * 25;
      const wave2 = Math.cos((n.row / rows) * Math.PI * 1.5 + (time || 0) * 0.015) * 15;
      n.targetX = bx + wave2;
      n.targetY = by + wave;
    }
  },

  converge(nodes, w, h) {
    const cx = w / 2, cy = h / 2;
    for (const n of nodes) {
      const angle = Math.atan2(n.baseY - cy, n.baseX - cx);
      const dist = Math.hypot(n.baseX - cx, n.baseY - cy);
      const pull = dist * 0.15; // converge to ~15% of original distance
      n.targetX = cx + Math.cos(angle) * pull;
      n.targetY = cy + Math.sin(angle) * pull;
    }
  },

  explode(nodes, w, h) {
    const cx = w / 2, cy = h / 2;
    const maxR = Math.hypot(w, h) * 0.55;
    for (const n of nodes) {
      const angle = Math.atan2(n.baseY - cy, n.baseX - cx);
      const baseDist = Math.hypot(n.baseX - cx, n.baseY - cy);
      const push = Math.min(baseDist * 2.5, maxR);
      n.targetX = cx + Math.cos(angle) * push;
      n.targetY = cy + Math.sin(angle) * push;
    }
  },

  constellation(nodes, w, h, _c, _r, seed) {
    // sparse clusters
    const clusters = 5;
    const centers = [];
    for (let i = 0; i < clusters; i++) {
      const a = Math.sin(i * 7919.1 + (seed || 0)) * 43758.5;
      const b = Math.sin(i * 3571.3 + (seed || 0)) * 28461.3;
      centers.push({
        x: 80 + (a - Math.floor(a)) * (w - 160),
        y: 80 + (b - Math.floor(b)) * (h - 160),
      });
    }
    for (const n of nodes) {
      const ci = n.id % clusters;
      const c = centers[ci];
      const hash = Math.sin(n.id * 1337.17 + (seed || 0)) * 43758.5;
      const r = (hash - Math.floor(hash));
      const hash2 = Math.sin(n.id * 7654.43 + (seed || 0)) * 28461.3;
      const a = (hash2 - Math.floor(hash2)) * Math.PI * 2;
      const spread = 60 + r * 120;
      n.targetX = c.x + Math.cos(a) * spread;
      n.targetY = c.y + Math.sin(a) * spread;
    }
  },
};

// ═══════════════════════════════════════════════════════════════════
//  Modifiers — each mutates renderX/renderY/renderScale/renderOpacity
// ═══════════════════════════════════════════════════════════════════

/** Beat → brief scale pulse on all nodes; downbeats hit harder */
function modPulse(nodes, audio, time, intensity) {
  if (!audio.isBeat) return;
  const base = 0.25 * intensity;
  const str = audio.isDownbeat ? base * 1.8 : base;
  const opBoost = audio.isDownbeat ? 0.25 : 0.15;
  for (const n of nodes) {
    n.renderScale += str * (0.7 + (audio.beatStrength || 0) * 0.3);
    n.renderOpacity = Math.min(1, n.renderOpacity + opBoost);
  }
}

/** Ripple — expanding ring from a point */
function modRipple(ripples, nodes, time, intensity) {
  for (const rip of ripples) {
    const age = time - rip.t;
    if (age > 90) continue;
    const fade = 1 - age / 90;
    const radius = age * 9;
    for (const n of nodes) {
      const d = Math.hypot(n.x - rip.x, n.y - rip.y);
      const delta = Math.abs(d - radius);
      if (delta < 45) {
        const ring = (1 - delta / 45) * fade * rip.str * intensity;
        const angle = Math.atan2(n.y - rip.y, n.x - rip.x);
        n.renderX += Math.cos(angle) * ring * 16;
        n.renderY += Math.sin(angle) * ring * 16;
      }
    }
  }
}

/** Highlight — flash random nodes on onset */
function modHighlight(nodes, audio, _time, intensity) {
  if (!audio.isOnset) return;
  const count = Math.floor(3 + audio.highEnergy * 12 * intensity);
  const len = nodes.length;
  for (let i = 0; i < count && i < len; i++) {
    const idx = Math.floor(Math.random() * len);
    nodes[idx].highlighted = true;
    nodes[idx].highlightAge = 0;
  }
}

/** Breath — global spacing modulation from RMS */
function modBreath(nodes, audio, _time, intensity, cx, cy) {
  const breathScale = 1 + audio.rms * 0.35 * intensity;
  for (const n of nodes) {
    const dx = n.renderX - cx;
    const dy = n.renderY - cy;
    n.renderX = cx + dx * breathScale;
    n.renderY = cy + dy * breathScale;
  }
}

/** Bass warp — stretch bottom region downward */
function modBassWarp(nodes, audio, _time, intensity, h) {
  const warp = audio.lowEnergy * 20 * intensity;
  for (const n of nodes) {
    const ny = n.y / h; // 0=top, 1=bottom
    if (ny > 0.5) {
      n.renderY += (ny - 0.5) * 2 * warp;
    }
  }
}

/** Shimmer — high-freq opacity flicker */
function modShimmer(nodes, audio, time, intensity) {
  const str = audio.highEnergy * intensity;
  if (str < 0.02) return;
  for (const n of nodes) {
    const flicker = Math.sin(time * 0.3 + n.id * 3.7) * 0.5 + 0.5;
    n.renderOpacity += (flicker - 0.5) * str * 0.4;
  }
}

/** Wave propagation — slow traveling displacement wave */
function modWavePropagation(nodes, _audio, time, intensity) {
  const amp = 10 * intensity;
  const speed = 0.025;
  const freq = 0.012;
  for (const n of nodes) {
    const phase = n.x * freq + time * speed;
    n.renderY += Math.sin(phase) * amp;
    n.renderX += Math.cos(phase * 0.7 + 1.2) * amp * 0.4;
  }
}

/** Column height — fbm noise + audio-driven height with phase cycling */
function modColumnHeight(nodes, audio, time, intensity, cols, rows) {
  const t = (time * 0.016) % 7; // ~7 second cycle at 60fps
  // Phase animation (inspired by shader's animHeight)
  let s = 0, hs = 1;
  let tt = remap(t, 0.5, 1.5, 0, 1);
  s = cio(tt) * 0.3;
  tt = remap(t, 2, 3.5, 0, 1);
  s += cio(tt) * 0.7;
  tt = remap(t, 5.5, 6.5, 0, 1);
  hs = 1 - cio(tt) * 0.6;
  tt = remap(t, 6.5, 7, 0, 1);
  hs *= 1 - cio(tt);

  // Rebuild hs when audio is strong
  hs = Math.max(hs, audio.rms * 1.5);
  s = Math.max(s, 0.15 + audio.rms * 1.2);

  const timeOffset = time * 0.008;
  const audioBoost = 0.3 + audio.rms * 2.5;
  const bassAdd = audio.lowEnergy * 0.35 * intensity;
  const beatPulse = audio.isBeat ? (audio.isDownbeat ? 0.3 : 0.15) * audio.beatStrength : 0;

  for (const n of nodes) {
    const nx = (n.col / cols) * s;
    const ny = (n.row / rows) * s;
    const base = fbm(nx + timeOffset, ny + timeOffset * 0.7);
    const target = (base * audioBoost + bassAdd + beatPulse) * hs * intensity;
    n.targetHeight += (target - n.targetHeight) * 0.12;
    n.height += (n.targetHeight - n.height) * 0.08;
    n.renderHeight = n.height;
  }
}

// ═══════════════════════════════════════════════════════════════════
//  ParticleSystem class
// ═══════════════════════════════════════════════════════════════════
export class ParticleSystem {
  constructor(w, h, cols, rows) {
    this.w = w;
    this.h = h;
    this.cols = cols;
    this.rows = rows;
    this.nodes = [];
    this.formation = 'grid';
    this.time = 0;
    this.ripples = [];         // active ripple instances
    this._buildNodes();
    this.applyFormation('grid');
  }

  _buildNodes() {
    this.nodes = [];
    const sx = this.w / (this.cols + 1);
    const sy = this.h / (this.rows + 1);
    let id = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.nodes.push(createNode(id++, c, r, sx * (c + 1), sy * (r + 1)));
      }
    }
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
    // update base positions
    const sx = w / (this.cols + 1);
    const sy = h / (this.rows + 1);
    for (const n of this.nodes) {
      n.baseX = sx * (n.col + 1);
      n.baseY = sy * (n.row + 1);
    }
    this.applyFormation(this.formation);
  }

  reconfigure(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this._buildNodes();
    this.applyFormation(this.formation);
  }

  applyFormation(name) {
    this.formation = name;
    const fn = formationFns[name];
    if (fn) fn(this.nodes, this.w, this.h, this.cols, this.rows, this.time);
  }

  addRipple(x, y, strength) {
    this.ripples.push({ x, y, str: strength, t: this.time });
  }

  /** Main update — call once per frame. */
  update(audio, config) {
    this.time++;
    const intensity = config.intensity ?? 0.75;
    const mods = config.modifiers || {};
    const formDef = FORMATIONS[this.formation] || FORMATIONS.grid;
    const lerpSpeed = formDef.transitionSpeed;

    // Recompute wave-surface targets (they're time-dependent)
    if (this.formation === 'waveSurface') {
      formationFns.waveSurface(this.nodes, this.w, this.h, this.cols, this.rows, this.time);
    }

    // ── Lerp toward formation targets ──
    for (const n of this.nodes) {
      n.x += (n.targetX - n.x) * lerpSpeed;
      n.y += (n.targetY - n.y) * lerpSpeed;

      // Reset render values
      n.renderX = n.x;
      n.renderY = n.y;
      n.renderScale = 1;

      // Base opacity with highlight handling
      if (n.highlighted) {
        n.highlightAge++;
        const fade = Math.max(0, 1 - n.highlightAge / 28);
        n.renderOpacity = 0.5 + fade * 0.5;
        n.renderScale = 1 + fade * 0.8;
        if (n.highlightAge > 28) { n.highlighted = false; n.highlightAge = 0; }
      } else {
        n.opacity += (0.55 + audio.rms * 0.3 - n.opacity) * 0.1;
        n.renderOpacity = n.opacity;
      }
    }

    // ── Apply modifiers ──
    const cx = this.w / 2, cy = this.h / 2;

    if (mods.pulse)           modPulse(this.nodes, audio, this.time, intensity);
    if (mods.highlight)       modHighlight(this.nodes, audio, this.time, intensity);
    if (mods.breath)          modBreath(this.nodes, audio, this.time, intensity, cx, cy);
    if (mods.bassWarp)        modBassWarp(this.nodes, audio, this.time, intensity, this.h);
    if (mods.shimmer)         modShimmer(this.nodes, audio, this.time, intensity);
    if (mods.wavePropagation) modWavePropagation(this.nodes, audio, this.time, intensity);
    if (mods.columnHeight)    modColumnHeight(this.nodes, audio, this.time, intensity, this.cols, this.rows);

    // Beat → spawn ripple; downbeats spawn from center with more strength
    if (mods.ripple && audio.isBeat) {
      const spread = audio.isDownbeat ? 0.15 : 0.4;
      const str = audio.isDownbeat
        ? 0.8 + audio.lowEnergy * 0.6
        : 0.5 + audio.lowEnergy * 0.8;
      this.addRipple(
        cx + (Math.random() - 0.5) * this.w * spread,
        cy + (Math.random() - 0.5) * this.h * spread,
        str,
      );
    }

    // Prune old ripples
    this.ripples = this.ripples.filter(r => this.time - r.t < 90);
    if (mods.ripple) modRipple(this.ripples, this.nodes, this.time, intensity);
  }

  /** Returns grid-neighbor connection pairs [i, j, normalizedDist]. */
  getConnections(maxDist) {
    const out = [];
    for (const n of this.nodes) {
      const { col, row } = n;
      // right
      if (col < this.cols - 1) {
        const j = row * this.cols + col + 1;
        const m = this.nodes[j];
        const d = Math.hypot(n.renderX - m.renderX, n.renderY - m.renderY);
        if (d < maxDist) out.push([n, m, d / maxDist]);
      }
      // below
      if (row < this.rows - 1) {
        const j = (row + 1) * this.cols + col;
        const m = this.nodes[j];
        const d = Math.hypot(n.renderX - m.renderX, n.renderY - m.renderY);
        if (d < maxDist) out.push([n, m, d / maxDist]);
      }
    }
    return out;
  }
}
