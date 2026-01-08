import { useMemo } from 'react';
import { rotateX, rotateY, rotateZ } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';

/**
 * 嵌套立方体 Logo
 * 大小不同的立方体同心嵌套，产生层次感和深度感
 */
const NestedCubesLogo = ({
  layers = 3,                    // 嵌套层数
  layerScale = 0.6,              // 每层缩放比例
  layerRotation = 15,            // 每层额外旋转角度
  styleType = 'line',            // 'line' | 'solid'
  rotationX: rx = 0.5,
  rotationY: ry = 0.4,
  rotationZ: rz = 0.1,
  scale = 80,
  strokeWidth = 2,
  colors = ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('nestedcubes', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);

  // 立方体顶点定义
  const cubeVertices = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
  ];

  // 立方体边定义
  const cubeEdges = [
    [0, 1], [1, 2], [2, 3], [3, 0], // 底面
    [4, 5], [5, 6], [6, 7], [7, 4], // 顶面
    [0, 4], [1, 5], [2, 6], [3, 7]  // 连接边
  ];

  // 立方体面定义 (索引对应 cubeVertices)
  const cubeFaces = [
      [0, 1, 2, 3], // Back
      [4, 5, 6, 7], // Front
      [0, 1, 5, 4], // Bottom
      [2, 3, 7, 6], // Top
      [0, 3, 7, 4], // Left
      [1, 2, 6, 5]  // Right
  ];

  const renderedElements = useMemo(() => {
    const elements = [];

    for (let layer = 0; layer < layers; layer++) {
      const currentScale = scale * Math.pow(layerScale, layer);
      const extraRotation = (layer * layerRotation * Math.PI) / 180;

      // 变换顶点
      const transformedVertices = cubeVertices.map(v => {
        let r = [...v];
        // 应用额外的层旋转
        r = rotateZ(r, extraRotation);
        // 应用主旋转
        r = rotateX(r, rx);
        r = rotateY(r, ry);
        r = rotateZ(r, rz);
        return r;
      });

      // 投影并添加深度信息
      const projected = transformedVertices.map(v => ({
        x: 150 + v[0] * currentScale,
        y: 150 + v[1] * currentScale,
        z: v[2]
      }));

      if (styleType === 'solid') {
          // 生成面
          cubeFaces.forEach(faceIndices => {
              const faceVerts = faceIndices.map(i => transformedVertices[i]);
              const projVerts = faceIndices.map(i => projected[i]);
              
              let zSum = 0;
              faceVerts.forEach(v => zSum += v[2]);
              const depth = zSum / faceVerts.length;
              
              const d = 'M ' + projVerts.map(p => `${p.x},${p.y}`).join(' L ') + ' Z';
              
              elements.push({
                  type: 'face',
                  d,
                  depth,
                  layer
              });
          });
      } else {
          // 生成边
          cubeEdges.forEach(([i, j]) => {
            elements.push({
              type: 'line',
              from: projected[i],
              to: projected[j],
              depth: (transformedVertices[i][2] + transformedVertices[j][2]) / 2,
              layer,
              opacity: 1 - (layer * 0.2)
            });
          });
      }
    }

    // 按深度排序 (Painter's Algorithm)
    elements.sort((a, b) => a.depth - b.depth);
    return elements;
  }, [layers, layerScale, layerRotation, rx, ry, rz, scale, styleType]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g stroke={styleType === 'line' ? getStroke(gradientId, colors) : 'none'} 
         strokeWidth={strokeWidth} 
         fill="none" 
         strokeLinecap="round"
         strokeLinejoin="round"
         {...strokeProps}
      >
        {renderedElements.map((el, i) => {
            if (el.type === 'line') {
                return (
                  <line
                    key={i}
                    x1={el.from.x}
                    y1={el.from.y}
                    x2={el.to.x}
                    y2={el.to.y}
                    opacity={(0.4 + (el.depth + 1) * 0.3) * el.opacity}
                  />
                );
            } else {
                // Solid mode
                // Use color based on layer
                const colorIdx = el.layer % colors.length;
                const baseColor = colors[colorIdx];
                const opacity = 0.5 + (el.depth + 1) * 0.25;
                const clampedOpacity = Math.max(0.2, Math.min(0.9, opacity));

                return (
                    <path 
                        key={i} 
                        d={el.d} 
                        fill={baseColor} 
                        fillOpacity={clampedOpacity}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={1}
                    />
                );
            }
        })}
      </g>
    </svg>
  );
};

export default NestedCubesLogo;
