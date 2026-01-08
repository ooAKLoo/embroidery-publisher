import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 复古排版 Logo - 多层轮廓/阴影，复古风格文字
const RetroLogo = ({
  text = 'RETRO',
  style = 'vintage',          // 'vintage' | 'art-deco' | 'groovy' | 'western'
  layers = 3,                 // 轮廓层数
  layerOffset = 3,            // 层偏移距离
  inline = true,              // 内线装饰
  serifs = true,              // 衬线
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const displayText = text.slice(0, 8).toUpperCase();

    // 基础字体大小
    const baseFontSize = Math.min(60, 280 / Math.max(displayText.length, 1));

    // 根据风格生成不同的字体路径
    const getLetterPath = (letter, x, y, size) => {
      const paths = [];
      const h = size;
      const w = size * 0.7;
      const serif = serifs ? size * 0.1 : 0;

      // 根据风格调整字母形状
      if (style === 'vintage' || style === 'western') {
        // 粗体衬线风格
        paths.push(...getSerifLetter(letter, x, y, w, h, serif));
      } else if (style === 'art-deco') {
        // Art Deco 几何风格
        paths.push(...getArtDecoLetter(letter, x, y, w, h));
      } else if (style === 'groovy') {
        // 70年代圆润风格
        paths.push(...getGroovyLetter(letter, x, y, w, h));
      }

      return paths;
    };

    // 衬线字母
    const getSerifLetter = (letter, x, y, w, h, serif) => {
      const paths = [];
      const hw = w / 2;
      const hh = h / 2;
      const thick = w * 0.2;

      switch (letter) {
        case 'A':
          paths.push(`M ${x - hw} ${y + hh} L ${x} ${y - hh} L ${x + hw} ${y + hh}`);
          paths.push(`M ${x - hw * 0.5} ${y + hh * 0.2} L ${x + hw * 0.5} ${y + hh * 0.2}`);
          if (serif > 0) {
            paths.push(`M ${x - hw - serif} ${y + hh} L ${x - hw + thick} ${y + hh}`);
            paths.push(`M ${x + hw - thick} ${y + hh} L ${x + hw + serif} ${y + hh}`);
          }
          break;
        case 'B':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh * 0.5} ${x - hw} ${y}`);
          paths.push(`M ${x - hw} ${y} Q ${x + hw * 1.1} ${y + hh * 0.5} ${x - hw} ${y + hh}`);
          if (serif > 0) {
            paths.push(`M ${x - hw - serif} ${y - hh} L ${x} ${y - hh}`);
            paths.push(`M ${x - hw - serif} ${y + hh} L ${x} ${y + hh}`);
          }
          break;
        case 'C':
          paths.push(`M ${x + hw} ${y - hh * 0.7} Q ${x - hw} ${y - hh} ${x - hw} ${y} Q ${x - hw} ${y + hh} ${x + hw} ${y + hh * 0.7}`);
          break;
        case 'D':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y - hh} Q ${x + hw * 1.2} ${y} ${x - hw} ${y + hh}`);
          if (serif > 0) {
            paths.push(`M ${x - hw - serif} ${y - hh} L ${x} ${y - hh}`);
            paths.push(`M ${x - hw - serif} ${y + hh} L ${x} ${y + hh}`);
          }
          break;
        case 'E':
          paths.push(`M ${x + hw} ${y - hh} L ${x - hw} ${y - hh} L ${x - hw} ${y + hh} L ${x + hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y} L ${x + hw * 0.6} ${y}`);
          break;
        case 'F':
          paths.push(`M ${x + hw} ${y - hh} L ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y} L ${x + hw * 0.6} ${y}`);
          if (serif > 0) paths.push(`M ${x - hw - serif} ${y + hh} L ${x - hw + thick} ${y + hh}`);
          break;
        case 'G':
          paths.push(`M ${x + hw} ${y - hh * 0.7} Q ${x - hw} ${y - hh} ${x - hw} ${y} Q ${x - hw} ${y + hh} ${x + hw} ${y + hh * 0.7} L ${x + hw} ${y}`);
          paths.push(`M ${x} ${y} L ${x + hw} ${y}`);
          break;
        case 'H':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x + hw} ${y - hh} L ${x + hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y} L ${x + hw} ${y}`);
          break;
        case 'I':
          paths.push(`M ${x} ${y - hh} L ${x} ${y + hh}`);
          if (serif > 0) {
            paths.push(`M ${x - hw * 0.5} ${y - hh} L ${x + hw * 0.5} ${y - hh}`);
            paths.push(`M ${x - hw * 0.5} ${y + hh} L ${x + hw * 0.5} ${y + hh}`);
          }
          break;
        case 'J':
          paths.push(`M ${x + hw * 0.3} ${y - hh} L ${x + hw * 0.3} ${y + hh * 0.5} Q ${x + hw * 0.3} ${y + hh} ${x - hw * 0.3} ${y + hh * 0.7}`);
          if (serif > 0) paths.push(`M ${x - hw * 0.3} ${y - hh} L ${x + hw} ${y - hh}`);
          break;
        case 'K':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x + hw} ${y - hh} L ${x - hw} ${y}`);
          paths.push(`M ${x - hw} ${y} L ${x + hw} ${y + hh}`);
          break;
        case 'L':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh} L ${x + hw} ${y + hh}`);
          if (serif > 0) paths.push(`M ${x - hw - serif} ${y - hh} L ${x - hw + thick} ${y - hh}`);
          break;
        case 'M':
          paths.push(`M ${x - hw} ${y + hh} L ${x - hw} ${y - hh} L ${x} ${y + hh * 0.3} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh}`);
          break;
        case 'N':
          paths.push(`M ${x - hw} ${y + hh} L ${x - hw} ${y - hh} L ${x + hw} ${y + hh} L ${x + hw} ${y - hh}`);
          break;
        case 'O':
          paths.push(`M ${x} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y} Q ${x - hw} ${y - hh} ${x} ${y - hh}`);
          break;
        case 'P':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh * 0.5} ${x - hw} ${y + hh * 0.1}`);
          if (serif > 0) paths.push(`M ${x - hw - serif} ${y + hh} L ${x - hw + thick} ${y + hh}`);
          break;
        case 'Q':
          paths.push(`M ${x} ${y - hh} Q ${x + hw} ${y - hh} ${x + hw} ${y} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y} Q ${x - hw} ${y - hh} ${x} ${y - hh}`);
          paths.push(`M ${x + hw * 0.3} ${y + hh * 0.3} L ${x + hw} ${y + hh}`);
          break;
        case 'R':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh}`);
          paths.push(`M ${x - hw} ${y - hh} Q ${x + hw} ${y - hh * 0.5} ${x - hw} ${y + hh * 0.1}`);
          paths.push(`M ${x - hw * 0.2} ${y + hh * 0.1} L ${x + hw} ${y + hh}`);
          break;
        case 'S':
          paths.push(`M ${x + hw} ${y - hh * 0.6} Q ${x + hw} ${y - hh} ${x} ${y - hh} Q ${x - hw} ${y - hh} ${x - hw} ${y - hh * 0.3} Q ${x - hw} ${y} ${x} ${y} Q ${x + hw} ${y} ${x + hw} ${y + hh * 0.3} Q ${x + hw} ${y + hh} ${x} ${y + hh} Q ${x - hw} ${y + hh} ${x - hw} ${y + hh * 0.6}`);
          break;
        case 'T':
          paths.push(`M ${x - hw} ${y - hh} L ${x + hw} ${y - hh}`);
          paths.push(`M ${x} ${y - hh} L ${x} ${y + hh}`);
          if (serif > 0) paths.push(`M ${x - hw * 0.5} ${y + hh} L ${x + hw * 0.5} ${y + hh}`);
          break;
        case 'U':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw} ${y + hh * 0.5} Q ${x - hw} ${y + hh} ${x} ${y + hh} Q ${x + hw} ${y + hh} ${x + hw} ${y + hh * 0.5} L ${x + hw} ${y - hh}`);
          break;
        case 'V':
          paths.push(`M ${x - hw} ${y - hh} L ${x} ${y + hh} L ${x + hw} ${y - hh}`);
          break;
        case 'W':
          paths.push(`M ${x - hw} ${y - hh} L ${x - hw * 0.5} ${y + hh} L ${x} ${y} L ${x + hw * 0.5} ${y + hh} L ${x + hw} ${y - hh}`);
          break;
        case 'X':
          paths.push(`M ${x - hw} ${y - hh} L ${x + hw} ${y + hh}`);
          paths.push(`M ${x + hw} ${y - hh} L ${x - hw} ${y + hh}`);
          break;
        case 'Y':
          paths.push(`M ${x - hw} ${y - hh} L ${x} ${y}`);
          paths.push(`M ${x + hw} ${y - hh} L ${x} ${y}`);
          paths.push(`M ${x} ${y} L ${x} ${y + hh}`);
          break;
        case 'Z':
          paths.push(`M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x - hw} ${y + hh} L ${x + hw} ${y + hh}`);
          break;
        default:
          paths.push(`M ${x - hw} ${y - hh} L ${x + hw} ${y - hh} L ${x + hw} ${y + hh} L ${x - hw} ${y + hh} Z`);
      }

      return paths;
    };

    // Art Deco 风格字母
    const getArtDecoLetter = (letter, x, y, w, h) => {
      const paths = [];
      const hw = w / 2;
      const hh = h / 2;

      // Art Deco 特点：几何形状、对称、装饰性
      switch (letter) {
        case 'A':
          paths.push(`M ${x - hw} ${y + hh} L ${x - hw * 0.3} ${y - hh} L ${x + hw * 0.3} ${y - hh} L ${x + hw} ${y + hh}`);
          paths.push(`M ${x - hw * 0.6} ${y + hh * 0.2} L ${x + hw * 0.6} ${y + hh * 0.2}`);
          paths.push(`M ${x - hw * 0.2} ${y - hh * 0.5} L ${x + hw * 0.2} ${y - hh * 0.5}`);
          break;
        case 'O':
          // 菱形的 O
          paths.push(`M ${x} ${y - hh} L ${x + hw} ${y} L ${x} ${y + hh} L ${x - hw} ${y} Z`);
          paths.push(`M ${x} ${y - hh * 0.5} L ${x + hw * 0.5} ${y} L ${x} ${y + hh * 0.5} L ${x - hw * 0.5} ${y} Z`);
          break;
        default:
          return getSerifLetter(letter, x, y, w, h, w * 0.15);
      }

      return paths;
    };

    // Groovy 70年代风格字母
    const getGroovyLetter = (letter, x, y, w, h) => {
      const paths = [];
      const hw = w / 2;
      const hh = h / 2;

      // Groovy 特点：圆润、流线、厚重
      switch (letter) {
        case 'O':
          paths.push(`M ${x} ${y - hh} C ${x + hw * 1.3} ${y - hh} ${x + hw * 1.3} ${y + hh} ${x} ${y + hh} C ${x - hw * 1.3} ${y + hh} ${x - hw * 1.3} ${y - hh} ${x} ${y - hh}`);
          break;
        case 'S':
          paths.push(`M ${x + hw * 0.8} ${y - hh * 0.6} C ${x + hw} ${y - hh * 1.2} ${x - hw * 1.2} ${y - hh * 0.8} ${x - hw * 0.5} ${y - hh * 0.2} C ${x} ${y} ${x} ${y} ${x + hw * 0.5} ${y + hh * 0.2} C ${x + hw * 1.2} ${y + hh * 0.8} ${x - hw} ${y + hh * 1.2} ${x - hw * 0.8} ${y + hh * 0.6}`);
          break;
        default:
          return getSerifLetter(letter, x, y, w, h, 0);
      }

      return paths;
    };

    // 偏移路径字符串的辅助函数
    const offsetPathString = (pathStr, dx, dy) => {
      return pathStr.replace(/(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g, (match, x, y) => {
        return `${parseFloat(x) + dx} ${parseFloat(y) + dy}`;
      });
    };

    // 计算文字总宽度和起始位置
    const letterSpacing = baseFontSize * 0.85;
    const totalWidth = displayText.length * letterSpacing;
    const startX = cx - totalWidth / 2 + letterSpacing / 2;

    // 为每个字母生成多层
    displayText.split('').forEach((letter, letterIndex) => {
      const letterX = startX + letterIndex * letterSpacing;
      const letterPaths = getLetterPath(letter, letterX, cy, baseFontSize);

      // 生成多层阴影效果
      for (let layer = layers - 1; layer >= 0; layer--) {
        const offsetX = layer * layerOffset;
        const offsetY = layer * layerOffset;

        letterPaths.forEach((path, pathIndex) => {
          // 对路径进行偏移
          const offsetPath = offsetPathString(path, offsetX, offsetY);

          result.push({
            type: 'letterLayer',
            id: `letter-${letterIndex}-layer-${layer}-path-${pathIndex}`,
            d: offsetPath,
            layer,
            isTop: layer === 0,
          });
        });
      }

      // 内线装饰
      if (inline && layers > 1) {
        letterPaths.forEach((path, pathIndex) => {
          result.push({
            type: 'inline',
            id: `letter-${letterIndex}-inline-${pathIndex}`,
            d: path,
          });
        });
      }
    });

    // 装饰性边框（vintage/western 风格）
    if (style === 'vintage' || style === 'western') {
      const frameW = totalWidth + 40;
      const frameH = baseFontSize + 30;

      result.push({
        type: 'frame',
        id: 'outer-frame',
        x: cx - frameW / 2,
        y: cy - frameH / 2,
        width: frameW,
        height: frameH,
      });

      if (style === 'western') {
        // 西部风格星星装饰
        [-1, 1].forEach((side, i) => {
          result.push({
            type: 'star',
            id: `star-${i}`,
            cx: cx + side * (frameW / 2 - 15),
            cy: cy,
            r: 8,
          });
        });
      }
    }

    return result;
  }, [text, style, layers, layerOffset, inline, serifs]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="retroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <g fill="none" {...strokeProps}>
        {elements.map((el) => {
          if (el.type === 'letterLayer') {
            const opacity = el.isTop ? 1 : 0.3 + (1 - el.layer / layers) * 0.3;
            return (
              <path
                key={el.id}
                d={el.d}
                stroke={color}
                strokeWidth={el.isTop ? strokeWidth * 1.5 : strokeWidth}
                opacity={opacity}
                fill={el.isTop ? 'none' : 'none'}
              />
            );
          } else if (el.type === 'inline') {
            return (
              <path
                key={el.id}
                d={el.d}
                stroke={color}
                strokeWidth={strokeWidth * 0.5}
                opacity={0.3}
                strokeDasharray="2,4"
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
                stroke={color}
                strokeWidth={strokeWidth}
                rx={style === 'groovy' ? 10 : 0}
                opacity={0.5}
              />
            );
          } else if (el.type === 'star') {
            // 五角星
            const points = [];
            for (let i = 0; i < 5; i++) {
              const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
              points.push(`${el.cx + el.r * Math.cos(angle)},${el.cy + el.r * Math.sin(angle)}`);
            }
            return (
              <polygon
                key={el.id}
                points={points.join(' ')}
                fill={color}
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

export default RetroLogo;
