import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import lottie from "lottie-web";

// ============== 常量配置 ==============
const DEFAULT_CONFIG = {
  // 基础形状
  shapeType: "polygon", // polygon, star, flower, wave, spiral
  sides: 6,
  innerRadius: 0.4,
  rotation: 0,

  // 变换
  copies: 8,
  spreadRadius: 100,
  copyScale: 1,
  copyRotation: 0,
  spiralTightness: 0,

  // 填充样式
  fillEnabled: true,
  fillColor: "#6366f1",
  fillOpacity: 1,
  gradientEnabled: false,            // 填充渐变开关
  gradientType: "linear",            // linear, radial, conic
  gradientAngle: 45,
  gradientColors: ["#6366f1", "#ec4899", "#f59e0b"],

  // 描边样式
  strokeEnabled: true,
  strokeColor: "#4f46e5",
  strokeWidth: 2,
  strokeOpacity: 1,
  strokeGradientEnabled: false,       // 描边渐变开关
  strokeGradientType: "linear",       // linear, radial
  strokeGradientAngle: 90,
  strokeGradientColors: ["#6366f1", "#ec4899"],

  // 效果
  blurEnabled: false,
  blurAmount: 0,
  shadowEnabled: false,
  shadowX: 4,
  shadowY: 4,
  shadowBlur: 8,
  shadowColor: "#00000040",

  // 画布
  canvasBg: "#ffffff",
  canvasSize: 400,
};

// ============== 形状生成器 ==============
const generateShapePoints = (config, cx, cy, size) => {
  const { shapeType, sides, innerRadius, rotation } = config;
  const points = [];
  const angleOffset = (rotation * Math.PI) / 180 - Math.PI / 2;

  switch (shapeType) {
    case "circle": {
      // 外圈
      const segments = 60;
      const outerPoints = [];
      const innerPoints = [];
      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments + angleOffset;
        outerPoints.push({
          x: cx + size * Math.cos(angle),
          y: cy + size * Math.sin(angle),
        });
        // 内圈（反向绘制以形成环形）
        const innerAngle = ((segments - i) * 2 * Math.PI) / segments + angleOffset;
        innerPoints.push({
          x: cx + size * innerRadius * Math.cos(innerAngle),
          y: cy + size * innerRadius * Math.sin(innerAngle),
        });
      }
      // 如果 innerRadius 接近 0，只返回外圈
      if (innerRadius < 0.05) {
        points.push(...outerPoints);
      } else {
        points.push(...outerPoints, { break: true }, ...innerPoints);
      }
      break;
    }
    case "polygon": {
      // 外圈多边形
      const outerPoly = [];
      const innerPoly = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides + angleOffset;
        outerPoly.push({
          x: cx + size * Math.cos(angle),
          y: cy + size * Math.sin(angle),
        });
        // 内圈多边形（反向绘制）
        const innerAngle = ((sides - i) * 2 * Math.PI) / sides + angleOffset;
        innerPoly.push({
          x: cx + size * innerRadius * Math.cos(innerAngle),
          y: cy + size * innerRadius * Math.sin(innerAngle),
        });
      }
      // 如果 innerRadius 接近 0，只返回外圈
      if (innerRadius < 0.05) {
        points.push(...outerPoly);
      } else {
        points.push(...outerPoly, { break: true }, ...innerPoly);
      }
      break;
    }
    case "star": {
      for (let i = 0; i < sides * 2; i++) {
        const angle = (i * Math.PI) / sides + angleOffset;
        const r = i % 2 === 0 ? size : size * innerRadius;
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
      break;
    }
    case "flower": {
      const segments = 60;
      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments + angleOffset;
        const petalEffect = Math.cos(sides * angle) * (1 - innerRadius) + innerRadius;
        const r = size * petalEffect;
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
      break;
    }
    case "wave": {
      const segments = 60;
      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments + angleOffset;
        const waveEffect = 1 + Math.sin(sides * angle) * (1 - innerRadius);
        const r = size * waveEffect * 0.5;
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
      break;
    }
    case "spiral": {
      const turns = sides;
      const segments = turns * 30;
      // innerRadius 控制螺旋的起始半径
      const startRadius = size * innerRadius;
      const endRadius = size;
      for (let i = 0; i < segments; i++) {
        const t = i / segments;
        const angle = turns * 2 * Math.PI * t + angleOffset;
        // 从 startRadius 线性插值到 endRadius
        const r = startRadius + (endRadius - startRadius) * t;
        points.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
      break;
    }
    default:
      break;
  }

  return points;
};

const pointsToPath = (points, closed = true) => {
  if (points.length === 0) return "";

  // 检查是否有复合路径（环形等）
  const breakIndex = points.findIndex(p => p.break);

  if (breakIndex === -1) {
    // 简单路径
    const [first, ...rest] = points;
    const segments = rest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
    return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${segments}${closed ? " Z" : ""}`;
  }

  // 复合路径（外圈 + 内圈形成环形）
  const outerPoints = points.slice(0, breakIndex);
  const innerPoints = points.slice(breakIndex + 1);

  // 外圈路径
  const [outerFirst, ...outerRest] = outerPoints;
  const outerSegments = outerRest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const outerPath = `M ${outerFirst.x.toFixed(2)} ${outerFirst.y.toFixed(2)} ${outerSegments} Z`;

  // 内圈路径
  if (innerPoints.length === 0) return outerPath;
  const [innerFirst, ...innerRest] = innerPoints;
  const innerSegments = innerRest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const innerPath = `M ${innerFirst.x.toFixed(2)} ${innerFirst.y.toFixed(2)} ${innerSegments} Z`;

  return `${outerPath} ${innerPath}`;
};

// ============== Lottie 动画生成 ==============
const ANIMATION_MODES = {
  morphScale: { name: "缩放成型", icon: "◎", duration: 800, description: "弹性缩放旋转入场" },
  fadeScale: { name: "淡入缩放", icon: "◐", duration: 600, description: "整体淡入并缩放" },
  rotateIn: { name: "旋转入场", icon: "⟳", duration: 1000, description: "旋转缩放进入" },
  popIn: { name: "弹跳入场", icon: "⚡", duration: 700, description: "弹性弹入效果" },
  staggerPetal: { name: "逐瓣生成", icon: "✿", duration: 1000, description: "每个形状依次出现" },
};

function hexToLottieColor(hex) {
  if (!hex || hex === "none") return [0, 0, 0, 0];
  const clean = String(hex).replace("#", "");
  const fullHex = clean.length === 3 ? clean.split("").map(c => c + c).join("") : clean;
  const r = parseInt(fullHex.slice(0, 2), 16) / 255;
  const g = parseInt(fullHex.slice(2, 4), 16) / 255;
  const b = parseInt(fullHex.slice(4, 6), 16) / 255;
  return [r, g, b, 1];
}

function createEasing(type) {
  const easings = {
    linear: { i: { x: [0.5], y: [0.5] }, o: { x: [0.5], y: [0.5] } },
    easeOut: { i: { x: [0.4], y: [1] }, o: { x: [0.6], y: [0] } },
    easeOutCubic: { i: { x: [0.33], y: [1] }, o: { x: [0.67], y: [1] } },
    easeOutQuart: { i: { x: [0.25], y: [1] }, o: { x: [0.5], y: [1] } },
    spring: { i: { x: [0.175], y: [0.885] }, o: { x: [0.32], y: [1.275] } },
  };
  return easings[type] || easings.easeOut;
}

function generateLottieShapes(config, size = 512) {
  const cx = size / 2;
  const cy = size / 2;
  const copies = Math.max(1, config.copies || 1);
  const copyScale = Math.max(0.01, config.copyScale || 1);
  const baseSize = size * 0.15 * copyScale;
  const shapes = [];

  for (let i = 0; i < copies; i++) {
    const angle = (i * 2 * Math.PI) / copies + (config.copyRotation * Math.PI) / 180;
    const spiralOffset = (config.spiralTightness || 0) * i * 5;
    const r = (config.spreadRadius || 100) + spiralOffset;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);

    const rotatedConfig = { ...config, rotation: config.rotation + (i * 360) / copies };
    const points = generateShapePoints(rotatedConfig, x, y, baseSize);

    // 过滤掉 break 标记，只保留实际点
    const filteredPoints = points.filter(p => !p.break);
    const vertices = filteredPoints.map(p => [p.x, p.y]);

    shapes.push({
      index: i,
      vertices,
      inTangents: vertices.map(() => [0, 0]),
      outTangents: vertices.map(() => [0, 0]),
      closed: config.shapeType !== "spiral",
    });
  }
  return shapes;
}

function generateLottieAnimation(config, mode = "morphScale", options = {}) {
  const { size = 512, fps = 60 } = options;
  const modeConfig = ANIMATION_MODES[mode] || ANIMATION_MODES.morphScale;
  let duration = modeConfig.duration;
  if (mode === "staggerPetal") duration = 600 + (config.copies || 1) * 50;
  const totalFrames = Math.ceil((duration / 1000) * fps);
  const shapes = generateLottieShapes(config, size);

  const hasFill = config.fillEnabled;
  const hasStroke = config.strokeEnabled;
  const strokeWidth = config.strokeWidth || 2;
  const fillOp = (config.fillOpacity !== undefined ? config.fillOpacity : 1) * 100;
  const strokeOp = (config.strokeOpacity !== undefined ? config.strokeOpacity : 1) * 100;
  const opacity = config.fillOpacity !== undefined ? config.fillOpacity : 1;

  // 计算所有形状的边界框，用于渐变坐标映射
  const bbox = (() => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const s of shapes) for (const [x, y] of s.vertices) {
      x0 = Math.min(x0, x); y0 = Math.min(y0, y);
      x1 = Math.max(x1, x); y1 = Math.max(y1, y);
    }
    return { x0, y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  })();

  // 构建 Lottie 渐变色标: [pos, r, g, b, pos, r, g, b, ...]
  const buildGradStops = (colors) => {
    const n = colors.length;
    const arr = [];
    for (let i = 0; i < n; i++) {
      arr.push(i / (n - 1));
      const [r, g, b] = hexToLottieColor(colors[i]);
      arr.push(r, g, b);
    }
    return { p: n, k: { a: 0, k: arr } };
  };

  // 根据角度和类型计算渐变起止点（像素坐标）
  const gradPts = (angle, type) => {
    if (type === "radial" || type === "conic") {
      const r = Math.max(bbox.w, bbox.h) * (type === "conic" ? 0.7 : 0.5);
      return { s: [bbox.cx, bbox.cy], e: [bbox.cx + r, bbox.cy] };
    }
    const rad = (angle * Math.PI) / 180;
    return {
      s: [bbox.cx - Math.cos(rad) * bbox.w / 2, bbox.cy - Math.sin(rad) * bbox.h / 2],
      e: [bbox.cx + Math.cos(rad) * bbox.w / 2, bbox.cy + Math.sin(rad) * bbox.h / 2],
    };
  };

  const createShapeGroup = (shape) => {
    const items = [
      {
        ty: "sh",
        ks: { a: 0, k: { i: shape.inTangents, o: shape.outTangents, v: shape.vertices, c: shape.closed } },
        nm: `Path ${shape.index + 1}`,
      },
    ];

    // 填充: 渐变 (ty:"gf") 或 纯色 (ty:"fl")
    if (hasFill) {
      if (config.gradientEnabled && config.gradientColors?.length >= 2) {
        const gp = gradPts(config.gradientAngle || 45, config.gradientType || "linear");
        items.push({
          ty: "gf", o: { a: 0, k: fillOp }, r: 2, bm: 0,
          g: buildGradStops(config.gradientColors),
          s: { a: 0, k: gp.s }, e: { a: 0, k: gp.e },
          t: (config.gradientType === "radial" || config.gradientType === "conic") ? 2 : 1,
          nm: "Gradient Fill",
        });
      } else {
        const fc = hexToLottieColor(config.fillColor);
        if (fc[3] > 0) {
          items.push({ ty: "fl", c: { a: 0, k: fc.slice(0, 3) }, o: { a: 0, k: fillOp }, r: 2, bm: 0, nm: "Fill" });
        }
      }
    }

    // 描边: 渐变 (ty:"gs") 或 纯色 (ty:"st")
    if (hasStroke) {
      if (config.strokeGradientEnabled && config.strokeGradientColors?.length >= 2) {
        const gp = gradPts(config.strokeGradientAngle || 90, config.strokeGradientType || "linear");
        items.push({
          ty: "gs", o: { a: 0, k: strokeOp }, w: { a: 0, k: strokeWidth },
          g: buildGradStops(config.strokeGradientColors),
          s: { a: 0, k: gp.s }, e: { a: 0, k: gp.e },
          t: config.strokeGradientType === "radial" ? 2 : 1,
          lc: 2, lj: 2, bm: 0, nm: "Gradient Stroke",
        });
      } else {
        const sc = hexToLottieColor(config.strokeColor);
        if (sc[3] > 0) {
          items.push({ ty: "st", c: { a: 0, k: sc.slice(0, 3) }, o: { a: 0, k: strokeOp }, w: { a: 0, k: strokeWidth }, lc: 2, lj: 2, bm: 0, nm: "Stroke" });
        }
      }
    }

    items.push({ ty: "tr", p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 }, nm: "Transform" });
    return { ty: "gr", it: items, nm: `Group ${shape.index + 1}` };
  };

  const layerOpts = { size, totalFrames, opacity };
  let layers = [];
  const easing = createEasing(mode === "morphScale" || mode === "popIn" ? "spring" : "easeOutCubic");

  switch (mode) {
    case "morphScale":
      layers = [{
        ddd: 0, ind: 1, ty: 4, nm: "Main Shape", sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0], ...easing }, { t: Math.floor(totalFrames * 0.2), s: [opacity * 100] }] },
          r: { a: 1, k: [{ t: 0, s: [-180], ...easing }, { t: totalFrames, s: [0] }] },
          p: { a: 0, k: [size / 2, size / 2] },
          a: { a: 0, k: [size / 2, size / 2] },
          s: { a: 1, k: [{ t: 0, s: [0, 0], ...easing }, { t: totalFrames, s: [100, 100] }] },
        },
        ao: 0, shapes: shapes.map(createShapeGroup), ip: 0, op: totalFrames + 30, st: 0,
      }];
      break;
    case "fadeScale":
      layers = [{
        ddd: 0, ind: 1, ty: 4, nm: "Main Shape", sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0], ...easing }, { t: totalFrames, s: [opacity * 100] }] },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [size / 2, size / 2] },
          a: { a: 0, k: [size / 2, size / 2] },
          s: { a: 1, k: [{ t: 0, s: [70, 70], ...easing }, { t: totalFrames, s: [100, 100] }] },
        },
        ao: 0, shapes: shapes.map(createShapeGroup), ip: 0, op: totalFrames + 30, st: 0,
      }];
      break;
    case "rotateIn":
      layers = [{
        ddd: 0, ind: 1, ty: 4, nm: "Main Shape", sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0], ...easing }, { t: Math.floor(totalFrames * 0.3), s: [opacity * 100] }] },
          r: { a: 1, k: [{ t: 0, s: [-90], ...easing }, { t: totalFrames, s: [0] }] },
          p: { a: 0, k: [size / 2, size / 2] },
          a: { a: 0, k: [size / 2, size / 2] },
          s: { a: 1, k: [{ t: 0, s: [50, 50], ...easing }, { t: totalFrames, s: [100, 100] }] },
        },
        ao: 0, shapes: shapes.map(createShapeGroup), ip: 0, op: totalFrames + 30, st: 0,
      }];
      break;
    case "popIn":
      layers = [{
        ddd: 0, ind: 1, ty: 4, nm: "Main Shape", sr: 1,
        ks: {
          o: { a: 1, k: [{ t: 0, s: [0] }, { t: Math.floor(totalFrames * 0.15), s: [opacity * 100] }] },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [size / 2, size / 2] },
          a: { a: 0, k: [size / 2, size / 2] },
          s: { a: 1, k: [{ t: 0, s: [0, 0], ...easing }, { t: Math.floor(totalFrames * 0.6), s: [110, 110], ...easing }, { t: totalFrames, s: [100, 100] }] },
        },
        ao: 0, shapes: shapes.map(createShapeGroup), ip: 0, op: totalFrames + 30, st: 0,
      }];
      break;
    case "staggerPetal":
      const staggerDelay = Math.max(2, Math.floor(totalFrames * 0.6 / shapes.length));
      const itemDuration = Math.floor(totalFrames * 0.5);
      layers = shapes.map((shape, index) => {
        const startFrame = index * staggerDelay;
        const endFrame = Math.min(startFrame + itemDuration, totalFrames);
        return {
          ddd: 0, ind: index + 1, ty: 4, nm: `Petal ${index + 1}`, sr: 1,
          ks: {
            o: { a: 1, k: [{ t: startFrame, s: [0], ...easing }, { t: endFrame, s: [opacity * 100] }] },
            r: { a: 0, k: 0 },
            p: { a: 0, k: [size / 2, size / 2] },
            a: { a: 0, k: [size / 2, size / 2] },
            s: { a: 1, k: [{ t: startFrame, s: [30, 30], ...easing }, { t: endFrame, s: [100, 100] }] },
          },
          ao: 0, shapes: [createShapeGroup(shape)], ip: 0, op: totalFrames + 30, st: 0,
        };
      });
      break;
    default:
      layers = [{
        ddd: 0, ind: 1, ty: 4, nm: "Main Shape", sr: 1,
        ks: {
          o: { a: 0, k: opacity * 100 }, r: { a: 0, k: 0 },
          p: { a: 0, k: [size / 2, size / 2] }, a: { a: 0, k: [size / 2, size / 2] }, s: { a: 0, k: [100, 100] },
        },
        ao: 0, shapes: shapes.map(createShapeGroup), ip: 0, op: totalFrames + 30, st: 0,
      }];
  }

  return { v: "5.7.14", fr: fps, ip: 0, op: totalFrames, w: size, h: size, nm: "GenerativeLogo2", ddd: 0, assets: [], layers, markers: [] };
}

// ============== 高清动画系统 ==============
const HD_MODES = {
  morphScale: { name: "缩放成型", icon: "◎", duration: 800 },
  staggerPetal: { name: "逐瓣生成", icon: "✿", duration: 1200 },
  fadeScale: { name: "淡入缩放", icon: "◐", duration: 600 },
  rotateIn: { name: "旋转入场", icon: "⟳", duration: 1000 },
  popIn: { name: "弹跳入场", icon: "⚡", duration: 700 },
};

function _easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function _spring(t) { return 1 - Math.exp(-6 * t) * Math.cos(6.5 * t); }
function _clamp(v, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }

function calcAnimState(mode, progress, index = 0, total = 1) {
  switch (mode) {
    case "morphScale": {
      const p = _spring(progress);
      return { scale: p, rotation: -180 * (1 - p), opacity: _clamp(progress / 0.2) };
    }
    case "fadeScale": {
      const p = _easeOutCubic(progress);
      return { scale: 0.7 + 0.3 * p, rotation: 0, opacity: p };
    }
    case "rotateIn": {
      const p = _easeOutCubic(progress);
      return { scale: 0.5 + 0.5 * p, rotation: -90 * (1 - p), opacity: _clamp(progress / 0.3) };
    }
    case "popIn": {
      const p = _spring(_clamp(progress * 1.3));
      return { scale: p, rotation: 0, opacity: _clamp(progress / 0.15) };
    }
    case "staggerPetal": {
      const delay = (index / Math.max(1, total)) * 0.6;
      const p = _easeOutCubic(_clamp((progress - delay) / 0.4));
      return { scale: 0.3 + 0.7 * p, rotation: 0, opacity: p };
    }
    default: return { scale: 1, rotation: 0, opacity: 1 };
  }
}

function _svgToImg(svgEl, w, h, bgColor = null) {
  return new Promise((resolve, reject) => {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width", w);
    clone.setAttribute("height", h);
    clone.removeAttribute("class");
    if (bgColor) {
      const ns = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", w);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", bgColor);
      clone.insertBefore(rect, clone.firstChild);
    }
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

async function _splitShapeImages(svgEl, w, h, bgColor = null) {
  const paths = svgEl.querySelectorAll("g > path");
  if (!paths.length) return [];
  const imgs = [];
  for (let i = 0; i < paths.length; i++) {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width", w);
    clone.setAttribute("height", h);
    clone.removeAttribute("class");
    if (bgColor) {
      const ns = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", w);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", bgColor);
      clone.insertBefore(rect, clone.firstChild);
    }
    clone.querySelectorAll("g > path").forEach((p, j) => { if (j !== i) p.setAttribute("opacity", "0"); });
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = await new Promise((res, rej) => { const im = new Image(); im.onload = () => { URL.revokeObjectURL(url); res(im); }; im.onerror = rej; im.src = url; });
    imgs.push(img);
  }
  return imgs;
}

// 绘制动画帧（仅形状，不含背景）
function _drawAnimated(ctx, mode, progress, size, fullImg, shapeImgs) {
  if (mode === "staggerPetal" && shapeImgs.length > 0) {
    for (let i = 0; i < shapeImgs.length; i++) {
      const st = calcAnimState(mode, progress, i, shapeImgs.length);
      ctx.save();
      ctx.globalAlpha = st.opacity;
      ctx.translate(size / 2, size / 2);
      ctx.scale(st.scale, st.scale);
      ctx.translate(-size / 2, -size / 2);
      ctx.drawImage(shapeImgs[i], 0, 0, size, size);
      ctx.restore();
    }
  } else if (fullImg) {
    const st = calcAnimState(mode, progress);
    ctx.save();
    ctx.globalAlpha = st.opacity;
    ctx.translate(size / 2, size / 2);
    ctx.rotate(st.rotation * Math.PI / 180);
    ctx.scale(st.scale, st.scale);
    ctx.translate(-size / 2, -size / 2);
    ctx.drawImage(fullImg, 0, 0, size, size);
    ctx.restore();
  }
}

// Alpha Matting 透明渲染：白底/黑底差值精确提取 alpha 通道
function _renderFrameTransparent(ctx, mode, progress, size, matteData) {
  const { whiteImg, blackImg, whiteShapeImgs, blackShapeImgs, tmpW, tmpB } = matteData;
  const ctxW = tmpW.getContext("2d");
  const ctxB = tmpB.getContext("2d");

  ctxW.clearRect(0, 0, size, size);
  ctxW.fillStyle = "#ffffff";
  ctxW.fillRect(0, 0, size, size);
  _drawAnimated(ctxW, mode, progress, size, whiteImg, whiteShapeImgs);

  ctxB.clearRect(0, 0, size, size);
  ctxB.fillStyle = "#000000";
  ctxB.fillRect(0, 0, size, size);
  _drawAnimated(ctxB, mode, progress, size, blackImg, blackShapeImgs);

  const wData = ctxW.getImageData(0, 0, size, size);
  const bData = ctxB.getImageData(0, 0, size, size);
  const out = ctx.createImageData(size, size);
  const w = wData.data, b = bData.data, o = out.data;

  for (let i = 0; i < w.length; i += 4) {
    const a = 255 - Math.round((w[i] - b[i] + w[i + 1] - b[i + 1] + w[i + 2] - b[i + 2]) / 3);
    const ac = Math.max(0, Math.min(255, a));
    if (ac > 0) {
      o[i]     = Math.min(255, Math.round(b[i] * 255 / ac));
      o[i + 1] = Math.min(255, Math.round(b[i + 1] * 255 / ac));
      o[i + 2] = Math.min(255, Math.round(b[i + 2] * 255 / ac));
    }
    o[i + 3] = ac;
  }

  ctx.putImageData(out, 0, 0);
}

function _renderAnimFrame(ctx, mode, progress, size, fullImg, shapeImgs, bgColor, transparentBg = false, matteData = null) {
  ctx.clearRect(0, 0, size, size);

  if (transparentBg && matteData) {
    _renderFrameTransparent(ctx, mode, progress, size, matteData);
  } else {
    if (!transparentBg) {
      ctx.fillStyle = bgColor || "#ffffff";
      ctx.fillRect(0, 0, size, size);
    }
    _drawAnimated(ctx, mode, progress, size, fullImg, shapeImgs);
  }
}

// ============== Lottie 导出器组件 ==============
function LottieExporter({ config, onClose }) {
  const [selectedMode, setSelectedMode] = useState("morphScale");
  const [fps, setFps] = useState(60);
  const [size, setSize] = useState(512);
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);
  const animationRef = useRef(null);

  const lottieData = useMemo(() => generateLottieAnimation(config, selectedMode, { size, fps }), [config, selectedMode, size, fps]);
  const lottieString = useMemo(() => JSON.stringify(lottieData, null, 2), [lottieData]);

  useEffect(() => {
    if (!previewRef.current || !lottieData) return;
    if (animationRef.current) animationRef.current.destroy();
    animationRef.current = lottie.loadAnimation({
      container: previewRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: lottieData,
    });
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [lottieData]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(lottieData));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [lottieData]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(lottieData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generative-v2-${selectedMode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lottieData, selectedMode]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[520px] max-w-[90vw] max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-cyan-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">Lottie 动画导出</h3>
              <p className="text-xs text-zinc-500">预览和导出 100% 一致</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-4" style={{ backgroundColor: config.canvasBg || "#ffffff" }}>
              <div ref={previewRef} style={{ width: 120, height: 120 }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">动画模式</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ANIMATION_MODES).map(([mode, modeConfig]) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                    selectedMode === mode ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  <span>{modeConfig.icon}</span>
                  {modeConfig.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-zinc-400 mt-2">{ANIMATION_MODES[selectedMode]?.description}</p>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">帧率</label>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg">
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">尺寸</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg">
                <option value={256}>256px</option>
                <option value={512}>512px</option>
                <option value={1024}>1024px</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-50 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-zinc-800">{lottieData.op}</div>
                <div className="text-xs text-zinc-500">总帧数</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-800">{(lottieData.op / fps).toFixed(2)}s</div>
                <div className="text-xs text-zinc-500">时长</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-800">{(lottieString.length / 1024).toFixed(1)}KB</div>
                <div className="text-xs text-zinc-500">文件大小</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleDownload} className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              下载 .json
            </button>
            <button onClick={handleCopy} className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2">
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          </div>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============== 高清动画导出器组件 ==============
function HDAnimationExporter({ config, previewRef, onClose }) {
  const [mode, setMode] = useState("morphScale");
  const [size, setSize] = useState(512);
  const [fps, setFps] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef({
    raf: null, startTime: 0, running: false,
    fullImg: null, shapeImgs: [],
    whiteImg: null, blackImg: null,
    whiteShapeImgs: [], blackShapeImgs: [],
    tmpW: null, tmpB: null,
  });

  const duration = (HD_MODES[mode]?.duration || 800) + (mode === "staggerPetal" ? (config.copies || 1) * 40 : 0);

  // Pre-render SVG to images (normal + white/black for alpha matting)
  useEffect(() => {
    const svg = previewRef?.current?.querySelector("svg");
    if (!svg) return;
    let cancelled = false;
    (async () => {
      const full = await _svgToImg(svg, size, size);
      if (cancelled) return;
      animRef.current.fullImg = full;

      const [whiteImg, blackImg] = await Promise.all([
        _svgToImg(svg, size, size, "#ffffff"),
        _svgToImg(svg, size, size, "#000000"),
      ]);
      if (cancelled) return;
      animRef.current.whiteImg = whiteImg;
      animRef.current.blackImg = blackImg;

      if (mode === "staggerPetal") {
        const [shapes, whiteShapes, blackShapes] = await Promise.all([
          _splitShapeImages(svg, size, size),
          _splitShapeImages(svg, size, size, "#ffffff"),
          _splitShapeImages(svg, size, size, "#000000"),
        ]);
        if (cancelled) return;
        animRef.current.shapeImgs = shapes;
        animRef.current.whiteShapeImgs = whiteShapes;
        animRef.current.blackShapeImgs = blackShapes;
      } else {
        animRef.current.shapeImgs = [];
        animRef.current.whiteShapeImgs = [];
        animRef.current.blackShapeImgs = [];
      }

      if (!animRef.current.tmpW || animRef.current.tmpW.width !== size) {
        const tmpW = document.createElement("canvas");
        tmpW.width = size; tmpW.height = size;
        tmpW.getContext("2d", { willReadFrequently: true });
        animRef.current.tmpW = tmpW;
        const tmpB = document.createElement("canvas");
        tmpB.width = size; tmpB.height = size;
        tmpB.getContext("2d", { willReadFrequently: true });
        animRef.current.tmpB = tmpB;
      }
    })();
    return () => { cancelled = true; };
  }, [config, mode, size, previewRef]);

  // Animation preview loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: transparentBg });
    animRef.current.running = true;
    animRef.current.startTime = 0;

    function loop() {
      if (!animRef.current.running) return;
      const now = performance.now();
      if (!animRef.current.startTime) animRef.current.startTime = now;
      const elapsed = now - animRef.current.startTime;
      const totalLoop = duration + 800;
      const t = elapsed % totalLoop;
      const progress = Math.min(t / duration, 1);

      const matteData = transparentBg && animRef.current.tmpW ? {
        whiteImg: animRef.current.whiteImg,
        blackImg: animRef.current.blackImg,
        whiteShapeImgs: animRef.current.whiteShapeImgs,
        blackShapeImgs: animRef.current.blackShapeImgs,
        tmpW: animRef.current.tmpW,
        tmpB: animRef.current.tmpB,
      } : null;

      _renderAnimFrame(ctx, mode, progress, size, animRef.current.fullImg, animRef.current.shapeImgs, config.canvasBg, transparentBg, matteData);
      animRef.current.raf = requestAnimationFrame(loop);
    }
    loop();

    return () => { animRef.current.running = false; if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf); };
  }, [config, mode, size, duration, transparentBg]);

  // Export WebM video
  const handleExport = useCallback(async () => {
    const svg = previewRef?.current?.querySelector("svg");
    if (!svg) return;
    setExporting(true);
    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = size;
      exportCanvas.height = size;
      const ctx = exportCanvas.getContext("2d", { willReadFrequently: transparentBg });

      const fullImg = await _svgToImg(svg, size, size);
      const shapeImgs = mode === "staggerPetal" ? await _splitShapeImages(svg, size, size) : [];

      let matteData = null;
      if (transparentBg) {
        const [whiteImg, blackImg] = await Promise.all([
          _svgToImg(svg, size, size, "#ffffff"),
          _svgToImg(svg, size, size, "#000000"),
        ]);
        const [whiteShapeImgs, blackShapeImgs] = mode === "staggerPetal"
          ? await Promise.all([
              _splitShapeImages(svg, size, size, "#ffffff"),
              _splitShapeImages(svg, size, size, "#000000"),
            ])
          : [[], []];
        const tmpW = document.createElement("canvas");
        tmpW.width = size; tmpW.height = size;
        tmpW.getContext("2d", { willReadFrequently: true });
        const tmpB = document.createElement("canvas");
        tmpB.width = size; tmpB.height = size;
        tmpB.getContext("2d", { willReadFrequently: true });
        matteData = { whiteImg, blackImg, whiteShapeImgs, blackShapeImgs, tmpW, tmpB };
      }

      const stream = exportCanvas.captureStream(fps);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

      const blob = await new Promise((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
        recorder.start();
        const holdFrames = Math.ceil(0.5 * fps);
        const animFrames = Math.ceil(duration / 1000 * fps);
        const totalFrames = animFrames + holdFrames;
        let frame = 0;

        function tick() {
          const progress = Math.min(frame / animFrames, 1);
          _renderAnimFrame(ctx, mode, progress, size, fullImg, shapeImgs, config.canvasBg, transparentBg, matteData);
          frame++;
          if (frame <= totalFrames) { requestAnimationFrame(tick); } else { recorder.stop(); }
        }
        tick();
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logo-anim-${mode}-${size}px${transparentBg ? "-alpha" : ""}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("HD export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [config, mode, size, fps, duration, transparentBg, previewRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[560px] max-w-[90vw] max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-xl">
        <div className="px-4 py-3 border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6.47L5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">高清动画导出</h3>
              <p className="text-xs text-zinc-500">100% 还原 · WebM 视频</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <div
              className="rounded-xl border border-zinc-200 overflow-hidden"
              style={transparentBg
                ? { backgroundImage: "repeating-conic-gradient(#e4e4e7 0% 25%, #fff 0% 50%)", backgroundSize: "16px 16px" }
                : { backgroundColor: config.canvasBg || "#fff" }
              }
            >
              <canvas ref={canvasRef} style={{ width: 200, height: 200 }} />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">动画模式</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(HD_MODES).map(([key, m]) => (
                <button key={key} onClick={() => setMode(key)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                    mode === key ? "bg-violet-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}>
                  <span>{m.icon}</span>{m.name}
                </button>
              ))}
            </div>
          </div>

          {/* 透明背景 */}
          <label className="flex items-center justify-between cursor-pointer py-1 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600">透明背景</span>
              <span className="text-xs text-zinc-400">(WebM Alpha 通道)</span>
            </div>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative ${transparentBg ? 'bg-violet-500' : 'bg-zinc-300'}`}
              onClick={() => setTransparentBg(!transparentBg)}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${transparentBg ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </label>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">帧率</label>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg">
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">分辨率</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg">
                <option value={512}>512px</option>
                <option value={1024}>1024px</option>
                <option value={2048}>2048px (4K)</option>
              </select>
            </div>
          </div>

          <div className="bg-zinc-50 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-zinc-800">{Math.ceil(duration / 1000 * fps)}</div>
                <div className="text-xs text-zinc-500">总帧数</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-800">{((duration + 500) / 1000).toFixed(1)}s</div>
                <div className="text-xs text-zinc-500">时长</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-800">{size}px</div>
                <div className="text-xs text-zinc-500">分辨率</div>
              </div>
            </div>
          </div>

          <button onClick={handleExport} disabled={exporting}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
            {exporting ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60"/></svg>导出中...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>导出 WebM 视频</>
            )}
          </button>
          <p className="text-xs text-zinc-400 text-center">渐变 · 阴影 · 模糊等效果 100% 还原，可用 FFmpeg 转 MP4</p>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ============== 图标导出工具栏组件 ==============
const PREVIEW_SIZES = [
  { size: 16, label: '16', desc: 'Favicon' },
  { size: 32, label: '32', desc: 'Favicon' },
  { size: 64, label: '64', desc: 'Icon' },
  { size: 128, label: '128', desc: 'macOS' },
  { size: 180, label: '180', desc: 'Apple' },
  { size: 512, label: '512', desc: 'App' },
];

const RADIUS_PRESETS = [
  { value: 0, label: '无', desc: '方形' },
  { value: 0.1, label: '小', desc: '10%' },
  { value: 0.22, label: 'macOS', desc: '22%' },
  { value: 0.5, label: '圆', desc: '50%' },
];

function IconExportToolbar({ config, previewRef, iconScale, setIconScale, borderRadius, setBorderRadius }) {
  const [exporting, setExporting] = useState(false);
  const [previews, setPreviews] = useState([]);

  const bgColor = config.canvasBg || "#ffffff";

  // 生成预览图
  useEffect(() => {
    const svg = previewRef?.current?.querySelector("svg");
    if (!svg) return;

    const generatePreviews = async () => {
      const newPreviews = [];

      for (const { size } of PREVIEW_SIZES) {
        try {
          const displaySize = Math.min(size, 64);
          const canvas = document.createElement("canvas");
          canvas.width = displaySize;
          canvas.height = displaySize;
          const ctx = canvas.getContext("2d");

          // 绘制圆角背景
          ctx.fillStyle = bgColor;
          const radius = displaySize * borderRadius;
          ctx.beginPath();
          ctx.moveTo(radius, 0);
          ctx.lineTo(displaySize - radius, 0);
          ctx.quadraticCurveTo(displaySize, 0, displaySize, radius);
          ctx.lineTo(displaySize, displaySize - radius);
          ctx.quadraticCurveTo(displaySize, displaySize, displaySize - radius, displaySize);
          ctx.lineTo(radius, displaySize);
          ctx.quadraticCurveTo(0, displaySize, 0, displaySize - radius);
          ctx.lineTo(0, radius);
          ctx.quadraticCurveTo(0, 0, radius, 0);
          ctx.closePath();
          ctx.fill();
          ctx.clip();

          // 绘制 SVG
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);

          const img = new Image();
          await new Promise((resolve) => {
            img.onload = () => {
              const scaledSize = displaySize * iconScale;
              const offset = (displaySize - scaledSize) / 2;
              ctx.drawImage(img, offset, offset, scaledSize, scaledSize);
              URL.revokeObjectURL(url);
              resolve();
            };
            img.onerror = resolve;
            img.src = url;
          });

          newPreviews.push(canvas.toDataURL("image/png"));
        } catch (e) {
          newPreviews.push(null);
        }
      }

      setPreviews(newPreviews);
    };

    const timer = setTimeout(generatePreviews, 100);
    return () => clearTimeout(timer);
  }, [previewRef, bgColor, iconScale, borderRadius, config]);

  const exportIcon = useCallback(async (targetSize) => {
    const svg = previewRef?.current?.querySelector("svg");
    if (!svg) return null;

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext("2d");

    // 绘制圆角背景
    ctx.fillStyle = bgColor;
    const radius = targetSize * borderRadius;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(targetSize - radius, 0);
    ctx.quadraticCurveTo(targetSize, 0, targetSize, radius);
    ctx.lineTo(targetSize, targetSize - radius);
    ctx.quadraticCurveTo(targetSize, targetSize, targetSize - radius, targetSize);
    ctx.lineTo(radius, targetSize);
    ctx.quadraticCurveTo(0, targetSize, 0, targetSize - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fill();
    ctx.clip();

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scaledSize = targetSize * iconScale;
        const offset = (targetSize - scaledSize) / 2;
        ctx.drawImage(img, offset, offset, scaledSize, scaledSize);
        URL.revokeObjectURL(svgUrl);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = svgUrl;
    });
  }, [bgColor, iconScale, borderRadius, previewRef]);

  const handleExportAll = useCallback(async () => {
    if (exporting) return;
    setExporting(true);

    try {
      const allSizes = [16, 32, 64, 128, 180, 192, 512, 1024];
      for (const size of allSizes) {
        const dataUrl = await exportIcon(size);
        if (dataUrl) {
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `icon-${size}.png`;
          link.click();
          await new Promise(r => setTimeout(r, 100));
        }
      }
    } finally {
      setExporting(false);
    }
  }, [exportIcon, exporting]);

  return (
    <div className="flex flex-col gap-2 px-6 py-4 border-t border-zinc-100 bg-white">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f8f8f8] rounded-xl">
        <div className="flex items-center gap-3">
          {/* 图标占比控制 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-zinc-400 whitespace-nowrap">占比</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={iconScale}
              onChange={(e) => setIconScale(parseFloat(e.target.value))}
              className="w-14 accent-indigo-500"
            />
            <span className="text-[10px] text-zinc-500 w-7">{Math.round(iconScale * 100)}%</span>
          </div>

          <div className="w-px h-4 bg-zinc-200" />

          {/* 圆角控制 */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-zinc-400 whitespace-nowrap">圆角</span>
            <div className="flex gap-0.5">
              {RADIUS_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setBorderRadius(preset.value)}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-all ${
                    borderRadius === preset.value
                      ? 'bg-indigo-500 text-white'
                      : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                  }`}
                  title={preset.desc}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 导出按钮 */}
        <button
          onClick={handleExportAll}
          disabled={exporting}
          className="px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
        >
          {exporting ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>导出中...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>下载图标包</span>
            </>
          )}
        </button>
      </div>

      {/* 导出预览 Gallery */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f8f8] rounded-xl overflow-x-auto">
        <span className="text-[10px] text-zinc-400 flex-shrink-0">预览</span>
        <div className="flex items-end gap-2">
          {PREVIEW_SIZES.map((item, index) => (
            <div key={item.size} className="flex flex-col items-center gap-1">
              <div
                className="flex-shrink-0 bg-zinc-200 overflow-hidden"
                style={{
                  width: Math.min(item.size, 48),
                  height: Math.min(item.size, 48),
                  borderRadius: borderRadius > 0 ? `${borderRadius * Math.min(item.size, 48)}px` : '4px',
                  boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.08)',
                }}
              >
                {previews[index] && (
                  <img
                    src={previews[index]}
                    alt={`${item.size}x${item.size}`}
                    className="w-full h-full object-cover"
                    style={{ imageRendering: item.size <= 32 ? 'pixelated' : 'auto' }}
                  />
                )}
              </div>
              <span className="text-[9px] text-zinc-400">{item.label}</span>
            </div>
          ))}
        </div>
        {/* 导出格式提示 */}
        <div className="flex-shrink-0 ml-auto flex items-center gap-1.5 text-[10px] text-zinc-400">
          <span className="px-1.5 py-0.5 bg-zinc-200 rounded">PNG</span>
          <span className="text-zinc-300">16~1024px</span>
        </div>
      </div>
    </div>
  );
}

// ============== 滑块组件 ==============
function Slider({ label, value, min, max, step = 1, onChange, suffix = "" }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-zinc-500">{label}</span>
        <span className="text-zinc-700 font-mono">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-indigo-500"
      />
    </div>
  );
}

// ============== 颜色选择组件 ==============
function ColorPicker({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs text-zinc-500 flex-1">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 bg-white"
      />
      <span className="text-xs text-zinc-400 font-mono w-16">{value}</span>
    </div>
  );
}

// ============== 开关组件 ==============
function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-xs text-zinc-600">{label}</span>
      <div
        className={`w-9 h-5 rounded-full transition-colors relative ${checked ? 'bg-indigo-500' : 'bg-zinc-300'}`}
        onClick={() => onChange(!checked)}
      >
        <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </label>
  );
}

// ============== 分组组件 ==============
function Section({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded-xl p-4 mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold text-zinc-700"
      >
        {title}
        <svg className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

// ============== 形状渲染器 ==============
function ShapeRenderer({ config, width, height }) {
  const cx = width / 2;
  const cy = height / 2;

  const paths = useMemo(() => {
    const { copies, spreadRadius, copyScale, copyRotation, spiralTightness } = config;
    const baseSize = Math.min(width, height) * 0.15 * copyScale;
    const result = [];

    for (let i = 0; i < copies; i++) {
      const angle = (i * 2 * Math.PI) / copies + (copyRotation * Math.PI) / 180;
      const spiralOffset = spiralTightness * i * 5;
      const r = spreadRadius + spiralOffset;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      const rotatedConfig = {
        ...config,
        rotation: config.rotation + (i * 360) / copies,
      };

      const points = generateShapePoints(rotatedConfig, x, y, baseSize);
      const pathData = pointsToPath(points, config.shapeType !== "spiral");

      result.push({ pathData, index: i, x, y });
    }

    return result;
  }, [config, width, height, cx, cy]);

  const gradientId = "grad-" + Math.random().toString(36).substr(2, 9);
  const strokeGradientId = "stroke-grad-" + Math.random().toString(36).substr(2, 9);
  const filterId = "filter-" + Math.random().toString(36).substr(2, 9);

  const renderGradient = () => {
    if (!config.gradientEnabled) return null;

    const gradientType = config.gradientType ?? "linear";
    const gradientAngle = config.gradientAngle ?? 45;
    const gradientColors = config.gradientColors ?? ["#6366f1", "#ec4899", "#f59e0b"];
    const stops = gradientColors.map((color, i) => (
      <stop key={i} offset={`${(i / (gradientColors.length - 1)) * 100}%`} stopColor={color} />
    ));

    if (gradientType === "radial") {
      return <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">{stops}</radialGradient>;
    }

    if (gradientType === "conic") {
      return <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">{stops}</radialGradient>;
    }

    const angleRad = (gradientAngle * Math.PI) / 180;
    return (
      <linearGradient
        id={gradientId}
        x1={0.5 - Math.cos(angleRad) / 2}
        y1={0.5 - Math.sin(angleRad) / 2}
        x2={0.5 + Math.cos(angleRad) / 2}
        y2={0.5 + Math.sin(angleRad) / 2}
      >
        {stops}
      </linearGradient>
    );
  };

  const renderStrokeGradient = () => {
    if (!config.strokeGradientEnabled || !config.strokeEnabled) return null;

    const strokeGradientType = config.strokeGradientType ?? "linear";
    const strokeGradientAngle = config.strokeGradientAngle ?? 90;
    const strokeGradientColors = config.strokeGradientColors ?? ["#6366f1", "#ec4899"];
    const stops = strokeGradientColors.map((color, i) => (
      <stop key={i} offset={`${(i / (strokeGradientColors.length - 1)) * 100}%`} stopColor={color} />
    ));

    if (strokeGradientType === "radial") {
      return <radialGradient id={strokeGradientId} cx="50%" cy="50%" r="50%">{stops}</radialGradient>;
    }

    const angleRad = (strokeGradientAngle * Math.PI) / 180;
    return (
      <linearGradient
        id={strokeGradientId}
        x1={0.5 - Math.cos(angleRad) / 2}
        y1={0.5 - Math.sin(angleRad) / 2}
        x2={0.5 + Math.cos(angleRad) / 2}
        y2={0.5 + Math.sin(angleRad) / 2}
      >
        {stops}
      </linearGradient>
    );
  };

  const renderFilter = () => {
    if (!config.blurEnabled && !config.shadowEnabled) return null;

    return (
      <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
        {config.shadowEnabled && (
          <feDropShadow
            dx={config.shadowX}
            dy={config.shadowY}
            stdDeviation={config.shadowBlur}
            floodColor={config.shadowColor}
          />
        )}
        {config.blurEnabled && (
          <feGaussianBlur stdDeviation={config.blurAmount} />
        )}
      </filter>
    );
  };

  const fillValue = config.gradientEnabled ? `url(#${gradientId})` : config.fillColor;
  const strokeValue = config.strokeGradientEnabled ? `url(#${strokeGradientId})` : config.strokeColor;
  const filterValue = (config.blurEnabled || config.shadowEnabled) ? `url(#${filterId})` : undefined;

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        {renderGradient()}
        {renderStrokeGradient()}
        {renderFilter()}
      </defs>

      <g filter={filterValue}>
        {paths.map(({ pathData, index }) => (
          <path
            key={index}
            d={pathData}
            fill={config.fillEnabled ? fillValue : "none"}
            fillOpacity={config.fillOpacity}
            fillRule="evenodd"
            stroke={config.strokeEnabled ? strokeValue : "none"}
            strokeWidth={config.strokeWidth}
            strokeOpacity={config.strokeOpacity}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
      </g>
    </svg>
  );
}

// ============== 主组件 ==============
function GenerativeVectorLab2() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const previewRef = useRef(null);
  const [showLottieExporter, setShowLottieExporter] = useState(false);
  const [showHDExporter, setShowHDExporter] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [iconScale, setIconScale] = useState(0.7);
  const [borderRadius, setBorderRadius] = useState(0.22);

  const updateConfig = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  // 解析并恢复参数（支持 README markdown 和纯 JSON）
  const handleApplyImport = useCallback(() => {
    try {
      setImportError("");
      const jsonMatch = importText.match(/```json\s*([\s\S]*?)```/i);
      const candidate = jsonMatch ? jsonMatch[1].trim() : importText.trim();
      if (!candidate) throw new Error("未找到可解析的 JSON 内容");
      const payload = JSON.parse(candidate);
      const sourceConfig = payload?.config ?? payload;
      if (!sourceConfig || typeof sourceConfig !== "object") throw new Error("未找到可用的配置对象");
      const nextConfig = { ...DEFAULT_CONFIG, ...sourceConfig };
      if (payload?.export?.bgColor) nextConfig.canvasBg = payload.export.bgColor;
      setConfig(nextConfig);
      if (payload?.export?.iconScale !== undefined) setIconScale(payload.export.iconScale);
      if (payload?.export?.borderRadius !== undefined) setBorderRadius(payload.export.borderRadius);
      setShowImport(false);
      setImportText("");
    } catch (err) {
      setImportError(err?.message || "解析失败，请确认内容格式");
    }
  }, [importText]);

  const randomize = useCallback(() => {
    const shapes = ["circle", "polygon", "star", "flower", "wave", "spiral"];
    const colors = [
      "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f59e0b",
      "#10b981", "#06b6d4", "#3b82f6", "#a855f7", "#14b8a6"
    ];

    const randomColor = () => colors[Math.floor(Math.random() * colors.length)];
    const useFillGradient = Math.random() > 0.5;
    const useStrokeGradient = Math.random() > 0.6;

    setConfig({
      ...DEFAULT_CONFIG,
      shapeType: shapes[Math.floor(Math.random() * shapes.length)],
      sides: Math.floor(Math.random() * 10) + 3,
      innerRadius: Math.random() * 0.6 + 0.2,
      rotation: Math.random() * 360,
      copies: Math.floor(Math.random() * 12) + 3,
      spreadRadius: Math.random() * 100 + 50,
      copyScale: Math.random() * 1.5 + 0.5,
      fillColor: randomColor(),
      strokeColor: randomColor(),
      gradientEnabled: useFillGradient,
      gradientColors: [randomColor(), randomColor(), randomColor()],
      strokeGradientEnabled: useStrokeGradient,
      strokeGradientColors: [randomColor(), randomColor()],
      strokeGradientAngle: Math.random() * 360,
      canvasBg: "#ffffff",
    });
  }, []);

  const exportSVG = useCallback(() => {
    if (!previewRef.current) return;
    const svgElement = previewRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `generative-v2-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const shapeOptions = [
    { key: "circle", label: "圆形", icon: "●" },
    { key: "polygon", label: "多边", icon: "⬡" },
    { key: "star", label: "星形", icon: "★" },
    { key: "flower", label: "花朵", icon: "✿" },
    { key: "wave", label: "波浪", icon: "〰" },
    { key: "spiral", label: "螺旋", icon: "🌀" },
  ];

  return (
    <div className="flex h-full w-full bg-[#f8f8f8] overflow-hidden font-sans rounded-2xl">
      {/* 左侧控制面板 */}
      <div className="w-72 flex-shrink-0 bg-[#f8f8f8] overflow-y-auto p-4">
        {/* 标题 */}
        <div className="bg-white rounded-xl p-4 mb-3">
          <h1 className="text-lg font-bold text-zinc-800">
            Generative Lab
            <span className="ml-2 text-xs font-normal text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">2.0</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">参数化矢量系统</p>
        </div>

        {/* 形状设置 */}
        <Section title="基础形状">
          <div className="grid grid-cols-6 gap-1.5 mb-3">
            {shapeOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => updateConfig({ shapeType: opt.key })}
                className={`p-2 rounded-lg text-center transition-all ${
                  config.shapeType === opt.key
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
                title={opt.label}
              >
                <span className="text-sm">{opt.icon}</span>
              </button>
            ))}
          </div>
          <Slider label="边数/频率" value={config.sides} min={3} max={20} onChange={(v) => updateConfig({ sides: v })} />
          <Slider label="内半径" value={config.innerRadius} min={0.1} max={0.9} step={0.01} onChange={(v) => updateConfig({ innerRadius: v })} />
          <Slider label="旋转" value={config.rotation} min={0} max={360} onChange={(v) => updateConfig({ rotation: v })} suffix="°" />
        </Section>

        {/* 阵列设置 */}
        <Section title="阵列变换">
          <Slider label="副本数" value={config.copies} min={1} max={24} onChange={(v) => updateConfig({ copies: v })} />
          <Slider label="扩散半径" value={config.spreadRadius} min={0} max={200} onChange={(v) => updateConfig({ spreadRadius: v })} />
          <Slider label="副本缩放" value={config.copyScale} min={0.2} max={3} step={0.1} onChange={(v) => updateConfig({ copyScale: v })} />
          <Slider label="螺旋紧度" value={config.spiralTightness} min={0} max={5} step={0.1} onChange={(v) => updateConfig({ spiralTightness: v })} />
        </Section>

        {/* 填充设置 */}
        <Section title="填充样式">
          <Toggle label="启用填充" checked={config.fillEnabled} onChange={(v) => updateConfig({ fillEnabled: v })} />
          {config.fillEnabled && (
            <>
              {/* 纯色/渐变切换 */}
              <div className="grid grid-cols-2 gap-1.5 my-2">
                <button
                  onClick={() => updateConfig({ gradientEnabled: false })}
                  className={`py-1.5 rounded-lg text-xs transition-all ${
                    !config.gradientEnabled
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  纯色
                </button>
                <button
                  onClick={() => updateConfig({ gradientEnabled: true })}
                  className={`py-1.5 rounded-lg text-xs transition-all ${
                    config.gradientEnabled
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  渐变
                </button>
              </div>

              {!config.gradientEnabled ? (
                <ColorPicker label="填充色" value={config.fillColor} onChange={(v) => updateConfig({ fillColor: v })} />
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-1.5 my-2">
                    {["linear", "radial", "conic"].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateConfig({ gradientType: type })}
                        className={`py-1.5 rounded-lg text-xs transition-all ${
                          config.gradientType === type
                            ? "bg-indigo-500 text-white"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {type === "linear" ? "线性" : type === "radial" ? "径向" : "圆锥"}
                      </button>
                    ))}
                  </div>
                  <Slider label="渐变角度" value={config.gradientAngle ?? 45} min={0} max={360} onChange={(v) => updateConfig({ gradientAngle: v })} suffix="°" />
                  <div className="space-y-1 mt-2">
                    {(config.gradientColors ?? ["#6366f1", "#ec4899", "#f59e0b"]).map((color, i) => (
                      <ColorPicker
                        key={i}
                        label={`颜色 ${i + 1}`}
                        value={color}
                        onChange={(v) => {
                          const newColors = [...(config.gradientColors ?? ["#6366f1", "#ec4899", "#f59e0b"])];
                          newColors[i] = v;
                          updateConfig({ gradientColors: newColors });
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              <Slider label="不透明度" value={config.fillOpacity} min={0} max={1} step={0.01} onChange={(v) => updateConfig({ fillOpacity: v })} />
            </>
          )}
        </Section>

        {/* 描边设置 */}
        <Section title="描边样式">
          <Toggle label="启用描边" checked={config.strokeEnabled} onChange={(v) => updateConfig({ strokeEnabled: v })} />
          {config.strokeEnabled && (
            <>
              {/* 纯色/渐变切换 */}
              <div className="grid grid-cols-2 gap-1.5 my-2">
                <button
                  onClick={() => updateConfig({ strokeGradientEnabled: false })}
                  className={`py-1.5 rounded-lg text-xs transition-all ${
                    !config.strokeGradientEnabled
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  纯色
                </button>
                <button
                  onClick={() => updateConfig({ strokeGradientEnabled: true })}
                  className={`py-1.5 rounded-lg text-xs transition-all ${
                    config.strokeGradientEnabled
                      ? "bg-indigo-500 text-white"
                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                  }`}
                >
                  渐变
                </button>
              </div>

              {!config.strokeGradientEnabled ? (
                <ColorPicker label="描边色" value={config.strokeColor} onChange={(v) => updateConfig({ strokeColor: v })} />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-1.5 my-2">
                    {["linear", "radial"].map((type) => (
                      <button
                        key={type}
                        onClick={() => updateConfig({ strokeGradientType: type })}
                        className={`py-1.5 rounded-lg text-xs transition-all ${
                          config.strokeGradientType === type
                            ? "bg-indigo-500 text-white"
                            : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {type === "linear" ? "线性" : "径向"}
                      </button>
                    ))}
                  </div>
                  <Slider label="渐变角度" value={config.strokeGradientAngle ?? 90} min={0} max={360} onChange={(v) => updateConfig({ strokeGradientAngle: v })} suffix="°" />
                  <div className="space-y-1 mt-2">
                    {(config.strokeGradientColors ?? ["#6366f1", "#ec4899"]).map((color, i) => (
                      <ColorPicker
                        key={i}
                        label={`颜色 ${i + 1}`}
                        value={color}
                        onChange={(v) => {
                          const newColors = [...(config.strokeGradientColors ?? ["#6366f1", "#ec4899"])];
                          newColors[i] = v;
                          updateConfig({ strokeGradientColors: newColors });
                        }}
                      />
                    ))}
                  </div>
                </>
              )}

              <Slider label="宽度" value={config.strokeWidth} min={0.5} max={10} step={0.5} onChange={(v) => updateConfig({ strokeWidth: v })} />
              <Slider label="不透明度" value={config.strokeOpacity} min={0} max={1} step={0.01} onChange={(v) => updateConfig({ strokeOpacity: v })} />
            </>
          )}
        </Section>

        {/* 效果设置 */}
        <Section title="特效" defaultOpen={false}>
          <Toggle label="模糊" checked={config.blurEnabled} onChange={(v) => updateConfig({ blurEnabled: v })} />
          {config.blurEnabled && (
            <Slider label="模糊量" value={config.blurAmount} min={0} max={20} onChange={(v) => updateConfig({ blurAmount: v })} />
          )}
          <Toggle label="阴影" checked={config.shadowEnabled} onChange={(v) => updateConfig({ shadowEnabled: v })} />
          {config.shadowEnabled && (
            <>
              <Slider label="X 偏移" value={config.shadowX} min={-20} max={20} onChange={(v) => updateConfig({ shadowX: v })} />
              <Slider label="Y 偏移" value={config.shadowY} min={-20} max={20} onChange={(v) => updateConfig({ shadowY: v })} />
              <Slider label="模糊" value={config.shadowBlur} min={0} max={30} onChange={(v) => updateConfig({ shadowBlur: v })} />
            </>
          )}
        </Section>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl overflow-hidden">
        {/* 工具栏 */}
        <div className="h-14 border-b border-zinc-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">画布背景</span>
            <input
              type="color"
              value={config.canvasBg}
              onChange={(e) => updateConfig({ canvasBg: e.target.value })}
              className="w-8 h-8 rounded-lg cursor-pointer border border-zinc-200 bg-white"
            />

            <div className="h-6 w-px bg-zinc-200 mx-2" />

            {/* Lottie 导出按钮 */}
            <button
              onClick={() => setShowLottieExporter(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              title="导出 Lottie 动画"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
              </svg>
              Lottie
            </button>

            <button
              onClick={() => setShowHDExporter(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
              title="高清动画导出 (WebM)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              HD 动画
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => { setImportError(""); setShowImport(true); }}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="从 JSON 恢复参数"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              恢复参数
            </button>
            <button
              onClick={randomize}
              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              随机生成
            </button>
            <button
              onClick={exportSVG}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出 SVG
            </button>
          </div>
        </div>

        {/* 画布区域 */}
        <div
          className="flex-1 flex items-center justify-center p-8"
          style={{ backgroundColor: config.canvasBg }}
        >
          <div
            ref={previewRef}
            className="aspect-square max-w-full max-h-full rounded-xl overflow-hidden"
            style={{ width: config.canvasSize, height: config.canvasSize }}
          >
            <ShapeRenderer config={config} width={config.canvasSize} height={config.canvasSize} />
          </div>
        </div>

        {/* 底部图标导出工具栏 */}
        <IconExportToolbar
          config={config}
          previewRef={previewRef}
          iconScale={iconScale}
          setIconScale={setIconScale}
          borderRadius={borderRadius}
          setBorderRadius={setBorderRadius}
        />

        {/* Lottie 动画导出弹窗 */}
        {showLottieExporter && (
          <LottieExporter config={config} onClose={() => setShowLottieExporter(false)} />
        )}
        {showHDExporter && (
          <HDAnimationExporter config={config} previewRef={previewRef} onClose={() => setShowHDExporter(false)} />
        )}

        {/* 参数恢复弹窗 */}
        {showImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowImport(false)} />
            <div className="relative w-[520px] max-w-[90vw] bg-white rounded-2xl shadow-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-800 mb-3">恢复参数</h3>
              <p className="text-xs text-zinc-400 mb-3">粘贴 JSON 配置（支持 README 中的 ```json 代码块或纯 JSON）</p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={'{\n  "config": { "shapeType": "polygon", ... },\n  "export": { "bgColor": "#ffffff" }\n}'}
                className="w-full h-48 text-xs font-mono text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200 resize-none"
              />
              {importError && <div className="mt-2 text-xs text-red-500">{importError}</div>}
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setShowImport(false)} className="px-4 py-2 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-lg hover:bg-zinc-200 transition-colors">取消</button>
                <button onClick={handleApplyImport} className="px-4 py-2 text-xs font-medium text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors">解析并恢复</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerativeVectorLab2;
