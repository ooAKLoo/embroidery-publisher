export const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

export const describeArc = (x, y, radius, startAngle, endAngle) => {
  const span = Math.abs(endAngle - startAngle);
  if (span >= 360) {
    const start = polarToCartesian(x, y, radius, startAngle);
    const mid = polarToCartesian(x, y, radius, startAngle + 180);
    const end = polarToCartesian(x, y, radius, startAngle + 360);
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, 1, 0, mid.x, mid.y,
      "A", radius, radius, 0, 1, 0, end.x, end.y
    ].join(" ");
  }

  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

export const describeRibbon = (x, y, radius, thickness, startAngle, endAngle, capStyle = "flat") => {
  const span = Math.abs(endAngle - startAngle);
  const rInner = radius - thickness / 2;
  const rOuter = radius + thickness / 2;

  if (span >= 360) {
    const startOuter = polarToCartesian(x, y, rOuter, startAngle);
    const midOuter = polarToCartesian(x, y, rOuter, startAngle + 180);
    const endOuter = polarToCartesian(x, y, rOuter, startAngle + 360);

    const startInner = polarToCartesian(x, y, rInner, startAngle);
    const midInner = polarToCartesian(x, y, rInner, startAngle + 180);
    const endInner = polarToCartesian(x, y, rInner, startAngle + 360);

    return [
      "M", startOuter.x, startOuter.y,
      "A", rOuter, rOuter, 0, 1, 0, midOuter.x, midOuter.y,
      "A", rOuter, rOuter, 0, 1, 0, endOuter.x, endOuter.y,
      "L", endInner.x, endInner.y,
      "A", rInner, rInner, 0, 1, 1, midInner.x, midInner.y,
      "A", rInner, rInner, 0, 1, 1, startInner.x, startInner.y,
      "Z"
    ].join(" ");
  }

  const startOuter = polarToCartesian(x, y, rOuter, startAngle);
  const endOuter = polarToCartesian(x, y, rOuter, endAngle);
  const startInner = polarToCartesian(x, y, rInner, startAngle);
  const endInner = polarToCartesian(x, y, rInner, endAngle);
  const capRadius = thickness / 2;

  const largeArcFlag = span <= 180 ? "0" : "1";
  const sweepOuter = endAngle >= startAngle ? 1 : 0;
  const sweepInner = endAngle >= startAngle ? 0 : 1;

  if (capStyle === "round") {
    return [
      "M", startOuter.x, startOuter.y,
      "A", rOuter, rOuter, 0, largeArcFlag, sweepOuter, endOuter.x, endOuter.y,
      "A", capRadius, capRadius, 0, 0, sweepOuter, endInner.x, endInner.y,
      "A", rInner, rInner, 0, largeArcFlag, sweepInner, startInner.x, startInner.y,
      "A", capRadius, capRadius, 0, 0, sweepOuter, startOuter.x, startOuter.y,
      "Z"
    ].join(" ");
  }

  return [
    "M", startOuter.x, startOuter.y,
    "A", rOuter, rOuter, 0, largeArcFlag, sweepOuter, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", rInner, rInner, 0, largeArcFlag, sweepInner, startInner.x, startInner.y,
    "Z"
  ].join(" ");
};

export const downloadSVG = (svgContent) => {
  const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "geometric-spiral.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
