import { useMemo } from "react";
import { generateAtomPath } from "./utils/math";

function ShapeRenderer({ config, width = 400, height = 400, className = "" }) {
  const cx = width / 2;
  const cy = height / 2;

  const paths = useMemo(() => {
    const generatedPaths = [];
    const { count, arrayRadius, rotation } = config;

    const atomPath = generateAtomPath(config, 0, 0);
    const angleStep = (2 * Math.PI) / count;
    const globalRotRad = (rotation * Math.PI) / 180;

    for (let i = 0; i < count; i++) {
      const theta = i * angleStep;
      const x = arrayRadius * Math.cos(theta + globalRotRad);
      const y = arrayRadius * Math.sin(theta + globalRotRad);
      const itemRotation = (theta + globalRotRad) * (180 / Math.PI) + 90;
      
      generatedPaths.push({
        d: atomPath,
        transform: `translate(${cx + x}, ${cy + y}) rotate(${itemRotation}) scale(${config.scale})`,
      });
    }

    return generatedPaths;
  }, [config, cx, cy]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      <g style={{ opacity: config.opacity }}>
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            transform={p.transform}
            fill={config.fill}
            stroke={config.stroke}
            strokeWidth={config.strokeWidth / config.scale}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        ))}
      </g>
    </svg>
  );
}

export default ShapeRenderer;
