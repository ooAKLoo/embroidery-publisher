import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 流体线条Logo - 曲线流动、贝塞尔曲线
const FlowingCurvesLogo = ({
  curveCount = 5,              // 曲线数量
  flowDirection = 'horizontal', // 'horizontal' | 'vertical' | 'circular' | 'wave'
  amplitude = 40,              // 波动幅度
  frequency = 2,               // 波动频率
  phase = 0,                   // 相位偏移
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const curves = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 110;

    for (let i = 0; i < curveCount; i++) {
      const offset = ((i - (curveCount - 1) / 2) / curveCount) * size * 1.5;
      const phaseOffset = (phase * Math.PI) / 180 + i * 0.5;
      let d = '';

      if (flowDirection === 'horizontal') {
        const points = [];
        for (let x = -size; x <= size; x += 5) {
          const y = offset + Math.sin((x / size) * Math.PI * frequency + phaseOffset) * amplitude;
          points.push({ x: cx + x, y: cy + y });
        }
        d = `M ${points[0].x} ${points[0].y}`;
        for (let j = 1; j < points.length - 1; j++) {
          const p0 = points[j - 1];
          const p1 = points[j];
          const p2 = points[j + 1];
          const cp1x = p1.x - (p1.x - p0.x) * 0.2;
          const cp1y = p1.y - (p1.y - p0.y) * 0.2;
          const cp2x = p1.x + (p2.x - p1.x) * 0.2;
          const cp2y = p1.y + (p2.y - p1.y) * 0.2;
          d += ` S ${cp1x} ${cp1y} ${p1.x} ${p1.y}`;
        }
      } else if (flowDirection === 'vertical') {
        const points = [];
        for (let y = -size; y <= size; y += 5) {
          const x = offset + Math.sin((y / size) * Math.PI * frequency + phaseOffset) * amplitude;
          points.push({ x: cx + x, y: cy + y });
        }
        d = `M ${points[0].x} ${points[0].y}`;
        for (let j = 1; j < points.length; j++) {
          d += ` L ${points[j].x} ${points[j].y}`;
        }
      } else if (flowDirection === 'circular') {
        const r = size * 0.4 + i * (size * 0.15);
        const points = [];
        const segments = 72;
        for (let j = 0; j <= segments; j++) {
          const angle = (j * 2 * Math.PI) / segments;
          const wave = Math.sin(angle * frequency + phaseOffset) * amplitude * 0.3;
          points.push({
            x: cx + (r + wave) * Math.cos(angle),
            y: cy + (r + wave) * Math.sin(angle),
          });
        }
        d = `M ${points[0].x} ${points[0].y}`;
        for (let j = 1; j < points.length; j++) {
          d += ` L ${points[j].x} ${points[j].y}`;
        }
        d += ' Z';
      } else if (flowDirection === 'wave') {
        // S形波浪
        const baseY = cy + offset * 0.8;
        d = `M ${cx - size} ${baseY}`;
        d += ` C ${cx - size * 0.5} ${baseY - amplitude} ${cx - size * 0.25} ${baseY + amplitude} ${cx} ${baseY}`;
        d += ` S ${cx + size * 0.5} ${baseY - amplitude} ${cx + size} ${baseY}`;
      }

      result.push({
        id: i,
        d,
        opacity: 0.4 + (1 - Math.abs(i - (curveCount - 1) / 2) / curveCount) * 0.6,
      });
    }

    return result;
  }, [curveCount, flowDirection, amplitude, frequency, phase]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0" />
          <stop offset="20%" stopColor={color} stopOpacity="1" />
          <stop offset="80%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform={`rotate(${rotation}, 150, 150)`} fill="none" {...strokeProps}>
        {curves.map((curve) => (
          <path
            key={curve.id}
            d={curve.d}
            stroke="url(#flowGrad)"
            strokeWidth={strokeWidth}
            opacity={curve.opacity}
          />
        ))}
      </g>
    </svg>
  );
};

export default FlowingCurvesLogo;
