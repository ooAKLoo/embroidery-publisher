import {
  PlatonicLogo, TesseractLogo, MobiusLogo, SquircleLogo,
  KochSnowflakeLogo, SierpinskiLogo, FractalTreeLogo, DragonCurveLogo,
  ButterflyCurveLogo, CardioidLogo, AstroidLogo, LemniscateLogo,
  LogSpiralLogo, SpirographLogo, RoseCurveLogo, LissajousLogo,
  WireframeLogo, IslamicPatternLogo, RadialLinesLogo,
  SegmentedPolygonLogo, GradientArcLogo,
  // 新增几何图案
  GridPatternLogo, ParticleFieldLogo, HoneycombLogo, ConcentricRingsLogo,
  GeometricShardLogo, FlowingCurvesLogo, NoiseTextureLogo, MandalaLogo,
  ConstellationLogo, SpiralLogo, WaveformLogo, MazeLogo, GlowOrbLogo
} from '../logos';

// Logo 类型配置
export const LOGO_TYPES = [
  { id: 'platonic', name: '柏拉图立体', category: '3D立体', Component: PlatonicLogo, defaultProps: { solid: 'icosahedron', rotationX: 0.6, rotationY: 0.4, rotationZ: 0.2, scale: 80 }, has3D: true },
  { id: 'tesseract', name: '超立方体', category: '3D立体', Component: TesseractLogo, defaultProps: { rotationXW: 0.5, rotationYW: 0.3, scale: 60 }, has3D: true },
  { id: 'mobius', name: '莫比乌斯带', category: '3D立体', Component: MobiusLogo, defaultProps: { rotationX: 0.5, rotationY: 0.3, scale: 80 }, has3D: true },
  { id: 'squircle', name: '超椭圆', category: '现代曲线', Component: SquircleLogo, defaultProps: { n: 4, size: 100 } },
  { id: 'butterfly', name: '蝴蝶曲线', category: '参数曲线', Component: ButterflyCurveLogo, defaultProps: { scale: 35 } },
  { id: 'cardioid', name: '心形线', category: '参数曲线', Component: CardioidLogo, defaultProps: { scale: 50 } },
  { id: 'astroid', name: '星形线', category: '参数曲线', Component: AstroidLogo, defaultProps: { scale: 90 } },
  { id: 'lemniscate', name: '无穷符号', category: '参数曲线', Component: LemniscateLogo, defaultProps: { scale: 80 } },
  { id: 'logspiral', name: '对数螺线', category: '螺线', Component: LogSpiralLogo, defaultProps: { a: 5, b: 0.15, turns: 4 } },
  { id: 'spirograph', name: '螺旋图', category: '螺线', Component: SpirographLogo, defaultProps: { R: 80, r: 35, d: 50 } },
  { id: 'rose', name: '玫瑰曲线', category: '螺线', Component: RoseCurveLogo, defaultProps: { k: 5, radius: 100 } },
  { id: 'lissajous', name: '利萨如曲线', category: '螺线', Component: LissajousLogo, defaultProps: { a: 3, b: 4, delta: Math.PI / 2, radius: 100 } },
  { id: 'koch', name: '科赫雪花', category: '分形', Component: KochSnowflakeLogo, defaultProps: { iterations: 4, size: 100 } },
  { id: 'sierpinski', name: '谢尔宾斯基', category: '分形', Component: SierpinskiLogo, defaultProps: { iterations: 5, size: 110 } },
  { id: 'tree', name: '分形树', category: '分形', Component: FractalTreeLogo, defaultProps: { iterations: 9, angle: 25, shrink: 0.7 } },
  { id: 'dragon', name: '龙曲线', category: '分形', Component: DragonCurveLogo, defaultProps: { iterations: 12, size: 4 } },
  { id: 'wireframe', name: '线框多边形', category: '几何', Component: WireframeLogo, defaultProps: { vertices: 5, rotation: -Math.PI / 2, innerConnections: true } },
  { id: 'islamic', name: '花窗图案', category: '几何', Component: IslamicPatternLogo, defaultProps: { rings: 3, petals: 8 } },
  { id: 'radial', name: '放射线条', category: '渐变线条', Component: RadialLinesLogo, defaultProps: { lines: 6, length: 60, thickness: 12, gap: 30, spiral: 0, gradientDirection: 'outward', roundCap: true } },
  { id: 'segmented', name: '断裂多边形', category: '渐变线条', Component: SegmentedPolygonLogo, defaultProps: { sides: 6, radius: 100, rotation: -90, segmentRatio: 0.7, gapPosition: 'end', thickness: 12, gradientDirection: 'clockwise', roundCap: true } },
  { id: 'gradientArc', name: '渐变弧线', category: '渐变线条', Component: GradientArcLogo, defaultProps: { arcs: 6, radius: 100, arcSpan: 40, rotation: 0, thickness: 12, gradientDirection: 'clockwise', roundCap: true } },
  // 网格/点阵类
  { id: 'grid', name: '网格线框', category: '网格点阵', Component: GridPatternLogo, defaultProps: { gridType: 'square', lineCount: 8, distortion: 0 } },
  { id: 'particle', name: '粒子点阵', category: '网格点阵', Component: ParticleFieldLogo, defaultProps: { particleCount: 50, distribution: 'random', connectLines: true, connectionDistance: 40, particleSize: 4, seed: 42 } },
  { id: 'honeycomb', name: '蜂窝六边形', category: '网格点阵', Component: HoneycombLogo, defaultProps: { rings: 3, cellSize: 25, fillMode: 'gradient', gap: 3 } },
  { id: 'constellation', name: '星座连线', category: '网格点阵', Component: ConstellationLogo, defaultProps: { starCount: 20, connectionMethod: 'nearest', maxConnections: 3, maxDistance: 80, starSize: 4, glowEffect: true, seed: 42 } },
  // 圆形/环形类
  { id: 'concentric', name: '同心圆环', category: '圆环波纹', Component: ConcentricRingsLogo, defaultProps: { ringCount: 6, maxRadius: 120, ringStyle: 'solid', spacing: 'equal', waveAmplitude: 0 } },
  { id: 'spiral', name: '螺旋线', category: '圆环波纹', Component: SpiralLogo, defaultProps: { spiralType: 'archimedean', turns: 5, direction: 'outward', rotation: 0 } },
  { id: 'mandala', name: '曼陀罗', category: '圆环波纹', Component: MandalaLogo, defaultProps: { symmetry: 8, layers: 4, complexity: 3, style: 'petals', innerRadius: 20 } },
  // 动态/流体类
  { id: 'flowing', name: '流体曲线', category: '动态流体', Component: FlowingCurvesLogo, defaultProps: { curveCount: 5, flowDirection: 'horizontal', amplitude: 40, frequency: 2, phase: 0 } },
  { id: 'waveform', name: '波形图案', category: '动态流体', Component: WaveformLogo, defaultProps: { waveCount: 3, frequency: 2, amplitude: 30, phase: 0, waveType: 'sine', orientation: 'horizontal' } },
  { id: 'glowOrb', name: '光晕球体', category: '动态流体', Component: GlowOrbLogo, defaultProps: { orbCount: 3, arrangement: 'center', blurAmount: 20, intensity: 0.8, orbSize: 60, seed: 42 } },
  // 纹理/碎片类
  { id: 'noise', name: '噪声纹理', category: '纹理碎片', Component: NoiseTextureLogo, defaultProps: { resolution: 20, noiseScale: 0.1, noiseType: 'circles', intensity: 1, seed: 42 } },
  { id: 'shard', name: '几何碎片', category: '纹理碎片', Component: GeometricShardLogo, defaultProps: { shardCount: 12, layers: 3, irregularity: 0.3, fillOpacity: 0.3, seed: 42 } },
  { id: 'maze', name: '迷宫回路', category: '纹理碎片', Component: MazeLogo, defaultProps: { mazeType: 'concentric', layers: 4, openings: 2, lineWeight: 'medium', seed: 42 } },
];

// 获取所有分类
export const CATEGORIES = [...new Set(LOGO_TYPES.map(t => t.category))];

// 根据 id 获取类型配置
export const getLogoType = (id) => LOGO_TYPES.find(t => t.id === id);
