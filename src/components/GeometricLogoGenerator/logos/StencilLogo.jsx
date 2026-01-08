import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { getStroke } from '../utils/gradient';

// 镂空模板风格 Logo - 军事/工业风格字母
const StencilLogo = ({
  text = 'LOGO',
  style = 'military',         // 'military' | 'industrial' | 'modern' | 'vintage'
  cutStyle = 'center',        // 镂空位置 'center' | 'edge' | 'bridge'
  spacing = 'normal',         // 字间距 'tight' | 'normal' | 'wide'
  borderFrame = true,         // 边框
  boldness = 'bold',          // 'regular' | 'bold' | 'heavy'
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = 'stencilGrad';
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const baseSize = 50;
    
    // 粗细映射
    const boldnessMap = { regular: 8, bold: 12, heavy: 16 };
    const lineWidth = boldnessMap[boldness] || 12;
    
    // 间距映射
    const spacingMap = { tight: 0.6, normal: 0.75, wide: 0.9 };
    const letterSpacing = spacingMap[spacing] || 0.75;
    
    const displayText = text.toUpperCase().slice(0, 6);
    const letterCount = displayText.length;
    const totalWidth = letterCount * baseSize * letterSpacing;
    const startX = cx - totalWidth / 2;
    
    // 生成模板字母路径
    const getStencilLetterPath = (letter, x, y, size, cuts) => {
      const s = size;
      const h = s * 0.8;
      const w = s * 0.5;
      const paths = [];
      const cutGap = s * 0.08;
      
      // 风格特定参数
      const cornerRadius = style === 'modern' ? s * 0.1 : 0;
      
      switch (letter) {
        case 'A':
          paths.push(`M ${x - w * 0.5} ${y + h * 0.5} L ${x} ${y - h * 0.5} L ${x + w * 0.5} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.25} ${y + h * 0.1} L ${x + w * 0.25} ${y + h * 0.1}`);
          if (cuts === 'center') {
            paths.push(`M ${x - w * 0.05} ${y - h * 0.1} L ${x + w * 0.05} ${y - h * 0.1}`);
          }
          break;
        case 'B':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          if (cuts !== 'bridge') {
            paths.push(`M ${x - w * 0.4} ${y - h * 0.5} Q ${x + w * 0.5} ${y - h * 0.3} ${x - w * 0.4} ${y}`);
            paths.push(`M ${x - w * 0.4} ${y} Q ${x + w * 0.5} ${y + h * 0.3} ${x - w * 0.4} ${y + h * 0.5}`);
          } else {
            paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x + w * 0.2} ${y - h * 0.5} Q ${x + w * 0.5} ${y - h * 0.25} ${x + w * 0.2} ${y - cutGap}`);
            paths.push(`M ${x - w * 0.4} ${y + cutGap} L ${x + w * 0.2} ${y + cutGap} Q ${x + w * 0.5} ${y + h * 0.25} ${x + w * 0.2} ${y + h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          }
          break;
        case 'C':
          paths.push(`M ${x + w * 0.4} ${y - h * 0.35} Q ${x - w * 0.5} ${y - h * 0.6} ${x - w * 0.4} ${y} Q ${x - w * 0.5} ${y + h * 0.6} ${x + w * 0.4} ${y + h * 0.35}`);
          break;
        case 'D':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} Q ${x + w * 0.6} ${y} ${x - w * 0.4} ${y + h * 0.5}`);
          break;
        case 'E':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x + w * 0.4} ${y - h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y} L ${x + w * 0.2} ${y}`);
          paths.push(`M ${x - w * 0.4} ${y + h * 0.5} L ${x + w * 0.4} ${y + h * 0.5}`);
          break;
        case 'F':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x + w * 0.4} ${y - h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y} L ${x + w * 0.2} ${y}`);
          break;
        case 'G':
          paths.push(`M ${x + w * 0.4} ${y - h * 0.35} Q ${x - w * 0.5} ${y - h * 0.6} ${x - w * 0.4} ${y} Q ${x - w * 0.5} ${y + h * 0.6} ${x + w * 0.4} ${y + h * 0.35}`);
          paths.push(`M ${x + w * 0.4} ${y + h * 0.35} L ${x + w * 0.4} ${y} L ${x} ${y}`);
          break;
        case 'H':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x + w * 0.4} ${y - h * 0.5} L ${x + w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y} L ${x + w * 0.4} ${y}`);
          break;
        case 'I':
          paths.push(`M ${x} ${y - h * 0.5} L ${x} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.25} ${y - h * 0.5} L ${x + w * 0.25} ${y - h * 0.5}`);
          paths.push(`M ${x - w * 0.25} ${y + h * 0.5} L ${x + w * 0.25} ${y + h * 0.5}`);
          break;
        case 'J':
          paths.push(`M ${x + w * 0.2} ${y - h * 0.5} L ${x + w * 0.2} ${y + h * 0.25} Q ${x + w * 0.2} ${y + h * 0.55} ${x - w * 0.3} ${y + h * 0.4}`);
          break;
        case 'K':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x + w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y}`);
          paths.push(`M ${x - w * 0.4} ${y} L ${x + w * 0.4} ${y + h * 0.5}`);
          break;
        case 'L':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5} L ${x + w * 0.4} ${y + h * 0.5}`);
          break;
        case 'M':
          paths.push(`M ${x - w * 0.5} ${y + h * 0.5} L ${x - w * 0.5} ${y - h * 0.5} L ${x} ${y + h * 0.1} L ${x + w * 0.5} ${y - h * 0.5} L ${x + w * 0.5} ${y + h * 0.5}`);
          break;
        case 'N':
          paths.push(`M ${x - w * 0.4} ${y + h * 0.5} L ${x - w * 0.4} ${y - h * 0.5} L ${x + w * 0.4} ${y + h * 0.5} L ${x + w * 0.4} ${y - h * 0.5}`);
          break;
        case 'O':
          if (cuts === 'bridge') {
            paths.push(`M ${x} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.5} ${x + w * 0.45} ${y - cutGap}`);
            paths.push(`M ${x + w * 0.45} ${y + cutGap} Q ${x + w * 0.55} ${y + h * 0.5} ${x} ${y + h * 0.5} Q ${x - w * 0.55} ${y + h * 0.5} ${x - w * 0.45} ${y + cutGap}`);
            paths.push(`M ${x - w * 0.45} ${y - cutGap} Q ${x - w * 0.55} ${y - h * 0.5} ${x} ${y - h * 0.5}`);
          } else {
            paths.push(`M ${x} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.5} ${x + w * 0.45} ${y} Q ${x + w * 0.55} ${y + h * 0.5} ${x} ${y + h * 0.5} Q ${x - w * 0.55} ${y + h * 0.5} ${x - w * 0.45} ${y} Q ${x - w * 0.55} ${y - h * 0.5} ${x} ${y - h * 0.5}`);
          }
          break;
        case 'P':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.3} ${x - w * 0.4} ${y + h * 0.05}`);
          break;
        case 'Q':
          paths.push(`M ${x} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.5} ${x + w * 0.45} ${y} Q ${x + w * 0.55} ${y + h * 0.5} ${x} ${y + h * 0.5} Q ${x - w * 0.55} ${y + h * 0.5} ${x - w * 0.45} ${y} Q ${x - w * 0.55} ${y - h * 0.5} ${x} ${y - h * 0.5}`);
          paths.push(`M ${x + w * 0.15} ${y + h * 0.2} L ${x + w * 0.5} ${y + h * 0.55}`);
          break;
        case 'R':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.3} ${x - w * 0.4} ${y + h * 0.05}`);
          paths.push(`M ${x - w * 0.1} ${y + h * 0.05} L ${x + w * 0.4} ${y + h * 0.5}`);
          break;
        case 'S':
          paths.push(`M ${x + w * 0.35} ${y - h * 0.35} Q ${x} ${y - h * 0.6} ${x - w * 0.35} ${y - h * 0.25} Q ${x - w * 0.5} ${y} ${x} ${y} Q ${x + w * 0.5} ${y} ${x + w * 0.35} ${y + h * 0.25} Q ${x} ${y + h * 0.6} ${x - w * 0.35} ${y + h * 0.35}`);
          break;
        case 'T':
          paths.push(`M ${x - w * 0.45} ${y - h * 0.5} L ${x + w * 0.45} ${y - h * 0.5}`);
          paths.push(`M ${x} ${y - h * 0.5} L ${x} ${y + h * 0.5}`);
          break;
        case 'U':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.2} Q ${x - w * 0.4} ${y + h * 0.55} ${x} ${y + h * 0.5} Q ${x + w * 0.4} ${y + h * 0.55} ${x + w * 0.4} ${y + h * 0.2} L ${x + w * 0.4} ${y - h * 0.5}`);
          break;
        case 'V':
          paths.push(`M ${x - w * 0.45} ${y - h * 0.5} L ${x} ${y + h * 0.5} L ${x + w * 0.45} ${y - h * 0.5}`);
          break;
        case 'W':
          paths.push(`M ${x - w * 0.5} ${y - h * 0.5} L ${x - w * 0.25} ${y + h * 0.5} L ${x} ${y} L ${x + w * 0.25} ${y + h * 0.5} L ${x + w * 0.5} ${y - h * 0.5}`);
          break;
        case 'X':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x + w * 0.4} ${y + h * 0.5}`);
          paths.push(`M ${x + w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5}`);
          break;
        case 'Y':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x} ${y}`);
          paths.push(`M ${x + w * 0.4} ${y - h * 0.5} L ${x} ${y}`);
          paths.push(`M ${x} ${y} L ${x} ${y + h * 0.5}`);
          break;
        case 'Z':
          paths.push(`M ${x - w * 0.4} ${y - h * 0.5} L ${x + w * 0.4} ${y - h * 0.5} L ${x - w * 0.4} ${y + h * 0.5} L ${x + w * 0.4} ${y + h * 0.5}`);
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          // 数字支持
          paths.push(`M ${x - w * 0.3} ${y} L ${x + w * 0.3} ${y}`);
          break;
        default:
          paths.push(`M ${x - w * 0.3} ${y} L ${x + w * 0.3} ${y}`);
      }
      
      return paths;
    };
    
    // 生成每个字母
    for (let i = 0; i < letterCount; i++) {
      const letter = displayText[i];
      const letterX = startX + i * baseSize * letterSpacing + baseSize * letterSpacing * 0.5;
      const letterY = cy;
      
      const paths = getStencilLetterPath(letter, letterX, letterY, baseSize, cutStyle);
      
      paths.forEach((d, j) => {
        result.push({
          type: 'letter',
          id: `letter-${i}-${j}`,
          d,
          letterIndex: i,
          stroke: lineWidth,
        });
      });
    }
    
    // 边框
    if (borderFrame) {
      const padding = baseSize * 0.3;
      const frameWidth = totalWidth + padding * 2;
      const frameHeight = baseSize * 1.0;
      
      result.push({
        type: 'frame',
        id: 'frame-outer',
        x: cx - frameWidth / 2,
        y: cy - frameHeight / 2 - padding * 0.3,
        width: frameWidth,
        height: frameHeight + padding * 0.6,
      });
      
      // 双层边框（军事风格）
      if (style === 'military') {
        result.push({
          type: 'frame',
          id: 'frame-inner',
          x: cx - frameWidth / 2 + 4,
          y: cy - frameHeight / 2 - padding * 0.3 + 4,
          width: frameWidth - 8,
          height: frameHeight + padding * 0.6 - 8,
        });
      }
    }
    
    return result;
  }, [text, style, cutStyle, spacing, borderFrame, boldness]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <g {...renderProps}>
        {elements.map((el) => {
          if (el.type === 'letter') {
            return (
              <path
                key={el.id}
                d={el.d}
                strokeWidth={el.stroke}
              />
            );
          } else if (el.type === 'frame') {
            return (
              <rect
                key={el.id}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                strokeWidth={strokeWidth * 1.5}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default StencilLogo;
