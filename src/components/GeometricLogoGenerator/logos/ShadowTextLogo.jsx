import { useMemo } from 'react';
import { getRenderProps } from '../constants/commonStyles';
import { getStroke } from '../utils/gradient';

// 3D 阴影效果 Logo - 立体投影文字
const ShadowTextLogo = ({
  text = 'SHADOW',
  shadowDepth = 8,            // 阴影深度
  shadowAngle = 135,          // 阴影方向（度数）
  perspective = 'flat',       // 'flat' | 'isometric' | 'extrude'
  fillStyle = 'solid',        // 'solid' | 'outline' | 'striped'
  fontWeight = 'bold',        // 'light' | 'regular' | 'bold'
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const gradientId = 'shadowGrad';
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const displayText = text.slice(0, 8).toUpperCase();

    // 字体粗细
    const weightMap = { light: 0.1, regular: 0.15, bold: 0.22 };
    const letterThickness = weightMap[fontWeight] || 0.15;

    // 基础字体大小
    const baseFontSize = Math.min(65, 280 / Math.max(displayText.length, 1));

    // 阴影偏移计算
    const angleRad = (shadowAngle * Math.PI) / 180;
    const shadowDx = Math.cos(angleRad) * shadowDepth;
    const shadowDy = Math.sin(angleRad) * shadowDepth;

    // 生成字母路径
    const getLetterPath = (letter, x, y, size) => {
      const h = size;
      const w = size * 0.7;
      const hw = w / 2;
      const hh = h / 2;
      const t = size * letterThickness;

      let path = '';

      switch (letter) {
        case 'A':
          path = `M ${x - hw} ${y + hh} L ${x} ${y - hh} L ${x + hw} ${y + hh} M ${x - hw * 0.45} ${y + hh * 0.2} L ${x + hw * 0.45} ${y + hh * 0.2}`;
          break;
        case 'B':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x - hw} ${y - hh} Q ${x + hw * 0.8} ${y - hh} ${x + hw * 0.8} ${y - hh * 0.25} Q ${x + hw * 0.8} ${y} ${x - hw} ${y} M ${x - hw} ${y} Q ${x + hw} ${y} ${x + hw} ${y + hh * 0.5} Q ${x + hw} ${y + hh} ${x - hw} ${y + hh}`;
          break;
        case 'C':
          path = `M ${x + hw} ${y - hh * 0.6} Q ${x} ${y - hh} ${x - hw} ${y} Q ${x} ${y + hh} ${x + hw} ${y + hh * 0.6}`;
          break;
        case 'D':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x - hw} ${y - hh} Q ${x + hw * 1.1} ${y} ${x - hw} ${y + hh}`;
          break;
        case 'E':
          path = `M ${x + hw} ${y - hh} L ${x - hw} ${y - hh} L ${x - hw} ${y + hh} L ${x + hw} ${y + hh} M ${x - hw} ${y} L ${x + hw * 0.6} ${y}`;
          break;
        case 'F':
          path = `M ${x + hw} ${y - hh} L ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x - hw} ${y} L ${x + hw * 0.6} ${y}`;
          break;
        case 'G':
          path = `M ${x + hw} ${y - hh * 0.6} Q ${x} ${y - hh} ${x - hw} ${y} Q ${x} ${y + hh} ${x + hw} ${y + hh * 0.6} L ${x + hw} ${y} L ${x} ${y}`;
          break;
        case 'H':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x + hw} ${y - hh} L ${x + hw} ${y + hh} M ${x - hw} ${y} L ${x + hw} ${y}`;
          break;
        case 'I':
          path = `M ${x} ${y - hh} L ${x} ${y + hh} M ${x - hw * 0.4} ${y - hh} L ${x + hw * 0.4} ${y - hh} M ${x - hw * 0.4} ${y + hh} L ${x + hw * 0.4} ${y + hh}`;
          break;
        case 'J':
          path = `M ${x + hw * 0.3} ${y - hh} L ${x + hw * 0.3} ${y + hh * 0.5} Q ${x + hw * 0.3} ${y + hh} ${x - hw * 0.3} ${y + hh * 0.7}`;
          break;
        case 'K':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x + hw} ${y - hh} L ${x - hw} ${y} L ${x + hw} ${y + hh}`;
          break;
        case 'L':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} L ${x + hw} ${y + hh}`;
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
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y - hh * 0.25} Q ${x + hw} ${y + hh * 0.15} ${x - hw} ${y + hh * 0.15}`;
          break;
        case 'Q':
          path = `M ${x} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y} Q ${x - hw} ${y - hh} ${x} ${y - hh} Z M ${x + hw * 0.2} ${y + hh * 0.3} L ${x + hw} ${y + hh}`;
          break;
        case 'R':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y - hh * 0.25} Q ${x + hw} ${y + hh * 0.1} ${x - hw} ${y + hh * 0.1} M ${x - hw * 0.1} ${y + hh * 0.1} L ${x + hw} ${y + hh}`;
          break;
        case 'S':
          path = `M ${x + hw} ${y - hh * 0.6} Q ${x + hw} ${y - hh} ${x} ${y - hh} Q ${x - hw} ${y - hh} ${x - hw} ${y - hh * 0.3} Q ${x - hw} ${y} ${x} ${y} Q ${x + hw} ${y} ${x + hw} ${y + hh * 0.3} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y + hh * 0.6}`;
          break;
        case 'T':
          path = `M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} M ${x} ${y - hh} L ${x} ${y + hh}`;
          break;
        case 'U':
          path = `M ${x - hw} ${y - hh} L ${x - hw} ${y + hh * 0.5} Q ${x - hw} ${y + hh} ${x} ${y + hh} Q ${x + hw} ${y + hh} ${x + hw} ${y + hh * 0.5} L ${x + hw} ${y - hh}`;
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
          path = `M ${x - hw * 0.3} ${y - hh} L ${x + hw * 0.3} ${y - hh} L ${x + hw * 0.3} ${y + hh} L ${x - hw * 0.3} ${y + hh} Z`;
      }

      return path;
    };

    // 偏移路径
    const offsetPath = (pathStr, dx, dy) => {
      return pathStr.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (match, x, y) => {
        return `${parseFloat(x) + dx} ${parseFloat(y) + dy}`;
      });
    };

    // 计算文字位置
    const letterSpacing = baseFontSize * 0.8;
    const totalWidth = displayText.length * letterSpacing;
    const startX = cx - totalWidth / 2 + letterSpacing / 2;

    // 生成阴影层
    const shadowLayers = perspective === 'extrude' ? shadowDepth : 1;

    displayText.split('').forEach((letter, index) => {
      const letterX = startX + index * letterSpacing;

      if (perspective === 'extrude') {
        // 挤压3D效果 - 多层阴影
        for (let layer = shadowLayers; layer > 0; layer--) {
          const layerDx = (shadowDx / shadowDepth) * layer;
          const layerDy = (shadowDy / shadowDepth) * layer;
          const path = getLetterPath(letter, letterX, cy, baseFontSize);
          const offsetPathStr = offsetPath(path, layerDx, layerDy);

          result.push({
            type: 'shadowLayer',
            id: `shadow-${index}-${layer}`,
            d: offsetPathStr,
            layer,
            maxLayers: shadowLayers,
          });
        }

        // 连接线（形成3D侧面）
        const letterPath = getLetterPath(letter, letterX, cy, baseFontSize);
        // 简化的侧面效果
        result.push({
          type: 'extrude',
          id: `extrude-${index}`,
          d: letterPath,
          dx: shadowDx,
          dy: shadowDy,
        });

      } else if (perspective === 'isometric') {
        // 等轴测视图
        const isoPath = getLetterPath(letter, letterX, cy, baseFontSize);
        const skewedPath = offsetPath(isoPath, shadowDx * 0.5, shadowDy * 0.5);

        result.push({
          type: 'shadow',
          id: `shadow-${index}`,
          d: skewedPath,
          isIso: true,
        });

      } else {
        // 平面阴影
        const path = getLetterPath(letter, letterX, cy, baseFontSize);
        const shadowPath = offsetPath(path, shadowDx, shadowDy);

        result.push({
          type: 'shadow',
          id: `shadow-${index}`,
          d: shadowPath,
        });
      }

      // 主文字
      const mainPath = getLetterPath(letter, letterX, cy, baseFontSize);
      result.push({
        type: 'main',
        id: `main-${index}`,
        d: mainPath,
        letterIndex: index,
      });

      // 条纹填充
      if (fillStyle === 'striped') {
        const hw = baseFontSize * 0.35;
        const hh = baseFontSize * 0.5;
        const stripeCount = 5;

        for (let s = 0; s < stripeCount; s++) {
          const stripeY = cy - hh + (s * 2 + 1) * (hh / stripeCount);
          result.push({
            type: 'stripe',
            id: `stripe-${index}-${s}`,
            x1: letterX - hw,
            y1: stripeY,
            x2: letterX + hw,
            y2: stripeY,
          });
        }
      }
    });

    return result;
  }, [text, shadowDepth, shadowAngle, perspective, fillStyle, fontWeight]);

  const color = colors[0] || '#1a1a1a';

  // 根据填充样式获取笔画宽度
  const getStrokeWidth = () => {
    if (fontWeight === 'bold') return strokeWidth * 3;
    if (fontWeight === 'light') return strokeWidth * 1.5;
    return strokeWidth * 2;
  };

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
        <clipPath id="mainTextClip">
          {elements.filter(el => el.type === 'main').map(el => (
            <path key={`clip-${el.id}`} d={el.d} />
          ))}
        </clipPath>
      </defs>
      <g {...renderProps}>
        {/* 阴影层 */}
        {elements.filter(el => el.type === 'shadow' || el.type === 'shadowLayer').map((el) => {
          let opacity = 0.3;
          if (el.type === 'shadowLayer') {
            opacity = 0.1 + (1 - el.layer / el.maxLayers) * 0.2;
          }

          return (
            <path
              key={el.id}
              d={el.d}
              stroke={color}
              strokeWidth={getStrokeWidth()}
              opacity={opacity}
              fill={fillStyle === 'solid' ? 'url(#shadowGrad)' : 'none'}
            />
          );
        })}

        {/* 挤压侧面效果 */}
        {elements.filter(el => el.type === 'extrude').map((el) => (
          <path
            key={el.id}
            d={el.d}
            stroke={color}
            strokeWidth={getStrokeWidth() * 0.5}
            opacity={0.2}
            transform={`translate(${el.dx * 0.5}, ${el.dy * 0.5})`}
          />
        ))}

        {/* 主文字 */}
        {elements.filter(el => el.type === 'main').map((el) => (
          <path
            key={el.id}
            d={el.d}
            stroke={color}
            strokeWidth={getStrokeWidth()}
            fill={fillStyle === 'solid' ? color : 'none'}
            opacity={fillStyle === 'solid' ? 0.9 : 1}
          />
        ))}

        {/* 条纹装饰 */}
        {fillStyle === 'striped' && (
          <g clipPath="url(#mainTextClip)">
            {elements.filter(el => el.type === 'stripe').map((el) => (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
                stroke={color}
                strokeWidth={strokeWidth * 0.8}
                opacity={0.5}
              />
            ))}
          </g>
        )}

        {/* 轮廓描边（如果是 outline 模式）*/}
        {fillStyle === 'outline' && elements.filter(el => el.type === 'main').map((el) => (
          <path
            key={`outline-${el.id}`}
            d={el.d}
            stroke={color}
            strokeWidth={strokeWidth * 0.5}
            fill="none"
            opacity={0.5}
          />
        ))}
      </g>
    </svg>
  );
};

export default ShadowTextLogo;
