import {
  PlatonicLogo, TesseractLogo, MobiusLogo, SquircleLogo,
  KochSnowflakeLogo, SierpinskiLogo, FractalTreeLogo, DragonCurveLogo,
  ButterflyCurveLogo, CardioidLogo, AstroidLogo, LemniscateLogo,
  LogSpiralLogo, SpirographLogo, RoseCurveLogo, LissajousLogo,
  WireframeLogo, IslamicPatternLogo, RadialLinesLogo,
  SegmentedPolygonLogo, GradientArcLogo,
  // 新增几何图案
  ParticleFieldLogo, HoneycombLogo, ConcentricRingsLogo,
  GeometricShardLogo, FlowingCurvesLogo, NoiseTextureLogo, MandalaLogo,
  ConstellationLogo, SpiralLogo, WaveformLogo, MazeLogo, GlowOrbLogo,
  SpinnerBladesLogo,
  // 神圣几何与文化符号
  CelticKnotLogo, YinYangLogo, EnsoCircleLogo, PenroseTileLogo,
  MetatronCubeLogo, FlowerOfLifeLogo, OuroborosLogo, LabyrinthLogo,
  OpArtLogo, MonogramLogo,
  // 字母排版风格
  ScriptLogo, StencilLogo, NeonLogo, RetroLogo, GradientTextLogo, ShadowTextLogo,
  // 有机形态
  PetalLogo, SwirlLogo, SpinningTrianglesLogo, PinwheelLogo, CircleFlowerLogo,
  // 通用多边形
  PolygonLogo,
  // 新增3D立体
  NestedCubesLogo, StellatedPolyhedronLogo, BuckyballLogo, TorusKnotLogo, StereographicGridLogo
} from '../logos';

// Logo 类型配置 - 按分类组织
export const LOGO_TYPES = [
  // ========== 🎨 几何图形 (Geometric) ==========
  // 基础形状
  { id: 'polygon', name: '通用多边形', category: '几何-基础形状', Component: PolygonLogo, defaultProps: { sides: 6, radius: 100, roundness: 0, hollowRatio: 0, rotation: 0, skewX: 0, skewY: 0, scaleX: 1, scaleY: 1, splitMode: 'none', splitGap: 10, innerPolygons: 0, innerRotation: 15, showVertices: false, vertexSize: 6, filled: false } },
  { id: 'squircle', name: '超椭圆', category: '几何-基础形状', Component: SquircleLogo, defaultProps: { n: 4, size: 100, rotation: 0 } },
  { id: 'wireframe', name: '线框多边形', category: '几何-基础形状', Component: WireframeLogo, defaultProps: { vertices: 6, rotation: 0, shapeType: 'regular', innerRadiusRatio: 0.4, roundness: 0, connectionStyle: 'center', showVertices: false, vertexRadius: 4, layers: 1, layerScale: 0.6, layerRotation: 15 } },
  { id: 'segmented', name: '断裂多边形', category: '几何-基础形状', Component: SegmentedPolygonLogo, defaultProps: { sides: 6, radius: 100, rotation: -90, segmentRatio: 0.7, gapPosition: 'end', thickness: 12, gradientDirection: 'clockwise', roundCap: true } },
  // 分形
  { id: 'koch', name: '科赫雪花', category: '几何-分形', Component: KochSnowflakeLogo, defaultProps: { iterations: 4, size: 100, rotation: 0 } },
  { id: 'sierpinski', name: '谢尔宾斯基', category: '几何-分形', Component: SierpinskiLogo, defaultProps: { iterations: 5, size: 110, rotation: 0 } },
  { id: 'tree', name: '分形树', category: '几何-分形', Component: FractalTreeLogo, defaultProps: { iterations: 9, angle: 25, shrink: 0.7, rotation: 0 } },
  { id: 'dragon', name: '龙曲线', category: '几何-分形', Component: DragonCurveLogo, defaultProps: { iterations: 12, size: 4, rotation: 0 } },
  // 网格点阵
  { id: 'honeycomb', name: '蜂窝六边形', category: '几何-网格点阵', Component: HoneycombLogo, defaultProps: { rings: 3, cellSize: 25, fillMode: 'gradient', gap: 3, rotation: 0 } },
  { id: 'particle', name: '粒子点阵', category: '几何-网格点阵', Component: ParticleFieldLogo, defaultProps: { particleCount: 50, distribution: 'random', connectLines: true, connectionDistance: 40, particleSize: 4, seed: 42, rotation: 0 } },

  // ========== 🌀 曲线与螺旋 (Curves & Spirals) ==========
  // 参数曲线
  { id: 'butterfly', name: '蝴蝶曲线', category: '曲线-参数曲线', Component: ButterflyCurveLogo, defaultProps: { scale: 35, rotation: 0 } },
  { id: 'cardioid', name: '心形线', category: '曲线-参数曲线', Component: CardioidLogo, defaultProps: { scale: 50, rotation: 0 } },
  { id: 'astroid', name: '星形线', category: '曲线-参数曲线', Component: AstroidLogo, defaultProps: { scale: 90, rotation: 0 } },
  { id: 'lemniscate', name: '无穷符号', category: '曲线-参数曲线', Component: LemniscateLogo, defaultProps: { scale: 80, rotation: 0 } },
  // 螺旋类
  { id: 'logspiral', name: '对数螺线', category: '曲线-螺旋', Component: LogSpiralLogo, defaultProps: { a: 5, b: 0.15, turns: 4, rotation: 0 } },
  { id: 'spirograph', name: '螺旋图', category: '曲线-螺旋', Component: SpirographLogo, defaultProps: { R: 80, r: 35, d: 50, rotation: 0 } },
  { id: 'rose', name: '玫瑰曲线', category: '曲线-螺旋', Component: RoseCurveLogo, defaultProps: { k: 5, radius: 100, rotation: 0 } },
  { id: 'lissajous', name: '利萨如曲线', category: '曲线-螺旋', Component: LissajousLogo, defaultProps: { a: 3, b: 4, delta: Math.PI / 2, radius: 100, rotation: 0 } },
  { id: 'spiral', name: '螺旋线', category: '曲线-螺旋', Component: SpiralLogo, defaultProps: { spiralType: 'archimedean', turns: 5, direction: 'outward', rotation: 0 } },

  // ========== 🔮 3D与立体 (3D & Solid) ==========
  { id: 'platonic', name: '柏拉图立体', category: '3D立体', Component: PlatonicLogo, defaultProps: { solid: 'icosahedron', rotationX: 0.6, rotationY: 0.4, rotationZ: 0.2, scale: 80 }, has3D: true },
  { id: 'tesseract', name: '超立方体', category: '3D立体', Component: TesseractLogo, defaultProps: { rotationXW: 0.5, rotationYW: 0.3, scale: 60 }, has3D: true },
  { id: 'mobius', name: '莫比乌斯带', category: '3D立体', Component: MobiusLogo, defaultProps: { rotationX: 0.5, rotationY: 0.3, scale: 80 }, has3D: true },
  { id: 'nestedCubes', name: '嵌套立方体', category: '3D立体', Component: NestedCubesLogo, defaultProps: { layers: 3, layerScale: 0.6, layerRotation: 15, rotationX: 0.5, rotationY: 0.4, rotationZ: 0.1, scale: 80 }, has3D: true },
  { id: 'stellated', name: '星形多面体', category: '3D立体', Component: StellatedPolyhedronLogo, defaultProps: { baseShape: 'icosahedron', stellationDepth: 1.5, showBase: true, rotationX: 0.5, rotationY: 0.4, rotationZ: 0, scale: 70 }, has3D: true },
  { id: 'buckyball', name: '巴克球', category: '3D立体', Component: BuckyballLogo, defaultProps: { rotationX: 0.4, rotationY: 0.3, rotationZ: 0, scale: 85 }, has3D: true },
  { id: 'torusKnot', name: '圆环结', category: '3D立体', Component: TorusKnotLogo, defaultProps: { p: 2, q: 3, tubeRadius: 0.3, segments: 200, rotationX: 0.3, rotationY: 0.2, rotationZ: 0, scale: 80 }, has3D: true },
  { id: 'stereographic', name: '球极投影', category: '3D立体', Component: StereographicGridLogo, defaultProps: { latitudeLines: 6, longitudeLines: 12, gridStyle: 'full', showEquator: true, rotationX: 0.3, rotationY: 0.2, rotationZ: 0, scale: 90 }, has3D: true },

  // ========== ☯️ 符号与神圣几何 (Sacred & Cultural) ==========
  // 文化符号
  { id: 'yinYang', name: '太极变体', category: '符号-文化', Component: YinYangLogo, defaultProps: { divisions: 2, innerDots: true, dotSize: 0.15, rotation: 0, spiralEffect: 0, outline: true } },
  { id: 'enso', name: '禅圆', category: '符号-文化', Component: EnsoCircleLogo, defaultProps: { openingSize: 15, openingPosition: 45, brushWidth: 20, taperStart: 0.3, taperEnd: 0.3, roughness: 0.02, inkSplash: false, innerCircle: false, seed: 42, rotation: 0 } },
  { id: 'celticKnot', name: '凯尔特结', category: '符号-文化', Component: CelticKnotLogo, defaultProps: { knotType: 'triquetra', complexity: 2, weaveWidth: 12, showBorder: true, rotation: 0 } },
  { id: 'ouroboros', name: '衔尾蛇', category: '符号-文化', Component: OuroborosLogo, defaultProps: { style: 'serpent', bodySegments: 24, headSize: 1.2, bodyTaper: 0.3, scales: true, rotation: -90 } },
  // 神圣几何
  { id: 'flowerOfLife', name: '生命之花', category: '符号-神圣几何', Component: FlowerOfLifeLogo, defaultProps: { pattern: 'flower', rings: 3, showOuterCircle: true, fillPetals: false, rotation: 0 } },
  { id: 'metatron', name: '梅塔特隆', category: '符号-神圣几何', Component: MetatronCubeLogo, defaultProps: { showCircles: true, showConnections: true, showInnerPatterns: true, circleStyle: 'solid', complexity: 3, rotation: 0 } },
  { id: 'penrose', name: '彭罗斯拼贴', category: '符号-神圣几何', Component: PenroseTileLogo, defaultProps: { tileType: 'kite-dart', iterations: 3, showOutline: true, fillAlternate: true, rotation: 0 } },
  { id: 'labyrinth', name: '迷宫', category: '符号-神圣几何', Component: LabyrinthLogo, defaultProps: { labyrinthType: 'chartres', circuits: 7, rotation: 0, showCenter: true, pathWidth: 8 } },

  // ========== ✨ 装饰与纹理 (Decorative) ==========
  // 圆环放射
  { id: 'concentric', name: '同心圆环', category: '装饰-圆环放射', Component: ConcentricRingsLogo, defaultProps: { ringCount: 6, maxRadius: 120, ringStyle: 'solid', spacing: 'equal', waveAmplitude: 0, rotation: 0 } },
  { id: 'mandala', name: '曼陀罗', category: '装饰-圆环放射', Component: MandalaLogo, defaultProps: { symmetry: 8, layers: 4, complexity: 3, style: 'petals', innerRadius: 20, rotation: 0 } },
  { id: 'radial', name: '放射线条', category: '装饰-圆环放射', Component: RadialLinesLogo, defaultProps: { lines: 6, length: 60, thickness: 12, gap: 30, spiral: 0, gradientDirection: 'outward', roundCap: true, rotation: 0 } },
  { id: 'gradientArc', name: '渐变弧线', category: '装饰-圆环放射', Component: GradientArcLogo, defaultProps: { arcs: 6, radius: 100, arcSpan: 40, rotation: 0, thickness: 12, gradientDirection: 'clockwise', roundCap: true } },
  { id: 'islamic', name: '花窗图案', category: '装饰-圆环放射', Component: IslamicPatternLogo, defaultProps: { rings: 3, petals: 8, rotation: 0 } },
  // 有机形态
  { id: 'petal', name: '花瓣', category: '装饰-有机形态', Component: PetalLogo, defaultProps: { petals: 8, petalLength: 45, petalWidth: 18, petalShape: 'ellipse', spread: 20, centerRadius: 8, rotation: 0 } },
  { id: 'swirl', name: '旋涡', category: '装饰-有机形态', Component: SwirlLogo, defaultProps: { blades: 4, twist: 60, innerRadius: 25, outerRadius: 70, bladeWidth: 0.6, rotation: 0 } },
  { id: 'spinningTriangles', name: '旋转三角', category: '装饰-有机形态', Component: SpinningTrianglesLogo, defaultProps: { count: 6, innerRadius: 35, outerRadius: 80, triangleRotation: 30, gap: 0.3, strokeWidth: 3, filled: false, centerDot: true, centerRadius: 6, rotation: 0 } },
  { id: 'pinwheel', name: '风车', category: '装饰-有机形态', Component: PinwheelLogo, defaultProps: { blades: 4, radius: 70, curve: 0.3, rotation: 0 } },
  { id: 'circleFlower', name: '圆形花', category: '装饰-有机形态', Component: CircleFlowerLogo, defaultProps: { petals: 6, petalRadius: 35, centerRadius: 15, spread: 35, rotation: 0 } },
  // 纹理图案
  { id: 'noise', name: '噪声纹理', category: '装饰-纹理图案', Component: NoiseTextureLogo, defaultProps: { resolution: 20, noiseScale: 0.1, noiseType: 'circles', intensity: 1, seed: 42, rotation: 0 } },
  { id: 'shard', name: '几何碎片', category: '装饰-纹理图案', Component: GeometricShardLogo, defaultProps: { shardCount: 12, layers: 3, irregularity: 0.3, fillOpacity: 0.3, seed: 42, rotation: 0 } },
  { id: 'maze', name: '迷宫回路', category: '装饰-纹理图案', Component: MazeLogo, defaultProps: { mazeType: 'concentric', layers: 4, openings: 2, lineWeight: 'medium', seed: 42, rotation: 0 } },
  { id: 'opArt', name: '欧普艺术', category: '装饰-纹理图案', Component: OpArtLogo, defaultProps: { pattern: 'checkerboard', density: 10, distortion: 0.5, rotation: 0, contrast: true } },

  // ========== 💫 动态效果 (Motion & Effects) ==========
  { id: 'flowing', name: '流体曲线', category: '动态效果', Component: FlowingCurvesLogo, defaultProps: { curveCount: 5, flowDirection: 'horizontal', amplitude: 40, frequency: 2, phase: 0, rotation: 0 } },
  { id: 'waveform', name: '波形图案', category: '动态效果', Component: WaveformLogo, defaultProps: { waveCount: 3, frequency: 2, amplitude: 30, phase: 0, waveType: 'sine', orientation: 'horizontal', rotation: 0 } },
  { id: 'glowOrb', name: '光晕球体', category: '动态效果', Component: GlowOrbLogo, defaultProps: { orbCount: 3, arrangement: 'center', blurAmount: 20, intensity: 0.8, orbSize: 60, seed: 42, rotation: 0 } },
  { id: 'spinner', name: '旋转叶片', category: '动态效果', Component: SpinnerBladesLogo, defaultProps: { bladeCount: 6, curvature: 30, innerRadius: 30, outerRadius: 100, rotation: 0 } },
  { id: 'constellation', name: '星座连线', category: '动态效果', Component: ConstellationLogo, defaultProps: { starCount: 20, connectionMethod: 'nearest', maxConnections: 3, maxDistance: 80, starSize: 4, glowEffect: true, seed: 42, rotation: 0 } },

  // ========== 🔤 字体排版 (Typography) ==========
  { id: 'script', name: '连笔书法', category: '字体排版', Component: ScriptLogo, defaultProps: { text: 'Logo', style: 'elegant', connectLetters: true, slant: 15, thickness: 'medium', flourish: true, gradientEffect: true } },
  { id: 'stencil', name: '镂空模板', category: '字体排版', Component: StencilLogo, defaultProps: { text: 'LOGO', style: 'military', cutStyle: 'center', spacing: 'normal', borderFrame: true } },
  { id: 'neon', name: '霓虹灯', category: '字体排版', Component: NeonLogo, defaultProps: { text: 'NEON', glowIntensity: 0.8, tubeStyle: 'round', flicker: false, backing: true } },
  { id: 'retro', name: '复古排版', category: '字体排版', Component: RetroLogo, defaultProps: { text: 'RETRO', style: 'vintage', layers: 3, layerOffset: 3, inline: true, serifs: true } },
  { id: 'gradientText', name: '渐变文字', category: '字体排版', Component: GradientTextLogo, defaultProps: { text: 'TECH', gradientType: 'linear', gradientAngle: 45, colorStops: 3, strokeOutline: true, glossy: false, fontWeight: 'bold' } },
  { id: 'shadowText', name: '3D阴影', category: '字体排版', Component: ShadowTextLogo, defaultProps: { text: 'SHADOW', shadowDepth: 8, shadowAngle: 135, perspective: 'flat', fillStyle: 'solid', fontWeight: 'bold' } },
  { id: 'monogram', name: '字母组合', category: '字体排版', Component: MonogramLogo, defaultProps: { letters: 'AB', style: 'overlap', arrangement: 'horizontal', letterWeight: 'bold', showFrame: true, rotation: 0 } },
];

// 获取所有分类
export const CATEGORIES = [...new Set(LOGO_TYPES.map(t => t.category))];

// 根据 id 获取类型配置
export const getLogoType = (id) => LOGO_TYPES.find(t => t.id === id);
