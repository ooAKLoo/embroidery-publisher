import { useState, useCallback, useRef, useEffect } from "react";
import { DEFAULT_CONFIG, PRESETS } from "./constants";
import ControlPanel from "./ControlPanel";
import ShapeRenderer from "./ShapeRenderer";
import { generateAtomPoints, generateVariation } from "./utils/math";
import PreviewToolbar from "../GeometricLogoGenerator/components/PreviewToolbar";

// 图标组件
const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const SparklesIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const ShuffleIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const GridIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const SwatchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h10a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 9H4a2 2 0 00-2 2v6a2 2 0 002 2h1" />
  </svg>
);

const MonitorIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

function GenerativeVectorLab() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [variations, setVariations] = useState([]);
  const [viewMode, setViewMode] = useState("single");
  const [iconScale, setIconScale] = useState(0.7);
  const [borderRadius, setBorderRadius] = useState(0.22);
  const [saving, setSaving] = useState(false);
  const previewRef = useRef(null);
  const previewAreaRef = useRef(null);
  const [zoom, setZoom] = useState(100);
  const zoomRef = useRef(100);
  const zoomUpdateTimeoutRef = useRef(null);
  const [baseSize, setBaseSize] = useState(800);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const readmeMeta = {
    generator: "GenerativeVectorLab",
    config,
    export: {
      bgColor: config.canvasBg ?? "#ffffff",
      iconScale,
      borderRadius,
    },
  };

  useEffect(() => {
    const el = previewAreaRef.current;
    if (!el || viewMode !== "single") return;

    const updateBaseSize = () => {
      const { clientWidth, clientHeight } = el;
      const nextSize = Math.max(200, Math.min(clientWidth, clientHeight));
      setBaseSize(nextSize);
    };

    updateBaseSize();
    const resizeObserver = new ResizeObserver(updateBaseSize);
    resizeObserver.observe(el);

    const wheelHandler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();

        const zoomFactor = 1 - e.deltaY * 0.003;
        const newZoom = Math.min(400, Math.max(25, zoomRef.current * zoomFactor));
        zoomRef.current = newZoom;

        if (zoomUpdateTimeoutRef.current) {
          clearTimeout(zoomUpdateTimeoutRef.current);
        }
        zoomUpdateTimeoutRef.current = setTimeout(() => {
          const finalZoom = Math.round(zoomRef.current);
          zoomRef.current = finalZoom;
          setZoom(finalZoom);
        }, 150);
      }
    };

    el.addEventListener("wheel", wheelHandler, { passive: false });
    return () => {
      el.removeEventListener("wheel", wheelHandler);
      resizeObserver.disconnect();
      if (zoomUpdateTimeoutRef.current) {
        clearTimeout(zoomUpdateTimeoutRef.current);
      }
    };
  }, [viewMode]);

  const resetZoom = useCallback(() => {
    zoomRef.current = 100;
    setZoom(100);
  }, []);

  const previewSize = Math.round(baseSize * (zoom / 100));

  const parseReadmeConfig = useCallback((text) => {
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/i);
    const candidate = jsonBlockMatch ? jsonBlockMatch[1].trim() : text.trim();
    if (!candidate) {
      throw new Error("未找到可解析的 JSON 内容");
    }
    return JSON.parse(candidate);
  }, []);

  const handleApplyImport = useCallback(() => {
    try {
      setImportError("");
      const payload = parseReadmeConfig(importText);
      const sourceConfig = payload?.config ?? payload;
      if (!sourceConfig || typeof sourceConfig !== "object") {
        throw new Error("未找到可用的配置对象");
      }
      const nextConfig = { ...DEFAULT_CONFIG, ...sourceConfig };
      if (payload?.export?.bgColor) {
        nextConfig.canvasBg = payload.export.bgColor;
      }
      setConfig(nextConfig);
      if (payload?.export?.iconScale !== undefined) {
        setIconScale(payload.export.iconScale);
      }
      if (payload?.export?.borderRadius !== undefined) {
        setBorderRadius(payload.export.borderRadius);
      }
      setViewMode("single");
      setShowImport(false);
      setImportText("");
    } catch (err) {
      setImportError(err?.message || "解析失败，请确认内容格式");
    }
  }, [importText, parseReadmeConfig, setConfig]);

  const buildSvgMarkup = (cfg, size = 800) => {
    const cx = size / 2;
    const cy = size / 2;
    const count = Math.max(1, cfg.count);
    const scale = Math.max(0.01, cfg.scale);
    const angleStep = (2 * Math.PI) / count;
    const globalRotRad = (cfg.rotation * Math.PI) / 180;
    const basePoints = generateAtomPoints(cfg, 0, 0);
    const fmt = (value) => Number.isFinite(value) ? value.toFixed(3) : "0";

    const toPath = (points) => {
      if (points.length === 0) return "";
      const [first, ...rest] = points;
      const segments = rest.map((p) => `L ${fmt(p.x)} ${fmt(p.y)}`).join(" ");
      return `M ${fmt(first.x)} ${fmt(first.y)} ${segments} Z`;
    };

    const pathParts = [];
    const pathItems = [];
    for (let i = 0; i < count; i += 1) {
      const theta = i * angleStep;
      const x = cfg.arrayRadius * Math.cos(theta + globalRotRad);
      const y = cfg.arrayRadius * Math.sin(theta + globalRotRad);
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

      const d = toPath(transformed);
      pathParts.push(d);
      pathItems.push({ d, index: i });
    }

    const compoundPath = pathParts.join(" ");
    const fillRule = cfg.useNegativeSpace ? "evenodd" : "nonzero";
    const showInvert = cfg.useNegativeSpace && cfg.invertFill;
    const useGradientFill = cfg.useGradient && cfg.fill !== "none";
    const useGradientStroke = cfg.strokeUseGradient && cfg.stroke !== "none";
    const gradientNeeded = useGradientFill || useGradientStroke;
    const gradientType = cfg.gradientType || "linear";
    const strokeGradientType = cfg.strokeGradientType || "linear";
    const isArrayStrokeGradient = strokeGradientType === "array-cw" || strokeGradientType === "array-ccw";
    const fillValue = useGradientFill ? "url(#shape-gradient)" : cfg.fill;
    const strokeValue = useGradientStroke && !isArrayStrokeGradient ? "url(#stroke-gradient)" : cfg.stroke;
    const angleRad = ((cfg.gradientAngle ?? 45) * Math.PI) / 180;
    const gradX1 = (0.5 - Math.cos(angleRad) / 2).toFixed(4);
    const gradY1 = (0.5 - Math.sin(angleRad) / 2).toFixed(4);
    const gradX2 = (0.5 + Math.cos(angleRad) / 2).toFixed(4);
    const gradY2 = (0.5 + Math.sin(angleRad) / 2).toFixed(4);
    const radialCx = (cfg.gradientRadialCx ?? 0.5).toFixed(4);
    const radialCy = (cfg.gradientRadialCy ?? 0.5).toFixed(4);
    const radialStrength = cfg.gradientRadialStrength;
    const radialRValue =
      radialStrength !== undefined && radialStrength !== null
        ? 0.85 - Math.min(Math.max(radialStrength, 0), 1) * 0.5
        : (cfg.gradientRadialR ?? 0.6);
    const radialR = radialRValue.toFixed(4);
    const clamp01 = (value, fallback) => {
      const num = Number(value);
      if (!Number.isFinite(num)) return fallback;
      return Math.min(1, Math.max(0, num));
    };
    const gradientFromPos = clamp01(cfg.gradientFromPos, 0);
    const gradientToPos = clamp01(cfg.gradientToPos, 1);
    const stopFrom = Math.min(gradientFromPos, gradientToPos);
    const stopTo = Math.max(gradientFromPos, gradientToPos);
    const stopFromOffset = `${(stopFrom * 100).toFixed(1)}%`;
    const stopToOffset = `${(stopTo * 100).toFixed(1)}%`;
    const gradientStart = cfg.gradientInvert ? cfg.gradientTo : cfg.gradientFrom;
    const gradientEnd = cfg.gradientInvert ? cfg.gradientFrom : cfg.gradientTo;
    const strokeGradientFrom = cfg.strokeGradientFrom ?? "#6366f1";
    const strokeGradientTo = cfg.strokeGradientTo ?? "#22d3ee";
    const strokeGradientStart = cfg.gradientInvert ? strokeGradientTo : strokeGradientFrom;
    const strokeGradientEnd = cfg.gradientInvert ? strokeGradientFrom : strokeGradientTo;
    const styleMode = cfg.styleMode ?? "custom";
    const isCustomStyle = styleMode === "custom";
    const isGlassStyle = styleMode === "glass";
    const isGradientStyle = styleMode === "gradient";
    const isMeshStyle = styleMode === "mesh";
    const isMaterialStyle = styleMode === "material";
    const isMinimalStyle = styleMode === "minimal";
    const primaryColor = cfg.fill !== "none"
      ? cfg.fill
      : (cfg.stroke !== "none" ? cfg.stroke : (cfg.gradientFrom ?? "#6366f1"));
    const secondaryColor = cfg.stroke !== "none"
      ? cfg.stroke
      : (cfg.gradientTo ?? "#22d3ee");
    const normalizeHex = (value) => {
      if (!value) return "#6366f1";
      const hex = String(value).trim().replace("#", "");
      if (hex.length === 3) {
        return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
      }
      if (hex.length === 6) return `#${hex}`;
      return "#6366f1";
    };
    const hexToRgb = (value) => {
      const hex = normalizeHex(value).replace("#", "");
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return { r, g, b };
    };
    const mixHex = (a, b, t) => {
      const mix = Math.min(1, Math.max(0, Number(t)));
      const colorA = hexToRgb(a);
      const colorB = hexToRgb(b);
      const toHex = (v) => Math.round(v).toString(16).padStart(2, "0");
      const r = colorA.r + (colorB.r - colorA.r) * mix;
      const g = colorA.g + (colorB.g - colorA.g) * mix;
      const bVal = colorA.b + (colorB.b - colorA.b) * mix;
      return `#${toHex(r)}${toHex(g)}${toHex(bVal)}`;
    };
    const meshBaseA = gradientStart ?? primaryColor;
    const meshBaseB = gradientEnd ?? secondaryColor;
    const meshMidA = mixHex(meshBaseA, meshBaseB, 0.35);
    const meshMidB = mixHex(meshBaseA, meshBaseB, 0.7);
    const meshCenter = mixHex(meshBaseA, meshBaseB, 0.5);
    const meshCenterX = clamp01(cfg.gradientRadialCx, 0.5);
    const meshCenterY = clamp01(cfg.gradientRadialCy, 0.5);
    const meshStrength = clamp01(cfg.gradientRadialStrength, 0.6);
    const meshSpread = 0.25 + (1 - meshStrength) * 0.2;
    const meshRadius = 0.65 + (1 - meshStrength) * 0.15;
    const meshPoints = [
      { id: "mesh-0", cx: clamp01(meshCenterX - meshSpread, meshCenterX), cy: clamp01(meshCenterY - meshSpread, meshCenterY), color: meshBaseA },
      { id: "mesh-1", cx: clamp01(meshCenterX + meshSpread, meshCenterX), cy: clamp01(meshCenterY - meshSpread, meshCenterY), color: meshMidA },
      { id: "mesh-2", cx: clamp01(meshCenterX - meshSpread, meshCenterX), cy: clamp01(meshCenterY + meshSpread, meshCenterY), color: meshMidB },
      { id: "mesh-3", cx: clamp01(meshCenterX + meshSpread, meshCenterX), cy: clamp01(meshCenterY + meshSpread, meshCenterY), color: meshBaseB },
      { id: "mesh-4", cx: meshCenterX, cy: meshCenterY, color: meshCenter },
    ];
    const gradientDef = isCustomStyle && gradientNeeded
      ? gradientType === "radial"
        ? `<radialGradient id="shape-gradient" cx="${radialCx}" cy="${radialCy}" r="${radialR}" fx="${radialCx}" fy="${radialCy}">
      <stop offset="${stopFromOffset}" stop-color="${gradientStart}" />
      <stop offset="${stopToOffset}" stop-color="${gradientEnd}" />
    </radialGradient>`
        : `<linearGradient id="shape-gradient" x1="${gradX1}" y1="${gradY1}" x2="${gradX2}" y2="${gradY2}">
      <stop offset="${stopFromOffset}" stop-color="${gradientStart}" />
      <stop offset="${stopToOffset}" stop-color="${gradientEnd}" />
    </linearGradient>`
      : "";
    const shadowEnabled = Boolean(cfg.shadowEnabled);
    const innerShadowEnabled = Boolean(cfg.innerShadowEnabled);
    const hasFill = cfg.fill !== "none";
    const hasStroke = cfg.stroke !== "none";
    const allowInnerShadow = innerShadowEnabled && !showInvert && (hasFill || hasStroke);
    const doubleStrokeEnabled = Boolean(cfg.doubleStrokeEnabled) && hasStroke;
    const doubleStrokeWidth = (cfg.doubleStrokeWidth ?? 0) / scale;
    const doubleStrokeOpacity = cfg.doubleStrokeOpacity ?? 0.6;
    const doubleStrokeColor = cfg.doubleStrokeColor ?? "#0f172a";
    const extrudeEnabled =
      Boolean(cfg.extrudeEnabled) && (cfg.fill !== "none" || cfg.stroke !== "none");
    const extrudeDepth = Math.max(1, Math.round(cfg.extrudeDepth ?? 0));
    const extrudeOffsetX = cfg.extrudeOffsetX ?? 0;
    const extrudeOffsetY = cfg.extrudeOffsetY ?? 0;
    const extrudeOpacity = Math.max(0, Math.min(1, cfg.extrudeOpacity ?? 0.6));
    const extrudeFade = Math.max(0, Math.min(1, cfg.extrudeFade ?? 0.6));
    const extrudeColor = cfg.extrudeColor ?? "#111827";
    const extrudeStepX = extrudeDepth > 0 ? extrudeOffsetX / extrudeDepth : 0;
    const extrudeStepY = extrudeDepth > 0 ? extrudeOffsetY / extrudeDepth : 0;
    const extrudeIsStrokeOnly = !hasFill && hasStroke;
    const extrudeFill = extrudeColor;
    const extrudeStroke = "none";
    const strokeWidth = cfg.strokeWidth / scale;
    const strokeLinecap = cfg.strokeLinecap ?? "round";
    const strokeAvailable = hasStroke;
    const dashEnabled = Boolean(cfg.strokeDashEnabled) && strokeAvailable;
    const dashLength = Math.max(0.1, cfg.strokeDashLength ?? 6) / scale;
    const dashGap = Math.max(0.1, cfg.strokeDashGap ?? 6) / scale;
    const dashOffset = (cfg.strokeDashOffset ?? 0) / scale;
    const dashAttr = dashEnabled
      ? ` stroke-dasharray="${fmt(dashLength)} ${fmt(dashGap)}" stroke-dashoffset="${fmt(dashOffset)}"`
      : "";
    const strokeStyleValue = cfg.strokeUseGradient && !isCustomStyle && !isGradientStyle
      ? "url(#stroke-gradient)"
      : (cfg.stroke !== "none" ? cfg.stroke : strokeValue);
    const styleStrokeWidth = Math.max(1, cfg.strokeWidth);
    const glowRadius = Math.min(size, size) * 0.35;
    const highlightRadius = Math.min(size, size) * 0.08;
    const outerStrokePath = doubleStrokeEnabled
      ? `  <path d="${compoundPath}" fill="none" stroke="${doubleStrokeColor}" stroke-width="${fmt(strokeWidth + doubleStrokeWidth)}" stroke-linejoin="round" stroke-linecap="${strokeLinecap}"${dashAttr} fill-rule="${fillRule}" clip-rule="${fillRule}" opacity="${doubleStrokeOpacity}" />`
      : "";
    // 计算阵列渐变颜色的函数
    const getArrayStrokeColor = (index, total) => {
      if (!isArrayStrokeGradient || total <= 1) return cfg.stroke;
      const isClockwise = strokeGradientType === "array-cw";
      const t = isClockwise 
        ? index / (total - 1)
        : (total - 1 - index) / (total - 1);
      return mixHex(strokeGradientStart ?? "#6366f1", strokeGradientEnd ?? "#22d3ee", t);
    };
    const innerStrokePath =
      cfg.stroke !== "none"
        ? isArrayStrokeGradient && useGradientStroke
          ? pathItems.map((item) => 
              `  <path d="${item.d}" fill="none" stroke="${getArrayStrokeColor(item.index, pathItems.length)}" stroke-width="${fmt(strokeWidth)}" stroke-linejoin="round" stroke-linecap="${strokeLinecap}"${dashAttr} opacity="${cfg.opacity}" />`
            ).join("\n")
          : `  <path d="${compoundPath}" fill="none" stroke="${strokeValue}" stroke-width="${fmt(strokeWidth)}" stroke-linejoin="round" stroke-linecap="${strokeLinecap}"${dashAttr} fill-rule="${fillRule}" clip-rule="${fillRule}" opacity="${cfg.opacity}" />`
        : "";
    const extrudePaths = extrudeEnabled && extrudeDepth > 0
      ? Array.from({ length: extrudeDepth }).map((_, idx) => {
          const step = extrudeDepth - idx;
          const t = step / extrudeDepth;
          const layerOpacity = Math.max(0, extrudeOpacity * (1 - t * extrudeFade));
          const offsetX = fmt(extrudeStepX * step);
          const offsetY = fmt(extrudeStepY * step);
          const strokeAttrs = extrudeIsStrokeOnly
            ? ` stroke="${extrudeStroke}" stroke-width="${fmt(strokeWidth)}" stroke-linejoin="round" stroke-linecap="${strokeLinecap}"${dashAttr}`
            : ` stroke="none"`;
          return `  <path d="${compoundPath}" transform="translate(${offsetX} ${offsetY})" fill="${extrudeFill}"${strokeAttrs} fill-rule="${fillRule}" clip-rule="${fillRule}" opacity="${layerOpacity.toFixed(3)}" />`;
        }).join("\n")
      : "";
    const dropShadowDef = shadowEnabled
      ? `<filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${fmt(cfg.shadowBlur ?? 0)}" result="shadowBlur" />
    <feOffset in="shadowBlur" dx="${fmt(cfg.shadowX ?? 0)}" dy="${fmt(cfg.shadowY ?? 0)}" result="shadowOffset" />
    <feFlood flood-color="${cfg.shadowColor ?? "#000000"}" flood-opacity="${fmt(cfg.shadowOpacity ?? 0.35)}" result="shadowColor" />
    <feComposite in="shadowColor" in2="shadowOffset" operator="in" result="shadow" />
    <feMerge>
      <feMergeNode in="shadow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>`
      : "";
    const innerShadowDef = allowInnerShadow
      ? `<filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%" color-interpolation-filters="sRGB">
    <feGaussianBlur in="SourceAlpha" stdDeviation="${fmt(cfg.innerShadowBlur ?? 0)}" result="innerBlur" />
    <feOffset in="innerBlur" dx="${fmt(cfg.innerShadowX ?? 0)}" dy="${fmt(cfg.innerShadowY ?? 0)}" result="innerOffset" />
    <feComposite in="innerOffset" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
    <feFlood flood-color="${cfg.innerShadowColor ?? "#000000"}" flood-opacity="${fmt(cfg.innerShadowOpacity ?? 0.4)}" result="innerColor" />
    <feComposite in="innerColor" in2="innerShadow" operator="in" result="innerShadowColor" />
    <feComposite in="SourceGraphic" in2="innerShadowColor" operator="over" />
  </filter>`
      : "";
    const clipPathDef = isCustomStyle && showInvert
      ? `<clipPath id="union-clip">
    <path d="${compoundPath}" fill-rule="nonzero" clip-rule="nonzero" />
  </clipPath>`
      : "";
    const petalGradientDefs = isGradientStyle
      ? pathItems.map((item) => {
          const angle = ((cfg.gradientAngle ?? 45) + (pathItems.length > 0 ? (item.index * 360) / pathItems.length : 0)) * Math.PI / 180;
          const x1 = (0.5 - Math.cos(angle) / 2).toFixed(4);
          const y1 = (0.5 - Math.sin(angle) / 2).toFixed(4);
          const x2 = (0.5 + Math.cos(angle) / 2).toFixed(4);
          const y2 = (0.5 + Math.sin(angle) / 2).toFixed(4);
          return `<linearGradient id="petal-gradient-${item.index}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="${stopFromOffset}" stop-color="${gradientStart}" />
      <stop offset="${stopToOffset}" stop-color="${gradientEnd}" />
    </linearGradient>`;
        }).join("\n")
      : "";
    const strokePetalGradientDefs = isGradientStyle && cfg.strokeUseGradient
      ? pathItems.map((item) => {
          const angle = ((cfg.gradientAngle ?? 45) + (pathItems.length > 0 ? (item.index * 360) / pathItems.length : 0)) * Math.PI / 180;
          const x1 = (0.5 - Math.cos(angle) / 2).toFixed(4);
          const y1 = (0.5 - Math.sin(angle) / 2).toFixed(4);
          const x2 = (0.5 + Math.cos(angle) / 2).toFixed(4);
          const y2 = (0.5 + Math.sin(angle) / 2).toFixed(4);
          return `<linearGradient id="petal-stroke-gradient-${item.index}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="${stopFromOffset}" stop-color="${strokeGradientStart}" />
      <stop offset="${stopToOffset}" stop-color="${strokeGradientEnd}" />
    </linearGradient>`;
        }).join("\n")
      : "";
    const strokeGradientDef = cfg.strokeUseGradient && !isArrayStrokeGradient
      ? strokeGradientType === "linear"
        ? `<linearGradient id="stroke-gradient" x1="${gradX1}" y1="${gradY1}" x2="${gradX2}" y2="${gradY2}">
    <stop offset="${stopFromOffset}" stop-color="${strokeGradientStart}" />
    <stop offset="${stopToOffset}" stop-color="${strokeGradientEnd}" />
  </linearGradient>`
        : strokeGradientType === "radial-in"
          ? `<radialGradient id="stroke-gradient" cx="${radialCx}" cy="${radialCy}" r="${radialR}" fx="${radialCx}" fy="${radialCy}">
    <stop offset="${stopFromOffset}" stop-color="${strokeGradientStart}" />
    <stop offset="${stopToOffset}" stop-color="${strokeGradientEnd}" />
  </radialGradient>`
          : strokeGradientType === "radial-out"
            ? `<radialGradient id="stroke-gradient" cx="${radialCx}" cy="${radialCy}" r="${radialR}" fx="${radialCx}" fy="${radialCy}">
    <stop offset="${stopFromOffset}" stop-color="${strokeGradientEnd}" />
    <stop offset="${stopToOffset}" stop-color="${strokeGradientStart}" />
  </radialGradient>`
            : ""
      : "";
    const meshDefs = isMeshStyle
      ? meshPoints.map((point) => (
          `<radialGradient id="${point.id}" cx="${point.cx.toFixed(4)}" cy="${point.cy.toFixed(4)}" r="${meshRadius.toFixed(4)}" fx="${point.cx.toFixed(4)}" fy="${point.cy.toFixed(4)}">
    <stop offset="0%" stop-color="${point.color}" stop-opacity="1" />
    <stop offset="100%" stop-color="${point.color}" stop-opacity="0" />
  </radialGradient>`
        )).join("\n")
      : "";
    const glassDefs = isGlassStyle
      ? `<filter id="glass-glow" x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="40" result="coloredBlur" />
  </filter>
  <filter id="blur-small">
    <feGaussianBlur stdDeviation="5" />
  </filter>`
      : "";
    const materialDefs = isMaterialStyle
      ? `<filter id="material-shadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000" flood-opacity="0.4" />
  </filter>
  <filter id="material-lighting">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
    <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lighting-color="#ffffff" result="specOut">
      <fePointLight x="-500" y="-1000" z="200" />
    </feSpecularLighting>
    <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
    <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
  </filter>`
      : "";
    const defsParts = [gradientDef, meshDefs, dropShadowDef, innerShadowDef, clipPathDef, petalGradientDefs, strokePetalGradientDefs, strokeGradientDef, glassDefs, materialDefs]
      .filter(Boolean)
      .join("\n");
    const defsBlock = defsParts ? `<defs>
  ${defsParts}
</defs>` : "";
    const innerShadowFillAttr = allowInnerShadow && hasFill ? ` filter="url(#inner-shadow)"` : "";
    const innerShadowStrokeAttr = allowInnerShadow && !hasFill && hasStroke ? ` filter="url(#inner-shadow)"` : "";
    const dropShadowOpen = shadowEnabled ? `  <g filter="url(#drop-shadow)">` : "";
    const dropShadowClose = shadowEnabled ? `  </g>` : "";
    const glassMarkup = isGlassStyle
      ? `  <g>
    <circle cx="${cx}" cy="${cy}" r="${fmt(glowRadius)}" fill="${primaryColor}" filter="url(#glass-glow)" opacity="0.3" />
    ${pathItems.map((item) => {
          const strokeColor = strokeAvailable ? (cfg.strokeUseGradient ? strokeStyleValue : (cfg.stroke !== "none" ? cfg.stroke : "#ffffff")) : "none";
          return `  <path d="${item.d}" fill="${primaryColor}" fill-opacity="${cfg.opacity}" stroke="${strokeColor}" stroke-width="1" stroke-linecap="${strokeLinecap}"${dashAttr} stroke-opacity="0.2" style="mix-blend-mode: plus-lighter" />`;
        }).join("\n")}
    <circle cx="${cx}" cy="${cy}" r="${fmt(highlightRadius)}" fill="#ffffff" fill-opacity="0.8" filter="url(#blur-small)" />
  </g>`
      : "";
    const gradientMarkup = isGradientStyle
      ? `  <g>
    ${pathItems.map((item) => `  <path d="${item.d}" fill="url(#petal-gradient-${item.index})" opacity="0.9" style="mix-blend-mode: screen" />
${strokeAvailable ? `  <path d="${item.d}" fill="none" stroke="${cfg.strokeUseGradient ? `url(#petal-stroke-gradient-${item.index})` : cfg.stroke}" stroke-width="${fmt(styleStrokeWidth)}" stroke-linecap="${strokeLinecap}"${dashAttr} opacity="${cfg.opacity}" />` : ""}`).join("\n")}
  </g>`
      : "";
    const meshMarkup = isMeshStyle
      ? `  <g>
    ${meshPoints.map((point) => `  <path d="${compoundPath}" fill="url(#${point.id})" opacity="${fmt(cfg.opacity)}" fill-rule="${fillRule}" clip-rule="${fillRule}" />`).join("\n")}
${strokeAvailable ? `  <path d="${compoundPath}" fill="none" stroke="${cfg.strokeUseGradient ? strokeStyleValue : cfg.stroke}" stroke-width="${fmt(styleStrokeWidth)}" stroke-linecap="${strokeLinecap}"${dashAttr} opacity="${fmt(cfg.opacity)}" />` : ""}
  </g>`
      : "";
    const materialMarkup = isMaterialStyle
      ? `  <g filter="url(#material-shadow)">
    ${pathItems.map((item) => `  <path d="${item.d}" fill="${primaryColor}" stroke="${strokeAvailable ? (cfg.strokeUseGradient ? strokeStyleValue : secondaryColor) : "none"}" stroke-width="${fmt(styleStrokeWidth)}" stroke-linecap="${strokeLinecap}"${dashAttr} filter="url(#material-lighting)" />`).join("\n")}
    <circle cx="${cx}" cy="${cy}" r="${fmt(highlightRadius * 0.9)}" fill="${secondaryColor}" filter="url(#material-lighting)" />
  </g>`
      : "";
    const minimalMarkup = isMinimalStyle
      ? `  <g>
    ${pathItems.map((item) => {
          const isHighlighted = item.index % 2 === 0;
          const fillValue = isHighlighted || !hasFill ? "none" : primaryColor;
          const strokeValue = isHighlighted && strokeAvailable
            ? (cfg.strokeUseGradient ? strokeStyleValue : primaryColor)
            : "none";
          if (fillValue === "none" && strokeValue === "none") return "";
          return `  <path d="${item.d}" fill="${fillValue}" stroke="${strokeValue}" stroke-width="${fmt(styleStrokeWidth)}" stroke-linecap="${strokeLinecap}"${dashAttr} opacity="${isHighlighted ? "0.55" : "1"}" />`;
        }).filter(Boolean).join("\n")}
  </g>`
      : "";
    const styleMarkup = glassMarkup || gradientMarkup || meshMarkup || materialMarkup || minimalMarkup;
    const styleMarkupWithInnerShadow = allowInnerShadow && styleMarkup
      ? `  <g filter="url(#inner-shadow)">
${styleMarkup}
  </g>`
      : styleMarkup;
    const nonCustomMarkup = `${dropShadowOpen}
${extrudePaths}
${styleMarkupWithInnerShadow}
${outerStrokePath}
${dropShadowClose}`;
    const backgroundRect = cfg.canvasBg && cfg.canvasBg !== "transparent"
      ? `  <rect width="${size}" height="${size}" fill="${cfg.canvasBg}" />`
      : "";

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${defsBlock}
${backgroundRect}
${isCustomStyle ? `${dropShadowOpen}
${extrudePaths}
  ${
    showInvert
      ? `  <g clip-path="url(#union-clip)">
    <path d="M 0 0 H ${size} V ${size} H 0 Z ${compoundPath}" fill="${fillValue}" stroke="none" fill-rule="evenodd" clip-rule="evenodd" opacity="${cfg.opacity}" />
  </g>
${outerStrokePath}
${innerStrokePath}`
      : `  ${hasFill ? `<path d="${compoundPath}" fill="${fillValue}" stroke="none" fill-rule="${fillRule}" clip-rule="${fillRule}" opacity="${cfg.opacity}"${innerShadowFillAttr} />` : ""}
${outerStrokePath}
${hasStroke ? `  <path d="${compoundPath}" fill="none" stroke="${strokeValue}" stroke-width="${fmt(strokeWidth)}" stroke-linejoin="round" stroke-linecap="${strokeLinecap}"${dashAttr} fill-rule="${fillRule}" clip-rule="${fillRule}" opacity="${cfg.opacity}"${innerShadowStrokeAttr} />` : ""}`
  }
${dropShadowClose}` : nonCustomMarkup}
</svg>`;
  };

  // 更新配置
  const handleConfigChange = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveStyle = async (name) => {
    setSaving(true);
    try {
      const raw = localStorage.getItem("generativeVectorLabStyles");
      const list = raw ? JSON.parse(raw) : [];
      list.push({ name, config, savedAt: Date.now() });
      localStorage.setItem("generativeVectorLabStyles", JSON.stringify(list));
    } finally {
      setSaving(false);
    }
  };

  // 生成变体系列
  const generateFamily = useCallback(() => {
    const family = Array.from({ length: 12 }).map(() =>
      generateVariation(config, 0.3)
    );
    setVariations(family);
    setViewMode("grid");
  }, [config]);

  // 导出 SVG
  const handleExport = () => {
    const svgData = buildSvgMarkup(config, 800);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `gen-shape-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full w-full bg-white text-zinc-900 overflow-hidden font-sans rounded-2xl">
      
      {/* 左侧: 控制面板 */}
      <div className="w-80 flex-shrink-0 border-r border-zinc-800 z-10 relative">
        <ControlPanel config={config} onChange={handleConfigChange} />
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 工具栏 */}
        <div className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
          
          <div className="flex items-center gap-4">
            {/* 预设按钮 */}
            {Object.entries(PRESETS).map(([name, preset]) => (
              <button
                key={name}
                onClick={() => {
                  setConfig(preset);
                  if(viewMode === 'grid') generateFamily();
                }}
                className="px-3 py-1 text-xs rounded-full border border-zinc-700 hover:border-indigo-500 hover:text-indigo-400 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mr-4">
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <SwatchIcon />
                背景
              </div>
              <input
                type="color"
                value={config.canvasBg ?? "#ffffff"}
                onChange={(e) => handleConfigChange({ canvasBg: e.target.value })}
                className="h-8 w-10 cursor-pointer rounded-md border border-zinc-200 bg-white"
                title="画布背景"
              />
            </div>
            {/* 视图切换 */}
            <div className="bg-zinc-100 p-1 rounded-lg flex mr-4">
              <button 
                onClick={() => setViewMode("single")}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'single' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                title="编辑视图"
              >
                <MonitorIcon />
              </button>
              <button 
                onClick={() => {
                  if (variations.length === 0) generateFamily();
                  setViewMode("grid");
                }}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}
                title="系列视图"
              >
                <GridIcon />
              </button>
            </div>

            <button
              onClick={() => handleConfigChange(generateVariation(config, 0.5))}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-md text-xs font-medium transition-colors"
            >
              <ShuffleIcon />
              随机
            </button>
            <button
              onClick={generateFamily}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors shadow-lg shadow-indigo-200/40"
            >
              <SparklesIcon />
              生成系列
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-md text-xs font-medium transition-colors"
              disabled={viewMode === 'grid'}
              title={viewMode === 'grid' ? "选择一个图形后导出" : "导出 SVG"}
            >
              <DownloadIcon />
              导出 SVG
            </button>
            <button
              onClick={() => {
                setImportError("");
                setShowImport(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 hover:bg-zinc-100 rounded-md text-xs font-medium transition-colors"
              title="从 README 恢复参数"
            >
              恢复参数
            </button>
          </div>
        </div>

        {/* 画布区域 */}
        <div
          ref={previewAreaRef}
          className="flex-1 relative overflow-hidden"
          style={{ backgroundColor: config.canvasBg || "#ffffff" }}
        >
          
          {viewMode === "single" ? (
            <div className="w-full h-full flex items-center justify-center">
              <div
                ref={previewRef}
                className="origin-center"
                style={{ width: previewSize, height: previewSize }}
              >
                <ShapeRenderer 
                  config={config} 
                  width={baseSize} 
                  height={baseSize} 
                  className="w-full h-full"
                />
              </div>
              {zoom !== 100 && (
                <button
                  onClick={resetZoom}
                  className="absolute bottom-4 left-4 px-2 py-1 bg-black/50 hover:bg-black/70 text-white text-xs rounded-lg transition-colors cursor-pointer"
                  title="点击重置缩放"
                >
                  {zoom}%
                </button>
              )}
              <div className="absolute bottom-4 right-4 text-zinc-600 text-xs font-mono opacity-0 hover:opacity-100 transition-opacity">
                {config.count} 个副本 • {config.frequency} 频率
              </div>
            </div>
          ) : (
            <div className="w-full h-full overflow-y-auto p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
                {variations.map((v, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => {
                      setConfig(v);
                      setViewMode("single");
                    }}
                    className="aspect-square bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:bg-zinc-800/80 transition-all hover:scale-[1.02] group"
                  >
                    <ShapeRenderer 
                      config={v} 
                      width={200} 
                      height={200} 
                      className="w-full h-full pointer-events-none" 
                    />
                    <div className="mt-2 text-center text-xs text-zinc-500 group-hover:text-indigo-400">
                      选择变体
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {viewMode === "single" && (
          <div className="px-6 py-4 border-t border-zinc-200 bg-white">
            <PreviewToolbar
              svgRef={previewRef}
              logoName="generative-vector"
              bgColor={config.canvasBg ?? "#ffffff"}
              setBgColor={(value) => handleConfigChange({ canvasBg: value })}
              iconScale={iconScale}
              setIconScale={setIconScale}
              borderRadius={borderRadius}
              setBorderRadius={setBorderRadius}
              readmeMeta={readmeMeta}
              onSave={handleSaveStyle}
              saving={saving}
            />
          </div>
        )}

        {showImport && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[560px] max-w-[92vw] bg-white rounded-xl shadow-xl border border-zinc-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-800">从 README 恢复参数</h3>
                <button
                  onClick={() => setShowImport(false)}
                  className="text-zinc-500 hover:text-zinc-800 text-xs"
                >
                  关闭
                </button>
              </div>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="粘贴 README 中的“生成参数”JSON 区块或直接粘贴 JSON"
                className="w-full h-44 text-xs font-mono text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              {importError && (
                <div className="mt-2 text-xs text-red-600">{importError}</div>
              )}
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowImport(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleApplyImport}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
                >
                  解析并恢复
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GenerativeVectorLab;
