import { useMemo } from 'react';

// 霓虹灯效果 Logo - 发光管风格
const NeonLogo = ({
  text = 'NEON',
  glowIntensity = 0.8,        // 发光强度 0.3-1
  tubeStyle = 'round',        // 'round' | 'flat' | 'vintage'
  flicker = false,            // 闪烁效果(静态表现为部分暗淡)
  backing = true,             // 背板
  tubeWidth = 'medium',       // 'thin' | 'medium' | 'thick'
  strokeWidth = 2,
  colors = ['#ff00ff', '#ffffff'],
}) => {
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const baseSize = 48;
    
    // 管宽映射
    const tubeWidthMap = { thin: 4, medium: 6, thick: 9 };
    const lineWidth = tubeWidthMap[tubeWidth] || 6;
    
    const displayText = text.toUpperCase().slice(0, 6);
    const letterCount = displayText.length;
    const letterSpacing = 0.75;
    const totalWidth = letterCount * baseSize * letterSpacing;
    const startX = cx - totalWidth / 2;
    
    // 生成霓虹字母路径（圆润风格）
    const getNeonLetterPath = (letter, x, y, size) => {
      const s = size;
      const h = s * 0.75;
      const w = s * 0.45;
      const paths = [];
      
      switch (letter) {
        case 'A':
          paths.push(`M ${x - w * 0.5} ${y + h * 0.5} L ${x} ${y - h * 0.5} L ${x + w * 0.5} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.25} ${y + h * 0.1} L ${x + w * 0.25} ${y + h * 0.1}`);
          break;
        case 'B':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} Q ${x + w * 0.5} ${y - h * 0.3} ${x - w * 0.35} ${y}`);
          paths.push(`M ${x - w * 0.35} ${y} Q ${x + w * 0.55} ${y + h * 0.3} ${x - w * 0.35} ${y + h * 0.5}`);
          break;
        case 'C':
          paths.push(`M ${x + w * 0.35} ${y - h * 0.35} Q ${x - w * 0.5} ${y - h * 0.5} ${x - w * 0.4} ${y} Q ${x - w * 0.5} ${y + h * 0.5} ${x + w * 0.35} ${y + h * 0.35}`);
          break;
        case 'D':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} Q ${x + w * 0.6} ${y} ${x - w * 0.35} ${y + h * 0.5}`);
          break;
        case 'E':
          paths.push(`M ${x + w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5} L ${x + w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y} L ${x + w * 0.2} ${y}`);
          break;
        case 'F':
          paths.push(`M ${x + w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y} L ${x + w * 0.2} ${y}`);
          break;
        case 'G':
          paths.push(`M ${x + w * 0.35} ${y - h * 0.35} Q ${x - w * 0.5} ${y - h * 0.5} ${x - w * 0.4} ${y} Q ${x - w * 0.5} ${y + h * 0.5} ${x + w * 0.35} ${y + h * 0.35} L ${x + w * 0.35} ${y} L ${x} ${y}`);
          break;
        case 'H':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x + w * 0.35} ${y - h * 0.5} L ${x + w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y} L ${x + w * 0.35} ${y}`);
          break;
        case 'I':
          paths.push(`M ${x} ${y - h * 0.5} L ${x} ${y + h * 0.5}`);
          break;
        case 'J':
          paths.push(`M ${x + w * 0.2} ${y - h * 0.5} L ${x + w * 0.2} ${y + h * 0.25} Q ${x + w * 0.2} ${y + h * 0.55} ${x - w * 0.25} ${y + h * 0.4}`);
          break;
        case 'K':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x + w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y}`);
          paths.push(`M ${x - w * 0.35} ${y} L ${x + w * 0.35} ${y + h * 0.5}`);
          break;
        case 'L':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5} L ${x + w * 0.35} ${y + h * 0.5}`);
          break;
        case 'M':
          paths.push(`M ${x - w * 0.45} ${y + h * 0.5} L ${x - w * 0.45} ${y - h * 0.5} L ${x} ${y + h * 0.1} L ${x + w * 0.45} ${y - h * 0.5} L ${x + w * 0.45} ${y + h * 0.5}`);
          break;
        case 'N':
          paths.push(`M ${x - w * 0.35} ${y + h * 0.5} L ${x - w * 0.35} ${y - h * 0.5} L ${x + w * 0.35} ${y + h * 0.5} L ${x + w * 0.35} ${y - h * 0.5}`);
          break;
        case 'O':
          paths.push(`M ${x} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.5} ${x + w * 0.45} ${y} Q ${x + w * 0.55} ${y + h * 0.5} ${x} ${y + h * 0.5} Q ${x - w * 0.55} ${y + h * 0.5} ${x - w * 0.45} ${y} Q ${x - w * 0.55} ${y - h * 0.5} ${x} ${y - h * 0.5}`);
          break;
        case 'P':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.3} ${x - w * 0.35} ${y + h * 0.05}`);
          break;
        case 'Q':
          paths.push(`M ${x} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.5} ${x + w * 0.45} ${y} Q ${x + w * 0.55} ${y + h * 0.5} ${x} ${y + h * 0.5} Q ${x - w * 0.55} ${y + h * 0.5} ${x - w * 0.45} ${y} Q ${x - w * 0.55} ${y - h * 0.5} ${x} ${y - h * 0.5}`);
          paths.push(`M ${x + w * 0.15} ${y + h * 0.2} L ${x + w * 0.45} ${y + h * 0.55}`);
          break;
        case 'R':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} Q ${x + w * 0.55} ${y - h * 0.3} ${x - w * 0.35} ${y + h * 0.05}`);
          paths.push(`M ${x - w * 0.1} ${y + h * 0.05} L ${x + w * 0.35} ${y + h * 0.5}`);
          break;
        case 'S':
          paths.push(`M ${x + w * 0.35} ${y - h * 0.35} Q ${x} ${y - h * 0.55} ${x - w * 0.35} ${y - h * 0.25} Q ${x - w * 0.5} ${y} ${x} ${y} Q ${x + w * 0.5} ${y} ${x + w * 0.35} ${y + h * 0.25} Q ${x} ${y + h * 0.55} ${x - w * 0.35} ${y + h * 0.35}`);
          break;
        case 'T':
          paths.push(`M ${x - w * 0.45} ${y - h * 0.5} L ${x + w * 0.45} ${y - h * 0.5}`);
          paths.push(`M ${x} ${y - h * 0.5} L ${x} ${y + h * 0.5}`);
          break;
        case 'U':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.2} Q ${x - w * 0.35} ${y + h * 0.55} ${x} ${y + h * 0.5} Q ${x + w * 0.35} ${y + h * 0.55} ${x + w * 0.35} ${y + h * 0.2} L ${x + w * 0.35} ${y - h * 0.5}`);
          break;
        case 'V':
          paths.push(`M ${x - w * 0.45} ${y - h * 0.5} L ${x} ${y + h * 0.5} L ${x + w * 0.45} ${y - h * 0.5}`);
          break;
        case 'W':
          paths.push(`M ${x - w * 0.5} ${y - h * 0.5} L ${x - w * 0.25} ${y + h * 0.5} L ${x} ${y} L ${x + w * 0.25} ${y + h * 0.5} L ${x + w * 0.5} ${y - h * 0.5}`);
          break;
        case 'X':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x + w * 0.35} ${y + h * 0.5}`);
          paths.push(`M ${x + w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5}`);
          break;
        case 'Y':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x} ${y}`);
          paths.push(`M ${x + w * 0.35} ${y - h * 0.5} L ${x} ${y}`);
          paths.push(`M ${x} ${y} L ${x} ${y + h * 0.5}`);
          break;
        case 'Z':
          paths.push(`M ${x - w * 0.35} ${y - h * 0.5} L ${x + w * 0.35} ${y - h * 0.5} L ${x - w * 0.35} ${y + h * 0.5} L ${x + w * 0.35} ${y + h * 0.5}`);
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
      
      const paths = getNeonLetterPath(letter, letterX, letterY, baseSize);
      const isFlickering = flicker && (i % 3 === 1); // 模拟闪烁
      
      paths.forEach((d, j) => {
        result.push({
          type: 'letter',
          id: `letter-${i}-${j}`,
          d,
          letterIndex: i,
          stroke: lineWidth,
          flickering: isFlickering,
        });
      });
    }
    
    // 背板
    if (backing) {
      const padding = baseSize * 0.4;
      const frameWidth = totalWidth + padding * 2;
      const frameHeight = baseSize * 1.1;
      
      result.push({
        type: 'backing',
        id: 'backing',
        x: cx - frameWidth / 2,
        y: cy - frameHeight / 2 - padding * 0.2,
        width: frameWidth,
        height: frameHeight + padding * 0.4,
        rx: 8,
      });
    }
    
    return result;
  }, [text, glowIntensity, tubeStyle, flicker, backing, tubeWidth]);

  const color = colors[0] || '#ff00ff';
  const glowId = 'neonGlow';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={4 * glowIntensity} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${glowIntensity * 2} 0`}
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* 背板 */}
        {elements.filter(el => el.type === 'backing').map((el) => (
          <rect
            key={el.id}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            rx={el.rx}
            fill="#1a1a1a"
            stroke="#333"
            strokeWidth={2}
          />
        ))}
        
        {/* 霓虹字母 */}
        {elements.filter(el => el.type === 'letter').map((el) => (
          <path
            key={el.id}
            d={el.d}
            stroke={tubeStyle === 'vintage' ? 'url(#tubeGrad)' : color}
            strokeWidth={el.stroke}
            filter={`url(#${glowId})`}
            opacity={el.flickering ? 0.4 : 1}
          />
        ))}
      </g>
    </svg>
  );
};

export default NeonLogo;
