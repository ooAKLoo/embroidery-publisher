/**
 * Lottie 动画生成器 - 核心模块
 *
 * 这是整个动画系统的唯一数据源
 * 预览、导出、Remotion 渲染都使用这个模块生成的 Lottie JSON
 */

import { generateAtomPoints } from "../utils/math";

// ============ 工具函数 ============

/**
 * 十六进制颜色转 Lottie RGBA 数组
 */
export function hexToLottieColor(hex) {
  if (!hex || hex === "none") return [0, 0, 0, 0];
  const clean = String(hex).replace("#", "");
  // 处理 3 位简写
  const fullHex = clean.length === 3
    ? clean.split("").map(c => c + c).join("")
    : clean;
  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;
  return [r, g, b, 1];
}

/**
 * 创建 Lottie 缓动曲线 (贝塞尔)
 */
export function createEasing(type) {
  const easings = {
    linear: { i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
    easeOut: { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
    easeOutCubic: { i: { x: [0.33], y: [1] }, o: { x: [0.67], y: [1] } },
    easeOutQuart: { i: { x: [0.25], y: [1] }, o: { x: [0.5], y: [1] } },
    easeOutQuint: { i: { x: [0.22], y: [1] }, o: { x: [0.36], y: [1] } },
    easeInOut: { i: { x: [0.42], y: [0] }, o: { x: [0.58], y: [1] } },
    // 弹性效果 - 使用过冲曲线模拟
    spring: { i: { x: [0.175], y: [0.885] }, o: { x: [0.32], y: [1.275] } },
  };
  return easings[type] || easings.easeOut;
}

// ============ 动画模式定义 ============

export const ANIMATION_MODES = {
  morphScale: {
    name: "缩放成型",
    description: "弹性缩放旋转入场",
    icon: "◎",
    duration: 800,
    easing: "spring",
  },
  staggerPetal: {
    name: "逐瓣生成",
    description: "每个形状依次出现",
    icon: "✿",
    duration: 1000, // 基础时长
    easing: "easeOutCubic",
  },
  fadeScale: {
    name: "淡入缩放",
    description: "整体淡入并缩放",
    icon: "◐",
    duration: 600,
    easing: "easeOutQuart",
  },
  rotateIn: {
    name: "旋转入场",
    description: "旋转缩放进入",
    icon: "⟳",
    duration: 1000,
    easing: "easeOutCubic",
  },
  popIn: {
    name: "弹跳入场",
    description: "弹性弹入效果",
    icon: "⚡",
    duration: 700,
    easing: "spring",
  },
};

// ============ 形状生成 ============

/**
 * 生成 Lottie 路径顶点数据
 * 使用与 ShapeRenderer 完全相同的 generateAtomPoints 函数
 */
export function generateLottieShapes(config, size = 512) {
  const cx = size / 2;
  const cy = size / 2;
  const count = Math.max(1, config.count || 1);
  const scale = Math.max(0.01, config.scale || 1);
  const angleStep = (2 * Math.PI) / count;
  const globalRotRad = ((config.rotation || 0) * Math.PI) / 180;
  const arrayRadius = config.arrayRadius || 0;

  // 使用与 ShapeRenderer 完全相同的函数
  const basePoints = generateAtomPoints(config, 0, 0);

  const shapes = [];

  for (let i = 0; i < count; i++) {
    const theta = i * angleStep;
    const arrayX = arrayRadius * Math.cos(theta + globalRotRad);
    const arrayY = arrayRadius * Math.sin(theta + globalRotRad);
    const rotRad = theta + globalRotRad + Math.PI / 2;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    const tx = cx + arrayX;
    const ty = cy + arrayY;

    // 变换每个点
    const vertices = basePoints.map((p) => {
      const sx = p.x * scale;
      const sy = p.y * scale;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return [rx + tx, ry + ty];
    });

    // Lottie 路径数据
    shapes.push({
      index: i,
      vertices,
      inTangents: vertices.map(() => [0, 0]),
      outTangents: vertices.map(() => [0, 0]),
      closed: true,
    });
  }

  return shapes;
}

// ============ 图层创建函数 ============

/**
 * 创建形状组 (单个路径 + 填充 + 描边)
 */
function createShapeGroup(shape, { fillColor, strokeColor, hasFill, hasStroke, strokeWidth }) {
  const items = [
    // 路径
    {
      ty: "sh",
      ks: {
        a: 0,
        k: {
          i: shape.inTangents,
          o: shape.outTangents,
          v: shape.vertices,
          c: shape.closed,
        },
      },
      nm: `Path ${shape.index + 1}`,
    },
  ];

  // 填充 - Lottie 的 c 属性只需要 RGB (3 个值)
  if (hasFill && fillColor && fillColor[3] > 0) {
    items.push({
      ty: "fl",
      c: { a: 0, k: fillColor.slice(0, 3) },
      o: { a: 0, k: 100 },
      r: 1,
      bm: 0,
      nm: "Fill",
    });
  }

  // 描边 - Lottie 的 c 属性只需要 RGB (3 个值)
  if (hasStroke && strokeColor && strokeColor[3] > 0) {
    items.push({
      ty: "st",
      c: { a: 0, k: strokeColor.slice(0, 3) },
      o: { a: 0, k: 100 },
      w: { a: 0, k: strokeWidth || 2 },
      lc: 2, // round cap
      lj: 2, // round join
      bm: 0,
      nm: "Stroke",
    });
  }

  // 变换
  items.push({
    ty: "tr",
    p: { a: 0, k: [0, 0] },
    a: { a: 0, k: [0, 0] },
    s: { a: 0, k: [100, 100] },
    r: { a: 0, k: 0 },
    o: { a: 0, k: 100 },
    nm: "Transform",
  });

  return {
    ty: "gr",
    it: items,
    nm: `Group ${shape.index + 1}`,
  };
}

/**
 * 创建 morphScale (缩放成型) 动画图层
 */
function createMorphScaleLayer(shapes, opts) {
  const { size, totalFrames, fillColor, strokeColor, hasFill, hasStroke, strokeWidth, opacity } = opts;
  const easing = createEasing("spring");

  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Main Shape",
    sr: 1,
    ks: {
      // 透明度动画
      o: {
        a: 1,
        k: [
          { t: 0, s: [0], ...easing },
          { t: Math.floor(totalFrames * 0.2), s: [opacity * 100] },
        ],
      },
      // 旋转动画: -180° → 0°
      r: {
        a: 1,
        k: [
          { t: 0, s: [-180], ...easing },
          { t: totalFrames, s: [0] },
        ],
      },
      p: { a: 0, k: [size / 2, size / 2] },
      a: { a: 0, k: [size / 2, size / 2] },
      // 缩放动画: 0% → 100%
      s: {
        a: 1,
        k: [
          { t: 0, s: [0, 0], ...easing },
          { t: totalFrames, s: [100, 100] },
        ],
      },
    },
    ao: 0,
    shapes: shapes.map((shape) => createShapeGroup(shape, { fillColor, strokeColor, hasFill, hasStroke, strokeWidth })),
    ip: 0,
    op: totalFrames + 30,
    st: 0,
  };
}

/**
 * 创建 staggerPetal (逐瓣生成) 动画图层
 */
function createStaggerPetalLayers(shapes, opts) {
  const { size, totalFrames, fillColor, strokeColor, hasFill, hasStroke, strokeWidth, opacity } = opts;
  const easing = createEasing("easeOutCubic");
  const count = shapes.length;

  // 计算错开时间
  const staggerDelay = Math.max(2, Math.floor(totalFrames * 0.6 / count));
  const itemDuration = Math.floor(totalFrames * 0.5);

  return shapes.map((shape, index) => {
    const startFrame = index * staggerDelay;
    const endFrame = Math.min(startFrame + itemDuration, totalFrames);

    return {
      ddd: 0,
      ind: index + 1,
      ty: 4,
      nm: `Petal ${index + 1}`,
      sr: 1,
      ks: {
        // 透明度: 0 → 100
        o: {
          a: 1,
          k: [
            { t: startFrame, s: [0], ...easing },
            { t: endFrame, s: [opacity * 100] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [size / 2, size / 2] },
        a: { a: 0, k: [size / 2, size / 2] },
        // 缩放: 30% → 100%
        s: {
          a: 1,
          k: [
            { t: startFrame, s: [30, 30], ...easing },
            { t: endFrame, s: [100, 100] },
          ],
        },
      },
      ao: 0,
      shapes: [createShapeGroup(shape, { fillColor, strokeColor, hasFill, hasStroke, strokeWidth })],
      ip: 0,
      op: totalFrames + 30,
      st: 0,
    };
  });
}

/**
 * 创建 fadeScale (淡入缩放) 动画图层
 */
function createFadeScaleLayer(shapes, opts) {
  const { size, totalFrames, fillColor, strokeColor, hasFill, hasStroke, strokeWidth, opacity } = opts;
  const easing = createEasing("easeOutQuart");

  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Main Shape",
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0, s: [0], ...easing },
          { t: totalFrames, s: [opacity * 100] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [size / 2, size / 2] },
      a: { a: 0, k: [size / 2, size / 2] },
      s: {
        a: 1,
        k: [
          { t: 0, s: [70, 70], ...easing },
          { t: totalFrames, s: [100, 100] },
        ],
      },
    },
    ao: 0,
    shapes: shapes.map((shape) => createShapeGroup(shape, { fillColor, strokeColor, hasFill, hasStroke, strokeWidth })),
    ip: 0,
    op: totalFrames + 30,
    st: 0,
  };
}

/**
 * 创建 rotateIn (旋转入场) 动画图层
 */
function createRotateInLayer(shapes, opts) {
  const { size, totalFrames, fillColor, strokeColor, hasFill, hasStroke, strokeWidth, opacity } = opts;
  const easing = createEasing("easeOutCubic");

  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Main Shape",
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0, s: [0], ...easing },
          { t: Math.floor(totalFrames * 0.3), s: [opacity * 100] },
        ],
      },
      r: {
        a: 1,
        k: [
          { t: 0, s: [-90], ...easing },
          { t: totalFrames, s: [0] },
        ],
      },
      p: { a: 0, k: [size / 2, size / 2] },
      a: { a: 0, k: [size / 2, size / 2] },
      s: {
        a: 1,
        k: [
          { t: 0, s: [50, 50], ...easing },
          { t: totalFrames, s: [100, 100] },
        ],
      },
    },
    ao: 0,
    shapes: shapes.map((shape) => createShapeGroup(shape, { fillColor, strokeColor, hasFill, hasStroke, strokeWidth })),
    ip: 0,
    op: totalFrames + 30,
    st: 0,
  };
}

/**
 * 创建 popIn (弹跳入场) 动画图层
 */
function createPopInLayer(shapes, opts) {
  const { size, totalFrames, fillColor, strokeColor, hasFill, hasStroke, strokeWidth, opacity } = opts;
  const easing = createEasing("spring");

  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: "Main Shape",
    sr: 1,
    ks: {
      o: {
        a: 1,
        k: [
          { t: 0, s: [0] },
          { t: Math.floor(totalFrames * 0.15), s: [opacity * 100] },
        ],
      },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [size / 2, size / 2] },
      a: { a: 0, k: [size / 2, size / 2] },
      s: {
        a: 1,
        k: [
          { t: 0, s: [0, 0], ...easing },
          { t: Math.floor(totalFrames * 0.6), s: [110, 110], ...easing },
          { t: totalFrames, s: [100, 100] },
        ],
      },
    },
    ao: 0,
    shapes: shapes.map((shape) => createShapeGroup(shape, { fillColor, strokeColor, hasFill, hasStroke, strokeWidth })),
    ip: 0,
    op: totalFrames + 30,
    st: 0,
  };
}

// ============ 主生成函数 ============

/**
 * 生成 Lottie JSON - 主函数
 *
 * @param {Object} config - 图形配置 (来自 GenerativeVectorLab)
 * @param {string} mode - 动画模式
 * @param {Object} options - 选项 { size, fps }
 * @returns {Object} Lottie JSON 对象
 */
export function generateLottieAnimation(config, mode = "morphScale", options = {}) {
  const { size = 512, fps = 60 } = options;

  const modeConfig = ANIMATION_MODES[mode] || ANIMATION_MODES.morphScale;

  // 计算总帧数
  let duration = modeConfig.duration;
  if (mode === "staggerPetal") {
    duration = 600 + (config.count || 1) * 50;
  }
  const totalFrames = Math.ceil((duration / 1000) * fps);

  // 生成形状
  const shapes = generateLottieShapes(config, size);

  // ============ 颜色处理 - 与 ShapeRenderer 保持一致 ============
  const styleMode = config.styleMode ?? "custom";
  const isCustomStyle = styleMode === "custom";
  const useGradientFill = config.useGradient;

  // 主色计算（与 ShapeRenderer 完全一致）
  // 优先使用渐变起始色，其次是填充色，最后是描边色
  const primaryColor = useGradientFill
    ? (config.gradientFrom ?? "#6366f1")
    : (config.fill && config.fill !== "none"
      ? config.fill
      : (config.stroke && config.stroke !== "none"
        ? config.stroke
        : "#6366f1"));

  // 根据样式模式决定填充颜色
  let fillColor;
  let hasFill;

  if (isCustomStyle) {
    // custom 样式：严格按照配置，但没有填充也没有描边时使用 primaryColor
    if (useGradientFill) {
      fillColor = hexToLottieColor(config.gradientFrom || "#6366f1");
      hasFill = true;
    } else if (config.fill && config.fill !== "none") {
      fillColor = hexToLottieColor(config.fill);
      hasFill = true;
    } else if (config.stroke && config.stroke !== "none") {
      // 只有描边，不需要填充
      fillColor = [0, 0, 0, 0];
      hasFill = false;
    } else {
      // 没有填充也没有描边，使用 primaryColor 作为 fallback
      fillColor = hexToLottieColor(primaryColor);
      hasFill = true;
    }
  } else {
    // 非 custom 样式（glass, gradient, mesh, material, minimal）：使用 primaryColor
    fillColor = hexToLottieColor(primaryColor);
    hasFill = true;
  }

  const strokeColor = config.stroke && config.stroke !== "none"
    ? hexToLottieColor(config.stroke)
    : null;
  const hasStroke = config.stroke && config.stroke !== "none";

  // Debug: 输出颜色信息到控制台
  console.log("[LottieGenerator] Colors:", {
    styleMode,
    fill: config.fill,
    stroke: config.stroke,
    useGradient: config.useGradient,
    primaryColor,
    fillColor,
    strokeColor,
    hasFill,
    hasStroke,
  });
  const strokeWidth = config.strokeWidth || 2;
  const opacity = config.opacity !== undefined ? config.opacity : 1;

  // 图层选项
  const layerOpts = {
    size,
    totalFrames,
    fillColor,
    strokeColor,
    hasFill,
    hasStroke,
    strokeWidth,
    opacity,
  };

  // 根据模式生成图层
  let layers = [];
  switch (mode) {
    case "morphScale":
      layers = [createMorphScaleLayer(shapes, layerOpts)];
      break;
    case "staggerPetal":
      layers = createStaggerPetalLayers(shapes, layerOpts);
      break;
    case "fadeScale":
      layers = [createFadeScaleLayer(shapes, layerOpts)];
      break;
    case "rotateIn":
      layers = [createRotateInLayer(shapes, layerOpts)];
      break;
    case "popIn":
      layers = [createPopInLayer(shapes, layerOpts)];
      break;
    default:
      layers = [createMorphScaleLayer(shapes, layerOpts)];
  }

  // 构建完整的 Lottie JSON
  return {
    v: "5.7.14",
    fr: fps,
    ip: 0,
    op: totalFrames,
    w: size,
    h: size,
    nm: "GenerativeLogo",
    ddd: 0,
    assets: [],
    layers,
    markers: [],
  };
}

export default generateLottieAnimation;
