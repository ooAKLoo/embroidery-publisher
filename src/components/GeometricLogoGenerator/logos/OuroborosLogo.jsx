import { useMemo } from 'react';
import { getSvgStrokeProps } from '../constants/commonStyles';

// 衔尾蛇 Logo - 蛇/龙咬住自己尾巴，象征循环与永恒
const OuroborosLogo = ({
  style = 'serpent',          // 'serpent' | 'dragon' | 'geometric' | 'double'
  bodySegments = 24,          // 身体节数
  headSize = 1.2,             // 头部大小比例
  bodyTaper = 0.3,            // 身体渐细程度
  scales = true,              // 显示鳞片
  rotation = -90,             // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);
  const elements = useMemo(() => {
    const result = [];
    const cx = 150, cy = 150;
    const radius = 90;
    const rotRad = (rotation * Math.PI) / 180;

    // 旋转点辅助函数
    const rotatePoint = (x, y) => {
      const dx = x - cx;
      const dy = y - cy;
      return {
        x: cx + dx * Math.cos(rotRad) - dy * Math.sin(rotRad),
        y: cy + dx * Math.sin(rotRad) + dy * Math.cos(rotRad),
      };
    };

    // 计算身体宽度（从头到尾渐变）
    const getBodyWidth = (t) => {
      const baseWidth = 25;
      const headWidth = baseWidth * headSize;
      const tailWidth = baseWidth * (1 - bodyTaper);

      // t = 0 是头部，t = 1 是尾部
      if (t < 0.1) {
        // 头部区域
        return headWidth * (0.8 + 0.2 * (t / 0.1));
      } else if (t > 0.85) {
        // 尾部区域
        const tailT = (t - 0.85) / 0.15;
        return tailWidth * (1 - tailT * 0.7);
      } else {
        // 身体区域 - 平滑过渡
        const bodyT = (t - 0.1) / 0.75;
        return headWidth * 0.9 - (headWidth * 0.9 - tailWidth) * bodyT;
      }
    };

    if (style === 'serpent' || style === 'dragon') {
      // 蛇/龙形态
      const bodyPoints = [];

      // 生成身体中心线点
      for (let i = 0; i <= bodySegments; i++) {
        const t = i / bodySegments;
        const angle = t * Math.PI * 2 - Math.PI / 2;

        // 添加微小的波动使身体看起来更自然
        const waveOffset = Math.sin(t * Math.PI * 8) * 3;

        const px = cx + (radius + waveOffset) * Math.cos(angle);
        const py = cy + (radius + waveOffset) * Math.sin(angle);

        bodyPoints.push({
          x: px,
          y: py,
          angle,
          width: getBodyWidth(t),
          t,
        });
      }

      // 生成身体外轮廓
      const outerPath = [];
      const innerPath = [];

      bodyPoints.forEach((p, i) => {
        const perpAngle = p.angle + Math.PI / 2;
        const halfWidth = p.width / 2;

        outerPath.push(rotatePoint(
          p.x + halfWidth * Math.cos(perpAngle),
          p.y + halfWidth * Math.sin(perpAngle)
        ));

        innerPath.unshift(rotatePoint(
          p.x - halfWidth * Math.cos(perpAngle),
          p.y - halfWidth * Math.sin(perpAngle)
        ));
      });

      // 身体轮廓路径
      let bodyPath = 'M ';
      outerPath.forEach((p, i) => {
        bodyPath += `${p.x} ${p.y} ${i < outerPath.length - 1 ? 'L ' : ''}`;
      });
      innerPath.forEach((p, i) => {
        bodyPath += `L ${p.x} ${p.y} `;
      });
      bodyPath += 'Z';

      result.push({
        type: 'body',
        id: 'serpent-body',
        d: bodyPath,
      });

      // 头部
      const headPoint = bodyPoints[0];
      const headAngle = headPoint.angle + rotRad;
      const headWidth = headPoint.width * headSize;

      // 头部形状
      const headCx = headPoint.x;
      const headCy = headPoint.y;
      const rHead = rotatePoint(headCx, headCy);

      // 眼睛
      const eyeOffset = headWidth * 0.25;
      const eyeRadius = headWidth * 0.12;
      const eyeAngle = headAngle - Math.PI / 2;

      const eye1 = rotatePoint(
        headCx + eyeOffset * Math.cos(eyeAngle + 0.3) + eyeOffset * 0.5 * Math.cos(headAngle),
        headCy + eyeOffset * Math.sin(eyeAngle + 0.3) + eyeOffset * 0.5 * Math.sin(headAngle)
      );

      const eye2 = rotatePoint(
        headCx + eyeOffset * Math.cos(eyeAngle - 0.3 + Math.PI) + eyeOffset * 0.5 * Math.cos(headAngle),
        headCy + eyeOffset * Math.sin(eyeAngle - 0.3 + Math.PI) + eyeOffset * 0.5 * Math.sin(headAngle)
      );

      result.push({
        type: 'eye',
        id: 'eye-1',
        cx: eye1.x,
        cy: eye1.y,
        r: eyeRadius,
      });

      result.push({
        type: 'eye',
        id: 'eye-2',
        cx: eye2.x,
        cy: eye2.y,
        r: eyeRadius,
      });

      // 龙形态添加角和胡须
      if (style === 'dragon') {
        // 角
        for (let side = -1; side <= 1; side += 2) {
          const hornBase = rotatePoint(
            headCx + headWidth * 0.3 * Math.cos(headAngle + side * Math.PI / 3),
            headCy + headWidth * 0.3 * Math.sin(headAngle + side * Math.PI / 3)
          );
          const hornTip = rotatePoint(
            headCx + headWidth * 0.8 * Math.cos(headAngle + side * Math.PI / 4),
            headCy + headWidth * 0.8 * Math.sin(headAngle + side * Math.PI / 4)
          );

          result.push({
            type: 'horn',
            id: `horn-${side}`,
            x1: hornBase.x,
            y1: hornBase.y,
            x2: hornTip.x,
            y2: hornTip.y,
          });
        }
      }

      // 鳞片装饰
      if (scales) {
        for (let i = 2; i < bodySegments - 2; i += 2) {
          const p = bodyPoints[i];
          const rp = rotatePoint(p.x, p.y);

          result.push({
            type: 'scale',
            id: `scale-${i}`,
            cx: rp.x,
            cy: rp.y,
            r: p.width * 0.15,
            angle: p.angle + rotRad,
          });
        }
      }

    } else if (style === 'geometric') {
      // 几何化风格
      const segments = bodySegments;
      const points = [];

      for (let i = 0; i < segments; i++) {
        const angle = (i * 2 * Math.PI) / segments;
        const innerR = radius - 15;
        const outerR = radius + 15;

        points.push({
          inner: rotatePoint(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle)),
          outer: rotatePoint(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle)),
          angle,
        });
      }

      // 外圈
      let outerPath = 'M ';
      points.forEach((p, i) => {
        outerPath += `${p.outer.x} ${p.outer.y} ${i < points.length - 1 ? 'L ' : ''}`;
      });
      outerPath += 'Z';

      // 内圈
      let innerPath = 'M ';
      points.forEach((p, i) => {
        innerPath += `${p.inner.x} ${p.inner.y} ${i < points.length - 1 ? 'L ' : ''}`;
      });
      innerPath += 'Z';

      result.push({ type: 'polygon', id: 'outer-ring', d: outerPath });
      result.push({ type: 'polygon', id: 'inner-ring', d: innerPath });

      // 连接线
      points.forEach((p, i) => {
        if (i % 3 === 0) {
          result.push({
            type: 'connector',
            id: `conn-${i}`,
            x1: p.inner.x,
            y1: p.inner.y,
            x2: p.outer.x,
            y2: p.outer.y,
          });
        }
      });

      // 头部三角形
      const headIdx = 0;
      const headP = points[headIdx];
      const headTip = rotatePoint(
        cx + (radius + 35) * Math.cos(headP.angle + rotRad),
        cy + (radius + 35) * Math.sin(headP.angle + rotRad)
      );

      result.push({
        type: 'head',
        id: 'geo-head',
        points: [headP.outer, headTip, points[(headIdx + 1) % segments].outer],
      });

    } else if (style === 'double') {
      // 双蛇缠绕
      for (let snake = 0; snake < 2; snake++) {
        const phaseOffset = snake * Math.PI;
        const snakeRadius = radius + (snake === 0 ? -8 : 8);

        const bodyPoints = [];
        for (let i = 0; i <= bodySegments; i++) {
          const t = i / bodySegments;
          const angle = t * Math.PI * 2 - Math.PI / 2 + phaseOffset;
          const width = getBodyWidth(t) * 0.7;

          bodyPoints.push({
            x: cx + snakeRadius * Math.cos(angle),
            y: cy + snakeRadius * Math.sin(angle),
            angle,
            width,
          });
        }

        // 生成路径
        const outerPath = [];
        const innerPath = [];

        bodyPoints.forEach((p) => {
          const perpAngle = p.angle + Math.PI / 2;
          const halfWidth = p.width / 2;

          outerPath.push(rotatePoint(
            p.x + halfWidth * Math.cos(perpAngle),
            p.y + halfWidth * Math.sin(perpAngle)
          ));

          innerPath.unshift(rotatePoint(
            p.x - halfWidth * Math.cos(perpAngle),
            p.y - halfWidth * Math.sin(perpAngle)
          ));
        });

        let bodyPath = 'M ';
        outerPath.forEach((p, i) => {
          bodyPath += `${p.x} ${p.y} ${i < outerPath.length - 1 ? 'L ' : ''}`;
        });
        innerPath.forEach((p) => {
          bodyPath += `L ${p.x} ${p.y} `;
        });
        bodyPath += 'Z';

        result.push({
          type: 'body',
          id: `snake-${snake}-body`,
          d: bodyPath,
          snake,
        });
      }
    }

    return result;
  }, [style, bodySegments, headSize, bodyTaper, scales, rotation]);

  const color = colors[0] || '#1a1a1a';

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="ouroborosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
        <radialGradient id="scaleGrad" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </radialGradient>
      </defs>
      <g {...strokeProps}>
        {elements.map((el) => {
          if (el.type === 'body') {
            return (
              <path
                key={el.id}
                d={el.d}
                fill="url(#ouroborosGrad)"
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={el.snake === 1 ? 0.7 : 1}
              />
            );
          } else if (el.type === 'eye') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill={color}
              />
            );
          } else if (el.type === 'horn') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2}
                y2={el.y2}
                stroke={color}
                strokeWidth={strokeWidth * 2}
              />
            );
          } else if (el.type === 'scale') {
            return (
              <circle
                key={el.id}
                cx={el.cx}
                cy={el.cy}
                r={el.r}
                fill="url(#scaleGrad)"
                stroke={color}
                strokeWidth={strokeWidth * 0.5}
                opacity={0.6}
              />
            );
          } else if (el.type === 'polygon') {
            return (
              <path
                key={el.id}
                d={el.d}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
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
                strokeWidth={strokeWidth * 0.5}
                opacity={0.5}
              />
            );
          } else if (el.type === 'head') {
            const d = `M ${el.points.map(p => `${p.x} ${p.y}`).join(' L ')} Z`;
            return (
              <path
                key={el.id}
                d={d}
                fill={color}
                stroke={color}
                strokeWidth={strokeWidth}
                opacity={0.8}
              />
            );
          }
          return null;
        })}
      </g>
    </svg>
  );
};

export default OuroborosLogo;
