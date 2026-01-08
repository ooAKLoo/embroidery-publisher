import { useMemo } from 'react';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';

const KochSnowflakeLogo = ({
  iterations = 4,
  size = 100,
  rotation = 0,
  strokeWidth = 1.5,
  colors = ['#06b6d4', '#0ea5e9']
}) => {
  const gradientId = generateGradientId('koch', colors);
  const path = useMemo(() => {
    const kochLine = (x1, y1, x2, y2, depth) => {
      if (depth === 0) return [`L ${x2} ${y2}`];
      const dx = x2 - x1, dy = y2 - y1;
      const px1 = x1 + dx / 3, py1 = y1 + dy / 3;
      const px3 = x1 + 2 * dx / 3, py3 = y1 + 2 * dy / 3;
      const px2 = px1 + (dx / 3) * Math.cos(-Math.PI / 3) - (dy / 3) * Math.sin(-Math.PI / 3);
      const py2 = py1 + (dx / 3) * Math.sin(-Math.PI / 3) + (dy / 3) * Math.cos(-Math.PI / 3);
      return [...kochLine(x1, y1, px1, py1, depth - 1), ...kochLine(px1, py1, px2, py2, depth - 1),
        ...kochLine(px2, py2, px3, py3, depth - 1), ...kochLine(px3, py3, x2, y2, depth - 1)];
    };
    const pts = [];
    for (let i = 0; i < 3; i++) {
      const a1 = (i * 2 * Math.PI / 3) - Math.PI / 2;
      const a2 = ((i + 1) * 2 * Math.PI / 3) - Math.PI / 2;
      pts.push(...kochLine(150 + size * Math.cos(a1), 150 + size * Math.sin(a1), 150 + size * Math.cos(a2), 150 + size * Math.sin(a2), iterations));
    }
    return `M ${150 + size * Math.cos(-Math.PI / 2)} ${150 + size * Math.sin(-Math.PI / 2)} ` + pts.join(' ') + ' Z';
  }, [iterations, size]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g transform={`rotate(${rotation}, 150, 150)`}>
        <path d={path} stroke={getStroke(gradientId, colors)} strokeWidth={strokeWidth} fill="none" />
      </g>
    </svg>
  );
};

export default KochSnowflakeLogo;
