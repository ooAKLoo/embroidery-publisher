import { useMemo } from 'react';
import { rotateX, rotateY } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

const MobiusLogo = ({
  rotationX: rx = 0.5,
  rotationY: ry = 0.3,
  scale = 80,
  strokeWidth = 1.5,
  colors = ['#8b5cf6', '#6366f1', '#3b82f6'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('mobius', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  const lines = useMemo(() => {
    const result = [];
    const R = 1;
    for (let v = -0.5; v <= 0.5; v += 0.25) {
      const strip = [];
      for (let u = 0; u <= 2 * Math.PI; u += 0.05) {
        const x = (R + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (R + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);
        let r = rotateX([x, y, z], rx);
        r = rotateY(r, ry);
        strip.push({ x: 150 + r[0] * scale, y: 150 + r[1] * scale, z: r[2] });
      }
      result.push(strip);
    }
    for (let u = 0; u < 2 * Math.PI; u += Math.PI / 8) {
      const cross = [];
      for (let v = -0.5; v <= 0.5; v += 0.1) {
        const x = (R + v * Math.cos(u / 2)) * Math.cos(u);
        const y = (R + v * Math.cos(u / 2)) * Math.sin(u);
        const z = v * Math.sin(u / 2);
        let r = rotateX([x, y, z], rx);
        r = rotateY(r, ry);
        cross.push({ x: 150 + r[0] * scale, y: 150 + r[1] * scale, z: r[2] });
      }
      result.push(cross);
    }
    return result;
  }, [rx, ry, scale]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g {...renderProps}>
        {lines.map((strip, i) => (
          <path key={i} d={strip.map((p, j) => `${j === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')} stroke={renderProps.stroke === 'none' ? renderProps.fill : renderProps.stroke} opacity={0.7} />
        ))}
      </g>
    </svg>
  );
};

export default MobiusLogo;
