import { useMemo } from 'react';
import { getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

// 彭罗斯拼贴 Logo - 非周期性对称图案
const PenroseTileLogo = ({
  tileType = 'kite-dart',     // 'kite-dart' | 'rhombus' | 'pentagons' | 'stars'
  iterations = 3,             // 细分迭代次数
  showOutline = true,         // 显示轮廓
  fillAlternate = true,       // 交替填充
  rotation = 0,               // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const stroke = getStroke(null, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const size = 100;
    const rotRad = (rotation * Math.PI) / 180;

    // 黄金比例
    const phi = (1 + Math.sqrt(5)) / 2;

    // 旋转点
    const rotatePoint = (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * Math.cos(rotRad) - dy * Math.sin(rotRad),
        y: cy + dx * Math.sin(rotRad) + dy * Math.cos(rotRad),
      };
    };

    if (tileType === 'kite-dart') {
      // 风筝和飞镖图案
      const kites = [];
      const darts = [];

      // 从五角星开始生成
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const nextAngle = ((i + 1) * 2 * Math.PI) / 5 - Math.PI / 2;

        // 风筝顶点
        const tip = { x: cx, y: cy };
        const p1 = {
          x: cx + size * Math.cos(angle),
          y: cy + size * Math.sin(angle),
        };
        const p2 = {
          x: cx + size * Math.cos(nextAngle),
          y: cy + size * Math.sin(nextAngle),
        };
        const mid = {
          x: cx + size * phi * 0.4 * Math.cos((angle + nextAngle) / 2),
          y: cy + size * phi * 0.4 * Math.sin((angle + nextAngle) / 2),
        };

        kites.push([tip, p1, mid, p2]);

        // 飞镖（在外圈）
        if (iterations >= 2) {
          const outerMid = {
            x: cx + size * 1.3 * Math.cos((angle + nextAngle) / 2),
            y: cy + size * 1.3 * Math.sin((angle + nextAngle) / 2),
          };
          darts.push([p1, outerMid, p2, mid]);
        }
      }

      // 添加风筝
      kites.forEach((k, i) => {
        const rp = k.map(p => rotatePoint(p.x, p.y));
        result.push({
          type: 'polygon',
          id: `kite-${i}`,
          points: rp,
          isKite: true,
        });
      });

      // 添加飞镖
      darts.forEach((d, i) => {
        const rp = d.map(p => rotatePoint(p.x, p.y));
        result.push({
          type: 'polygon',
          id: `dart-${i}`,
          points: rp,
          isKite: false,
        });
      });

    } else if (tileType === 'rhombus') {
      // 粗菱形和细菱形
      const thinAngle = Math.PI / 5;  // 36度
      const thickAngle = 2 * Math.PI / 5;  // 72度

      // 中心十瓣花
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const isThick = i % 2 === 0;
        const halfAngle = isThick ? thickAngle / 2 : thinAngle / 2;

        const r = size * (isThick ? 0.8 : 0.6);

        const p1 = { x: cx, y: cy };
        const p2 = {
          x: cx + r * Math.cos(angle - halfAngle / 2),
          y: cy + r * Math.sin(angle - halfAngle / 2),
        };
        const p3 = {
          x: cx + r * 1.2 * Math.cos(angle),
          y: cy + r * 1.2 * Math.sin(angle),
        };
        const p4 = {
          x: cx + r * Math.cos(angle + halfAngle / 2),
          y: cy + r * Math.sin(angle + halfAngle / 2),
        };

        const rp = [p1, p2, p3, p4].map(p => rotatePoint(p.x, p.y));
        result.push({
          type: 'polygon',
          id: `rhombus-${i}`,
          points: rp,
          isThick,
        });
      }

    } else if (tileType === 'pentagons') {
      // 五边形和五角星
      // 中心五边形
      const pentPoints = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        pentPoints.push({
          x: cx + size * 0.5 * Math.cos(angle),
          y: cy + size * 0.5 * Math.sin(angle),
        });
      }
      const rpPent = pentPoints.map(p => rotatePoint(p.x, p.y));
      result.push({
        type: 'polygon',
        id: 'center-pentagon',
        points: rpPent,
        isPentagon: true,
      });

      // 周围的五边形
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const outerCx = cx + size * 0.85 * Math.cos(angle);
        const outerCy = cy + size * 0.85 * Math.sin(angle);

        const outerPentPoints = [];
        for (let j = 0; j < 5; j++) {
          const pAngle = (j * 2 * Math.PI) / 5 + angle + Math.PI;
          outerPentPoints.push({
            x: outerCx + size * 0.35 * Math.cos(pAngle),
            y: outerCy + size * 0.35 * Math.sin(pAngle),
          });
        }
        const rpOuter = outerPentPoints.map(p => rotatePoint(p.x, p.y));
        result.push({
          type: 'polygon',
          id: `outer-pentagon-${i}`,
          points: rpOuter,
          isPentagon: true,
        });
      }

      // 填充的菱形
      if (iterations >= 2) {
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const nextAngle = ((i + 1) * 2 * Math.PI) / 5 - Math.PI / 2;

          const p1 = pentPoints[i];
          const p2 = pentPoints[(i + 1) % 5];
          const p3 = {
            x: cx + size * 0.85 * Math.cos((angle + nextAngle) / 2),
            y: cy + size * 0.85 * Math.sin((angle + nextAngle) / 2),
          };

          const rp = [p1, p3, p2, { x: cx, y: cy }].map(p => rotatePoint(p.x, p.y));
          result.push({
            type: 'polygon',
            id: `filler-${i}`,
            points: rp,
            isFiller: true,
          });
        }
      }

    } else if (tileType === 'stars') {
      // 五角星和十角星图案
      // 中心十角星
      const starPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const r = i % 2 === 0 ? size : size * 0.4;
        starPoints.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
        });
      }
      const rpStar = starPoints.map(p => rotatePoint(p.x, p.y));
      result.push({
        type: 'polygon',
        id: 'center-star',
        points: rpStar,
        isStar: true,
      });

      // 五个五角星围绕
      if (iterations >= 2) {
        for (let i = 0; i < 5; i++) {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const starCx = cx + size * 1.1 * Math.cos(angle);
          const starCy = cy + size * 1.1 * Math.sin(angle);

          const smallStarPoints = [];
          for (let j = 0; j < 10; j++) {
            const sAngle = (j * Math.PI) / 5 + angle;
            const r = j % 2 === 0 ? size * 0.35 : size * 0.15;
            smallStarPoints.push({
              x: starCx + r * Math.cos(sAngle),
              y: starCy + r * Math.sin(sAngle),
            });
          }
          const rpSmall = smallStarPoints.map(p => rotatePoint(p.x, p.y));
          result.push({
            type: 'polygon',
            id: `outer-star-${i}`,
            points: rpSmall,
            isStar: true,
          });
        }
      }
    }

    // 外圈装饰
    if (showOutline) {
      // 十边形外框
      const decagonPoints = [];
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        decagonPoints.push(rotatePoint(
          cx + size * 1.15 * Math.cos(angle),
          cy + size * 1.15 * Math.sin(angle)
        ));
      }
      result.push({
        type: 'polygon',
        id: 'outer-decagon',
        points: decagonPoints,
        isOutline: true,
      });
    }

    return result;
  }, [tileType, iterations, showOutline, fillAlternate, rotation]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="penroseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <g strokeWidth={strokeWidth} {...renderProps}>
        {elements.map((el) => {
          if (el.type === 'polygon') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            let fill = 'none';
            let opacity = 1;

            if (fillAlternate) {
              if (el.isKite || el.isThick || el.isPentagon || el.isStar) {
                fill = 'url(#penroseGrad)';
              } else if (el.isFiller) {
                fill = color;
                opacity = 0.1;
              }
            }

            if (el.isOutline) {
              fill = 'none';
              opacity = 0.5;
            }

            return (
              <path
                key={el.id}
                d={d}
                fill={fill}
                opacity={opacity}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default PenroseTileLogo;
