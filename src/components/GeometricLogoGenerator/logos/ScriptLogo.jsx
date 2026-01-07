import { useMemo } from 'react';

// 连笔书法风格 Logo - 类似 "Six" 设计的流畅手写体
const ScriptLogo = ({
  text = 'Logo',
  style = 'elegant',          // 'elegant' | 'playful' | 'formal' | 'brush'
  connectLetters = true,       // 字母间连接
  slant = 12,                  // 倾斜角度 (0-30)
  thickness = 'medium',        // 'thin' | 'medium' | 'thick'
  flourish = true,             // 装饰花饰
  gradientEffect = true,       // 渐变效果
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
}) => {
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const baseSize = 45;
    
    // 粗细映射
    const thicknessMap = { thin: 3, medium: 6, thick: 10 };
    const lineWidth = thicknessMap[thickness] || 6;
    
    // 倾斜变换
    const skewRad = (slant * Math.PI) / 180;
    
    // 风格参数
    const styleParams = {
      elegant: { curvature: 1.2, loopSize: 0.8, baseline: 0.3 },
      playful: { curvature: 1.5, loopSize: 1.2, baseline: 0.4 },
      formal: { curvature: 0.8, loopSize: 0.5, baseline: 0.2 },
      brush: { curvature: 1.0, loopSize: 0.6, baseline: 0.35 },
    };
    const params = styleParams[style] || styleParams.elegant;
    
    // 预设文字组合
    const presets = {
      'Logo': 'Logo',
      'Brand': 'Brand',
      'Studio': 'Studio',
      'Design': 'Design',
    };
    
    const displayText = text.slice(0, 8); // 最多8个字符
    const letterCount = displayText.length;
    const totalWidth = letterCount * baseSize * 0.7;
    const startX = cx - totalWidth / 2;
    
    // 生成连笔字母路径
    const getScriptLetterPath = (letter, x, y, size) => {
      const s = size;
      const h = s * 1.2;
      const w = s * 0.6;
      const curve = params.curvature;
      const loop = params.loopSize;
      
      // 连笔书法字母路径（简化版）
      switch (letter.toLowerCase()) {
        case 'a':
          return `M ${x - w * 0.3} ${y + h * 0.4} 
                  Q ${x - w * 0.4} ${y - h * 0.1} ${x} ${y - h * 0.2}
                  Q ${x + w * 0.5} ${y - h * 0.3} ${x + w * 0.3} ${y + h * 0.1}
                  L ${x + w * 0.3} ${y + h * 0.4}
                  Q ${x + w * 0.5} ${y + h * 0.5} ${x + w * 0.6} ${y + h * 0.3}`;
        case 'b':
          return `M ${x - w * 0.3} ${y - h * 0.5}
                  L ${x - w * 0.3} ${y + h * 0.4}
                  Q ${x - w * 0.3} ${y + h * 0.5} ${x} ${y + h * 0.4}
                  Q ${x + w * 0.5} ${y + h * 0.3} ${x + w * 0.3} ${y + h * 0.1}
                  Q ${x + w * 0.5} ${y - h * 0.1} ${x - w * 0.3} ${y + h * 0.05}`;
        case 'c':
          return `M ${x + w * 0.3} ${y - h * 0.1}
                  Q ${x - w * 0.3} ${y - h * 0.3} ${x - w * 0.3} ${y + h * 0.15}
                  Q ${x - w * 0.3} ${y + h * 0.5} ${x + w * 0.3} ${y + h * 0.35}`;
        case 'd':
          return `M ${x + w * 0.4} ${y - h * 0.5}
                  L ${x + w * 0.4} ${y + h * 0.4}
                  M ${x + w * 0.4} ${y + h * 0.1}
                  Q ${x - w * 0.4} ${y + h * 0.4} ${x - w * 0.3} ${y + h * 0.1}
                  Q ${x - w * 0.4} ${y - h * 0.2} ${x + w * 0.4} ${y - h * 0.1}`;
        case 'e':
          return `M ${x - w * 0.2} ${y + h * 0.1}
                  L ${x + w * 0.3} ${y + h * 0.1}
                  Q ${x + w * 0.4} ${y - h * 0.2} ${x} ${y - h * 0.2}
                  Q ${x - w * 0.4} ${y - h * 0.1} ${x - w * 0.3} ${y + h * 0.2}
                  Q ${x - w * 0.2} ${y + h * 0.5} ${x + w * 0.3} ${y + h * 0.4}`;
        case 'f':
          return `M ${x + w * 0.2} ${y - h * 0.4}
                  Q ${x} ${y - h * 0.5} ${x - w * 0.1} ${y - h * 0.3}
                  L ${x - w * 0.2} ${y + h * 0.5}
                  M ${x - w * 0.4} ${y + h * 0.05}
                  L ${x + w * 0.2} ${y + h * 0.05}`;
        case 'g':
          return `M ${x + w * 0.4} ${y - h * 0.1}
                  Q ${x - w * 0.3} ${y - h * 0.3} ${x - w * 0.2} ${y + h * 0.1}
                  Q ${x - w * 0.2} ${y + h * 0.4} ${x + w * 0.4} ${y + h * 0.3}
                  L ${x + w * 0.4} ${y + h * 0.6}
                  Q ${x + w * 0.3} ${y + h * 0.8} ${x - w * 0.2} ${y + h * 0.7}`;
        case 'h':
          return `M ${x - w * 0.3} ${y - h * 0.5}
                  L ${x - w * 0.3} ${y + h * 0.4}
                  M ${x - w * 0.3} ${y + h * 0.05}
                  Q ${x} ${y - h * 0.15} ${x + w * 0.3} ${y + h * 0.05}
                  L ${x + w * 0.3} ${y + h * 0.4}`;
        case 'i':
          return `M ${x} ${y - h * 0.1}
                  L ${x} ${y + h * 0.4}
                  M ${x} ${y - h * 0.25}
                  L ${x + 1} ${y - h * 0.25}`;
        case 'j':
          return `M ${x + w * 0.1} ${y - h * 0.1}
                  L ${x + w * 0.1} ${y + h * 0.5}
                  Q ${x} ${y + h * 0.7} ${x - w * 0.3} ${y + h * 0.6}
                  M ${x + w * 0.1} ${y - h * 0.25}
                  L ${x + w * 0.15} ${y - h * 0.25}`;
        case 'k':
          return `M ${x - w * 0.3} ${y - h * 0.5}
                  L ${x - w * 0.3} ${y + h * 0.4}
                  M ${x + w * 0.3} ${y - h * 0.15}
                  L ${x - w * 0.3} ${y + h * 0.1}
                  L ${x + w * 0.4} ${y + h * 0.4}`;
        case 'l':
          return `M ${x} ${y - h * 0.5}
                  L ${x} ${y + h * 0.35}
                  Q ${x + w * 0.1} ${y + h * 0.45} ${x + w * 0.3} ${y + h * 0.4}`;
        case 'm':
          return `M ${x - w * 0.5} ${y + h * 0.4}
                  L ${x - w * 0.5} ${y}
                  Q ${x - w * 0.3} ${y - h * 0.15} ${x - w * 0.1} ${y + h * 0.05}
                  L ${x - w * 0.1} ${y + h * 0.4}
                  M ${x - w * 0.1} ${y + h * 0.05}
                  Q ${x + w * 0.2} ${y - h * 0.15} ${x + w * 0.4} ${y + h * 0.05}
                  L ${x + w * 0.4} ${y + h * 0.4}`;
        case 'n':
          return `M ${x - w * 0.3} ${y + h * 0.4}
                  L ${x - w * 0.3} ${y}
                  Q ${x} ${y - h * 0.15} ${x + w * 0.3} ${y + h * 0.05}
                  L ${x + w * 0.3} ${y + h * 0.4}`;
        case 'o':
          return `M ${x} ${y - h * 0.15}
                  Q ${x - w * 0.4} ${y - h * 0.1} ${x - w * 0.35} ${y + h * 0.15}
                  Q ${x - w * 0.3} ${y + h * 0.45} ${x} ${y + h * 0.4}
                  Q ${x + w * 0.4} ${y + h * 0.35} ${x + w * 0.35} ${y + h * 0.1}
                  Q ${x + w * 0.3} ${y - h * 0.15} ${x} ${y - h * 0.15}`;
        case 'p':
          return `M ${x - w * 0.3} ${y - h * 0.1}
                  L ${x - w * 0.3} ${y + h * 0.7}
                  M ${x - w * 0.3} ${y}
                  Q ${x - w * 0.2} ${y - h * 0.2} ${x + w * 0.1} ${y - h * 0.15}
                  Q ${x + w * 0.4} ${y - h * 0.05} ${x + w * 0.3} ${y + h * 0.15}
                  Q ${x + w * 0.2} ${y + h * 0.35} ${x - w * 0.3} ${y + h * 0.25}`;
        case 'q':
          return `M ${x + w * 0.3} ${y - h * 0.1}
                  L ${x + w * 0.3} ${y + h * 0.7}
                  M ${x + w * 0.3} ${y + h * 0.2}
                  Q ${x - w * 0.2} ${y + h * 0.4} ${x - w * 0.25} ${y + h * 0.1}
                  Q ${x - w * 0.2} ${y - h * 0.15} ${x + w * 0.3} ${y - h * 0.05}`;
        case 'r':
          return `M ${x - w * 0.2} ${y + h * 0.4}
                  L ${x - w * 0.2} ${y}
                  Q ${x} ${y - h * 0.15} ${x + w * 0.3} ${y - h * 0.05}`;
        case 's':
          return `M ${x + w * 0.25} ${y - h * 0.1}
                  Q ${x} ${y - h * 0.2} ${x - w * 0.2} ${y - h * 0.05}
                  Q ${x - w * 0.35} ${y + h * 0.05} ${x} ${y + h * 0.15}
                  Q ${x + w * 0.35} ${y + h * 0.25} ${x + w * 0.2} ${y + h * 0.35}
                  Q ${x} ${y + h * 0.45} ${x - w * 0.25} ${y + h * 0.35}`;
        case 't':
          return `M ${x} ${y - h * 0.4}
                  L ${x} ${y + h * 0.35}
                  Q ${x + w * 0.1} ${y + h * 0.45} ${x + w * 0.25} ${y + h * 0.4}
                  M ${x - w * 0.25} ${y - h * 0.1}
                  L ${x + w * 0.25} ${y - h * 0.1}`;
        case 'u':
          return `M ${x - w * 0.3} ${y - h * 0.1}
                  L ${x - w * 0.3} ${y + h * 0.25}
                  Q ${x - w * 0.25} ${y + h * 0.45} ${x + w * 0.1} ${y + h * 0.35}
                  L ${x + w * 0.3} ${y - h * 0.1}
                  L ${x + w * 0.3} ${y + h * 0.4}`;
        case 'v':
          return `M ${x - w * 0.35} ${y - h * 0.1}
                  Q ${x - w * 0.2} ${y + h * 0.3} ${x} ${y + h * 0.4}
                  Q ${x + w * 0.2} ${y + h * 0.3} ${x + w * 0.35} ${y - h * 0.1}`;
        case 'w':
          return `M ${x - w * 0.5} ${y - h * 0.1}
                  L ${x - w * 0.25} ${y + h * 0.4}
                  L ${x} ${y + h * 0.1}
                  L ${x + w * 0.25} ${y + h * 0.4}
                  L ${x + w * 0.5} ${y - h * 0.1}`;
        case 'x':
          return `M ${x - w * 0.3} ${y - h * 0.1}
                  Q ${x} ${y + h * 0.15} ${x + w * 0.3} ${y + h * 0.4}
                  M ${x + w * 0.3} ${y - h * 0.1}
                  Q ${x} ${y + h * 0.15} ${x - w * 0.3} ${y + h * 0.4}`;
        case 'y':
          return `M ${x - w * 0.3} ${y - h * 0.1}
                  Q ${x - w * 0.1} ${y + h * 0.2} ${x + w * 0.05} ${y + h * 0.3}
                  M ${x + w * 0.3} ${y - h * 0.1}
                  L ${x + w * 0.05} ${y + h * 0.3}
                  Q ${x - w * 0.1} ${y + h * 0.7} ${x - w * 0.3} ${y + h * 0.6}`;
        case 'z':
          return `M ${x - w * 0.3} ${y - h * 0.1}
                  L ${x + w * 0.3} ${y - h * 0.1}
                  L ${x - w * 0.3} ${y + h * 0.4}
                  L ${x + w * 0.3} ${y + h * 0.4}`;
        default:
          return `M ${x - w * 0.2} ${y} L ${x + w * 0.2} ${y}`;
      }
    };
    
    // 生成每个字母
    for (let i = 0; i < letterCount; i++) {
      const letter = displayText[i];
      const letterX = startX + i * baseSize * 0.7 + baseSize * 0.35;
      const letterY = cy;
      
      // 应用倾斜
      const skewedX = letterX + (cy - letterY) * Math.tan(skewRad);
      
      const path = getScriptLetterPath(letter, skewedX, letterY, baseSize);
      
      result.push({
        type: 'letter',
        id: `letter-${i}`,
        d: path,
        letterIndex: i,
        stroke: lineWidth,
      });
      
      // 连接线（如果启用）
      if (connectLetters && i < letterCount - 1) {
        const nextX = startX + (i + 1) * baseSize * 0.7 + baseSize * 0.35;
        const connectorPath = `M ${skewedX + baseSize * 0.25} ${letterY + baseSize * 0.35}
                               Q ${skewedX + baseSize * 0.4} ${letterY + baseSize * 0.42} ${nextX - baseSize * 0.25} ${letterY + baseSize * 0.35}`;
        result.push({
          type: 'connector',
          id: `connector-${i}`,
          d: connectorPath,
          stroke: lineWidth * 0.8,
        });
      }
    }
    
    // 花饰装饰
    if (flourish) {
      // 起始装饰
      const startDecorX = startX - baseSize * 0.2;
      result.push({
        type: 'flourish',
        id: 'flourish-start',
        d: `M ${startDecorX} ${cy - baseSize * 0.3}
            Q ${startDecorX - baseSize * 0.4} ${cy - baseSize * 0.5} ${startDecorX - baseSize * 0.3} ${cy - baseSize * 0.1}
            Q ${startDecorX - baseSize * 0.5} ${cy + baseSize * 0.2} ${startDecorX - baseSize * 0.2} ${cy + baseSize * 0.4}`,
        stroke: lineWidth * 0.7,
      });
      
      // 结尾装饰
      const endDecorX = startX + totalWidth + baseSize * 0.2;
      result.push({
        type: 'flourish',
        id: 'flourish-end',
        d: `M ${endDecorX} ${cy + baseSize * 0.35}
            Q ${endDecorX + baseSize * 0.3} ${cy + baseSize * 0.5} ${endDecorX + baseSize * 0.5} ${cy + baseSize * 0.3}
            Q ${endDecorX + baseSize * 0.6} ${cy} ${endDecorX + baseSize * 0.4} ${cy - baseSize * 0.2}`,
        stroke: lineWidth * 0.7,
      });
    }
    
    return result;
  }, [text, style, connectLetters, slant, thickness, flourish]);

  const color = colors[0] || '#1a1a1a';
  const gradientId = 'scriptGrad';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {gradientEffect && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="50%" stopColor={color} stopOpacity="0.7" />
            <stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </linearGradient>
        )}
      </defs>
      <g 
        fill="none" 
        stroke={gradientEffect ? `url(#${gradientId})` : color}
        strokeLinecap="round" 
        strokeLinejoin="round"
      >
        {elements.map((el) => {
          if (el.type === 'letter') {
            return (
              <path
                key={el.id}
                d={el.d}
                strokeWidth={el.stroke}
              />
            );
          } else if (el.type === 'connector') {
            return (
              <path
                key={el.id}
                d={el.d}
                strokeWidth={el.stroke}
                opacity={0.8}
              />
            );
          } else if (el.type === 'flourish') {
            return (
              <path
                key={el.id}
                d={el.d}
                strokeWidth={el.stroke}
                opacity={0.6}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default ScriptLogo;
