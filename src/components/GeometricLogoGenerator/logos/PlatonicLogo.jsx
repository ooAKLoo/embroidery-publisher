import { useMemo } from 'react';
import { rotateX, rotateY, rotateZ } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { PLATONIC_SOLIDS } from '../constants/polyhedra';
import { getRenderProps } from '../constants/commonStyles';

const PlatonicLogo = ({
  solid = 'icosahedron',
  rotationX: rx = 0.5,
  rotationY: ry = 0.3,
  rotationZ: rz = 0,
  scale = 70,
  strokeWidth = 2.5,
  colors = ['#f97316', '#ec4899', '#a855f7', '#6366f1'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('platonic', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const projected = useMemo(() => {
    const { vertices, edges } = PLATONIC_SOLIDS[solid];
    const maxDist = Math.max(...vertices.map(v => Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)));
    const rotated = vertices.map(v => {
      let r = v.map(c => c / maxDist);
      r = rotateX(r, rx); r = rotateY(r, ry); r = rotateZ(r, rz);
      return r;
    });
    const proj = rotated.map(v => ({ x: 150 + v[0] * scale, y: 150 + v[1] * scale, z: v[2] }));
    const edgesWithDepth = edges.map(([i, j]) => ({ from: proj[i], to: proj[j], depth: (rotated[i][2] + rotated[j][2]) / 2 }));
    edgesWithDepth.sort((a, b) => a.depth - b.depth);
    return edgesWithDepth;
  }, [solid, rx, ry, rz, scale]);

  // 3D 线框图形主要使用线条
  const lineColor = renderProps.stroke !== 'none' ? renderProps.stroke : renderProps.fill;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g
        stroke={lineColor}
        strokeWidth={renderProps.strokeWidth}
        strokeLinecap={renderProps.strokeLinecap}
        strokeLinejoin={renderProps.strokeLinejoin}
        fill="none"
      >
        {projected.map((e, i) => (
          <line
            key={i}
            x1={e.from.x}
            y1={e.from.y}
            x2={e.to.x}
            y2={e.to.y}
            opacity={(0.5 + (e.depth + 1) * 0.25) * (renderProps.fillOpacity || 1)}
          />
        ))}
      </g>
    </svg>
  );
};

export default PlatonicLogo;
