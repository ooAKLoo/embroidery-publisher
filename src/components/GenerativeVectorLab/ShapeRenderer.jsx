import { useMemo } from "react";
import { generateAtomPoints } from "./utils/math";

function ShapeRenderer({ config, width = 400, height = 400, className = "" }) {
  const cx = width / 2;
  const cy = height / 2;

  const { paths, compoundPath } = useMemo(() => {
    const count = Math.max(1, config.count);
    const scale = Math.max(0.01, config.scale);
    const angleStep = (2 * Math.PI) / count;
    const globalRotRad = (config.rotation * Math.PI) / 180;
    const basePoints = generateAtomPoints(config, 0, 0);
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

      const d = toPath(transformed);
      pathParts.push(d);
      pathItems.push({ d, index: i, angle: theta });
    }

    return { paths: pathItems, compoundPath: pathParts.join(" ") };
  }, [config, cx, cy, width, height]);

  const clamp01 = (value, fallback) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(1, Math.max(0, num));
  };

  const normalizeHex = (value) => {
    if (!value) return "#6366f1";
    const hex = String(value).trim().replace("#", "");
    if (hex.length === 3) {
      const r = hex[0] + hex[0];
      const g = hex[1] + hex[1];
      const b = hex[2] + hex[2];
      return `#${r}${g}${b}`;
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

  const fillRule = config.useNegativeSpace ? "evenodd" : "nonzero";
  const safeScale = Math.max(0.01, config.scale);
  const strokeWidth = config.strokeWidth / safeScale;
  const showInvert = config.useNegativeSpace && config.invertFill;
  const useGradientFill = config.useGradient && config.fill !== "none";
  const useGradientStroke = config.strokeUseGradient && config.stroke !== "none";
  const gradientNeeded = useGradientFill || useGradientStroke;
  const gradientType = config.gradientType || "linear";
  const strokeGradientType = config.strokeGradientType || "linear";
  const isArrayStrokeGradient = strokeGradientType === "array-cw" || strokeGradientType === "array-ccw";
  const fillValue = useGradientFill ? "url(#shape-gradient)" : config.fill;
  // 对于阵列渐变，每个元素单独设置颜色，使用占位符
  const strokeValue = useGradientStroke 
    ? (isArrayStrokeGradient ? "__ARRAY_STROKE__" : "url(#stroke-gradient)") 
    : config.stroke;
  const angleRad = ((config.gradientAngle ?? 45) * Math.PI) / 180;
  const gradX1 = 0.5 - Math.cos(angleRad) / 2;
  const gradY1 = 0.5 - Math.sin(angleRad) / 2;
  const gradX2 = 0.5 + Math.cos(angleRad) / 2;
  const gradY2 = 0.5 + Math.sin(angleRad) / 2;
  const radialCx = config.gradientRadialCx ?? 0.5;
  const radialCy = config.gradientRadialCy ?? 0.5;
  const radialStrength = config.gradientRadialStrength;
  const radialR = radialStrength !== undefined && radialStrength !== null
    ? 0.85 - Math.min(Math.max(radialStrength, 0), 1) * 0.5
    : (config.gradientRadialR ?? 0.6);
  const gradientFromPos = clamp01(config.gradientFromPos, 0);
  const gradientToPos = clamp01(config.gradientToPos, 1);
  const stopFrom = Math.min(gradientFromPos, gradientToPos);
  const stopTo = Math.max(gradientFromPos, gradientToPos);
  const stopFromOffset = `${(stopFrom * 100).toFixed(1)}%`;
  const stopToOffset = `${(stopTo * 100).toFixed(1)}%`;
  const gradientStart = config.gradientInvert ? config.gradientTo : config.gradientFrom;
  const gradientEnd = config.gradientInvert ? config.gradientFrom : config.gradientTo;
  const strokeGradientFrom = config.strokeGradientFrom ?? "#6366f1";
  const strokeGradientTo = config.strokeGradientTo ?? "#22d3ee";
  const strokeGradientStart = config.gradientInvert ? strokeGradientTo : strokeGradientFrom;
  const strokeGradientEnd = config.gradientInvert ? strokeGradientFrom : strokeGradientTo;
  const styleMode = config.styleMode ?? "custom";
  const isCustomStyle = styleMode === "custom";
  const isGlassStyle = styleMode === "glass";
  const isGradientStyle = styleMode === "gradient";
  const isMeshStyle = styleMode === "mesh";
  const isMaterialStyle = styleMode === "material";
  const isMinimalStyle = styleMode === "minimal";
  const primaryColor = config.fill !== "none"
    ? config.fill
    : (config.stroke !== "none" ? config.stroke : (config.gradientFrom ?? "#6366f1"));
  const secondaryColor = config.stroke !== "none"
    ? config.stroke
    : (config.gradientTo ?? "#22d3ee");
  const meshBaseA = gradientStart ?? primaryColor;
  const meshBaseB = gradientEnd ?? secondaryColor;
  const meshMidA = mixHex(meshBaseA, meshBaseB, 0.35);
  const meshMidB = mixHex(meshBaseA, meshBaseB, 0.7);
  const meshCenter = mixHex(meshBaseA, meshBaseB, 0.5);
  const meshCenterX = clamp01(config.gradientRadialCx, 0.5);
  const meshCenterY = clamp01(config.gradientRadialCy, 0.5);
  const meshStrength = clamp01(config.gradientRadialStrength, 0.6);
  const meshSpread = 0.25 + (1 - meshStrength) * 0.2;
  const meshRadius = 0.65 + (1 - meshStrength) * 0.15;
  const meshPoints = [
    {
      id: "mesh-0",
      cx: clamp01(meshCenterX - meshSpread, meshCenterX),
      cy: clamp01(meshCenterY - meshSpread, meshCenterY),
      color: meshBaseA,
    },
    {
      id: "mesh-1",
      cx: clamp01(meshCenterX + meshSpread, meshCenterX),
      cy: clamp01(meshCenterY - meshSpread, meshCenterY),
      color: meshMidA,
    },
    {
      id: "mesh-2",
      cx: clamp01(meshCenterX - meshSpread, meshCenterX),
      cy: clamp01(meshCenterY + meshSpread, meshCenterY),
      color: meshMidB,
    },
    {
      id: "mesh-3",
      cx: clamp01(meshCenterX + meshSpread, meshCenterX),
      cy: clamp01(meshCenterY + meshSpread, meshCenterY),
      color: meshBaseB,
    },
    {
      id: "mesh-4",
      cx: meshCenterX,
      cy: meshCenterY,
      color: meshCenter,
    },
  ];
  const shadowEnabled = Boolean(config.shadowEnabled);
  const innerShadowEnabled = Boolean(config.innerShadowEnabled);
  const hasFill = config.fill !== "none";
  const hasStroke = config.stroke !== "none";
  const allowInnerShadow = innerShadowEnabled && !showInvert && (hasFill || hasStroke);
  const doubleStrokeEnabled = Boolean(config.doubleStrokeEnabled) && config.stroke !== "none";
  const doubleStrokeWidth = (config.doubleStrokeWidth ?? 0) / safeScale;
  const doubleStrokeOpacity = config.doubleStrokeOpacity ?? 0.6;
  const doubleStrokeColor = config.doubleStrokeColor ?? "#0f172a";
  const extrudeEnabled =
    Boolean(config.extrudeEnabled) && (config.fill !== "none" || config.stroke !== "none");
  const extrudeDepth = Math.max(1, Math.round(config.extrudeDepth ?? 0));
  const extrudeOffsetX = config.extrudeOffsetX ?? 0;
  const extrudeOffsetY = config.extrudeOffsetY ?? 0;
  const extrudeOpacity = Math.max(0, Math.min(1, config.extrudeOpacity ?? 0.6));
  const extrudeFade = Math.max(0, Math.min(1, config.extrudeFade ?? 0.6));
  const extrudeColor = config.extrudeColor ?? "#111827";
  const extrudeStepX = extrudeDepth > 0 ? extrudeOffsetX / extrudeDepth : 0;
  const extrudeStepY = extrudeDepth > 0 ? extrudeOffsetY / extrudeDepth : 0;
  const extrudeIsStrokeOnly = !hasFill && hasStroke;
  const extrudeFill = extrudeColor;
  const extrudeStroke = "none";
  const strokeLinecap = config.strokeLinecap ?? "round";
  const strokeAvailable = hasStroke;
  const dashEnabled = Boolean(config.strokeDashEnabled) && strokeAvailable;
  const dashLength = Math.max(0.1, config.strokeDashLength ?? 6) / safeScale;
  const dashGap = Math.max(0.1, config.strokeDashGap ?? 6) / safeScale;
  const dashOffset = (config.strokeDashOffset ?? 0) / safeScale;
  const strokeDashArray = dashEnabled ? `${dashLength} ${dashGap}` : undefined;
  const styleStrokeWidth = Math.max(1, config.strokeWidth);
  const glowRadius = Math.min(width, height) * 0.35;
  const highlightRadius = Math.min(width, height) * 0.08;
  
  // 计算阵列渐变颜色的函数
  const getArrayStrokeColor = (index, total) => {
    if (!isArrayStrokeGradient || total <= 1) return config.stroke;
    const isClockwise = strokeGradientType === "array-cw";
    const t = isClockwise 
      ? index / (total - 1)
      : (total - 1 - index) / (total - 1);
    return mixHex(strokeGradientStart ?? "#6366f1", strokeGradientEnd ?? "#22d3ee", t);
  };

  const strokeStyleValue = config.strokeUseGradient && !isCustomStyle && !isGradientStyle
    ? "url(#stroke-gradient)"
    : (config.stroke !== "none" ? config.stroke : strokeValue);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {shadowEnabled && (
          <filter id="drop-shadow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation={config.shadowBlur ?? 0} result="shadowBlur" />
            <feOffset in="shadowBlur" dx={config.shadowX ?? 0} dy={config.shadowY ?? 0} result="shadowOffset" />
            <feFlood floodColor={config.shadowColor ?? "#000000"} floodOpacity={config.shadowOpacity ?? 0.35} result="shadowColor" />
            <feComposite in="shadowColor" in2="shadowOffset" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        {allowInnerShadow && (
          <filter id="inner-shadow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation={config.innerShadowBlur ?? 0} result="innerBlur" />
            <feOffset in="innerBlur" dx={config.innerShadowX ?? 0} dy={config.innerShadowY ?? 0} result="innerOffset" />
            <feComposite in="innerOffset" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
            <feFlood floodColor={config.innerShadowColor ?? "#000000"} floodOpacity={config.innerShadowOpacity ?? 0.4} result="innerColor" />
            <feComposite in="innerColor" in2="innerShadow" operator="in" result="innerShadowColor" />
            <feComposite in="SourceGraphic" in2="innerShadowColor" operator="over" />
          </filter>
        )}
        {isCustomStyle && gradientNeeded && (
          gradientType === "radial" ? (
            <radialGradient
              id="shape-gradient"
              cx={radialCx}
              cy={radialCy}
              r={radialR}
              fx={radialCx}
              fy={radialCy}
            >
              <stop offset={stopFromOffset} stopColor={gradientStart} />
              <stop offset={stopToOffset} stopColor={gradientEnd} />
            </radialGradient>
          ) : (
            <linearGradient
              id="shape-gradient"
              x1={gradX1}
              y1={gradY1}
              x2={gradX2}
              y2={gradY2}
            >
              <stop offset={stopFromOffset} stopColor={gradientStart} />
              <stop offset={stopToOffset} stopColor={gradientEnd} />
            </linearGradient>
          )
        )}
        {isMeshStyle && meshPoints.map((point) => (
          <radialGradient
            key={point.id}
            id={point.id}
            cx={point.cx}
            cy={point.cy}
            r={meshRadius}
            fx={point.cx}
            fy={point.cy}
          >
            <stop offset="0%" stopColor={point.color} stopOpacity="1" />
            <stop offset="100%" stopColor={point.color} stopOpacity="0" />
          </radialGradient>
        ))}
        {isGradientStyle && paths.map((path, i) => {
          const angle = ((config.gradientAngle ?? 45) + (paths.length > 0 ? (i * 360) / paths.length : 0)) * Math.PI / 180;
          const x1 = 0.5 - Math.cos(angle) / 2;
          const y1 = 0.5 - Math.sin(angle) / 2;
          const x2 = 0.5 + Math.cos(angle) / 2;
          const y2 = 0.5 + Math.sin(angle) / 2;
          return (
            <linearGradient
              key={`petal-gradient-${path.index}`}
              id={`petal-gradient-${path.index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop offset={stopFromOffset} stopColor={gradientStart} />
              <stop offset={stopToOffset} stopColor={gradientEnd} />
            </linearGradient>
          );
        })}
        {isGradientStyle && config.strokeUseGradient && paths.map((path, i) => {
          const angle = ((config.gradientAngle ?? 45) + (paths.length > 0 ? (i * 360) / paths.length : 0)) * Math.PI / 180;
          const x1 = 0.5 - Math.cos(angle) / 2;
          const y1 = 0.5 - Math.sin(angle) / 2;
          const x2 = 0.5 + Math.cos(angle) / 2;
          const y2 = 0.5 + Math.sin(angle) / 2;
          return (
            <linearGradient
              key={`petal-stroke-gradient-${path.index}`}
              id={`petal-stroke-gradient-${path.index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop offset={stopFromOffset} stopColor={strokeGradientStart} />
              <stop offset={stopToOffset} stopColor={strokeGradientEnd} />
            </linearGradient>
          );
        })}
        {!isCustomStyle && !isGradientStyle && config.strokeUseGradient && !isArrayStrokeGradient && (
          strokeGradientType === "linear" ? (
            <linearGradient id="stroke-gradient" x1={gradX1} y1={gradY1} x2={gradX2} y2={gradY2}>
              <stop offset={stopFromOffset} stopColor={strokeGradientStart} />
              <stop offset={stopToOffset} stopColor={strokeGradientEnd} />
            </linearGradient>
          ) : strokeGradientType === "radial-in" ? (
            <radialGradient id="stroke-gradient" cx={radialCx} cy={radialCy} r={radialR} fx={radialCx} fy={radialCy}>
              <stop offset={stopFromOffset} stopColor={strokeGradientStart} />
              <stop offset={stopToOffset} stopColor={strokeGradientEnd} />
            </radialGradient>
          ) : strokeGradientType === "radial-out" ? (
            <radialGradient id="stroke-gradient" cx={radialCx} cy={radialCy} r={radialR} fx={radialCx} fy={radialCy}>
              <stop offset={stopFromOffset} stopColor={strokeGradientEnd} />
              <stop offset={stopToOffset} stopColor={strokeGradientStart} />
            </radialGradient>
          ) : null
        )}
        {isCustomStyle && config.strokeUseGradient && !isArrayStrokeGradient && (
          strokeGradientType === "linear" ? (
            <linearGradient id="stroke-gradient" x1={gradX1} y1={gradY1} x2={gradX2} y2={gradY2}>
              <stop offset={stopFromOffset} stopColor={strokeGradientStart} />
              <stop offset={stopToOffset} stopColor={strokeGradientEnd} />
            </linearGradient>
          ) : strokeGradientType === "radial-in" ? (
            <radialGradient id="stroke-gradient" cx={radialCx} cy={radialCy} r={radialR} fx={radialCx} fy={radialCy}>
              <stop offset={stopFromOffset} stopColor={strokeGradientStart} />
              <stop offset={stopToOffset} stopColor={strokeGradientEnd} />
            </radialGradient>
          ) : strokeGradientType === "radial-out" ? (
            <radialGradient id="stroke-gradient" cx={radialCx} cy={radialCy} r={radialR} fx={radialCx} fy={radialCy}>
              <stop offset={stopFromOffset} stopColor={strokeGradientEnd} />
              <stop offset={stopToOffset} stopColor={strokeGradientStart} />
            </radialGradient>
          ) : null
        )}
        {isGlassStyle && (
          <>
            <filter id="glass-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="40" result="coloredBlur" />
            </filter>
            <filter id="blur-small">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </>
        )}
        {isMaterialStyle && (
          <>
            <filter id="material-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#000" floodOpacity="0.4" />
            </filter>
            <filter id="material-lighting">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
              <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#ffffff" result="specOut">
                <fePointLight x="-500" y="-1000" z="200" />
              </feSpecularLighting>
              <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
              <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
            </filter>
          </>
        )}
      </defs>
      
      {isCustomStyle && showInvert && (
        <defs>
          <clipPath id="union-clip">
            <path d={compoundPath} fillRule="nonzero" />
          </clipPath>
        </defs>
      )}

      {isCustomStyle ? (
        <g filter={shadowEnabled ? "url(#drop-shadow)" : undefined}>
          {extrudeEnabled && extrudeDepth > 0 && Array.from({ length: extrudeDepth }).map((_, idx) => {
            const step = extrudeDepth - idx;
            const t = step / extrudeDepth;
            const layerOpacity = Math.max(0, extrudeOpacity * (1 - t * extrudeFade));
            return (
              <path
                key={`extrude-${step}`}
                d={compoundPath}
                transform={`translate(${(extrudeStepX * step).toFixed(3)} ${(extrudeStepY * step).toFixed(3)})`}
                fill={extrudeFill}
                stroke={extrudeStroke}
                strokeWidth={extrudeIsStrokeOnly ? strokeWidth : undefined}
                strokeLinejoin="round"
                strokeLinecap={strokeLinecap}
                strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                strokeDashoffset={dashEnabled ? dashOffset : undefined}
                fillRule={fillRule}
                clipRule={fillRule}
                style={{ opacity: layerOpacity }}
              />
            );
          })}

          {showInvert ? (
            <>
              <g clipPath="url(#union-clip)">
                <path
                  d={`M 0 0 H ${width} V ${height} H 0 Z ${compoundPath}`}
                  fill={fillValue}
                  stroke="none"
                  fillRule="evenodd"
                  clipRule="evenodd"
                  style={{ opacity: config.opacity }}
                  className="transition-all duration-300 ease-out"
                />
              </g>
              {doubleStrokeEnabled && (
                <path
                  d={compoundPath}
                  fill="none"
                  stroke={doubleStrokeColor}
                  strokeWidth={strokeWidth + doubleStrokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap={strokeLinecap}
                  strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                  strokeDashoffset={dashEnabled ? dashOffset : undefined}
                  fillRule="nonzero"
                  clipRule="nonzero"
                  style={{ opacity: doubleStrokeOpacity }}
                  className="transition-all duration-300 ease-out"
                />
              )}
              {config.stroke !== "none" && (
                <path
                  d={compoundPath}
                  fill="none"
                  stroke={strokeValue}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap={strokeLinecap}
                  strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                  strokeDashoffset={dashEnabled ? dashOffset : undefined}
                  fillRule="nonzero"
                  clipRule="nonzero"
                  style={{ opacity: config.opacity }}
                  className="transition-all duration-300 ease-out"
                />
              )}
            </>
          ) : (
            <>
              {hasFill && (
                <path
                  d={compoundPath}
                  fill={fillValue}
                  stroke="none"
                  fillRule={fillRule}
                  clipRule={fillRule}
                  style={{ opacity: config.opacity }}
                  className="transition-all duration-300 ease-out"
                  filter={allowInnerShadow && hasFill ? "url(#inner-shadow)" : undefined}
                />
              )}
              {doubleStrokeEnabled && (
                <path
                  d={compoundPath}
                  fill="none"
                  stroke={doubleStrokeColor}
                  strokeWidth={strokeWidth + doubleStrokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap={strokeLinecap}
                  strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                  strokeDashoffset={dashEnabled ? dashOffset : undefined}
                  fillRule={fillRule}
                  clipRule={fillRule}
                  style={{ opacity: doubleStrokeOpacity }}
                  className="transition-all duration-300 ease-out"
                />
              )}
              {hasStroke && (
                isArrayStrokeGradient && useGradientStroke ? (
                  // 阵列渐变：每个元素单独渲染不同颜色的描边
                  paths.map((path) => (
                    <path
                      key={`array-stroke-${path.index}`}
                      d={path.d}
                      fill="none"
                      stroke={getArrayStrokeColor(path.index, paths.length)}
                      strokeWidth={strokeWidth}
                      strokeLinejoin="round"
                      strokeLinecap={strokeLinecap}
                      strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                      strokeDashoffset={dashEnabled ? dashOffset : undefined}
                      style={{ opacity: config.opacity }}
                      className="transition-all duration-300 ease-out"
                      filter={allowInnerShadow && !hasFill ? "url(#inner-shadow)" : undefined}
                    />
                  ))
                ) : (
                  <path
                    d={compoundPath}
                    fill="none"
                    stroke={useGradientStroke ? "url(#stroke-gradient)" : config.stroke}
                    strokeWidth={strokeWidth}
                    strokeLinejoin="round"
                    strokeLinecap={strokeLinecap}
                    strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                    strokeDashoffset={dashEnabled ? dashOffset : undefined}
                    fillRule={fillRule}
                    clipRule={fillRule}
                    style={{ opacity: config.opacity }}
                    className="transition-all duration-300 ease-out"
                    filter={allowInnerShadow && !hasFill ? "url(#inner-shadow)" : undefined}
                  />
                )
              )}
            </>
          )}
        </g>
      ) : (
        <g filter={shadowEnabled ? "url(#drop-shadow)" : undefined}>
          {extrudeEnabled && extrudeDepth > 0 && Array.from({ length: extrudeDepth }).map((_, idx) => {
            const step = extrudeDepth - idx;
            const t = step / extrudeDepth;
            const layerOpacity = Math.max(0, extrudeOpacity * (1 - t * extrudeFade));
            return (
              <path
                key={`extrude-${step}`}
                d={compoundPath}
                transform={`translate(${(extrudeStepX * step).toFixed(3)} ${(extrudeStepY * step).toFixed(3)})`}
                fill={extrudeFill}
                stroke={extrudeStroke}
                strokeWidth={extrudeIsStrokeOnly ? strokeWidth : undefined}
                strokeLinejoin="round"
                strokeLinecap={strokeLinecap}
                strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                strokeDashoffset={dashEnabled ? dashOffset : undefined}
                fillRule={fillRule}
                clipRule={fillRule}
                style={{ opacity: layerOpacity }}
              />
            );
          })}

          <g filter={allowInnerShadow ? "url(#inner-shadow)" : undefined}>
            {isGlassStyle && (
              <g>
                <circle cx={cx} cy={cy} r={glowRadius} fill={primaryColor} filter="url(#glass-glow)" opacity="0.3" />
                {paths.map((path) => {
                  const strokeColor = strokeAvailable ? (config.strokeUseGradient ? strokeStyleValue : (config.stroke !== "none" ? config.stroke : "#ffffff")) : "none";
                  return (
                    <path
                      key={`glass-${path.index}`}
                      d={path.d}
                      fill={primaryColor}
                      fillOpacity={config.opacity}
                      stroke={strokeColor}
                      strokeWidth={1}
                      strokeOpacity={0.2}
                      strokeLinecap={strokeLinecap}
                      strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                      strokeDashoffset={dashEnabled ? dashOffset : undefined}
                      style={{ mixBlendMode: "plus-lighter" }}
                    />
                  );
                })}
                <circle cx={cx} cy={cy} r={highlightRadius} fill="#ffffff" fillOpacity={0.8} filter="url(#blur-small)" />
              </g>
            )}

          {isGradientStyle && (
            <g>
              {paths.map((path) => (
                <g key={`gradient-${path.index}`}>
                    <path
                      d={path.d}
                      fill={`url(#petal-gradient-${path.index})`}
                      opacity={0.9}
                      style={{ mixBlendMode: "screen" }}
                    />
                    {strokeAvailable && (
                      <path
                        d={path.d}
                        fill="none"
                        stroke={config.strokeUseGradient ? `url(#petal-stroke-gradient-${path.index})` : config.stroke}
                        strokeWidth={styleStrokeWidth}
                        strokeLinecap={strokeLinecap}
                        strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                        strokeDashoffset={dashEnabled ? dashOffset : undefined}
                        opacity={config.opacity}
                      />
                    )}
                  </g>
              ))}
            </g>
          )}

          {isMeshStyle && (
            <g>
              {meshPoints.map((point) => (
                <path
                  key={`mesh-fill-${point.id}`}
                  d={compoundPath}
                  fill={`url(#${point.id})`}
                  opacity={config.opacity}
                  fillRule={fillRule}
                  clipRule={fillRule}
                />
              ))}
              {strokeAvailable && (
                <path
                  d={compoundPath}
                  fill="none"
                  stroke={config.strokeUseGradient ? strokeStyleValue : config.stroke}
                  strokeWidth={styleStrokeWidth}
                  strokeLinecap={strokeLinecap}
                  strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                  strokeDashoffset={dashEnabled ? dashOffset : undefined}
                  opacity={config.opacity}
                />
              )}
            </g>
          )}

          {isMaterialStyle && (
            <g filter="url(#material-shadow)">
              {paths.map((path) => (
                  <path
                    key={`material-${path.index}`}
                    d={path.d}
                    fill={primaryColor}
                    stroke={strokeAvailable ? (config.strokeUseGradient ? strokeStyleValue : secondaryColor) : "none"}
                    strokeWidth={styleStrokeWidth}
                    strokeLinecap={strokeLinecap}
                    strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                    strokeDashoffset={dashEnabled ? dashOffset : undefined}
                    filter="url(#material-lighting)"
                  />
                ))}
                <circle cx={cx} cy={cy} r={highlightRadius * 0.9} fill={secondaryColor} filter="url(#material-lighting)" />
              </g>
            )}

            {isMinimalStyle && (
              <g>
                {paths.map((path) => {
                  const isHighlighted = path.index % 2 === 0;
                  const fillValue = isHighlighted || !hasFill ? "none" : primaryColor;
                  const strokeValue = isHighlighted && strokeAvailable
                    ? (config.strokeUseGradient ? strokeStyleValue : primaryColor)
                    : "none";
                  if (fillValue === "none" && strokeValue === "none") return null;
                  return (
                    <path
                      key={`minimal-${path.index}`}
                      d={path.d}
                      fill={fillValue}
                      stroke={strokeValue}
                      strokeWidth={styleStrokeWidth}
                      strokeLinecap={strokeLinecap}
                      strokeDasharray={dashEnabled ? strokeDashArray : undefined}
                      strokeDashoffset={dashEnabled ? dashOffset : undefined}
                      opacity={isHighlighted ? 0.55 : 1}
                    />
                  );
                })}
              </g>
            )}
          </g>

          {doubleStrokeEnabled && (
            <path
              d={compoundPath}
              fill="none"
              stroke={doubleStrokeColor}
              strokeWidth={strokeWidth + doubleStrokeWidth}
              strokeLinejoin="round"
              strokeLinecap={strokeLinecap}
              strokeDasharray={dashEnabled ? strokeDashArray : undefined}
              strokeDashoffset={dashEnabled ? dashOffset : undefined}
              fillRule={fillRule}
              clipRule={fillRule}
              style={{ opacity: doubleStrokeOpacity }}
              className="transition-all duration-300 ease-out"
            />
          )}
        </g>
      )}
    </svg>
  );
}

export default ShapeRenderer;
