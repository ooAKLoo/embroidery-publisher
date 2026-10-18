import React, { useMemo } from 'react';
import { LogoParams } from '../types';
import { polarToCartesian } from '../utils/geometry';

interface LogoRendererProps {
    params: LogoParams;
    size?: number;
    className?: string;
    backgroundColor?: string;
    seed?: number; // Optional seed for slight variations if we implemented per-petal noise
}

export const LogoRenderer = ({ params, size = 300, className = "", backgroundColor = "#0b1120" }: LogoRendererProps) => {
    const half = size / 2;

    // Generate the paths based on the parameters
    const shapes = useMemo(() => {
        return Array.from({ length: params.count }).map((_, i) => {
            // Structural Rule: Polar Distribution
            const angleStep = 360 / params.count;
            const angle = (i * angleStep) + params.rotationOffset;

            // We use SVG transforms for the actual rotation to make the math simpler for the "Atomic Rotation" 
            // relative to the "Structural Rotation".

            // Calculate opacity variation if needed (e.g. for depth)
            // For now, uniform opacity.

            return {
                id: i,
                angle,
            };
        });
    }, [params.count, params.rotationOffset]);

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
    const parseHexColor = (hex: string) => {
        const normalized = hex.trim().replace('#', '');
        if (normalized.length === 3) {
            const r = parseInt(normalized[0] + normalized[0], 16);
            const g = parseInt(normalized[1] + normalized[1], 16);
            const b = parseInt(normalized[2] + normalized[2], 16);
            return { r, g, b };
        }
        if (normalized.length === 6) {
            const r = parseInt(normalized.slice(0, 2), 16);
            const g = parseInt(normalized.slice(2, 4), 16);
            const b = parseInt(normalized.slice(4, 6), 16);
            return { r, g, b };
        }
        return null;
    };
    const hslToRgb = (h: number, s: number, l: number) => {
        const hh = ((h % 360) + 360) % 360;
        const ss = clamp(s, 0, 100) / 100;
        const ll = clamp(l, 0, 100) / 100;
        const c = (1 - Math.abs(2 * ll - 1)) * ss;
        const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
        const m = ll - c / 2;
        let r = 0;
        let g = 0;
        let b = 0;
        if (hh < 60) [r, g, b] = [c, x, 0];
        else if (hh < 120) [r, g, b] = [x, c, 0];
        else if (hh < 180) [r, g, b] = [0, c, x];
        else if (hh < 240) [r, g, b] = [0, x, c];
        else if (hh < 300) [r, g, b] = [x, 0, c];
        else [r, g, b] = [c, 0, x];
        return {
            r: Math.round((r + m) * 255),
            g: Math.round((g + m) * 255),
            b: Math.round((b + m) * 255),
        };
    };
    const relativeLuminance = (r: number, g: number, b: number) => {
        const toLinear = (v: number) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        };
        const rl = toLinear(r);
        const gl = toLinear(g);
        const bl = toLinear(b);
        return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
    };
    const contrastRatio = (l1: number, l2: number) => {
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
    };
    const hasFill = params.fill;
    const hasStroke = params.stroke;

    // CSS Color String
    const color = `hsla(${params.hue}, ${params.saturation}%, ${params.lightness}%, ${params.opacity})`;
    const strokeLightness = clamp(params.lightness + 20, 0, 100);
    const strokeColor = `hsla(${params.hue}, ${params.saturation}%, ${strokeLightness}%, 1)`;
    const useAutoDepthColor = Boolean(params.autoDepthColor);
    const baseLightness = clamp(params.lightness, 0, 100);
    const baseSaturation = clamp(params.saturation, 0, 100);
    const bgRgb = parseHexColor(backgroundColor) ?? { r: 11, g: 17, b: 32 };
    const bgLum = relativeLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
    const baseRgb = hslToRgb(params.hue, baseSaturation, baseLightness);
    const baseLum = relativeLuminance(baseRgb.r, baseRgb.g, baseRgb.b);
    const preferDark = baseLum > bgLum;
    const makeAutoColor = (darkDelta: number, lightDelta: number, satDrop: number, minContrast = 1.6) => {
        const s = clamp(baseSaturation - satDrop, 0, 100);
        const darkL = clamp(baseLightness - darkDelta, 0, 100);
        const lightL = clamp(baseLightness + lightDelta, 0, 100);
        const darkRgb = hslToRgb(params.hue, s, darkL);
        const lightRgb = hslToRgb(params.hue, s, lightL);
        const darkContrast = contrastRatio(relativeLuminance(darkRgb.r, darkRgb.g, darkRgb.b), bgLum);
        const lightContrast = contrastRatio(relativeLuminance(lightRgb.r, lightRgb.g, lightRgb.b), bgLum);
        let chosenL = darkContrast >= lightContrast ? darkL : lightL;
        let chosenContrast = Math.max(darkContrast, lightContrast);
        if (preferDark && Math.abs(darkContrast - lightContrast) < 0.25) {
            chosenL = darkL;
            chosenContrast = darkContrast;
        }
        if (chosenContrast < minContrast) {
            const direction = bgLum < 0.5 ? 1 : -1;
            chosenL = clamp(chosenL + direction * 14, 0, 100);
        }
        return `hsl(${params.hue}, ${s}%, ${chosenL}%)`;
    };
    const autoShadowColor = makeAutoColor(28, 22, 12, 1.7);
    const autoInnerShadowColor = makeAutoColor(18, 14, 8, 1.5);
    const autoDoubleStrokeColor = makeAutoColor(32, 18, 12, 1.7);
    const autoExtrudeColor = makeAutoColor(24, 16, 10, 1.6);
    const doubleStrokeColor = useAutoDepthColor ? autoDoubleStrokeColor : (params.doubleStrokeColor ?? "#0f172a");

    const shadowEnabled = Boolean(params.shadowEnabled);
    const innerShadowEnabled = Boolean(params.innerShadowEnabled);
    const allowInnerShadow = innerShadowEnabled && (hasFill || hasStroke);
    const doubleStrokeEnabled = Boolean(params.doubleStrokeEnabled) && hasStroke;
    const doubleStrokeWidth = params.doubleStrokeWidth ?? 0;
    const doubleStrokeOpacity = params.doubleStrokeOpacity ?? 0.6;
    const extrudeEnabled = Boolean(params.extrudeEnabled);
    const extrudeDepth = Math.max(1, Math.round(params.extrudeDepth ?? 0));
    const extrudeOffsetX = params.extrudeOffsetX ?? 0;
    const extrudeOffsetY = params.extrudeOffsetY ?? 0;
    const extrudeOpacity = clamp(params.extrudeOpacity ?? 0.6, 0, 1);
    const extrudeFade = clamp(params.extrudeFade ?? 0.6, 0, 1);
    const extrudeColor = useAutoDepthColor ? autoExtrudeColor : (params.extrudeColor ?? "#111827");
    const extrudeStepX = extrudeDepth > 0 ? extrudeOffsetX / extrudeDepth : 0;
    const extrudeStepY = extrudeDepth > 0 ? extrudeOffsetY / extrudeDepth : 0;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`-${half} -${half} ${size} ${size}`}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {shadowEnabled && (
                    <filter id="geo-drop-shadow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceAlpha" stdDeviation={params.shadowBlur ?? 0} result="shadowBlur" />
                        <feOffset in="shadowBlur" dx={params.shadowX ?? 0} dy={params.shadowY ?? 0} result="shadowOffset" />
                        <feFlood floodColor={useAutoDepthColor ? autoShadowColor : (params.shadowColor ?? "#000000")} floodOpacity={params.shadowOpacity ?? 0.25} result="shadowColor" />
                        <feComposite in="shadowColor" in2="shadowOffset" operator="in" result="shadow" />
                        <feMerge>
                            <feMergeNode in="shadow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                )}
                {allowInnerShadow && (
                    <filter id="geo-inner-shadow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
                        <feGaussianBlur in="SourceAlpha" stdDeviation={params.innerShadowBlur ?? 0} result="innerBlur" />
                        <feOffset in="innerBlur" dx={params.innerShadowX ?? 0} dy={params.innerShadowY ?? 0} result="innerOffset" />
                        <feComposite in="innerOffset" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
                        <feFlood floodColor={useAutoDepthColor ? autoInnerShadowColor : (params.innerShadowColor ?? "#000000")} floodOpacity={params.innerShadowOpacity ?? 0.4} result="innerColor" />
                        <feComposite in="innerColor" in2="innerShadow" operator="in" result="innerShadowColor" />
                        <feComposite in="SourceGraphic" in2="innerShadowColor" operator="over" />
                    </filter>
                )}
            </defs>
            <g filter={shadowEnabled ? "url(#geo-drop-shadow)" : undefined}>
                {extrudeEnabled && extrudeDepth > 0 && Array.from({ length: extrudeDepth }).map((_, idx) => {
                    const step = extrudeDepth - idx;
                    const t = step / extrudeDepth;
                    const layerOpacity = Math.max(0, extrudeOpacity * (1 - t * extrudeFade));
                    return (
                        <g key={`extrude-${step}`} transform={`translate(${(extrudeStepX * step).toFixed(3)} ${(extrudeStepY * step).toFixed(3)})`}>
                            {shapes.map((shape) => (
                                <g key={`extrude-${step}-${shape.id}`} transform={`rotate(${shape.angle})`}>
                                    <path
                                        d={createPrimitivePath(params)}
                                        fill={extrudeColor}
                                        stroke="none"
                                        opacity={layerOpacity}
                                    />
                                </g>
                            ))}
                        </g>
                    );
                })}

                {shapes.map((shape) => (
                    <g
                        key={shape.id}
                        transform={`rotate(${shape.angle})`}
                        style={{ mixBlendMode: params.blendMode as any }}
                    >
                        {hasFill && (
                            <path
                                d={createPrimitivePath(params)}
                                fill={color}
                                stroke="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={allowInnerShadow && hasFill ? "url(#geo-inner-shadow)" : undefined}
                            />
                        )}
                        {doubleStrokeEnabled && (
                            <path
                                d={createPrimitivePath(params)}
                                fill="none"
                                stroke={doubleStrokeColor}
                                strokeWidth={params.strokeWidth + doubleStrokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity={doubleStrokeOpacity}
                            />
                        )}
                        {hasStroke && (
                            <path
                                d={createPrimitivePath(params)}
                                fill="none"
                                stroke={strokeColor}
                                strokeWidth={params.strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                filter={allowInnerShadow && !hasFill ? "url(#geo-inner-shadow)" : undefined}
                            />
                        )}
                    </g>
                ))}
            </g>
        </svg>
    );
};

// Internal helper to create the "Atom" path string
// We construct it around (0,0) assuming it will be rotated by the parent group
function createPrimitivePath(p: LogoParams): string {
    // Use a hybrid approach:
    // If cornerRadius is low, we use Arc math.
    // If cornerRadius is high, we use Beziers for organic petals.

    // We draw relative to (0,0). 
    // p.innerRadius moves it out along X axis.
    // p.atomicRotation rotates it around its own center (which is complex in SVG)
    // so we rotate the primitive points.

    // To support "Atomic Rotation" effectively, we calculate points then rotate them.

    // 1. Define base shape points unrotated (pointing East)
    const r1 = p.innerRadius;
    const r2 = p.innerRadius + p.length;
    const halfSpread = p.spread / 2;
    const rad = (deg: number) => deg * Math.PI / 180;

    // A simple rounded rectangle / capsule approximation centered on X axis
    // But strictly speaking, a "sector" is wedged.

    // Let's go with a "Super Rect" approach for maximum versatility.
    // Four corners:
    // TL: (r1, -halfSpread scaled to Y) -> This is tricky in polar.
    // Let's stick to true polar conversion.

    // Base Angle is 0 (East).
    const angleTop = -halfSpread;
    const angleBottom = halfSpread;

    // Additional rotation of the atom itself relative to the radial line
    const tilt = p.atomicRotation;

    // Helper to get point with local tilt
    const getP = (r: number, a: number) => {
        const finalA = a + tilt;
        return {
            x: r * Math.cos(rad(finalA)),
            y: r * Math.sin(rad(finalA))
        };
    };

    // Corners
    const p1 = getP(r1, angleTop);    // Inner Top
    const p2 = getP(r2, angleTop);    // Outer Top
    const p3 = getP(r2, angleBottom); // Outer Bottom
    const p4 = getP(r1, angleBottom); // Inner Bottom

    // Roundness factor (0 to 1)
    // If 0: Straight lines.
    // If 1: Maximum curve (ellipse/circle feel).
    const cr = p.cornerRadius;

    if (cr < 0.05) {
        return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} L ${p4.x} ${p4.y} Z`;
    }

    // Cubic Bezier implementation for "Organic" shapes
    // We offset control points based on length/width and roundness

    // Outer Arc/Cap
    // Vector from p2 to p3
    const outerDist = Math.hypot(p3.x - p2.x, p3.y - p2.y);
    const innerDist = Math.hypot(p4.x - p1.x, p4.y - p1.y);
    const sideDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    // Control point offset magnitude
    const cpScale = cr * 0.4;

    // For a perfect "Capsule", we need control points extending outward.
    // Let's try a simpler approach: Rounding the corners of the polygon.

    // Actually, standard SVG 'arc' commands are best for geometric logos.
    // Let's return to the Arc command but applied to the tilted coordinates.

    // If spread is small (< 180), it's a wedge. 
    const largeArc = 0;
    const sweep = 1;

    // Note: Standard 'A' command requires axes aligned unless we rotate the whole coordinate system.
    // Since we are calculating manually, 'Q' (Quadratic) is easier for generic rounding.

    return `
    M ${p1.x} ${p1.y}
    L ${p2.x} ${p2.y}
    Q ${getP(r2 + (p.length * cr * 0.5), 0).x} ${getP(r2 + (p.length * cr * 0.5), 0).y} ${p3.x} ${p3.y}
    L ${p4.x} ${p4.y}
    Q ${getP(r1 - (p.length * cr * 0.5), 0).x} ${getP(r1 - (p.length * cr * 0.5), 0).y} ${p1.x} ${p1.y}
    Z
  `;

    // Note: The math above is a stylistic approximation to allow "Leaf" shapes. 
    // It creates a Quadratic curve for the outer cap and inner cap.
}
