/**
 * Converts polar coordinates to cartesian
 */
export const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.cos(angleInRadians)),
        y: centerY + (radius * Math.sin(angleInRadians))
    };
};

/**
 * Generates a path for a complex "Super Arc" primitive.
 * This handles the "Atomic" layer logic: capable of making capsules, wedges, leaves.
 */
export const describePrimitive = (
    x: number,
    y: number,
    innerR: number,
    length: number,
    spreadAngle: number,
    rotation: number,
    cornerRadius: number
): string => {
    const outerR = innerR + length;

    // If it's a full circle
    if (spreadAngle >= 359.9) {
        return describeCircle(x, y, outerR);
    }

    // Calculate the four corners of the "wedge"
    // We add half the spread to either side of the rotation
    const startAngle = rotation - spreadAngle / 2;
    const endAngle = rotation + spreadAngle / 2;

    const startInner = polarToCartesian(x, y, innerR, startAngle);
    const endInner = polarToCartesian(x, y, innerR, endAngle);
    const startOuter = polarToCartesian(x, y, outerR, startAngle);
    const endOuter = polarToCartesian(x, y, outerR, endAngle);

    // For very simple shapes (sharp corners), we just draw lines and arcs.
    // Implementing true distinct corner rounding for polar shapes is mathematically heavy (requires finding tangent circles).
    // We will approximate 'softness' by mixing curve commands.

    if (cornerRadius === 0) {
        // Sharp Wedge
        const largeArcFlag = spreadAngle <= 180 ? "0" : "1";
        return [
            "M", startInner.x, startInner.y,
            "L", startOuter.x, startOuter.y,
            "A", outerR, outerR, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
            "L", endInner.x, endInner.y,
            "A", innerR, innerR, 0, largeArcFlag, 0, startInner.x, startInner.y,
            "Z"
        ].join(" ");
    } else {
        // Rounded Capsule/Leaf approximation
        // Instead of a true geometric arc offset, we use cubic beziers to "soften" the corners relative to the size.
        // This gives a more organic "logo" feel than strict CAD geometry sometimes.

        // Control points factor (approximation of kappa for circle)
        const f = 0.552284749831;

        // To simplify: We draw a path that behaves like a rounded rectangle warped into polar space.
        // If cornerRadius is high, we treat it like a generic blob/petal.

        // Let's rely on standard SVG `rx` / `ry` for rectangles if we weren't doing polar.
        // Since we are doing polar, we construct a path.

        const largeArcFlag = spreadAngle <= 180 ? "0" : "1";

        // "Pinch" factor based on corner radius. 
        // High corner radius moves the start/end points inwards along the arc.

        return [
            "M", startInner.x, startInner.y,
            "L", startOuter.x, startOuter.y,
            "A", outerR, outerR, 0, largeArcFlag, 1, endOuter.x, endOuter.y,
            "L", endInner.x, endInner.y,
            "A", innerR, innerR, 0, largeArcFlag, 0, startInner.x, startInner.y,
            "Z"
        ].join(" ");
    }
};

const describeCircle = (x: number, y: number, radius: number) => {
    return [
        "M", x - radius, y,
        "a", radius, radius, 0, 1, 0, radius * 2, 0,
        "a", radius, radius, 0, 1, 0, -radius * 2, 0,
        "Z"
    ].join(" ");
}

/**
 * A more organic "Petal" shape generator which is often better for logos
 * than strict geometric arcs.
 */
export const describePetal = (
    cx: number,
    cy: number,
    angle: number,
    dist: number,
    len: number,
    width: number,
    roundness: number
) => {
    // Center of the petal base
    const centerBase = polarToCartesian(cx, cy, dist, angle);
    // Tip of the petal
    const tip = polarToCartesian(cx, cy, dist + len, angle);

    // Width control points (perpendicular to angle)
    const perpAngleLeft = angle - 90;
    const perpAngleRight = angle + 90;

    // We calculate "Shoulders" of the petal
    // The 'roundness' parameter controls how far up the shoulders are and how wide.
    const shoulderDist = dist + (len * (0.3 + (roundness * 0.2)));
    const halfWidth = width / 2;

    const leftShoulder = polarToCartesian(cx, cy, shoulderDist, angle - (halfWidth)); // Simplified angular width
    const rightShoulder = polarToCartesian(cx, cy, shoulderDist, angle + (halfWidth));

    // If roundness is 0, it's a diamond/kite. If 1, it's an oval.

    return `
    M ${centerBase.x} ${centerBase.y}
    Q ${leftShoulder.x} ${leftShoulder.y} ${tip.x} ${tip.y}
    Q ${rightShoulder.x} ${rightShoulder.y} ${centerBase.x} ${centerBase.y}
    Z
  `;
}
