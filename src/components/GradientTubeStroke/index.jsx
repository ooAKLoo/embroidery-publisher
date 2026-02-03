import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

const DEFAULTS = {
  radius: 0.32,
  tubularSegments: 520,
  radialSegments: 24,
  colorA: '#00d4ff',
  colorB: '#6b6bff',
  colorC: '#ff6bd6',
  fresnelPower: 2.2,
  fresnelIntensity: 0.8,
  bloomThreshold: 0.85,
  bloomStrength: 0.55,
  bloomRadius: 0.18,
  background: '#ffffff',
  svgScale: 0.06
};

function buildLoopCurve(scale = 4.2, zScale = 1.2) {
  const points = [];
  const steps = 360;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2;
    const wobble = Math.sin(angle * 2.5) * 0.25 + Math.cos(angle * 1.5) * 0.15;
    const x = Math.sin(angle) * scale + Math.sin(angle * 3) * 0.6 + wobble;
    const y = Math.cos(angle * 0.9) * (scale * 0.6) + Math.sin(angle * 2.2) * 0.8;
    const z = Math.sin(angle * 1.6) * zScale + Math.cos(angle * 0.7) * 0.6;
    points.push(new THREE.Vector3(x, y, z));
  }

  return new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.12);
}

function buildCurveFromSvgPath(pathD, scale = 0.06, maxPoints = 520) {
  if (!pathD?.trim()) return null;
  if (pathD.length > 50000) {
    throw new Error('SVG path 太长，已拒绝加载');
  }

  const svgText = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${pathD}" /></svg>`;
  const loader = new SVGLoader();
  const data = loader.parse(svgText);

  if (!data?.paths?.length) return null;

  const candidate = data.paths
    .map(path => {
      const points = path.subPaths.flatMap(subPath => {
        const length = typeof subPath.getLength === 'function' ? subPath.getLength() : 200;
        const segments = Math.min(420, Math.max(120, Math.floor(length / 1.6)));
        return typeof subPath.getSpacedPoints === 'function'
          ? subPath.getSpacedPoints(segments)
          : subPath.getPoints(segments);
      });
      return { path, points };
    })
    .filter(item => item.points.length > 4)
    .sort((a, b) => b.points.length - a.points.length)[0];

  if (!candidate) return null;

  let { points } = candidate;
  if (points.length > maxPoints) {
    const step = Math.ceil(points.length / maxPoints);
    points = points.filter((_, index) => index % step === 0);
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  points.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const curvePoints = points.map((point, index) => {
    const t = points.length > 1 ? index / (points.length - 1) : 0;
    const x = (point.x - centerX) * scale;
    const y = -(point.y - centerY) * scale;
    const z = Math.sin(t * Math.PI * 2) * 0.25 + Math.sin(t * Math.PI * 4) * 0.08;
    return new THREE.Vector3(x, y, z);
  });

  const baseCurve = new THREE.CatmullRomCurve3(curvePoints, false, 'centripetal', 0.18);
  const targetCount = Math.min(maxPoints, Math.max(200, Math.floor(curvePoints.length * 1.1)));
  const smoothPoints = baseCurve.getSpacedPoints(targetCount);

  return {
    curve: new THREE.CatmullRomCurve3(smoothPoints, false, 'centripetal', 0.18),
    pointCount: smoothPoints.length
  };
}

function GradientTube({
  radius,
  tubularSegments,
  radialSegments,
  colorA,
  colorB,
  colorC,
  fresnelPower,
  fresnelIntensity,
  svgPath,
  svgScale,
  onSvgError
}) {
  const meshRef = useRef();

  const { geometry, error } = useMemo(() => {
    let curve = null;
    let pointCount = 0;
    let parseError = '';

    try {
      const svgResult = buildCurveFromSvgPath(svgPath, svgScale);
      if (svgResult?.curve) {
        curve = svgResult.curve;
        pointCount = svgResult.pointCount || 0;
      } else {
        curve = buildLoopCurve();
      }
    } catch (err) {
      console.error('SVG path 解析失败:', err);
      parseError = err?.message || 'SVG path 解析失败';
      curve = buildLoopCurve();
    }

    const safeTubularSegments = pointCount
      ? Math.min(tubularSegments, Math.max(120, pointCount * 2))
      : tubularSegments;

    const geometry = new THREE.TubeGeometry(curve, safeTubularSegments, radius, radialSegments, false);
    geometry.computeVertexNormals();

    return {
      geometry,
      error: parseError
    };
  }, [tubularSegments, radius, radialSegments, svgPath, svgScale]);

  useEffect(() => {
    console.log('[GradientTube] geometry built', {
      svgEnabled: Boolean(svgPath),
      svgLength: svgPath?.length || 0,
      svgScale,
      tubularSegments,
      radialSegments,
      radius,
      error
    });
    onSvgError?.(error);
  }, [error, onSvgError]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uColorA: { value: new THREE.Color(colorA) },
        uColorB: { value: new THREE.Color(colorB) },
        uColorC: { value: new THREE.Color(colorC) },
        uFresnelPower: { value: fresnelPower },
        uFresnelIntensity: { value: fresnelIntensity },
        uLightDir: { value: new THREE.Vector3(0.4, 0.8, 0.45).normalize() },
        uLightColor: { value: new THREE.Color('#ffffff') },
        uAmbient: { value: 0.32 },
        uSpecular: { value: 0.55 },
        uShininess: { value: 48.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDirW;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vNormalW = normalize(mat3(modelMatrix) * normal);
          vViewDirW = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform float uFresnelPower;
        uniform float uFresnelIntensity;
        uniform vec3 uLightDir;
        uniform vec3 uLightColor;
        uniform float uAmbient;
        uniform float uSpecular;
        uniform float uShininess;
        varying vec2 vUv;
        varying vec3 vNormalW;
        varying vec3 vViewDirW;

        void main() {
          float t = clamp(vUv.x, 0.0, 1.0);
          vec3 grad = mix(uColorA, uColorB, smoothstep(0.0, 0.5, t));
          grad = mix(grad, uColorC, smoothstep(0.5, 1.0, t));

          vec3 normalW = normalize(vNormalW);
          vec3 viewDirW = normalize(vViewDirW);
          vec3 lightDirW = normalize(uLightDir);

          float diffuse = max(dot(normalW, lightDirW), 0.0);
          vec3 halfDir = normalize(lightDirW + viewDirW);
          float spec = pow(max(dot(normalW, halfDir), 0.0), uShininess);

          float fresnel = pow(1.0 - max(dot(normalW, viewDirW), 0.0), uFresnelPower);
          vec3 light = uLightColor * (uAmbient + diffuse * 0.9);
          vec3 color = grad * light + (uLightColor * spec * uSpecular) + (fresnel * uFresnelIntensity);

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: false,
      depthTest: true,
      depthWrite: true
    });
  }, [colorA, colorB, colorC, fresnelPower, fresnelIntensity]);

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  );
}

function Scene(props) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={45} />
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={20}
      />
      <GradientTube {...props} />
    </>
  );
}

function GradientTubeStroke() {
  const [config, setConfig] = useState(DEFAULTS);
  const [svgPath, setSvgPath] = useState('');
  const [svgPathDraft, setSvgPathDraft] = useState('');
  const [svgError, setSvgError] = useState('');
  const [useSvgPath, setUseSvgPath] = useState(false);

  const svgIsActive = useSvgPath && svgPath.trim().length > 0;
  const isHeavySvg = svgIsActive && svgPath.length > 4000;
  const disableBloom = svgIsActive && svgPath.length > 8000;

  const effectiveTubularSegments = svgIsActive
    ? Math.min(config.tubularSegments, isHeavySvg ? 180 : 260)
    : config.tubularSegments;
  const effectiveRadialSegments = svgIsActive
    ? Math.min(config.radialSegments, isHeavySvg ? 10 : 14)
    : config.radialSegments;

  const applySvgPath = () => {
    console.log('[GradientTube] apply svg path', { length: svgPathDraft.trim().length });
    setSvgPath(svgPathDraft.trim());
    setUseSvgPath(true);
  };

  const resetSvgPath = () => {
    console.log('[GradientTube] reset svg path');
    setSvgPath('');
    setSvgPathDraft('');
    setUseSvgPath(false);
    setSvgError('');
  };

  const handleSvgFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const match = text.match(/d\s*=\s*"([^"]+)"/i);
      if (match?.[1]) {
        console.log('[GradientTube] svg file loaded', { name: file.name, length: match[1].length });
        setSvgPathDraft(match[1]);
        setUseSvgPath(true);
      } else {
        console.warn('[GradientTube] svg file missing path d', { name: file.name });
        setSvgError('未找到 path 的 d 属性');
      }
    };
    reader.onerror = () => {
      console.error('[GradientTube] svg file read failed', { name: file.name });
      setSvgError('读取 SVG 文件失败');
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden rounded-2xl">
      <div className="w-72 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-1">渐变管状笔触</h2>
          <p className="text-xs text-slate-500">TubeGeometry + 自定义 Shader + Bloom</p>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">管子半径</label>
            <input
              type="range"
              min="0.18"
              max="0.6"
              step="0.02"
              value={config.radius}
              onChange={(e) => setConfig(prev => ({ ...prev, radius: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">沿路径段数</label>
            <input
              type="range"
              min="200"
              max="600"
              step="20"
              value={config.tubularSegments}
              onChange={(e) => setConfig(prev => ({ ...prev, tubularSegments: parseInt(e.target.value, 10) }))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">横截面段数</label>
            <input
              type="range"
              min="8"
              max="36"
              step="2"
              value={config.radialSegments}
              onChange={(e) => setConfig(prev => ({ ...prev, radialSegments: parseInt(e.target.value, 10) }))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">使用 SVG Path</span>
            <button
              onClick={() => setUseSvgPath(!useSvgPath)}
              className={`w-10 h-5 rounded-full transition-colors ${
                useSvgPath ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                useSvgPath ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {useSvgPath && (
            <div className="space-y-2">
              <textarea
                value={svgPathDraft}
                onChange={(e) => setSvgPathDraft(e.target.value)}
                placeholder="粘贴 SVG path 的 d 字符串..."
                className="w-full h-20 px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono text-slate-700"
              />
              <div className="flex gap-2">
                <button
                  onClick={applySvgPath}
                  className="flex-1 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs"
                >
                  应用 Path
                </button>
                <button
                  onClick={resetSvgPath}
                  className="flex-1 px-3 py-1.5 bg-slate-200 text-slate-700 rounded text-xs"
                >
                  重置
                </button>
              </div>
              <div>
                <input
                  type="file"
                  accept=".svg"
                  onChange={handleSvgFile}
                  className="text-xs text-slate-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">SVG 缩放</label>
                <input
                  type="range"
                  min="0.02"
                  max="0.2"
                  step="0.01"
                  value={config.svgScale}
                  onChange={(e) => setConfig(prev => ({ ...prev, svgScale: parseFloat(e.target.value) }))}
                  className="w-full accent-indigo-500"
                />
              </div>
              {svgError && (
                <p className="text-xs text-rose-500">{svgError}</p>
              )}
              {disableBloom && (
                <p className="text-xs text-amber-600">
                  SVG 较复杂，已自动关闭 Bloom 并降低几何精度以防止黑屏。
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">渐变色 A</label>
            <input
              type="color"
              value={config.colorA}
              onChange={(e) => setConfig(prev => ({ ...prev, colorA: e.target.value }))}
              className="w-full h-9 rounded border border-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">渐变色 B</label>
            <input
              type="color"
              value={config.colorB}
              onChange={(e) => setConfig(prev => ({ ...prev, colorB: e.target.value }))}
              className="w-full h-9 rounded border border-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">渐变色 C</label>
            <input
              type="color"
              value={config.colorC}
              onChange={(e) => setConfig(prev => ({ ...prev, colorC: e.target.value }))}
              className="w-full h-9 rounded border border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Fresnel 强度</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={config.fresnelIntensity}
              onChange={(e) => setConfig(prev => ({ ...prev, fresnelIntensity: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Fresnel 幂</label>
            <input
              type="range"
              min="1"
              max="4"
              step="0.1"
              value={config.fresnelPower}
              onChange={(e) => setConfig(prev => ({ ...prev, fresnelPower: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Bloom Threshold</label>
            <input
              type="range"
              min="0.6"
              max="0.98"
              step="0.01"
              value={config.bloomThreshold}
              onChange={(e) => setConfig(prev => ({ ...prev, bloomThreshold: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Bloom Strength</label>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={config.bloomStrength}
              onChange={(e) => setConfig(prev => ({ ...prev, bloomStrength: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Bloom Radius</label>
            <input
              type="range"
              min="0"
              max="0.6"
              step="0.02"
              value={config.bloomRadius}
              onChange={(e) => setConfig(prev => ({ ...prev, bloomRadius: parseFloat(e.target.value) }))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <Canvas
          style={{ background: config.background }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <Scene
            radius={config.radius}
            tubularSegments={effectiveTubularSegments}
            radialSegments={effectiveRadialSegments}
            colorA={config.colorA}
            colorB={config.colorB}
            colorC={config.colorC}
            fresnelPower={config.fresnelPower}
            fresnelIntensity={config.fresnelIntensity}
            svgPath={useSvgPath ? svgPath : ''}
            svgScale={config.svgScale}
            onSvgError={setSvgError}
          />
          {!disableBloom && (
            <EffectComposer>
              <Bloom
                luminanceThreshold={config.bloomThreshold}
                intensity={config.bloomStrength}
                radius={config.bloomRadius}
              />
            </EffectComposer>
          )}
        </Canvas>

        <div className="absolute bottom-4 left-4 text-xs text-slate-500">
          鼠标拖拽旋转 | 滚轮缩放
        </div>
      </div>
    </div>
  );
}

export default GradientTubeStroke;
