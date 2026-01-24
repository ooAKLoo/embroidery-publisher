import React, { useMemo } from 'react';
import { LogoParams } from '../types';
import { polarToCartesian } from '../utils/geometry';

interface LogoRendererProps {
    params: LogoParams;
    size?: number;
    className?: string;
    seed?: number; // Optional seed for slight variations if we implemented per-petal noise
}

export const LogoRenderer = ({ params, size = 300, className = "" }: LogoRendererProps) => {
    const center = size / 2;

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

    // CSS Color String
    const color = `hsla(${params.hue}, ${params.saturation}%, ${params.lightness}%, ${params.opacity})`;
    const strokeColor = `hsla(${params.hue}, ${params.saturation}%, ${params.lightness + 20}%, 1)`;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* We can add gradients here later */}
            </defs>
            <g transform={`translate(${center}, ${center})`}>
                {shapes.map((shape) => (
                    <g
                        key={shape.id}
                        transform={`rotate(${shape.angle})`}
                        style={{ mixBlendMode: params.blendMode as any }}
                    >
                        {/* 
                Atomic Primitive Construction:
                We build the shape at 0 degrees, pointing right (or up), 
                then transform it via the group.
             */}
                        <path
                            d={createPrimitivePath(params)}
                            fill={params.fill ? color : 'none'}
                            stroke={params.stroke ? strokeColor : 'none'}
                            strokeWidth={params.strokeWidth}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
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
