import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { getStroke } from '../utils/gradient';

// 渐变填充文字 Logo - 现代科技感
const GradientTextLogo = ({
  text = 'TECH',
  gradientType = 'linear',    // 'linear' | 'radial' | 'conic'
  gradientAngle = 45,         // 渐变角度（线性渐变）
  colorStops = 3,             // 颜色过渡点数
  strokeOutline = true,       // 描边轮廓
  glossy = false,             // 光泽效果
  fontWeight = 'bold',        // 'light' | 'regular' | 'bold'
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = 'textGrad';
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const displayText = text.slice(0, 8).toUpperCase();

    // 字体粗细
    const weightMap = { light: 0.12, regular: 0.18, bold: 0.25 };
    const letterThickness = weightMap[fontWeight] || 0.18;

    // 基础字体大小
    const baseFontSize = Math.min(70, 300 / Math.max(displayText.length, 1));

    // 生成字母轮廓路径（填充版本）
    const getFilledLetterPath = (letter, x, y, size) => {
      const h = size;
      const w = size * 0.7;
      const hw = w / 2;
      const hh = h / 2;
      const t = size * letterThickness; // 笔画粗细

      let path = '';

      switch (letter) {
        case 'A':
          // 外轮廓
          path = `M ${x - hw} ${y + hh} L ${x} ${y - hh} L ${x + hw} ${y + hh} L ${x + hw - t} ${y + hh} L ${x} ${y - hh + t * 2} L ${x - hw + t} ${y + hh} Z`;
          // 横杠作为单独的矩形
          path += ` M ${x - hw * 0.45} ${y + hh * 0.15} L ${x + hw * 0.45} ${y + hh * 0.15} L ${x + hw * 0.45} ${y + hh * 0.15 + t * 0.8} L ${x - hw * 0.45} ${y + hh * 0.15 + t * 0.8} Z`;
          break;
        case 'B':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          path += ` M ${x - hw} ${y - hh} Q ${x + hw * 0.8} ${y - hh} ${x + hw * 0.8} ${y - hh * 0.25} Q ${x + hw * 0.8} ${y + hh * 0.05} ${x - hw} ${y + hh * 0.05} Q ${x + hw} ${y + hh * 0.1} ${x + hw} ${y + hh * 0.5} Q ${x + hw} ${y + hh} ${x - hw} ${y + hh}`;
          break;
        case 'C':
          path = `M ${x + hw} ${y - hh * 0.7} Q ${x + hw} ${y - hh} ${x} ${y - hh} Q ${x - hw} ${y - hh} ${x - hw} ${y} Q ${x - hw} ${y + hh} ${x} ${y + hh} Q ${x + hw} ${y + hh} ${x + hw} ${y + hh * 0.7}`;
          break;
        case 'D':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          path += ` M ${x - hw} ${y - hh} Q ${x + hw * 1.1} ${y - hh} ${x + hw * 1.1} ${y} Q ${x + hw * 1.1} ${y + hh} ${x - hw} ${y + hh}`;
          break;
        case 'E':
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y - hh + t} L ${x - hw + t} ${y - hh + t} L ${x - hw + t} ${y - t / 2} L ${x + hw * 0.6} ${y - t / 2} L ${x + hw * 0.6} ${y + t / 2} L ${x - hw + t} ${y + t / 2} L ${x - hw + t} ${y + hh - t} L ${x + hw} ${y + hh - t} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`;
          break;
        case 'F':
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y - hh + t} L ${x - hw + t} ${y - hh + t} L ${x - hw + t} ${y - t / 2} L ${x + hw * 0.6} ${y - t / 2} L ${x + hw * 0.6} ${y + t / 2} L ${x - hw + t} ${y + t / 2} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          break;
        case 'G':
          path = `M ${x + hw} ${y - hh * 0.7} Q ${x + hw} ${y - hh} ${x} ${y - hh} Q ${x - hw} ${y - hh} ${x - hw} ${y} Q ${x - hw} ${y + hh} ${x} ${y + hh} Q ${x + hw} ${y + hh} ${x + hw} ${y + hh * 0.5} L ${x + hw} ${y} L ${x} ${y} L ${x} ${y + t} L ${x + hw - t} ${y + t}`;
          break;
        case 'H':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y - t / 2} L ${x + hw - t} ${y - t / 2} L ${x + hw - t} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh} L ${x + hw - t} ${y + hh} L ${x + hw - t} ${y + t / 2} L ${x - hw + t} ${y + t / 2} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          break;
        case 'I':
          path = `M ${x - t / 2} ${y - hh} L ${x + t / 2} ${y - hh} L ${x + t / 2} ${y + hh} L ${x - t / 2} ${y + hh} Z`;
          break;
        case 'J':
          path = `M ${x + hw * 0.3 - t / 2} ${y - hh} L ${x + hw * 0.3 + t / 2} ${y - hh} L ${x + hw * 0.3 + t / 2} ${y + hh * 0.5} Q ${x + hw * 0.3} ${y + hh} ${x - hw * 0.3} ${y + hh * 0.7}`;
          break;
        case 'K':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          path += ` M ${x + hw} ${y - hh} L ${x - hw + t} ${y} L ${x + hw} ${y + hh}`;
          break;
        case 'L':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh - t} L ${x + hw} ${y + hh - t} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`;
          break;
        case 'M':
          path = `M ${x - hw} ${y + hh} L ${x - hw} ${y - hh} L ${x} ${y + hh * 0.3} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh}`;
          break;
        case 'N':
          path = `M ${x - hw} ${y + hh} L ${x - hw} ${y - hh} L ${x + hw} ${y + hh} L ${x + hw} ${y - hh}`;
          break;
        case 'O':
          path = `M ${x} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y} Q ${x - hw} ${y - hh} ${x} ${y - hh} Z`;
          break;
        case 'P':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          path += ` M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y - hh * 0.25} Q ${x + hw} ${y + hh * 0.15} ${x - hw} ${y + hh * 0.15}`;
          break;
        case 'Q':
          path = `M ${x} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y} Q ${x - hw} ${y - hh} ${x} ${y - hh} Z`;
          path += ` M ${x + hw * 0.2} ${y + hh * 0.3} L ${x + hw} ${y + hh}`;
          break;
        case 'R':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh} L ${x - hw} ${y + hh} Z`;
          path += ` M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y - hh * 0.25} Q ${x + hw} ${y + hh * 0.15} ${x - hw} ${y + hh * 0.15}`;
          path += ` M ${x - hw * 0.1} ${y + hh * 0.15} L ${x + hw} ${y + hh}`;
          break;
        case 'S':
          path = `M ${x + hw} ${y - hh * 0.6} Q ${x + hw} ${y - hh} ${x} ${y - hh} Q ${x - hw} ${y - hh} ${x - hw} ${y - hh * 0.3} Q ${x - hw} ${y} ${x} ${y} Q ${x + hw} ${y} ${x + hw} ${y + hh * 0.3} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y + hh * 0.6}`;
          break;
        case 'T':
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y - hh + t} L ${x + t / 2} ${y - hh + t} L ${x + t / 2} ${y + hh} L ${x - t / 2} ${y + hh} L ${x - t / 2} ${y - hh + t} L ${x - hw} ${y - hh + t} Z`;
          break;
        case 'U':
          path = `M ${x - hw} ${y - hh} L ${x - hw + t} ${y - hh} L ${x - hw + t} ${y + hh * 0.5} Q ${x - hw + t} ${y + hh - t} ${x} ${y + hh - t} Q ${x + hw - t} ${y + hh - t} ${x + hw - t} ${y + hh * 0.5} L ${x + hw - t} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh * 0.5} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y + hh * 0.5} Z`;
          break;
        case 'V':
          path = `M ${x - hw} ${y - hh} L ${x} ${y + hh} L ${x + hw} ${y - hh}`;
          break;
        case 'W':
          path = `M ${x - hw} ${y - hh} L ${x - hw * 0.5} ${y + hh} L ${x} ${y} L ${x + hw * 0.5} ${y + hh} L ${x + hw} ${y - hh}`;
          break;
        case 'X':
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y + hh} M ${x + hw} ${y - hh} L ${x - hw} ${y + hh}`;
          break;
        case 'Y':
          path = `M ${x - hw} ${y - hh} L ${x} ${y} L ${x + hw} ${y - hh} M ${x} ${y} L ${x} ${y + hh}`;
          break;
        case 'Z':
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x - hw} ${y + hh} L ${x + hw} ${y + hh}`;
          break;
        default:
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`;
      }

      return path;
    };

    // 计算文字位置
    const letterSpacing = baseFontSize * 0.8;
    const totalWidth = displayText.length * letterSpacing;
    const startX = cx - totalWidth / 2 + letterSpacing / 2;

    // 生成每个字母
    displayText.split('').forEach((letter, index) => {
      const letterX = startX + index * letterSpacing;
      const path = getFilledLetterPath(letter, letterX, cy, baseFontSize);

      result.push({
        type: 'letter',
        id: `letter-${index}`,
        d: path,
        letterIndex: index,
      });

      // 光泽效果
      if (glossy) {
        result.push({
          type: 'gloss',
          id: `gloss-${index}`,
          x: letterX - baseFontSize * 0.35,
          y: cy - baseFontSize * 0.5,
          width: baseFontSize * 0.7,
          height: baseFontSize * 0.4,
        });
      }
    });

    // 描边轮廓
    if (strokeOutline) {
      displayText.split('').forEach((letter, index) => {
        const letterX = startX + index * letterSpacing;
        const path = getFilledLetterPath(letter, letterX, cy, baseFontSize);

        result.push({
          type: 'outline',
          id: `outline-${index}`,
          d: path,
        });
      });
    }

    return result;
  }, [text, gradientType, gradientAngle, colorStops, strokeOutline, glossy, fontWeight]);

  const color = colors[0] || '#1a1a1a';

  // 生成渐变色停
  const generateGradientStops = () => {
    const stops = [];
    for (let i = 0; i < colorStops; i++) {
      const offset = (i / (colorStops - 1)) * 100;
      const opacity = 0.4 + (Math.sin((i / colorStops) * Math.PI) * 0.6);
      stops.push({ offset: `${offset}%`, opacity });
    }
    return stops;
  };

  const gradientStops = generateGradientStops();

  // 计算线性渐变的坐标
  const angleRad = (gradientAngle * Math.PI) / 180;
  const x1 = 50 - Math.cos(angleRad) * 50;
  const y1 = 50 - Math.sin(angleRad) * 50;
  const x2 = 50 + Math.cos(angleRad) * 50;
  const y2 = 50 + Math.sin(angleRad) * 50;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        {gradientType === 'linear' && (
          <linearGradient id={gradientId} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={color} stopOpacity={stop.opacity} />
            ))}
          </linearGradient>
        )}
        {gradientType === 'radial' && (
          <radialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={color} stopOpacity={stop.opacity} />
            ))}
          </radialGradient>
        )}
        {gradientType === 'conic' && (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={color} stopOpacity={stop.opacity} />
            ))}
          </linearGradient>
        )}
        <linearGradient id="glossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="textClip">
          {elements.filter(el => el.type === 'letter').map(el => (
            <path key={el.id} d={el.d} />
          ))}
        </clipPath>
      </defs>
      <g>
        {/* 填充文字 */}
        {elements.filter(el => el.type === 'letter').map((el) => (
          <path
            key={el.id}
            d={el.d}
            fill={`url(#${gradientId})`}
            stroke="none"
          />
        ))}

        {/* 描边轮廓 */}
        {elements.filter(el => el.type === 'outline').map((el) => (
          <path
            key={el.id}
            d={el.d}
            {...renderProps}
          />
        ))}

        {/* 光泽效果 */}
        {glossy && (
          <g clipPath="url(#textClip)">
            {elements.filter(el => el.type === 'gloss').map((el) => (
              <rect
                key={el.id}
                x={el.x}
                y={el.y}
                width={el.width}
                height={el.height}
                fill="url(#glossGrad)"
                rx={5}
              />
            ))}
          </g>
        )}
      </g>
    </svg>
  );
};

export default GradientTextLogo;
