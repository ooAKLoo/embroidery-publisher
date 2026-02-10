import { PALETTES } from '../MusicNarrativeEngine/presets';

// ═══════════════════════════════════════════════════════════════════
//  GLSL Shader source — ported from the reference shader
// ═══════════════════════════════════════════════════════════════════
const VERT_SRC = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG_SRC = `
precision mediump float;

uniform float iTime;
uniform vec2  iResolution;
uniform float uRMS;
uniform float uLow;
uniform float uMid;
uniform float uHigh;
uniform float uBeat;
uniform float uBeatStrength;
uniform vec3  uColorBase;   // palette node color
uniform vec3  uColorGlow;   // palette glow color
uniform vec3  uColorBg;     // palette background

#define PI 3.141592
#define TAU (PI*2.0)

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 ip = floor(p);
  vec2 u = fract(p);
  u = u*u*(3.0-2.0*u);
  float res = mix(
    mix(rand(ip), rand(ip+vec2(1.0,0.0)), u.x),
    mix(rand(ip+vec2(0.0,1.0)), rand(ip+vec2(1.0,1.0)), u.x), u.y);
  return res*res;
}

float fbm(vec2 p) {
  float r = 0.0, amp = 1.0, freq = 1.0;
  for(int i = 0; i < 3; i++) {
    r += amp * noise(freq*p);
    amp *= 0.5;
    freq *= 2.0;
  }
  return r;
}

float remap(float val, float im, float ix, float om, float ox) {
  return clamp(om + (val - im) * (ox - om) / (ix - im), om, ox);
}

float cio(float t) {
  return t < 0.5
    ? 0.5 * (1.0 - sqrt(1.0 - 4.0*t*t))
    : 0.5 * (sqrt((3.0 - 2.0*t) * (2.0*t - 1.0)) + 1.0);
}

mat2 rot(float th) {
  vec2 a = sin(vec2(1.5707963, 0.0) + th);
  return mat2(a, -a.y, a.x);
}

float animHeight(vec2 p) {
  float s = 0.0, hs = 1.0;
  float t = mod(iTime, 7.0);

  float tt = remap(t, 1.0, 2.0, 0.0, 1.0);
  s = mix(0.0, 0.3, cio(tt));
  tt = remap(t, 3.0, 4.0, 0.0, 1.0);
  p *= rot(cio(tt) * 3.0);
  tt = remap(t, 4.0, 5.0, 0.0, 1.0);
  s = mix(s, 1.0, cio(tt));
  tt = remap(t, 5.0, 6.0, 0.0, 1.0);
  p *= rot(-cio(tt) * 3.0);
  tt = remap(t, 6.5, 7.0, 0.0, 1.0);
  p *= rot(cio(tt) * 1.0);
  hs = mix(1.0, 0.0, cio(tt));

  float pls = (sin(t * TAU - PI*0.5) * 0.5 + 0.5) * step(mod(t, 2.0), 1.0) * 0.2;

  // Audio modulation
  float audioBoost = 0.3 + uRMS * 2.5;
  hs = max(hs, uRMS * 1.5);
  s = max(s, 0.15 + uRMS * 1.2);

  float h = (fbm(p * s + iTime * 0.5) + pls) * hs;
  h *= audioBoost;
  h += uLow * 0.3;
  h += uBeat * 0.2 * uBeatStrength;
  return h;
}

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, 0.0));
}

vec2 rep(vec2 p, vec2 c) {
  return mod(p, c) - 0.5*c;
}

float map(vec3 p) {
  float bd = length(p.xz) - 5.0;
  if (bd > 0.1) return bd;
  vec2 id = floor(p.xz / 0.2);
  float height = animHeight(id * 0.2) * 0.5;
  p.xz = rep(p.xz, vec2(0.2));
  p.y -= height;
  float box = sdBox(p, vec3(0.03, height, 0.03));
  return max(box, bd) * 0.5;
}

vec2 trace(vec3 p, vec3 ray, float mx) {
  float t = 0.0;
  float dist;
  for (int i = 0; i < 96; i++) {
    vec3 pos = p + ray * t;
    dist = map(pos);
    if (dist < 0.002 || t > mx) break;
    t += dist;
  }
  return vec2(t, dist);
}

vec3 getColor(vec3 p, vec3 ray) {
  vec2 t = trace(p, ray, 100.0);
  vec3 pos = p + ray * t.x;
  if (t.x > 100.0) return vec3(0.0);
  vec3 col = uColorBase * 7.0 * pow(pos.y, 4.0) * smoothstep(0.0, -1.0, length(pos.xz) - 5.0);
  return max(col, vec3(0.0));
}

mat3 camera(vec3 ro, vec3 ta, float cr) {
  vec3 cw = normalize(ta - ro);
  vec3 cp = vec3(sin(cr), cos(cr), 0.0);
  vec3 cu = normalize(cross(cw, cp));
  vec3 cv = normalize(cross(cu, cw));
  return mat3(cu, cv, cw);
}

vec3 acesFilm(vec3 x) {
  float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
  return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 p = (fragCoord * 2.0 - iResolution) / min(iResolution.x, iResolution.y);

  float t = iTime * 0.1;
  vec3 ro = vec3(cos(t) * 10.0, 5.5, sin(t) * 10.0);
  vec3 ta = vec3(0.0, 1.0, 0.0);
  mat3 c = camera(ro, ta, 0.0);
  vec3 ray = c * normalize(vec3(p, 2.5));
  vec3 col = getColor(ro, ray);

  // Volumetric light
  vec3 lp = vec3(0.0, 6.0, 0.0);
  vec3 rd = ray;
  float s = 7.5, vol = 0.0;
  for(int i = 0; i < 40; i++) {
    vec3 pos = ro + rd * s;
    vec3 v = -normalize(lp - pos);
    float tt = -(lp.y - 2.0) / v.y;
    vec3 ppos = lp + v * tt;
    vol += pow(animHeight(ppos.xz), 3.0) * 0.05 * smoothstep(0.0, 1.5, pos.y) * smoothstep(-1.0, -4.0, length(ppos.xz) - 5.0);
    s += 0.15;
  }

  col += 1.6 * vec3(uColorGlow.r * vol, uColorGlow.g * vol, uColorGlow.b * vol);

  // ACES tonemapping
  col = acesFilm(col * 0.5);
  col = pow(col, vec3(1.0/2.2));

  // Mix with background color
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(uColorBg, col, smoothstep(0.0, 0.02, lum));

  gl_FragColor = vec4(col, 1.0);
}`;

// ═══════════════════════════════════════════════════════════════════
//  WebGL shader background
// ═══════════════════════════════════════════════════════════════════
class ShaderBackground {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.gl = this.canvas.getContext('webgl', { alpha: false, antialias: false, preserveDrawingBuffer: false });
    if (!this.gl) {
      this.failed = true;
      return;
    }
    this.failed = false;
    this._initGL();
  }

  _initGL() {
    const gl = this.gl;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, VERT_SRC);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, FRAG_SRC);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.warn('Shader compile error:', gl.getShaderInfoLog(fs));
      this.failed = true;
      return;
    }

    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.warn('Shader link error:', gl.getProgramInfoLog(this.program));
      this.failed = true;
      return;
    }

    gl.useProgram(this.program);

    // Fullscreen quad
    const quad = new Float32Array([-1,-1, 1,-1, -1,1, 1,1]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    this.uniforms = {
      iTime:         gl.getUniformLocation(this.program, 'iTime'),
      iResolution:   gl.getUniformLocation(this.program, 'iResolution'),
      uRMS:          gl.getUniformLocation(this.program, 'uRMS'),
      uLow:          gl.getUniformLocation(this.program, 'uLow'),
      uMid:          gl.getUniformLocation(this.program, 'uMid'),
      uHigh:         gl.getUniformLocation(this.program, 'uHigh'),
      uBeat:         gl.getUniformLocation(this.program, 'uBeat'),
      uBeatStrength: gl.getUniformLocation(this.program, 'uBeatStrength'),
      uColorBase:    gl.getUniformLocation(this.program, 'uColorBase'),
      uColorGlow:    gl.getUniformLocation(this.program, 'uColorGlow'),
      uColorBg:      gl.getUniformLocation(this.program, 'uColorBg'),
    };

    this._startTime = performance.now() / 1000;
    this._beatDecay = 0;
  }

  resize(w, h) {
    if (this.failed) return;
    const scale = 0.5;
    this.canvas.width = Math.floor(w * scale);
    this.canvas.height = Math.floor(h * scale);
  }

  render(audio, palette) {
    if (this.failed) return;
    const gl = this.gl;
    const u = this.uniforms;

    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);

    const now = performance.now() / 1000 - this._startTime;
    gl.uniform1f(u.iTime, now);
    gl.uniform2f(u.iResolution, this.canvas.width, this.canvas.height);

    gl.uniform1f(u.uRMS, audio.rms || 0);
    gl.uniform1f(u.uLow, audio.lowEnergy || 0);
    gl.uniform1f(u.uMid, audio.midEnergy || 0);
    gl.uniform1f(u.uHigh, audio.highEnergy || 0);

    if (audio.isBeat) this._beatDecay = 1;
    this._beatDecay *= 0.9;
    gl.uniform1f(u.uBeat, this._beatDecay);
    gl.uniform1f(u.uBeatStrength, audio.beatStrength || 0);

    const pal = palette || { node: '#4d80cc', glow: '#3366bb', bg: '#060614' };
    gl.uniform3fv(u.uColorBase, hexToVec3(pal.node));
    gl.uniform3fv(u.uColorGlow, hexToVec3(pal.glow));
    gl.uniform3fv(u.uColorBg, hexToVec3(pal.bg));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  destroy() {
    if (this.gl) {
      const ext = this.gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════
//  Utility
// ═══════════════════════════════════════════════════════════════════
function hexToVec3(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

/**
 * CanvasRenderer — draws WebGL shader column array with vignette overlay.
 */
export class CanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this._bg = new ShaderBackground();
  }

  render(audio, config) {
    const { ctx, canvas } = this;
    const W = canvas.width / (window.devicePixelRatio || 1);
    const H = canvas.height / (window.devicePixelRatio || 1);
    const pal = PALETTES[config.palette] || PALETTES.cosmic;

    // WebGL shader background
    if (!this._bg.failed) {
      if (this._bg.canvas.width !== Math.floor(W * 0.5) || this._bg.canvas.height !== Math.floor(H * 0.5)) {
        this._bg.resize(W, H);
      }
      this._bg.render(audio, pal);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.drawImage(this._bg.canvas, 0, 0, W, H);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, 0, W, H);
    }

    // Vignette
    const vig = ctx.createRadialGradient(W / 2, H / 2, W * 0.22, W / 2, H / 2, W * 0.68);
    vig.addColorStop(0, 'transparent');
    vig.addColorStop(1, pal.bg + 'aa');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Beat flash overlay
    if (audio.isBeat) {
      const alpha = audio.isDownbeat ? '24' : '12';
      const radius = audio.isDownbeat ? 0.55 : 0.45;
      const flash = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * radius);
      flash.addColorStop(0, pal.glow + alpha);
      flash.addColorStop(1, 'transparent');
      ctx.fillStyle = flash;
      ctx.fillRect(0, 0, W, H);
    }
  }

  destroy() {
    this._bg?.destroy();
  }
}
