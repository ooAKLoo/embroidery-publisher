import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

const WireframeLogo = ({
  vertices = 6,
  radius = 100,
  rotation = 0,
  innerConnections = true,
  strokeWidth = 2.5,
  colors = ['#f97316', '#c084fc', '#60a5fa'],
  commonStyles = {}
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const gradientId = generateGradientId('wireframe', colors);
  const rotationRad = (rotation * Math.PI) / 180;
  const { points, innerPoints } = useMemo(() => {
    const pts = [], innerPts = [], innerRadius = radius * 0.4;
    for (let i = 0; i < vertices; i++) {
      const angle = (i * 2 * Math.PI) / vertices + rotationRad;
      pts.push({ x: 150 + radius * Math.cos(angle), y: 150 + radius * Math.sin(angle) });
      innerPts.push({ x: 150 + innerRadius * Math.cos(angle + Math.PI / vertices), y: 150 + innerRadius * Math.sin(angle + Math.PI / vertices) });
    }
    return { points: pts, innerPoints: innerPts };
  }, [vertices, radius, rotationRad]);

  const outerPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const connectionLines = innerConnections ? points.flatMap((p, i) => [
    `M ${p.x} ${p.y} L 150 150`, 
    `M ${p.x} ${p.y} L ${innerPoints[i].x} ${innerPoints[i].y}`, 
    `M ${p.x} ${p.y} L ${innerPoints[(i + 1) % vertices].x} ${innerPoints[(i + 1) % vertices].y}`
  ]) : [];

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" {...strokeProps}>
        <path d={outerPath} />
        {connectionLines.map((d, i) => <path key={i} d={d} />)}
      </g>
    </svg>
  );
};

export default WireframeLogo;
