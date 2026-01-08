import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 字母组合/双向图 Logo - 几何化的字母重叠设计
const MonogramLogo = ({
  letters = 'AB',              // 要显示的字母（1-3个）
  style = 'overlap',           // 'overlap' | 'interlock' | 'mirror' | 'geometric'
  arrangement = 'horizontal',  // 'horizontal' | 'vertical' | 'diagonal' | 'circular'
  letterWeight = 'bold',       // 'light' | 'regular' | 'bold'
  showFrame = true,            // 显示外框
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 80;
    const rotRad = (rotation * Math.PI) / 180;

    // 字母宽度
    const weightMap = { light: 4, regular: 8, bold: 12 };
    const letterStroke = weightMap[letterWeight] || 8;

    // 旋转点辅助函数
    const rotatePoint = (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * Math.cos(rotRad) - dy * Math.sin(rotRad),
        y: cy + dx * Math.sin(rotRad) + dy * Math.cos(rotRad),
      };
    };

    // 简化的几何化字母生成器
    const getLetterPath = (letter, centerX, centerY, letterSize) => {
      const s = letterSize;
      const h = s;
      const w = s * 0.7;

      const paths = [];

      switch (letter.toUpperCase()) {
        case 'A':
          paths.push(`M ${centerX - w / 2} ${centerY + h / 2} L ${centerX} ${centerY - h / 2} L ${centerX + w / 2} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 4} ${centerY + h / 6} L ${centerX + w / 4} ${centerY + h / 6}`);
          break;
        case 'B':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} Q ${centerX + w / 2} ${centerY - h / 3} ${centerX - w / 3} ${centerY}`);
          paths.push(`M ${centerX - w / 3} ${centerY} Q ${centerX + w / 2} ${centerY + h / 3} ${centerX - w / 3} ${centerY + h / 2}`);
          break;
        case 'C':
          paths.push(`M ${centerX + w / 3} ${centerY - h / 3} Q ${centerX - w / 2} ${centerY - h / 2} ${centerX - w / 3} ${centerY} Q ${centerX - w / 2} ${centerY + h / 2} ${centerX + w / 3} ${centerY + h / 3}`);
          break;
        case 'D':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} Q ${centerX + w / 2} ${centerY} ${centerX - w / 3} ${centerY + h / 2}`);
          break;
        case 'E':
          paths.push(`M ${centerX + w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2} L ${centerX + w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY} L ${centerX + w / 6} ${centerY}`);
          break;
        case 'F':
          paths.push(`M ${centerX + w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY} L ${centerX + w / 6} ${centerY}`);
          break;
        case 'G':
          paths.push(`M ${centerX + w / 3} ${centerY - h / 3} Q ${centerX - w / 2} ${centerY - h / 2} ${centerX - w / 3} ${centerY} Q ${centerX - w / 2} ${centerY + h / 2} ${centerX + w / 3} ${centerY + h / 3} L ${centerX + w / 3} ${centerY}`);
          paths.push(`M ${centerX} ${centerY} L ${centerX + w / 3} ${centerY}`);
          break;
        case 'H':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX + w / 3} ${centerY - h / 2} L ${centerX + w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY} L ${centerX + w / 3} ${centerY}`);
          break;
        case 'I':
          paths.push(`M ${centerX} ${centerY - h / 2} L ${centerX} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 4} ${centerY - h / 2} L ${centerX + w / 4} ${centerY - h / 2}`);
          paths.push(`M ${centerX - w / 4} ${centerY + h / 2} L ${centerX + w / 4} ${centerY + h / 2}`);
          break;
        case 'J':
          paths.push(`M ${centerX + w / 4} ${centerY - h / 2} L ${centerX + w / 4} ${centerY + h / 4} Q ${centerX + w / 4} ${centerY + h / 2} ${centerX - w / 4} ${centerY + h / 3}`);
          break;
        case 'K':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX + w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY}`);
          paths.push(`M ${centerX - w / 3} ${centerY} L ${centerX + w / 3} ${centerY + h / 2}`);
          break;
        case 'L':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2} L ${centerX + w / 3} ${centerY + h / 2}`);
          break;
        case 'M':
          paths.push(`M ${centerX - w / 2} ${centerY + h / 2} L ${centerX - w / 2} ${centerY - h / 2} L ${centerX} ${centerY} L ${centerX + w / 2} ${centerY - h / 2} L ${centerX + w / 2} ${centerY + h / 2}`);
          break;
        case 'N':
          paths.push(`M ${centerX - w / 3} ${centerY + h / 2} L ${centerX - w / 3} ${centerY - h / 2} L ${centerX + w / 3} ${centerY + h / 2} L ${centerX + w / 3} ${centerY - h / 2}`);
          break;
        case 'O':
          paths.push(`M ${centerX} ${centerY - h / 2} Q ${centerX + w / 2} ${centerY - h / 2} ${centerX + w / 2} ${centerY} Q ${centerX + w / 2} ${centerY + h / 2} ${centerX} ${centerY + h / 2} Q ${centerX - w / 2} ${centerY + h / 2} ${centerX - w / 2} ${centerY} Q ${centerX - w / 2} ${centerY - h / 2} ${centerX} ${centerY - h / 2}`);
          break;
        case 'P':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} Q ${centerX + w / 2} ${centerY - h / 3} ${centerX - w / 3} ${centerY}`);
          break;
        case 'Q':
          paths.push(`M ${centerX} ${centerY - h / 2} Q ${centerX + w / 2} ${centerY - h / 2} ${centerX + w / 2} ${centerY} Q ${centerX + w / 2} ${centerY + h / 2} ${centerX} ${centerY + h / 2} Q ${centerX - w / 2} ${centerY + h / 2} ${centerX - w / 2} ${centerY} Q ${centerX - w / 2} ${centerY - h / 2} ${centerX} ${centerY - h / 2}`);
          paths.push(`M ${centerX + w / 6} ${centerY + h / 6} L ${centerX + w / 2} ${centerY + h / 2}`);
          break;
        case 'R':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} Q ${centerX + w / 2} ${centerY - h / 3} ${centerX - w / 3} ${centerY}`);
          paths.push(`M ${centerX - w / 3} ${centerY} L ${centerX + w / 3} ${centerY + h / 2}`);
          break;
        case 'S':
          paths.push(`M ${centerX + w / 3} ${centerY - h / 3} Q ${centerX} ${centerY - h / 2} ${centerX - w / 3} ${centerY - h / 4} Q ${centerX - w / 2} ${centerY} ${centerX} ${centerY} Q ${centerX + w / 2} ${centerY} ${centerX + w / 3} ${centerY + h / 4} Q ${centerX} ${centerY + h / 2} ${centerX - w / 3} ${centerY + h / 3}`);
          break;
        case 'T':
          paths.push(`M ${centerX - w / 2} ${centerY - h / 2} L ${centerX + w / 2} ${centerY - h / 2}`);
          paths.push(`M ${centerX} ${centerY - h / 2} L ${centerX} ${centerY + h / 2}`);
          break;
        case 'U':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 4} Q ${centerX - w / 3} ${centerY + h / 2} ${centerX} ${centerY + h / 2} Q ${centerX + w / 3} ${centerY + h / 2} ${centerX + w / 3} ${centerY + h / 4} L ${centerX + w / 3} ${centerY - h / 2}`);
          break;
        case 'V':
          paths.push(`M ${centerX - w / 2} ${centerY - h / 2} L ${centerX} ${centerY + h / 2} L ${centerX + w / 2} ${centerY - h / 2}`);
          break;
        case 'W':
          paths.push(`M ${centerX - w / 2} ${centerY - h / 2} L ${centerX - w / 4} ${centerY + h / 2} L ${centerX} ${centerY} L ${centerX + w / 4} ${centerY + h / 2} L ${centerX + w / 2} ${centerY - h / 2}`);
          break;
        case 'X':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX + w / 3} ${centerY + h / 2}`);
          paths.push(`M ${centerX + w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2}`);
          break;
        case 'Y':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX} ${centerY}`);
          paths.push(`M ${centerX + w / 3} ${centerY - h / 2} L ${centerX} ${centerY}`);
          paths.push(`M ${centerX} ${centerY} L ${centerX} ${centerY + h / 2}`);
          break;
        case 'Z':
          paths.push(`M ${centerX - w / 3} ${centerY - h / 2} L ${centerX + w / 3} ${centerY - h / 2} L ${centerX - w / 3} ${centerY + h / 2} L ${centerX + w / 3} ${centerY + h / 2}`);
          break;
        default:
          // 默认圆形
          paths.push(`M ${centerX} ${centerY - h / 3} A ${w / 3} ${h / 3} 0 1 1 ${centerX} ${centerY + h / 3} A ${w / 3} ${h / 3} 0 1 1 ${centerX} ${centerY - h / 3}`);
      }

      return paths;
    };

    // 获取字母位置
    const getLetterPositions = (letterCount) => {
      const positions = [];
      const spacing = size * 0.8;

      if (arrangement === 'horizontal') {
        const startX = cx - ((letterCount - 1) * spacing) / 2;
        for (let i = 0; i < letterCount; i++) {
          positions.push({ x: startX + i * spacing, y: cy });
        }
      } else if (arrangement === 'vertical') {
        const startY = cy - ((letterCount - 1) * spacing) / 2;
        for (let i = 0; i < letterCount; i++) {
          positions.push({ x: cx, y: startY + i * spacing });
        }
      } else if (arrangement === 'diagonal') {
        const startX = cx - ((letterCount - 1) * spacing * 0.5) / 2;
        const startY = cy - ((letterCount - 1) * spacing * 0.5) / 2;
        for (let i = 0; i < letterCount; i++) {
          positions.push({ x: startX + i * spacing * 0.5, y: startY + i * spacing * 0.5 });
        }
      } else if (arrangement === 'circular') {
        const radius = spacing * 0.6;
        for (let i = 0; i < letterCount; i++) {
          const angle = (i * 2 * Math.PI) / letterCount - Math.PI / 2;
          positions.push({
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
          });
        }
      }

      return positions;
    };

    const letterArray = letters.slice(0, 3).split('');
    const positions = getLetterPositions(letterArray.length);
    const letterSize = style === 'overlap' ? size * 0.9 : size * 0.7;

    // 生成字母
    letterArray.forEach((letter, i) => {
      const pos = positions[i];
      const paths = getLetterPath(letter, pos.x, pos.y, letterSize);

      // 旋转变换
      const transformedPaths = paths.map(d => {
        // 简单的路径点提取和旋转
        return d.replace(/(-?\d+\.?\d*)/g, (match, num, offset, str) => {
          // 这是一个简化的实现，实际应该解析SVG路径
          return match;
        });
      });

      paths.forEach((d, j) => {
        result.push({
          type: 'letter',
          id: `letter-${i}-${j}`,
          d,
          letterIndex: i,
          stroke: letterStroke,
        });
      });
    });

    // 根据风格添加装饰
    if (style === 'interlock') {
      // 交织效果 - 添加连接线
      if (letterArray.length >= 2) {
        for (let i = 0; i < letterArray.length - 1; i++) {
          const p1 = positions[i];
          const p2 = positions[i + 1];
          const rp1 = rotatePoint(p1.x, p1.y);
          const rp2 = rotatePoint(p2.x, p2.y);

          result.push({
            type: 'connector',
            id: `connector-${i}`,
            x1: rp1.x,
            y1: rp1.y,
            x2: rp2.x,
            y2: rp2.y,
          });
        }
      }
    } else if (style === 'mirror') {
      // 镜像效果 - 添加倒影
      letterArray.forEach((letter, i) => {
        const pos = positions[i];
        const mirrorY = cy + (cy - pos.y) + letterSize;
        const paths = getLetterPath(letter, pos.x, mirrorY, letterSize * 0.6);

        paths.forEach((d, j) => {
          result.push({
            type: 'mirror-letter',
            id: `mirror-${i}-${j}`,
            d,
            letterIndex: i,
            stroke: letterStroke * 0.6,
          });
        });
      });
    } else if (style === 'geometric') {
      // 几何装饰
      const decorRadius = letterSize * 0.8;

      // 中心几何图形
      const geoPoints = [];
      const sides = Math.max(3, letterArray.length + 2);
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        geoPoints.push(rotatePoint(
          cx + decorRadius * Math.cos(angle),
          cy + decorRadius * Math.sin(angle)
        ));
      }

      result.push({
        type: 'geometric-frame',
        id: 'geo-frame',
        points: geoPoints,
      });
    }

    // 外框
    if (showFrame) {
      const frameSize = size * 1.3;

      if (arrangement === 'circular') {
        // 圆形框
        result.push({
          type: 'frame-circle',
          id: 'frame',
          cx,
          cy,
          r: frameSize,
        });
      } else {
        // 方形/菱形框
        const framePoints = [];
        for (let i = 0; i < 4; i++) {
          const angle = (i * Math.PI) / 2 + Math.PI / 4;
          framePoints.push(rotatePoint(
            cx + frameSize * Math.cos(angle),
            cy + frameSize * Math.sin(angle)
          ));
        }

        result.push({
          type: 'frame-polygon',
          id: 'frame',
          points: framePoints,
        });
      }
    }

    return result;
  }, [letters, style, arrangement, letterWeight, showFrame, rotation]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="monogramGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g fill="none" {...strokeProps}>
        {elements.map((el) => {
          if (el.type === 'letter') {
            return (
              <path
                key={el.id}
                d={el.d}
                stroke={color}
                strokeWidth={el.stroke}
              />
            );
          } else if (el.type === 'mirror-letter') {
            return (
              <path
                key={el.id}
                d={el.d}
                stroke={color}
                strokeWidth={el.stroke}
                opacity={0.3}
              />
            );
          } else if (el.type === 'connector') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={0.5}
                strokeDasharray="4,4"
              />
            );
          } else if (el.type === 'geometric-frame') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={0.3}
              />
            );
          } else if (el.type === 'frame-circle') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                stroke={color}
                strokeWidth={strokeWidth * 1.5}
                opacity={0.4}
              />
            );
          } else if (el.type === 'frame-polygon') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                stroke={color}
                strokeWidth={strokeWidth * 1.5}
                opacity={0.4}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default MonogramLogo;
