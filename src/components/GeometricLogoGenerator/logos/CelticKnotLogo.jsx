import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 凯尔特结 Logo - 无始无终的编织图案
const CelticKnotLogo = ({
  knotType = 'triquetra',      // 'triquetra' | 'quaternary' | 'endless' | 'triskele'
  complexity = 2,              // 复杂度 1-4
  weaveWidth = 12,             // 编织带宽度
  showBorder = true,           // 显示外圈
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const radius = 100;
    const rotRad = (rotation * Math.PI) / 180;

    // 旋转点的辅助函数
    const rotatePoint = (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * Math.cos(rotRad) - dy * Math.sin(rotRad),
        y: cy + dx * Math.sin(rotRad) + dy * Math.cos(rotRad),
      };
    };

    if (knotType === 'triquetra') {
      // 三叶结 - 三个交织的弧形
      const lobeRadius = radius * 0.6;
      const centerDist = radius * 0.35;

      for (let i = 0; i < 3; i++) {
        const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
        const lobeCx = cx + centerDist * Math.cos(angle);
        const lobeCy = cy + centerDist * Math.sin(angle);

        // 外弧
        const startAngle = angle + Math.PI * 0.3;
        const endAngle = angle + Math.PI * 1.7;

        const x1 = lobeCx + lobeRadius * Math.cos(startAngle);
        const y1 = lobeCy + lobeRadius * Math.sin(startAngle);
        const x2 = lobeCx + lobeRadius * Math.cos(endAngle);
        const y2 = lobeCy + lobeRadius * Math.sin(endAngle);

        const rp1 = rotatePoint(x1, y1);
        const rp2 = rotatePoint(x2, y2);
        const rpC = rotatePoint(lobeCx, lobeCy);

        // 主弧线
        result.push({
          type: 'arc',
          id: `lobe-${i}`,
          cx: rpC.x,
          cy: rpC.y,
          r: lobeRadius,
          startAngle: startAngle + rotRad,
          endAngle: endAngle + rotRad,
          x1: rp1.x, y1: rp1.y,
          x2: rp2.x, y2: rp2.y,
        });

        // 内环（复杂度增加时）
        if (complexity >= 2) {
          const innerR = lobeRadius * 0.6;
          result.push({
            type: 'arc',
            id: `inner-lobe-${i}`,
            cx: rpC.x,
            cy: rpC.y,
            r: innerR,
            startAngle: startAngle + rotRad,
            endAngle: endAngle + rotRad,
            x1: rpC.x + innerR * Math.cos(startAngle + rotRad),
            y1: rpC.y + innerR * Math.sin(startAngle + rotRad),
            x2: rpC.x + innerR * Math.cos(endAngle + rotRad),
            y2: rpC.y + innerR * Math.sin(endAngle + rotRad),
          });
        }
      }

      // 中心三角形交织
      if (complexity >= 3) {
        const triR = radius * 0.25;
        let triPath = 'M ';
        for (let i = 0; i <= 3; i++) {
          const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const px = cx + triR * Math.cos(angle);
          const py = cy + triR * Math.sin(angle);
          const rp = rotatePoint(px, py);
          triPath += `${rp.x} ${rp.y} ${i < 3 ? 'L ' : ''}`;
        }
        triPath += 'Z';
        result.push({ type: 'path', id: 'center-tri', d: triPath });
      }

    } else if (knotType === 'quaternary') {
      // 四元结 - 四个交织的环
      const lobeRadius = radius * 0.45;
      const centerDist = radius * 0.4;

      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const lobeCx = cx + centerDist * Math.cos(angle);
        const lobeCy = cy + centerDist * Math.sin(angle);
        const rp = rotatePoint(lobeCx, lobeCy);

        result.push({
          type: 'circle',
          id: `lobe-${i}`,
          cx: rp.x,
          cy: rp.y,
          r: lobeRadius,
        });

        if (complexity >= 2) {
          result.push({
            type: 'circle',
            id: `inner-${i}`,
            cx: rp.x,
            cy: rp.y,
            r: lobeRadius * 0.5,
          });
        }
      }

      // 中心交织方形
      if (complexity >= 3) {
        const sqR = radius * 0.2;
        let sqPath = 'M ';
        for (let i = 0; i <= 4; i++) {
          const angle = (i * Math.PI) / 2 + Math.PI / 4;
          const px = cx + sqR * Math.cos(angle);
          const py = cy + sqR * Math.sin(angle);
          const rp = rotatePoint(px, py);
          sqPath += `${rp.x} ${rp.y} ${i < 4 ? 'L ' : ''}`;
        }
        sqPath += 'Z';
        result.push({ type: 'path', id: 'center-sq', d: sqPath });
      }

    } else if (knotType === 'endless') {
      // 无尽结 - 连续的编织线
      const gridSize = radius * 0.5;
      const offset = gridSize / 2;

      // 创建交织的方形图案
      const points = [];
      for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
          points.push({
            x: cx + col * gridSize,
            y: cy + row * gridSize,
          });
        }
      }

      // 水平编织线
      for (let row = -1; row <= 1; row++) {
        const y = cy + row * gridSize;
        for (let col = -1; col < 1; col++) {
          const x1 = cx + col * gridSize + offset / 2;
          const x2 = cx + (col + 1) * gridSize - offset / 2;
          const rp1 = rotatePoint(x1, y);
          const rp2 = rotatePoint(x2, y);
          result.push({
            type: 'line',
            id: `h-${row}-${col}`,
            x1: rp1.x, y1: rp1.y,
            x2: rp2.x, y2: rp2.y,
          });
        }
      }

      // 垂直编织线
      for (let col = -1; col <= 1; col++) {
        const x = cx + col * gridSize;
        for (let row = -1; row < 1; row++) {
          const y1 = cy + row * gridSize + offset / 2;
          const y2 = cy + (row + 1) * gridSize - offset / 2;
          const rp1 = rotatePoint(x, y1);
          const rp2 = rotatePoint(x, y2);
          result.push({
            type: 'line',
            id: `v-${row}-${col}`,
            x1: rp1.x, y1: rp1.y,
            x2: rp2.x, y2: rp2.y,
          });
        }
      }

      // 连接弧线（圆角）
      for (let row = -1; row <= 1; row++) {
        for (let col = -1; col <= 1; col++) {
          const nodeCx = cx + col * gridSize;
          const nodeCy = cy + row * gridSize;
          const arcR = offset / 2;

          // 四个方向的弧线
          const corners = [
            { start: Math.PI, end: Math.PI * 1.5 },
            { start: Math.PI * 1.5, end: Math.PI * 2 },
            { start: 0, end: Math.PI * 0.5 },
            { start: Math.PI * 0.5, end: Math.PI },
          ];

          corners.forEach((corner, idx) => {
            const ax = nodeCx + arcR * Math.cos((corner.start + corner.end) / 2);
            const ay = nodeCy + arcR * Math.sin((corner.start + corner.end) / 2);
            const rp = rotatePoint(nodeCx, nodeCy);

            if (Math.abs(col) <= 1 && Math.abs(row) <= 1) {
              result.push({
                type: 'smallArc',
                id: `corner-${row}-${col}-${idx}`,
                cx: rp.x,
                cy: rp.y,
                r: arcR,
                startAngle: corner.start + rotRad,
                endAngle: corner.end + rotRad,
              });
            }
          });
        }
      }

    } else if (knotType === 'triskele') {
      // 三旋臂 - 螺旋三叉
      const armCount = 3;
      const spiralTurns = complexity * 0.5;

      for (let arm = 0; arm < armCount; arm++) {
        const baseAngle = (arm * 2 * Math.PI) / armCount - Math.PI / 2;
        let path = 'M ';

        const points = [];
        for (let t = 0; t <= 1; t += 0.02) {
          const r = radius * 0.2 + t * radius * 0.7;
          const angle = baseAngle + t * spiralTurns * Math.PI;
          const px = cx + r * Math.cos(angle);
          const py = cy + r * Math.sin(angle);
          const rp = rotatePoint(px, py);
          points.push(rp);
        }

        points.forEach((p, idx) => {
          path += `${p.x} ${p.y} ${idx < points.length - 1 ? 'L ' : ''}`;
        });

        result.push({ type: 'path', id: `arm-${arm}`, d: path });

        // 内螺旋
        if (complexity >= 2) {
          let innerPath = 'M ';
          const innerPoints = [];
          for (let t = 0; t <= 0.7; t += 0.02) {
            const r = radius * 0.15 + t * radius * 0.4;
            const angle = baseAngle + Math.PI + t * spiralTurns * Math.PI;
            const px = cx + r * Math.cos(angle);
            const py = cy + r * Math.sin(angle);
            const rp = rotatePoint(px, py);
            innerPoints.push(rp);
          }

          innerPoints.forEach((p, idx) => {
            innerPath += `${p.x} ${p.y} ${idx < innerPoints.length - 1 ? 'L ' : ''}`;
          });

          result.push({ type: 'path', id: `inner-arm-${arm}`, d: innerPath });
        }
      }
    }

    // 外圈边框
    if (showBorder) {
      result.push({
        type: 'border',
        id: 'outer-border',
        cx,
        cy,
        r: radius + 10,
      });

      if (complexity >= 4) {
        result.push({
          type: 'border',
          id: 'inner-border',
          cx,
          cy,
          r: radius + 5,
        });
      }
    }

    return result;
  }, [knotType, complexity, weaveWidth, showBorder, rotation]);

  const color = colors[0] || '#1a1a1a';
  const actualStrokeWidth = weaveWidth / 2;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="celticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <g stroke={color} strokeWidth={actualStrokeWidth} fill="none" {...strokeProps}>
        {elements.map((el) => {
          if (el.type === 'circle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
              />
            );
          } else if (el.type === 'arc') {
            const largeArc = (el.endAngle - el.startAngle) > Math.PI ? 1 : 0;
            return (
              <path
                key={el.id}
                d={`M ${el.x1} ${el.y1} A ${el.r} ${el.r} 0 ${largeArc} 1 ${el.x2} ${el.y2}`}
              />
            );
          } else if (el.type === 'smallArc') {
            const x1 = el.cx + el.r * Math.cos(el.startAngle);
            const y1 = el.cy + el.r * Math.sin(el.startAngle);
            const x2 = el.cx + el.r * Math.cos(el.endAngle);
            const y2 = el.cy + el.r * Math.sin(el.endAngle);
            return (
              <path
                key={el.id}
                d={`M ${x1} ${y1} A ${el.r} ${el.r} 0 0 1 ${x2} ${y2}`}
                strokeWidth={actualStrokeWidth * 0.8}
              />
            );
          } else if (el.type === 'line') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
              />
            );
          } else if (el.type === 'path') {
            return (
              <path
                key={el.id}
                d={el.d}
              />
            );
          } else if (el.type === 'border') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                strokeWidth={strokeWidth}
                opacity={0.5}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default CelticKnotLogo;
