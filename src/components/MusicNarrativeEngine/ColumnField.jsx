import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { VIZ_MODES } from './presets';

// ── Helpers ──────────────────────────────────────────────────────────

function hexToVec3(hex) {
  return new THREE.Color(hex);
}

// ── Shape helpers ────────────────────────────────────────────────────

/** 5-pointed star: boundary radius at a given polar angle */
function starBoundaryR(angle, R) {
  const n = 5, innerRatio = 0.4;
  const sector = (2 * Math.PI) / n;
  const halfSector = sector / 2;
  const a = ((angle % sector) + sector) % sector;
  const t = 1 - Math.abs(a - halfSector) / halfSector; // 1 at tip, 0 at valley
  return R * (innerRatio + t * (1 - innerRatio));
}

/** Heart implicit test: (x²+y²−1)³ − x²y³ ≤ 0 */
function insideHeart(px, pz, R) {
  const s = R * 0.82;
  const hx = px / s, hy = -pz / s;
  const t = hx * hx + hy * hy - 1;
  return t * t * t - hx * hx * hy * hy * hy <= 0;
}

/** Heart boundary radius at a given polar angle (binary search) */
function heartBoundaryR(angle, R) {
  const s = R * 0.82;
  const dx = Math.cos(angle), dz = Math.sin(angle);
  let lo = 0, hi = R * 1.5;
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2;
    const hx = mid * dx / s, hy = -mid * dz / s;
    const t = hx * hx + hy * hy - 1;
    if (t * t * t - hx * hx * hy * hy * hy <= 0) lo = mid; else hi = mid;
  }
  return lo;
}

/** Hex distance (flat-top hex) */
function hexDist(x, z) {
  return Math.max(Math.abs(x) * 0.866025 + Math.abs(z) * 0.5, Math.abs(z));
}

// ── Layout builder ───────────────────────────────────────────────────

function buildLayout(count, radius, mode, shape) {
  const offsets = new Float32Array(count * 2);
  const freqUVs = new Float32Array(count);
  const edgeDists = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  // ── 1. Generate positions per shape ────────────────────────────
  switch (shape) {
    case 'square': {
      const side = Math.ceil(Math.sqrt(count));
      const step = (2 * radius) / side;
      for (let i = 0; i < count; i++) {
        offsets[i * 2]     = -radius + (i % side + 0.5) * step;
        offsets[i * 2 + 1] = -radius + (Math.floor(i / side) + 0.5) * step;
      }
      break;
    }
    case 'hex': {
      // Hex grid clipped to hexagonal boundary
      const area = 2 * Math.sqrt(3) * radius * radius;
      const stepX = Math.sqrt((area / count) * 2 / Math.sqrt(3));
      const stepZ = stepX * Math.sqrt(3) / 2;
      const ext = radius + stepX;
      const cols = Math.ceil(2 * ext / stepX);
      const rows = Math.ceil(2 * ext / stepZ);
      const tmp = [];
      for (let r = 0; r < rows; r++) {
        const z = -ext + r * stepZ + stepZ * 0.5;
        const xOff = (r % 2) * stepX * 0.5;
        for (let c = 0; c < cols; c++) {
          const x = -ext + c * stepX + xOff + stepX * 0.5;
          if (hexDist(x, z) <= radius) tmp.push(x, z);
        }
      }
      const n = Math.min(count, tmp.length / 2);
      for (let i = 0; i < n; i++) { offsets[i * 2] = tmp[i * 2]; offsets[i * 2 + 1] = tmp[i * 2 + 1]; }
      break;
    }
    case 'ring': {
      const innerR = radius * 0.45;
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(innerR * innerR + (radius * radius - innerR * innerR) * (i / count));
        const theta = i * goldenAngle;
        offsets[i * 2] = r * Math.cos(theta);
        offsets[i * 2 + 1] = r * Math.sin(theta);
      }
      break;
    }
    case 'star': {
      const over = Math.ceil(count * 2.8);
      let idx = 0;
      for (let i = 0; i < over && idx < count; i++) {
        const r = radius * Math.sqrt(i / over);
        const theta = i * goldenAngle;
        if (r > starBoundaryR(theta, radius)) continue;
        offsets[idx * 2] = r * Math.cos(theta);
        offsets[idx * 2 + 1] = r * Math.sin(theta);
        idx++;
      }
      break;
    }
    case 'heart': {
      const over = Math.ceil(count * 3.5);
      let idx = 0;
      for (let i = 0; i < over && idx < count; i++) {
        const r = radius * 1.2 * Math.sqrt(i / over);
        const theta = i * goldenAngle;
        const x = r * Math.cos(theta), z = r * Math.sin(theta);
        if (!insideHeart(x, z, radius)) continue;
        offsets[idx * 2] = x;
        offsets[idx * 2 + 1] = z;
        idx++;
      }
      break;
    }
    default: // disc
      for (let i = 0; i < count; i++) {
        const r = radius * Math.sqrt(i / count);
        const theta = i * goldenAngle;
        offsets[i * 2] = r * Math.cos(theta);
        offsets[i * 2 + 1] = r * Math.sin(theta);
      }
  }

  // ── 2. Compute freqUVs + edgeDists ────────────────────────────
  for (let i = 0; i < count; i++) {
    const x = offsets[i * 2], z = offsets[i * 2 + 1];
    const dist = Math.sqrt(x * x + z * z);
    const normR = Math.min(1, dist / radius);

    // ─ freqUV (viz mode) ─
    switch (mode) {
      case 'spectralRing':
        if (normR < 0.4) freqUVs[i] = (normR / 0.4) * 0.15;
        else if (normR < 0.75) freqUVs[i] = 0.15 + ((normR - 0.4) / 0.35) * 0.35;
        else freqUVs[i] = 0.5 + ((normR - 0.75) / 0.25) * 0.5;
        break;
      case 'logSpiral':
        freqUVs[i] = Math.log(1 + normR * 9) / Math.log(10);
        break;
      case 'unified':
        freqUVs[i] = 0.5;
        break;
      case 'aurora': {
        const angle = Math.atan2(z, x);
        freqUVs[i] = (angle + Math.PI) / (2 * Math.PI);
        break;
      }
      default: // ripple
        freqUVs[i] = normR;
    }

    // ─ edgeDist (shape) — normalized so 0.2 ≈ 1-unit fade at R=5 ─
    switch (shape) {
      case 'square':
        edgeDists[i] = Math.max(0, Math.min(radius - Math.abs(x), radius - Math.abs(z)) / radius);
        break;
      case 'hex':
        edgeDists[i] = Math.max(0, (radius - hexDist(x, z)) / radius);
        break;
      case 'ring': {
        const innerR = radius * 0.45;
        const midR = (innerR + radius) / 2;
        const halfW = (radius - innerR) / 2;
        edgeDists[i] = Math.max(0, (halfW - Math.abs(dist - midR)) / radius);
        break;
      }
      case 'star': {
        const a = Math.atan2(z, x);
        edgeDists[i] = Math.max(0, (starBoundaryR(a, radius) - dist) / radius);
        break;
      }
      case 'heart': {
        const a = Math.atan2(z, x);
        const bR = heartBoundaryR(a, radius);
        edgeDists[i] = bR > 0.01 ? Math.max(0, (bR - dist) / radius) : 0;
        break;
      }
      default: // disc
        edgeDists[i] = Math.max(0, 1 - normR);
    }
  }

  return { offsets, freqUVs, edgeDists };
}

// ── Vertex Shader ────────────────────────────────────────────────────

const vertexShader = /* glsl */ `
  attribute vec2 aOffset;
  attribute float aFreqUV;
  attribute float aEdgeDist;

  uniform sampler2D uFFT;
  uniform float uTime;
  uniform float uRMS;
  uniform float uLow;
  uniform float uBeatPulse;
  uniform float uBeatStrength;

  uniform int uMode;
  uniform float uMid;
  uniform float uHigh;
  uniform float uSpectralCentroid;
  uniform float uBeatTime;
  uniform float uFFTWeight;
  uniform float uGlobalWeight;

  varying float vWorldY;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vFreqUV;
  varying float vEdgeDist;

  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 ip = floor(p);
    vec2 u = fract(p);
    u = u * u * (3.0 - 2.0 * u);
    float res = mix(
      mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
      mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
    return res * res;
  }

  float fbm(vec2 p) {
    float r = 0.0, amp = 1.0, freq = 1.0;
    for (int i = 0; i < 3; i++) {
      r += amp * noise(freq * p);
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
      ? 0.5 * (1.0 - sqrt(1.0 - 4.0 * t * t))
      : 0.5 * (sqrt((3.0 - 2.0 * t) * (2.0 * t - 1.0)) + 1.0);
  }

  mat2 rot(float th) {
    vec2 a = sin(vec2(1.5707963, 0.0) + th);
    return mat2(a, -a.y, a.x);
  }

  float animHeight(vec2 p) {
    float PI = 3.141592;
    float TAU = PI * 2.0;
    float s = 0.0, hs = 1.0;
    float t = mod(uTime, 7.0);
    float tt;

    tt = remap(t, 1.0, 2.0, 0.0, 1.0);
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

    float pls = (sin(t * TAU - PI * 0.5) * 0.5 + 0.5) * step(mod(t, 2.0), 1.0) * 0.2;

    float audioBoost = 0.3 + uRMS * 2.5;
    hs = max(hs, uRMS * 1.5);
    s = max(s, 0.15 + uRMS * 1.2);

    float h = (fbm(p * s + uTime * 0.5) + pls) * hs;
    h *= audioBoost;
    h += uLow * 0.3;
    h += uBeatPulse * 0.2 * uBeatStrength;
    return h;
  }

  void main() {
    float PI = 3.141592;
    float TAU = PI * 2.0;

    // Base height from original animation
    float baseHeight = animHeight(aOffset) * 0.5;

    // Per-column FFT modulation
    float fftVal = texture2D(uFFT, vec2(aFreqUV, 0.5)).r;

    // Weighted combination
    float columnHeight = baseHeight * uGlobalWeight + fftVal * uFFTWeight;

    // === Mode-specific shader logic ===

    // Mode 0: Ripple — beat-triggered outward wave
    if (uMode == 0) {
      float timeSinceBeat = uTime - uBeatTime;
      float dist = aFreqUV;
      float speed = 2.5;
      float waveFront = timeSinceBeat * speed;
      float wave = exp(-pow(dist - waveFront, 2.0) * 40.0);
      float decay = exp(-timeSinceBeat * 3.0);
      columnHeight += wave * decay * uBeatStrength * 0.8;
    }

    // Mode 1: Spectral Ring — add band energy per ring zone
    if (uMode == 1) {
      float bandEnergy = 0.0;
      if (aFreqUV < 0.15) bandEnergy = uLow;
      else if (aFreqUV < 0.5) bandEnergy = uMid;
      else bandEnergy = uHigh;
      columnHeight += bandEnergy * 0.4;
    }

    // Mode 4: Aurora — flowing waveform driven by RMS envelope
    if (uMode == 4) {
      float flow = sin(aFreqUV * TAU + uTime * 0.8 + uSpectralCentroid * TAU);
      float envelope = uRMS * 1.5;
      columnHeight += flow * envelope * 0.3;
    }

    columnHeight = max(0.01, columnHeight);

    // Scale box
    vec3 scaled = position;
    scaled.xz *= 0.06;
    scaled.y *= columnHeight;
    scaled.y += columnHeight * 0.5;

    scaled.x += aOffset.x;
    scaled.z += aOffset.y;

    vWorldY = scaled.y;
    vWorldPos = (modelMatrix * vec4(scaled, 1.0)).xyz;
    vNormal = normalMatrix * normal;
    vFreqUV = aFreqUV;
    vEdgeDist = aEdgeDist;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// ── Fragment Shader ──────────────────────────────────────────────────

const fragmentShader = /* glsl */ `
  uniform vec3 uColorBase;
  uniform vec3 uColorGlow;
  uniform vec3 uColorBg;
  uniform float uBeatPulse;
  uniform int uMode;
  uniform float uSpectralCentroid;

  varying float vWorldY;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vFreqUV;
  varying float vEdgeDist;

  vec3 acesFilm(vec3 x) {
    float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    vec3 col = uColorBase * 7.0 * pow(max(vWorldY, 0.0), 4.0);

    // Edge fade — driven by per-instance distance to shape boundary
    col *= smoothstep(0.0, 0.2, vEdgeDist);

    // Directional lighting
    vec3 n = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diff = max(dot(n, lightDir), 0.0);
    col *= (0.8 + diff * 0.2);

    // Glow
    float glowFactor = pow(max(vWorldY, 0.0), 3.0) * 0.05;
    col += uColorGlow * glowFactor * 1.6;

    // Beat emissive pulse
    col += uColorGlow * uBeatPulse * max(vWorldY, 0.0) * 0.3;

    // Aurora mode: tint color temperature by spectral centroid
    if (uMode == 4) {
      float warmth = uSpectralCentroid;
      vec3 warmTint = vec3(1.08, 1.0, 0.92);
      vec3 coolTint = vec3(0.92, 0.97, 1.08);
      col *= mix(coolTint, warmTint, warmth);
    }

    col = acesFilm(col * 0.5);
    col = pow(col, vec3(1.0 / 2.2));

    float lum = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(uColorBg, col, smoothstep(0.0, 0.02, lum));

    gl_FragColor = vec4(col, 1.0);
  }
`;

// ── CameraRig ────────────────────────────────────────────────────────

function CameraRig({ config, beatPulseRef }) {
  const { cameraOrbitSpeed, cameraDistance, cameraHeight } = config;

  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime() * cameraOrbitSpeed;
    const shake = (beatPulseRef.current || 0) * 0.15;
    camera.position.set(
      Math.cos(t) * cameraDistance,
      cameraHeight + shake,
      Math.sin(t) * cameraDistance,
    );
    camera.lookAt(0, 1, 0);
  });

  return null;
}

// ── Main scene component ─────────────────────────────────────────────

export default function ColumnField({ analyzerRef, palette, config }) {
  const meshRef = useRef();
  const beatPulseRef = useRef(0);
  const beatTimeRef = useRef(0);

  const { columnCount, discRadius, bloomIntensity, bloomThreshold, bloomRadius, vizMode, layoutShape } = config;

  const modeKey = vizMode || 'logSpiral';
  const shapeKey = layoutShape || 'disc';
  const modeInfo = VIZ_MODES[modeKey] || VIZ_MODES.logSpiral;

  const { offsets, freqUVs, edgeDists } = useMemo(
    () => buildLayout(columnCount, discRadius, modeKey, shapeKey),
    [columnCount, discRadius, modeKey, shapeKey],
  );

  const fftTexture = useMemo(() => {
    const size = 512;
    const data = new Uint8Array(size);
    const tex = new THREE.DataTexture(data, size, 1, THREE.RedFormat, THREE.UnsignedByteType);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }, []);

  const shaderMaterial = useMemo(() => {
    const pal = palette || {};
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFFT: { value: fftTexture },
        uTime: { value: 0 },
        uRMS: { value: 0 },
        uLow: { value: 0 },
        uBeatPulse: { value: 0 },
        uBeatStrength: { value: 0 },
        uColorBase: { value: hexToVec3(pal.node || '#c4b5fd') },
        uColorGlow: { value: hexToVec3(pal.glow || '#8b5cf6') },
        uColorBg: { value: hexToVec3(pal.bg || '#08081a') },
        uMode: { value: modeInfo.id },
        uMid: { value: 0 },
        uHigh: { value: 0 },
        uSpectralCentroid: { value: 0 },
        uBeatTime: { value: 0 },
        uFFTWeight: { value: modeInfo.fftWeight },
        uGlobalWeight: { value: modeInfo.globalWeight },
      },
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update palette uniforms
  useEffect(() => {
    if (!shaderMaterial || !palette) return;
    shaderMaterial.uniforms.uColorBase.value.set(palette.node);
    shaderMaterial.uniforms.uColorGlow.value.set(palette.glow);
    shaderMaterial.uniforms.uColorBg.value.set(palette.bg);
  }, [palette, shaderMaterial]);

  // Update mode uniforms when vizMode changes
  useEffect(() => {
    if (!shaderMaterial) return;
    const info = VIZ_MODES[modeKey] || VIZ_MODES.logSpiral;
    shaderMaterial.uniforms.uMode.value = info.id;
    shaderMaterial.uniforms.uFFTWeight.value = info.fftWeight;
    shaderMaterial.uniforms.uGlobalWeight.value = info.globalWeight;
  }, [modeKey, shaderMaterial]);

  // Set up instanced attributes
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const geo = mesh.geometry;
    geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 2));
    geo.setAttribute('aFreqUV', new THREE.InstancedBufferAttribute(freqUVs, 1));
    geo.setAttribute('aEdgeDist', new THREE.InstancedBufferAttribute(edgeDists, 1));
  }, [offsets, freqUVs, edgeDists]);

  // Per-frame update
  useFrame(({ clock }) => {
    const u = shaderMaterial.uniforms;
    u.uTime.value = clock.getElapsedTime();

    const analyzer = analyzerRef?.current;
    if (analyzer && analyzer.ready) {
      const audio = analyzer.analyze();
      const freqData = analyzer.getFrequencyData();

      u.uRMS.value = audio.rms || 0;
      u.uLow.value = audio.lowEnergy || 0;
      u.uMid.value = audio.midEnergy || 0;
      u.uHigh.value = audio.highEnergy || 0;
      u.uSpectralCentroid.value = audio.spectralCentroid || 0;
      u.uBeatStrength.value = audio.beatStrength || 0;

      if (audio.isBeat) {
        beatPulseRef.current = 1;
        beatTimeRef.current = clock.getElapsedTime();
      }
      beatPulseRef.current *= 0.9;
      u.uBeatPulse.value = beatPulseRef.current;
      u.uBeatTime.value = beatTimeRef.current;

      if (freqData && fftTexture.image) {
        const texData = fftTexture.image.data;
        const len = Math.min(freqData.length, texData.length);
        for (let i = 0; i < len; i++) {
          texData[i] = Math.floor(freqData[i] * 255);
        }
        fftTexture.needsUpdate = true;
      }
    }
  });

  // Cleanup
  useEffect(() => {
    return () => {
      fftTexture.dispose();
      shaderMaterial.dispose();
    };
  }, [fftTexture, shaderMaterial]);

  return (
    <>
      <CameraRig config={config} beatPulseRef={beatPulseRef} />

      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 3]} intensity={0.8} />
      <pointLight position={[0, 6, 0]} intensity={1.5} color="#ffffff" distance={20} decay={2} />

      <instancedMesh
        ref={meshRef}
        args={[null, null, columnCount]}
        material={shaderMaterial}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={bloomThreshold}
          luminanceSmoothing={bloomRadius}
          mipmapBlur
        />
        <Vignette darkness={0.7} offset={0.3} />
      </EffectComposer>
    </>
  );
}
