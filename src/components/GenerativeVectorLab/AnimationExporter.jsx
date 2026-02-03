import { useState, useCallback, useMemo } from "react";
import { generateAtomPoints } from "./utils/math";
import { DEFAULT_CONFIG } from "./constants";

/**
 * 动画规格生成器
 * 生成可以被 AI 解读或在 AE/Remotion 中复现的动画规格
 */

// 生成 SVG 路径数据
function generateSvgPathData(config, size = 400) {
  const cx = size / 2;
  const cy = size / 2;
  const count = Math.max(1, config.count);
  const scale = Math.max(0.01, config.scale);
  const angleStep = (2 * Math.PI) / count;
  const globalRotRad = (config.rotation * Math.PI) / 180;
  const basePoints = generateAtomPoints(config, 0, 0);
  const fmt = (v) => (Number.isFinite(v) ? v.toFixed(3) : "0");

  const toPath = (points) => {
    if (points.length === 0) return "";
    const [first, ...rest] = points;
    const segments = rest.map((p) => `L ${fmt(p.x)} ${fmt(p.y)}`).join(" ");
    return `M ${fmt(first.x)} ${fmt(first.y)} ${segments} Z`;
  };

  const paths = [];
  for (let i = 0; i < count; i++) {
    const theta = i * angleStep;
    const x = config.arrayRadius * Math.cos(theta + globalRotRad);
    const y = config.arrayRadius * Math.sin(theta + globalRotRad);
    const rotRad = theta + globalRotRad + Math.PI / 2;
    const cos = Math.cos(rotRad);
    const sin = Math.sin(rotRad);
    const tx = cx + x;
    const ty = cy + y;

    const transformed = basePoints.map((p) => {
      const sx = p.x * scale;
      const sy = p.y * scale;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return { x: rx + tx, y: ry + ty };
    });

    paths.push({
      index: i,
      angle: (theta * 180) / Math.PI,
      d: toPath(transformed),
      centerX: tx,
      centerY: ty,
      rotation: (rotRad * 180) / Math.PI,
    });
  }

  return paths;
}

// 生成完整的 SVG 字符串
function generateSvgString(config, size = 400) {
  const paths = generateSvgPathData(config, size);
  const fillRule = config.useNegativeSpace ? "evenodd" : "nonzero";

  // 渐变定义
  let gradientDef = "";
  if (config.useGradient) {
    const angle = ((config.gradientAngle ?? 45) * Math.PI) / 180;
    const x1 = 0.5 - Math.cos(angle) / 2;
    const y1 = 0.5 - Math.sin(angle) / 2;
    const x2 = 0.5 + Math.cos(angle) / 2;
    const y2 = 0.5 + Math.sin(angle) / 2;
    const start = config.gradientInvert ? config.gradientTo : config.gradientFrom;
    const end = config.gradientInvert ? config.gradientFrom : config.gradientTo;

    if (config.gradientType === "radial") {
      const cx = config.gradientRadialCx ?? 0.5;
      const cy = config.gradientRadialCy ?? 0.5;
      const r = config.gradientRadialR ?? 0.6;
      gradientDef = `<radialGradient id="gradient" cx="${cx}" cy="${cy}" r="${r}">
        <stop offset="0%" stop-color="${start}" />
        <stop offset="100%" stop-color="${end}" />
      </radialGradient>`;
    } else {
      gradientDef = `<linearGradient id="gradient" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
        <stop offset="0%" stop-color="${start}" />
        <stop offset="100%" stop-color="${end}" />
      </linearGradient>`;
    }
  }

  const fill = config.useGradient ? "url(#gradient)" : config.fill;
  const compoundPath = paths.map(p => p.d).join(" ");

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>${gradientDef}</defs>
  <path
    d="${compoundPath}"
    fill="${fill}"
    stroke="${config.stroke}"
    stroke-width="${config.strokeWidth}"
    fill-rule="${fillRule}"
    opacity="${config.opacity}"
  />
</svg>`;
}

// 动画模式的详细规格
const ANIMATION_SPECS = {
  conicReveal: {
    name: "扇形揭示 (Conic Reveal)",
    aeDescription: "使用径向擦除/遮罩从0°旋转到360°揭示图形",
    duration: 1200,
    easing: "easeOutCubic", // 1 - Math.pow(1 - t, 3)
    keyframes: [
      { time: 0, revealAngle: 0, scale: 0.86, rotation: -12, blur: 8, opacity: 0 },
      { time: 1, revealAngle: 360, scale: 1, rotation: 0, blur: 0, opacity: 1 },
    ],
    aeSteps: [
      "1. 导入 SVG 到合成",
      "2. 添加 'Radial Wipe' 效果到图层",
      "3. 设置擦除中心为图形中心",
      "4. 关键帧: 0s -> Completion: 100%, 1.2s -> Completion: 0%",
      "5. 同时为 Scale 添加关键帧: 0s -> 86%, 1.2s -> 100%",
      "6. 为 Rotation 添加关键帧: 0s -> -12°, 1.2s -> 0°",
      "7. 添加 Gaussian Blur: 0s -> 8px, 1.2s -> 0px",
      "8. 缓动曲线: Easy Ease Out (或手动调整贝塞尔为 0, 0, 0.58, 1)",
    ],
  },
  staggerPetal: {
    name: "逐瓣生成 (Stagger Petal)",
    aeDescription: "图形的每个元素按顺序依次出现",
    duration: 800, // 基础时长，实际 = 800 + count * 30
    easing: "easeOutCubic",
    keyframes: [
      { time: 0, visiblePetals: 0, scale: 0.85, opacity: 0.3 },
      { time: 1, visiblePetals: "count", scale: 1, opacity: 1 },
    ],
    aeSteps: [
      "1. 将 SVG 中的每个路径单独导入为图层",
      "2. 为每个图层设置 Opacity 和 Scale 动画",
      "3. 使用 'Stagger' 功能错开每个图层的入场时间",
      "4. 每个元素: 0s -> Scale 0%, Opacity 0%; 0.15s -> Scale 100%, Opacity 100%",
      "5. 错开间隔: 每个元素延迟 (总时长 / 元素数量) 秒开始",
      "6. 整体 Scale: 从 85% 到 100%",
      "7. 缓动: Easy Ease Out",
    ],
  },
  parameterDriven: {
    name: "参数回放 (Parameter Interpolation)",
    aeDescription: "通过参数变化驱动图形从简单到复杂的演变",
    duration: 1400,
    easing: "easeOutQuart", // 1 - Math.pow(1 - t, 4)
    keyframes: [
      { time: 0.0, scale: 0.2, phase: 0.0, rotation: 0, gradientAngle: 0 },
      { time: 0.4, scale: "0.7x", phase: "0.6x", rotation: "0.55x", gradientAngle: 20 },
      { time: 0.7, scale: "0.9x", phase: "0.85x", rotation: "0.85x", gradientAngle: 35 },
      { time: 1.0, scale: "1x", phase: "1x", rotation: "1x", gradientAngle: "final" },
    ],
    aeSteps: [
      "1. 此动画需要使用 Shape Layer 或表达式驱动",
      "2. 创建参数化图形 (使用 AE 内置形状或脚本生成)",
      "3. 为 Scale 参数添加关键帧:",
      "   - 0s: 20%",
      "   - 0.56s (40%): 目标值 × 70%",
      "   - 0.98s (70%): 目标值 × 90%",
      "   - 1.4s: 目标值 100%",
      "4. Rotation 关键帧遵循相同时间点",
      "5. 如有渐变，动画渐变角度 0° -> 目标角度",
      "6. 缓动曲线: Ease Out Quart (贝塞尔: 0.25, 1, 0.5, 1)",
    ],
  },
  drawPath: {
    name: "路径绘制 (Stroke Draw)",
    aeDescription: "路径从起点到终点逐渐绘制出现",
    duration: 1000,
    easing: "easeOutQuad", // 1 - Math.pow(1 - t, 2)
    keyframes: [
      { time: 0, drawProgress: 0, scale: 0.9, opacity: 0.4 },
      { time: 1, drawProgress: 360, scale: 1, opacity: 1 },
    ],
    aeSteps: [
      "1. 导入 SVG 路径到合成",
      "2. 方法A - 使用 Trim Paths:",
      "   - 添加 'Trim Paths' 到形状图层",
      "   - 关键帧 End: 0s -> 0%, 1s -> 100%",
      "3. 方法B - 使用径向遮罩:",
      "   - 创建圆形遮罩，设置为 'Radial Wipe'",
      "   - 从中心向外揭示",
      "4. 同时为 Scale 添加关键帧: 0s -> 90%, 1s -> 100%",
      "5. Opacity: 0s -> 40%, 1s -> 100%",
      "6. 缓动: Easy Ease Out",
    ],
  },
  morphScale: {
    name: "缩放成型 (Scale Morph)",
    aeDescription: "弹性缩放旋转入场效果",
    duration: 800,
    easing: "spring", // stiffness: 200, damping: 20
    keyframes: [
      { time: 0, scale: 0, rotation: -180, opacity: 0 },
      { time: 1, scale: 1, rotation: 0, opacity: 1 },
    ],
    aeSteps: [
      "1. 导入 SVG 到合成",
      "2. 设置锚点在图形中心",
      "3. Scale 关键帧: 0s -> 0%, 0.8s -> 100%",
      "4. Rotation 关键帧: 0s -> -180°, 0.8s -> 0°",
      "5. Opacity 关键帧: 0s -> 0%, 0.1s -> 100%",
      "6. 应用 'Easy Ease' 并调整为弹性曲线:",
      "   - 使用 Expression: elasticOut 或",
      "   - 在图形编辑器中拉出过冲曲线 (overshoot)",
      "7. 或使用 Motion 3 / Flow 插件的弹性预设",
    ],
    springConfig: {
      stiffness: 200,
      damping: 20,
      mass: 1,
    },
  },
};

// 生成完整的动画导出规格
export function generateAnimationSpec(config, mode = "conicReveal", options = {}) {
  const { size = 400, fps = 60 } = options;
  const spec = ANIMATION_SPECS[mode];
  const paths = generateSvgPathData(config, size);
  const svgString = generateSvgString(config, size);

  // 计算实际时长
  let actualDuration = spec.duration;
  if (mode === "staggerPetal") {
    actualDuration = 800 + config.count * 30;
  }

  // 生成具体的关键帧数值
  const resolvedKeyframes = spec.keyframes.map((kf) => {
    const resolved = { ...kf };
    Object.keys(resolved).forEach((key) => {
      if (typeof resolved[key] === "string") {
        if (resolved[key].includes("x")) {
          const multiplier = parseFloat(resolved[key]);
          resolved[key] = config[key.replace("_", "")] * multiplier;
        } else if (resolved[key] === "count") {
          resolved[key] = config.count;
        } else if (resolved[key] === "final") {
          resolved[key] = config[key.replace("_", "")] ?? config.gradientAngle ?? 45;
        }
      }
    });
    resolved.timeMs = Math.round(resolved.time * actualDuration);
    resolved.frame = Math.round(resolved.timeMs * fps / 1000);
    return resolved;
  });

  return {
    // 元信息
    meta: {
      version: "1.0",
      generatedAt: new Date().toISOString(),
      tool: "Generative Vector Lab",
      mode,
      modeName: spec.name,
    },

    // SVG 数据
    svg: {
      viewBox: `0 0 ${size} ${size}`,
      width: size,
      height: size,
      source: svgString,
      paths: paths,
    },

    // 图形配置参数
    config: {
      // 几何参数
      baseRadius: config.baseRadius,
      frequency: config.frequency,
      amplitude: config.amplitude,
      roundness: config.roundness,
      stretch: config.stretch,
      phase: config.phase,
      count: config.count,
      arrayRadius: config.arrayRadius,
      scale: config.scale,
      rotation: config.rotation,

      // 样式参数
      fill: config.fill,
      stroke: config.stroke,
      strokeWidth: config.strokeWidth,
      opacity: config.opacity,
      useGradient: config.useGradient,
      gradientFrom: config.gradientFrom,
      gradientTo: config.gradientTo,
      gradientAngle: config.gradientAngle,
      gradientType: config.gradientType,
    },

    // 动画规格
    animation: {
      duration: actualDuration,
      durationSeconds: actualDuration / 1000,
      fps,
      totalFrames: Math.ceil(actualDuration * fps / 1000),
      easing: spec.easing,
      easingFunction: getEasingFunction(spec.easing),
      keyframes: resolvedKeyframes,
    },

    // AE/视频编辑软件的操作指南
    instructions: {
      description: spec.aeDescription,
      steps: spec.aeSteps,
      springConfig: spec.springConfig,
    },

    // AI 提示词 - 用于让 AI 在其他工具中复现
    aiPrompt: generateAIPrompt(config, mode, spec, svgString, actualDuration),
  };
}

// 生成缓动函数的数学表达式
function getEasingFunction(easing) {
  const functions = {
    easeOutCubic: "t => 1 - Math.pow(1 - t, 3)",
    easeOutQuart: "t => 1 - Math.pow(1 - t, 4)",
    easeOutQuad: "t => 1 - Math.pow(1 - t, 2)",
    spring: "t => spring(t, { stiffness: 200, damping: 20 })",
    linear: "t => t",
  };
  return functions[easing] || functions.linear;
}

// 生成 AI 提示词
function generateAIPrompt(config, mode, spec, svgString, duration) {
  return `请在 After Effects 中重现以下 SVG 动画:

## SVG 源码
\`\`\`xml
${svgString}
\`\`\`

## 动画类型: ${spec.name}
${spec.aeDescription}

## 时长: ${duration}ms (${(duration/1000).toFixed(2)}秒)

## 缓动函数: ${spec.easing}
数学表达式: ${getEasingFunction(spec.easing)}

## 关键帧:
${spec.keyframes.map((kf, i) => `- ${Math.round(kf.time * 100)}% 时刻: ${JSON.stringify(kf)}`).join("\n")}

## 操作步骤:
${spec.aeSteps.join("\n")}

## 图形参数 (如需重新生成):
- 元素数量: ${config.count}
- 阵列半径: ${config.arrayRadius}
- 基础半径: ${config.baseRadius}
- 频率: ${config.frequency}
- 振幅: ${config.amplitude}
- 圆润度: ${config.roundness}
- 旋转: ${config.rotation}°
- 缩放: ${config.scale}

请按照以上规格在 AE 中实现相同的动画效果。`;
}

// 导出为 Remotion 代码
export function generateRemotionCode(config, mode = "conicReveal") {
  const spec = ANIMATION_SPECS[mode];
  let actualDuration = spec.duration;
  if (mode === "staggerPetal") {
    actualDuration = 800 + config.count * 30;
  }

  const svgString = generateSvgString(config, 400);
  const escapedSvg = svgString.replace(/`/g, "\\`").replace(/\$/g, "\\$");

  const remotionCode = `import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

// 动画配置
const ANIMATION_CONFIG = {
  mode: "${mode}",
  duration: ${actualDuration}, // ms
  easing: "${spec.easing}",
};

// SVG 源码
const SVG_SOURCE = \`${escapedSvg}\`;

export const GenerativeLogoAnimation = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 计算动画进度 (0-1)
  const durationFrames = Math.ceil(ANIMATION_CONFIG.duration * fps / 1000);
  const progress = Math.min(1, frame / durationFrames);

  // 缓动
  const eased = ${getEasingExpression(spec.easing)};

${getAnimationCode(mode, spec)}

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '${config.canvasBg || "#ffffff"}',
    }}>
      <div
        style={{
          width: 400,
          height: 400,
          transform,
          opacity,
          ...extraStyles,
        }}
        dangerouslySetInnerHTML={{ __html: SVG_SOURCE }}
      />
    </div>
  );
};

// 导出配置
export const config = {
  id: 'GenerativeLogoAnimation',
  component: GenerativeLogoAnimation,
  durationInFrames: Math.ceil(${actualDuration} * 30 / 1000),
  fps: 30,
  width: 1080,
  height: 1080,
};
`;

  return remotionCode;
}

function getEasingExpression(easing) {
  switch (easing) {
    case "easeOutCubic":
      return "1 - Math.pow(1 - progress, 3)";
    case "easeOutQuart":
      return "1 - Math.pow(1 - progress, 4)";
    case "easeOutQuad":
      return "1 - Math.pow(1 - progress, 2)";
    case "spring":
      return `interpolate(progress, [0, 1], [0, 1], { easing: Easing.elastic(1) })`;
    default:
      return "progress";
  }
}

function getAnimationCode(mode, spec) {
  switch (mode) {
    case "conicReveal":
      return `
  // 扇形揭示动画
  const angle = eased * 360;
  const scaleVal = 0.86 + eased * 0.14;
  const rotation = -12 + eased * 12;
  const blur = (1 - eased) * 8;

  const transform = \`scale(\${scaleVal}) rotate(\${rotation}deg)\`;
  const opacity = eased > 0 ? 1 : 0;
  const extraStyles = {
    maskImage: \`conic-gradient(#000 0deg \${angle}deg, transparent \${angle}deg)\`,
    WebkitMaskImage: \`conic-gradient(#000 0deg \${angle}deg, transparent \${angle}deg)\`,
    filter: \`blur(\${blur}px)\`,
  };`;

    case "staggerPetal":
      return `
  // 逐瓣生成动画
  const currentScale = 0.85 + eased * 0.15;
  const currentOpacity = eased > 0 ? 0.3 + eased * 0.7 : 0;

  const transform = \`scale(\${currentScale})\`;
  const opacity = currentOpacity;
  const extraStyles = {};`;

    case "drawPath":
      return `
  // 路径绘制动画
  const angle = eased * 360;
  const currentScale = 0.9 + eased * 0.1;
  const currentOpacity = eased > 0 ? 0.4 + eased * 0.6 : 0;

  const transform = \`scale(\${currentScale})\`;
  const opacity = currentOpacity;
  const extraStyles = {
    maskImage: \`conic-gradient(from -90deg, #000 0deg \${angle}deg, transparent \${angle}deg)\`,
    WebkitMaskImage: \`conic-gradient(from -90deg, #000 0deg \${angle}deg, transparent \${angle}deg)\`,
  };`;

    case "morphScale":
      return `
  // 缩放成型动画
  const scaleVal = eased;
  const rotation = -180 + eased * 180;

  const transform = \`scale(\${scaleVal}) rotate(\${rotation}deg)\`;
  const opacity = eased;
  const extraStyles = {};`;

    case "parameterDriven":
      return `
  // 参数回放动画 (简化版)
  const scaleVal = 0.2 + eased * 0.8;
  const rotation = eased * ${spec.keyframes[spec.keyframes.length - 1].rotation || 0};

  const transform = \`scale(\${scaleVal}) rotate(\${rotation}deg)\`;
  const opacity = 1;
  const extraStyles = {};`;

    default:
      return `
  const transform = 'scale(1)';
  const opacity = 1;
  const extraStyles = {};`;
  }
}

// ===== UI 组件 =====
function AnimationExporter({ config, className = "" }) {
  const [selectedMode, setSelectedMode] = useState("conicReveal");
  const [exportFormat, setExportFormat] = useState("spec"); // spec, remotion, prompt
  const [copied, setCopied] = useState(false);

  const exportData = useMemo(() => {
    switch (exportFormat) {
      case "spec":
        return JSON.stringify(generateAnimationSpec(config, selectedMode), null, 2);
      case "remotion":
        return generateRemotionCode(config, selectedMode);
      case "prompt":
        return generateAnimationSpec(config, selectedMode).aiPrompt;
      default:
        return "";
    }
  }, [config, selectedMode, exportFormat]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(exportData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [exportData]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([exportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `animation-${selectedMode}-${exportFormat}.${exportFormat === "remotion" ? "jsx" : "json"}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportData, selectedMode, exportFormat]);

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100">
        <h3 className="text-sm font-semibold text-zinc-800">动画导出</h3>
        <p className="text-xs text-zinc-400 mt-0.5">导出动画规格用于 AE / Remotion / AI 复现</p>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4">
        {/* Mode Selection */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-2 block">动画模式</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ANIMATION_SPECS).map(([mode, spec]) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                  selectedMode === mode
                    ? "bg-indigo-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {spec.name}
              </button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-2 block">导出格式</label>
          <div className="flex gap-2">
            <button
              onClick={() => setExportFormat("spec")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                exportFormat === "spec"
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              📋 完整规格 (JSON)
            </button>
            <button
              onClick={() => setExportFormat("remotion")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                exportFormat === "remotion"
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              🎬 Remotion 代码
            </button>
            <button
              onClick={() => setExportFormat("prompt")}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                exportFormat === "prompt"
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              🤖 AI 提示词
            </button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-2 block">预览</label>
          <div className="relative">
            <pre className="bg-zinc-900 text-zinc-100 p-4 rounded-xl text-xs overflow-auto max-h-64 font-mono">
              {exportData.slice(0, 2000)}
              {exportData.length > 2000 && "\n\n... (已截断，点击下载获取完整内容)"}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
        <div className="text-xs text-zinc-500 space-y-1">
          <p><strong>使用方法:</strong></p>
          <ul className="list-disc list-inside space-y-0.5 text-zinc-400">
            <li><strong>完整规格:</strong> 包含 SVG + 参数 + 关键帧 + 操作步骤</li>
            <li><strong>Remotion 代码:</strong> 可直接用于 Remotion 项目渲染视频</li>
            <li><strong>AI 提示词:</strong> 复制给 ChatGPT/Claude 让 AI 指导在 AE 中实现</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AnimationExporter;
export { ANIMATION_SPECS, generateSvgString, generateSvgPathData };
