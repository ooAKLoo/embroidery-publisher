import { useState, useMemo, useCallback, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import opentype from 'opentype.js';

// 生成平滑的 3D 曲线点
function generateCurvePoints(seed, complexity = 10, amplitude = 3, zDepth = 2) {
  const points = [];
  const random = seededRandom(seed);

  for (let i = 0; i < complexity; i++) {
    const t = i / (complexity - 1);
    const x = (t - 0.5) * 10 + (random() - 0.5) * amplitude;
    const y = Math.sin(t * Math.PI * 2 + seed) * amplitude + (random() - 0.5) * amplitude * 0.5;
    const z = Math.cos(t * Math.PI + seed * 0.5) * zDepth + (random() - 0.5) * zDepth * 0.5;
    points.push(new THREE.Vector3(x, y, z));
  }

  const curve = new THREE.CatmullRomCurve3(points);
  return curve.getPoints(100);
}

// 简单的种子随机数生成器
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// 从 opentype.js 路径命令转换为 Three.js 点
function pathCommandsToPoints(commands, resolution = 2) {
  const paths = [];
  let currentPath = [];
  let currentX = 0;
  let currentY = 0;

  commands.forEach(cmd => {
    switch (cmd.type) {
      case 'M': // MoveTo
        if (currentPath.length > 2) {
          paths.push([...currentPath]);
        }
        currentPath = [new THREE.Vector3(cmd.x, cmd.y, 0)];
        currentX = cmd.x;
        currentY = cmd.y;
        break;

      case 'L': // LineTo
        currentPath.push(new THREE.Vector3(cmd.x, cmd.y, 0));
        currentX = cmd.x;
        currentY = cmd.y;
        break;

      case 'Q': // Quadratic Bezier
        {
          const steps = Math.max(5, Math.ceil(resolution * 3));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const x = (1 - t) * (1 - t) * currentX + 2 * (1 - t) * t * cmd.x1 + t * t * cmd.x;
            const y = (1 - t) * (1 - t) * currentY + 2 * (1 - t) * t * cmd.y1 + t * t * cmd.y;
            currentPath.push(new THREE.Vector3(x, y, 0));
          }
          currentX = cmd.x;
          currentY = cmd.y;
        }
        break;

      case 'C': // Cubic Bezier
        {
          const steps = Math.max(8, Math.ceil(resolution * 5));
          for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const t2 = t * t;
            const t3 = t2 * t;
            const mt = 1 - t;
            const mt2 = mt * mt;
            const mt3 = mt2 * mt;
            const x = mt3 * currentX + 3 * mt2 * t * cmd.x1 + 3 * mt * t2 * cmd.x2 + t3 * cmd.x;
            const y = mt3 * currentY + 3 * mt2 * t * cmd.y1 + 3 * mt * t2 * cmd.y2 + t3 * cmd.y;
            currentPath.push(new THREE.Vector3(x, y, 0));
          }
          currentX = cmd.x;
          currentY = cmd.y;
        }
        break;

      case 'Z': // ClosePath
        if (currentPath.length > 0) {
          currentPath.push(currentPath[0].clone());
        }
        if (currentPath.length > 2) {
          paths.push([...currentPath]);
        }
        currentPath = [];
        break;
    }
  });

  // 添加最后一条路径
  if (currentPath.length > 2) {
    paths.push(currentPath);
  }

  return paths;
}

// 从 opentype.js 字体获取文字轮廓
function getTextPaths(font, text, fontSize = 72) {
  if (!font || !text) return [];

  const allPaths = [];
  let offsetX = 0;

  // 遍历每个字符
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = font.charToGlyph(char);

    if (glyph && glyph.path) {
      const path = glyph.getPath(offsetX, 0, fontSize);
      const commands = path.commands;

      if (commands && commands.length > 0) {
        const charPaths = pathCommandsToPoints(commands, 2);
        charPaths.forEach(pathPoints => {
          if (pathPoints.length > 2) {
            allPaths.push(pathPoints);
          }
        });
      }

      // 更新 X 偏移
      const advanceWidth = glyph.advanceWidth || fontSize * 0.6;
      offsetX += (advanceWidth / font.unitsPerEm) * fontSize;
    } else {
      // 未找到字形，添加默认间距
      offsetX += fontSize * 0.6;
    }
  }

  return allPaths;
}

// 单个笔触组件 - 基础版本
function Stroke({
  seed,
  color1 = '#00aaff',
  color2 = '#ff00ff',
  lineWidth = 0.3,
  taper = true,
  animationSpeed = 1,
  delay = 0,
  complexity = 10,
  amplitude = 3,
  zDepth = 2,
  position = [0, 0, 0]
}) {
  const meshRef = useRef();
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(null);

  const points = useMemo(() =>
    generateCurvePoints(seed, complexity, amplitude, zDepth),
    [seed, complexity, amplitude, zDepth]
  );

  const colors = useMemo(() => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return points.map((_, i) => {
      const t = i / (points.length - 1);
      const color = new THREE.Color().lerpColors(c1, c2, t);
      return color;
    });
  }, [points, color1, color2]);

  useFrame((state) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current - delay;
    if (elapsed < 0) return;

    const newProgress = Math.min(1, elapsed * animationSpeed);
    setProgress(newProgress);
  });

  const visiblePoints = useMemo(() => {
    const count = Math.floor(points.length * progress);
    return points.slice(0, Math.max(2, count));
  }, [points, progress]);

  const visibleColors = useMemo(() => {
    const count = Math.floor(colors.length * progress);
    return colors.slice(0, Math.max(2, count));
  }, [colors, progress]);

  if (progress === 0) return null;

  return (
    <group position={position}>
      <Line
        ref={meshRef}
        points={visiblePoints}
        vertexColors={visibleColors}
        lineWidth={lineWidth * 10}
        dashed={false}
      />
    </group>
  );
}

// 文字笔触组件 - 沿着文字轮廓绘制
function TextStroke({
  points,
  color1 = '#00aaff',
  color2 = '#ff00ff',
  lineWidth = 0.3,
  animationSpeed = 1,
  delay = 0,
  zOffset = 0
}) {
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(null);

  // 平滑曲线
  const smoothPoints = useMemo(() => {
    if (points.length < 3) return points;
    try {
      const curve = new THREE.CatmullRomCurve3(points.map(p =>
        new THREE.Vector3(p.x, p.y, zOffset)
      ));
      return curve.getPoints(Math.max(50, points.length * 2));
    } catch (e) {
      return points.map(p => new THREE.Vector3(p.x, p.y, zOffset));
    }
  }, [points, zOffset]);

  const colors = useMemo(() => {
    const c1 = new THREE.Color(color1);
    const c2 = new THREE.Color(color2);
    return smoothPoints.map((_, i) => {
      const t = i / (smoothPoints.length - 1);
      return new THREE.Color().lerpColors(c1, c2, t);
    });
  }, [smoothPoints, color1, color2]);

  useFrame((state) => {
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.elapsedTime;
    }

    const elapsed = state.clock.elapsedTime - startTimeRef.current - delay;
    if (elapsed < 0) return;

    const newProgress = Math.min(1, elapsed * animationSpeed);
    setProgress(newProgress);
  });

  const visiblePoints = useMemo(() => {
    const count = Math.floor(smoothPoints.length * progress);
    return smoothPoints.slice(0, Math.max(2, count));
  }, [smoothPoints, progress]);

  const visibleColors = useMemo(() => {
    const count = Math.floor(colors.length * progress);
    return colors.slice(0, Math.max(2, count));
  }, [colors, progress]);

  if (progress === 0 || visiblePoints.length < 2) return null;

  return (
    <Line
      points={visiblePoints}
      vertexColors={visibleColors}
      lineWidth={lineWidth * 10}
      dashed={false}
    />
  );
}

// 文字轮廓组件
function TextOutline({ text, font, config, playKey }) {
  const {
    color1,
    color2,
    lineWidth,
    animationSpeed,
    staggerDelay,
    textSize = 5,
    zDepth
  } = config;

  // 从文字生成路径
  const allPaths = useMemo(() => {
    if (!font || !text) return [];

    const fontSize = textSize * 10; // 放大以获得更好的精度
    const paths = getTextPaths(font, text, fontSize);

    // 缩放回正常大小并添加延迟
    return paths.map((pathPoints, index) => ({
      points: pathPoints.map(p => new THREE.Vector3(
        p.x / 10,
        p.y / 10,
        0
      )),
      delay: index * staggerDelay,
      zOffset: (Math.random() - 0.5) * zDepth * 0.5
    }));
  }, [font, text, textSize, staggerDelay, zDepth]);

  // 计算居中偏移
  const centerOffset = useMemo(() => {
    if (allPaths.length === 0) return [0, 0, 0];

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    allPaths.forEach(path => {
      path.points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });
    });

    return [-(minX + maxX) / 2, -(minY + maxY) / 2, 0];
  }, [allPaths]);

  if (allPaths.length === 0) return null;

  return (
    <group position={centerOffset}>
      {allPaths.map((path, index) => (
        <TextStroke
          key={`${playKey}-${index}`}
          points={path.points}
          color1={color1}
          color2={color2}
          lineWidth={lineWidth}
          animationSpeed={animationSpeed}
          delay={path.delay}
          zOffset={path.zOffset}
        />
      ))}
    </group>
  );
}

// 多笔触组合组件（自由模式）
function StrokeGroup({ config, isPlaying }) {
  const {
    strokeCount = 5,
    color1 = '#00aaff',
    color2 = '#ff00ff',
    lineWidth = 0.3,
    taper = true,
    animationSpeed = 0.8,
    staggerDelay = 0.3,
    complexity = 10,
    amplitude = 3,
    zDepth = 2,
    spread = 3
  } = config;

  const strokes = useMemo(() => {
    const items = [];
    for (let i = 0; i < strokeCount; i++) {
      const seed = Math.floor(Math.random() * 10000) + i * 1000;
      const yOffset = (i - (strokeCount - 1) / 2) * spread / strokeCount;
      items.push({
        seed,
        position: [0, yOffset, (Math.random() - 0.5) * zDepth],
        delay: i * staggerDelay
      });
    }
    return items;
  }, [strokeCount, staggerDelay, spread, zDepth, isPlaying]);

  return (
    <group>
      {strokes.map((stroke, index) => (
        <Stroke
          key={`${index}-${stroke.seed}`}
          seed={stroke.seed}
          color1={color1}
          color2={color2}
          lineWidth={lineWidth}
          taper={taper}
          animationSpeed={animationSpeed}
          delay={stroke.delay}
          complexity={complexity}
          amplitude={amplitude}
          zDepth={zDepth}
          position={stroke.position}
        />
      ))}
    </group>
  );
}

// 场景组件
function Scene({ config, isPlaying, playKey, mode, text, font }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={50} />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
      />

      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8080ff" />

      <Suspense fallback={null}>
        <Environment preset="city" />
        {mode === 'text' && font ? (
          <TextOutline
            key={playKey}
            text={text}
            font={font}
            config={config}
            playKey={playKey}
          />
        ) : (
          <StrokeGroup key={playKey} config={config} isPlaying={isPlaying} />
        )}
      </Suspense>
    </>
  );
}

// 颜色预设
const COLOR_PRESETS = [
  { name: '蓝青渐变', color1: '#00aaff', color2: '#00ffaa' },
  { name: '紫粉渐变', color1: '#8844ff', color2: '#ff44aa' },
  { name: '橙红渐变', color1: '#ff8800', color2: '#ff0044' },
  { name: '冰蓝渐变', color1: '#00ddff', color2: '#0044ff' },
  { name: '金绿渐变', color1: '#ffdd00', color2: '#00ff88' },
  { name: '暗夜渐变', color1: '#4400ff', color2: '#ff0088' },
];

// 预设文字
const TEXT_PRESETS = [
  { name: '你好', text: '你好' },
  { name: '龙', text: '龙' },
  { name: '永', text: '永' },
  { name: '爱', text: '爱' },
  { name: 'Art', text: 'Art' },
  { name: 'LOVE', text: 'LOVE' },
];

// 字体选项
const FONT_OPTIONS = [
  {
    id: 'noto-sans-sc',
    name: '思源黑体',
    url: 'https://cdn.jsdelivr.net/npm/@aspect-build/aspect-fonts@0.0.8/NotoSansSC-Regular.otf',
    supportsChinese: true
  },
  {
    id: 'noto-serif-sc',
    name: '思源宋体',
    url: 'https://fonts.gstatic.com/s/notoserifsc/v22/H4chBXePl9DZ0Xe7gG9cyOj7oqCcbzhqHtPk.otf',
    supportsChinese: true
  },
  {
    id: 'ma-shan-zheng',
    name: '马善政楷书',
    url: 'https://fonts.gstatic.com/s/mashanzheng/v10/NaPecZTRCLxvwo41b4gvzkXaRMTpDw.otf',
    supportsChinese: true
  },
  {
    id: 'zcool-kuaile',
    name: 'ZCOOL 快乐体',
    url: 'https://fonts.gstatic.com/s/zcoolkuaile/v19/tssqApdaRQokwFjFJjvM6h2Wo_Hu.otf',
    supportsChinese: true
  },
  {
    id: 'roboto',
    name: 'Roboto',
    url: 'https://fonts.gstatic.com/s/roboto/v32/KFOmCnqEu92Fr1Me5Q.ttf',
    supportsChinese: false
  }
];

// 主组件
function StrokeLab() {
  const [config, setConfig] = useState({
    strokeCount: 5,
    color1: '#00aaff',
    color2: '#00ffaa',
    lineWidth: 0.15,
    taper: true,
    animationSpeed: 0.4,
    staggerDelay: 0.08,
    complexity: 12,
    amplitude: 2.5,
    zDepth: 1.5,
    spread: 4,
    bgColor: '#0a0a0f',
    textSize: 5
  });

  const [mode, setMode] = useState('text'); // 'free' | 'text'
  const [text, setText] = useState('龙');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playKey, setPlayKey] = useState(0);
  const [font, setFont] = useState(null);
  const [fontLoading, setFontLoading] = useState(false);
  const [selectedFontId, setSelectedFontId] = useState('noto-sans-sc');
  const [fontError, setFontError] = useState('');

  // 加载字体
  const loadFont = useCallback(async (fontOption) => {
    setFontLoading(true);
    setFontError('');

    try {
      const loadedFont = await opentype.load(fontOption.url);
      setFont(loadedFont);
      setFontLoading(false);
    } catch (error) {
      console.error('字体加载失败:', error);
      setFontError(`字体加载失败: ${error.message}`);
      setFontLoading(false);

      // 尝试加载备用字体
      if (fontOption.id !== 'roboto') {
        const fallback = FONT_OPTIONS.find(f => f.id === 'roboto');
        if (fallback) {
          try {
            const fallbackFont = await opentype.load(fallback.url);
            setFont(fallbackFont);
            setFontError('已切换到备用字体 Roboto');
          } catch (e) {
            console.error('备用字体加载也失败:', e);
          }
        }
      }
    }
  }, []);

  // 初始加载字体
  useEffect(() => {
    const fontOption = FONT_OPTIONS.find(f => f.id === selectedFontId);
    if (fontOption) {
      loadFont(fontOption);
    }
  }, [selectedFontId, loadFont]);

  const handleConfigChange = useCallback((key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReplay = useCallback(() => {
    setPlayKey(k => k + 1);
    setIsPlaying(true);
  }, []);

  const handleRandomize = useCallback(() => {
    const preset = COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)];
    setConfig(prev => ({
      ...prev,
      color1: preset.color1,
      color2: preset.color2,
      strokeCount: Math.floor(Math.random() * 6) + 3,
      complexity: Math.floor(Math.random() * 10) + 8,
      amplitude: Math.random() * 2 + 1.5,
      zDepth: Math.random() * 2 + 0.5,
      lineWidth: Math.random() * 0.15 + 0.08
    }));
    handleReplay();
  }, [handleReplay]);

  const applyPreset = useCallback((preset) => {
    setConfig(prev => ({ ...prev, color1: preset.color1, color2: preset.color2 }));
    handleReplay();
  }, [handleReplay]);

  const applyTextPreset = useCallback((preset) => {
    setText(preset.text);
    setMode('text');
    handleReplay();
  }, [handleReplay]);

  const handleFontChange = useCallback((fontId) => {
    setSelectedFontId(fontId);
  }, []);

  return (
    <div className="flex h-full w-full bg-white text-slate-800 overflow-hidden rounded-2xl">
      {/* 控制面板 */}
      <div className="w-72 flex-shrink-0 bg-[#f8f8f8] p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">3D 笔触工坊</h2>
          <p className="text-xs text-slate-400">创建带有体积感和生长动画的 3D 笔触效果</p>
        </div>

        {/* 模式切换 */}
        <div className="mb-6">
          <label className="text-xs font-medium text-slate-500 mb-2 block">绘制模式</label>
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('free'); handleReplay(); }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'free'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-slate-500 hover:bg-zinc-200'
              }`}
            >
              自由笔触
            </button>
            <button
              onClick={() => { setMode('text'); handleReplay(); }}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === 'text'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 text-slate-500 hover:bg-zinc-200'
              }`}
            >
              文字描边
            </button>
          </div>
        </div>

        {/* 文字输入 - 仅在文字模式显示 */}
        {mode === 'text' && (
          <div className="mb-6 p-3 bg-white rounded-lg border border-zinc-200">
            <label className="text-xs font-medium text-slate-500 mb-2 block">输入文字</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleReplay();
              }}
              placeholder="输入中文或英文..."
              className="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              maxLength={10}
            />
            <p className="text-xs text-slate-400 mt-1">按 Enter 重新绘制</p>

            {/* 字体选择 */}
            <div className="mt-3">
              <label className="text-xs text-slate-500 mb-1 block">选择字体</label>
              <select
                value={selectedFontId}
                onChange={(e) => handleFontChange(e.target.value)}
                className="w-full px-2 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
              >
                {FONT_OPTIONS.map(fontOpt => (
                  <option key={fontOpt.id} value={fontOpt.id}>
                    {fontOpt.name} {fontOpt.supportsChinese ? '(支持中文)' : '(仅英文)'}
                  </option>
                ))}
              </select>
            </div>

            {/* 文字预设 */}
            <div className="mt-3">
              <label className="text-xs text-slate-400 mb-1 block">快速选择</label>
              <div className="flex flex-wrap gap-1">
                {TEXT_PRESETS.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyTextPreset(preset)}
                    className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-slate-600 rounded text-xs transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 文字大小 */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">文字大小</span>
                <span className="text-slate-600">{config.textSize}</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                step="0.5"
                value={config.textSize}
                onChange={(e) => handleConfigChange('textSize', parseFloat(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {fontLoading && (
              <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在加载字体...
              </p>
            )}
            {fontError && (
              <p className="text-xs text-orange-400 mt-2">{fontError}</p>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={handleReplay}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            重播
          </button>
          <button
            onClick={handleRandomize}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            随机
          </button>
        </div>

        {/* 颜色预设 */}
        <div className="mb-6">
          <label className="text-xs font-medium text-slate-500 mb-2 block">颜色预设</label>
          <div className="grid grid-cols-3 gap-2">
            {COLOR_PRESETS.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="h-8 rounded-lg border border-zinc-200 hover:border-indigo-400 transition-colors overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${preset.color1}, ${preset.color2})`
                }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* 颜色控制 */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">起始颜色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.color1}
                onChange={(e) => handleConfigChange('color1', e.target.value)}
                className="w-12 h-8 rounded cursor-pointer border border-zinc-200"
              />
              <input
                type="text"
                value={config.color1}
                onChange={(e) => handleConfigChange('color1', e.target.value)}
                className="flex-1 px-2 py-1 bg-white border border-zinc-200 rounded text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">结束颜色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={config.color2}
                onChange={(e) => handleConfigChange('color2', e.target.value)}
                className="w-12 h-8 rounded cursor-pointer border border-zinc-200"
              />
              <input
                type="text"
                value={config.color2}
                onChange={(e) => handleConfigChange('color2', e.target.value)}
                className="flex-1 px-2 py-1 bg-white border border-zinc-200 rounded text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* 笔触参数 */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-600">笔触参数</h3>

          {mode === 'free' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">笔触数量</span>
                <span className="text-slate-600">{config.strokeCount}</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={config.strokeCount}
                onChange={(e) => handleConfigChange('strokeCount', parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          )}

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">线条宽度</span>
              <span className="text-slate-600">{config.lineWidth.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.03"
              max="0.4"
              step="0.01"
              value={config.lineWidth}
              onChange={(e) => handleConfigChange('lineWidth', parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {mode === 'free' && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">曲线复杂度</span>
                  <span className="text-slate-600">{config.complexity}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={config.complexity}
                  onChange={(e) => handleConfigChange('complexity', parseInt(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">曲线振幅</span>
                  <span className="text-slate-600">{config.amplitude.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={config.amplitude}
                  onChange={(e) => handleConfigChange('amplitude', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">笔触间距</span>
                  <span className="text-slate-600">{config.spread.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.1"
                  value={config.spread}
                  onChange={(e) => handleConfigChange('spread', parseFloat(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </div>
            </>
          )}

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">Z轴深度</span>
              <span className="text-slate-600">{config.zDepth.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.1"
              value={config.zDepth}
              onChange={(e) => handleConfigChange('zDepth', parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">两端渐细（笔锋效果）</span>
            <button
              onClick={() => handleConfigChange('taper', !config.taper)}
              className={`w-10 h-5 rounded-full transition-colors ${
                config.taper ? 'bg-indigo-600' : 'bg-zinc-300'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                config.taper ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>

        {/* 动画参数 */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-600">动画参数</h3>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">动画速度</span>
              <span className="text-slate-600">{config.animationSpeed.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={config.animationSpeed}
              onChange={(e) => handleConfigChange('animationSpeed', parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">错开延迟</span>
              <span className="text-slate-600">{config.staggerDelay.toFixed(2)}s</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.3"
              step="0.01"
              value={config.staggerDelay}
              onChange={(e) => handleConfigChange('staggerDelay', parseFloat(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>
        </div>

        {/* 背景颜色 */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">背景颜色</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={config.bgColor}
              onChange={(e) => handleConfigChange('bgColor', e.target.value)}
              className="w-12 h-8 rounded cursor-pointer border border-zinc-200"
            />
            <input
              type="text"
              value={config.bgColor}
              onChange={(e) => handleConfigChange('bgColor', e.target.value)}
              className="flex-1 px-2 py-1 bg-white border border-zinc-200 rounded text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* 3D 画布 */}
      <div className="flex-1 relative">
        <Canvas
          style={{ background: config.bgColor }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <Scene
            config={config}
            isPlaying={isPlaying}
            playKey={playKey}
            mode={mode}
            text={text}
            font={font}
          />
        </Canvas>

        {/* 提示信息 */}
        <div className="absolute bottom-4 left-4 text-xs text-zinc-500">
          鼠标拖拽旋转 | 滚轮缩放
        </div>

        {/* 当前模式 */}
        <div className="absolute top-4 left-4 text-xs text-slate-500 bg-zinc-900/80 px-2 py-1 rounded">
          {mode === 'text' ? `文字模式: "${text}"` : '自由笔触模式'}
        </div>

        {/* 字体信息 */}
        {mode === 'text' && font && (
          <div className="absolute top-12 left-4 text-xs text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded">
            字体: {FONT_OPTIONS.find(f => f.id === selectedFontId)?.name || '未知'}
          </div>
        )}

        {/* 技术标识 */}
        <div className="absolute top-4 right-4 text-xs text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded">
          Three.js + OpenType.js
        </div>
      </div>
    </div>
  );
}

export default StrokeLab;
