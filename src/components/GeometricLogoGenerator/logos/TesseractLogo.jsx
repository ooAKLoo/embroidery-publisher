import { useMemo } from 'react';
import { rotateXW, rotateYW, rotateZW } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { TESSERACT } from '../constants/polyhedra';

const TesseractLogo = ({ 
  rotationXY = 0, 
  rotationXZ = 0, 
  rotationXW = 0.5, 
  rotationYW = 0.3, 
  scale = 60, 
  strokeWidth = 2, 
  colors = ['#06b6d4', '#3b82f6', '#6366f1'] 
}) => {
  const gradientId = generateGradientId('tesseract', colors);
  const projected = useMemo(() => {
    const { vertices, edges } = TESSERACT;
    const rotated = vertices.map(v => {
      let r = [...v];
      r = rotateXW(r, rotationXW); r = rotateYW(r, rotationYW); r = rotateZW(r, rotationXZ);
      const w = 2 / (3 - r[3]);
      return [r[0] * w, r[1] * w, r[2] * w, r[3]];
    });
    const proj = rotated.map(v => ({ x: 150 + v[0] * scale, y: 150 + v[1] * scale, z: v[2], w: v[3] }));
    const edgesData = edges.map(([i, j]) => ({ from: proj[i], to: proj[j], depth: (rotated[i][2] + rotated[j][2]) / 2 }));
    edgesData.sort((a, b) => a.depth - b.depth);
    return edgesData;
  }, [rotationXY, rotationXZ, rotationXW, rotationYW, scale]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" strokeLinecap="round">
        {projected.map((e, i) => <line key={i} x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y} opacity={0.4 + (e.depth + 1) * 0.3} />)}
      </g>
    </svg>
  );
};

export default TesseractLogo;
