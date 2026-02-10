import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

// ── Helpers ──────────────────────────────────────────────────────────

function hexToVec3(hex) {
  return new THREE.Color(hex);
}

function buildLayout(count, radius) {
  const offsets = new Float32Array(count * 2);
  const freqUVs = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const r = radius * Math.sqrt(i / count);
    const theta = i * goldenAngle;
    offsets[i * 2] = r * Math.cos(theta);
    offsets[i * 2 + 1] = r * Math.sin(theta);
    freqUVs[i] = r / radius;
  }
  return { offsets, freqUVs };
}

// ── Vertex Shader — ports original animHeight with noise + FFT ──────

const vertexShader = /* glsl */ `
  attribute vec2 aOffset;
  attribute float aFreqUV;

  uniform sampler2D uFFT;
  uniform float uTime;
  uniform float uRMS;
  uniform float uLow;
  uniform float uBeatPulse;
  uniform float uBeatStrength;

  varying float vWorldY;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

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
    // Base height from original animation
    float baseHeight = animHeight(aOffset) * 0.5;

    // Per-column FFT modulation
    float fftVal = texture2D(uFFT, vec2(aFreqUV, 0.5)).r;

    // Combine: base noise animation + per-column FFT response
    float columnHeight = max(0.01, baseHeight + fftVal * 0.5);

    // Scale box (matching original box half-size 0.03)
    vec3 scaled = position;
    scaled.xz *= 0.06;
    scaled.y *= columnHeight;
    scaled.y += columnHeight * 0.5;

    scaled.x += aOffset.x;
    scaled.z += aOffset.y;

    vWorldY = scaled.y;
    vWorldPos = (modelMatrix * vec4(scaled, 1.0)).xyz;
    vNormal = normalMatrix * normal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(scaled, 1.0);
  }
`;

// ── Fragment Shader — ports original coloring + ACES ────────────────

const fragmentShader = /* glsl */ `
  uniform vec3 uColorBase;
  uniform vec3 uColorGlow;
  uniform vec3 uColorBg;
  uniform float uBeatPulse;

  varying float vWorldY;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  vec3 acesFilm(vec3 x) {
    float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
  }

  void main() {
    // Match original: colorBase * 7.0 * pow(y, 4)
    vec3 col = uColorBase * 7.0 * pow(max(vWorldY, 0.0), 4.0);

    // Disc edge fade (from original)
    col *= smoothstep(0.0, -1.0, length(vWorldPos.xz) - 5.0);

    // Simple directional lighting
    vec3 n = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
    float diff = max(dot(n, lightDir), 0.0);
    col *= (0.8 + diff * 0.2);

    // Glow contribution (simulates volumetric light from original)
    float glowFactor = pow(max(vWorldY, 0.0), 3.0) * 0.05;
    col += uColorGlow * glowFactor * 1.6;

    // Beat emissive pulse
    col += uColorGlow * uBeatPulse * max(vWorldY, 0.0) * 0.3;

    // ACES tonemapping (from original shader)
    col = acesFilm(col * 0.5);
    col = pow(col, vec3(1.0 / 2.2));

    // Background blend (from original shader)
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

  const { columnCount, discRadius, bloomIntensity, bloomThreshold, bloomRadius } = config;

  const { offsets, freqUVs } = useMemo(
    () => buildLayout(columnCount, discRadius),
    [columnCount, discRadius],
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

  // Set up instanced attributes
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const geo = mesh.geometry;
    geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 2));
    geo.setAttribute('aFreqUV', new THREE.InstancedBufferAttribute(freqUVs, 1));
  }, [offsets, freqUVs]);

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
      u.uBeatStrength.value = audio.beatStrength || 0;

      if (audio.isBeat) {
        beatPulseRef.current = 1;
      }
      beatPulseRef.current *= 0.9;
      u.uBeatPulse.value = beatPulseRef.current;

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

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 3]} intensity={0.8} />
      <pointLight position={[0, 6, 0]} intensity={1.5} color="#ffffff" distance={20} decay={2} />

      {/* Instanced columns */}
      <instancedMesh
        ref={meshRef}
        args={[null, null, columnCount]}
        material={shaderMaterial}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>

      {/* Post-processing */}
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
