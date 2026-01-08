import { useMemo } from 'react';
import { rotateX, rotateY, rotateZ } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

/**
 * 星形多面体 Logo
 * 正多面体的每个面向外延伸形成尖角，产生锐利、能量感的视觉效果
 */
const StellatedPolyhedronLogo = ({
  baseShape = 'icosahedron',     // 基础形状: tetrahedron, octahedron, icosahedron
  stellationDepth = 1.5,         // 星形化深度（尖角突出程度）
  showBase = true,               // 显示基础多面体 (线框模式下)
  styleType = 'line',            // 'line' | 'solid'
  rotationX: rx = 0.5,
  rotationY: ry = 0.4,
  rotationZ: rz = 0,
  scale = 70,
  strokeWidth = 2,
  colors = ['#f59e0b', '#ef4444', '#ec4899'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('stellated', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  // 基础多面体数据
  const SHAPES = {
    tetrahedron: {
      vertices: [
        [1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]
      ],
      faces: [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]],
      edges: [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]]
    },
    octahedron: {
      vertices: [
        [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]
      ],
      faces: [
        [0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2],
        [1, 2, 4], [1, 4, 3], [1, 3, 5], [1, 5, 2]
      ],
      edges: [[0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [2, 5], [3, 4], [3, 5]]
    },
    icosahedron: {
      vertices: (() => {
        const phi = (1 + Math.sqrt(5)) / 2;
        return [
          [0, 1, phi], [0, -1, phi], [0, 1, -phi], [0, -1, -phi],
          [1, phi, 0], [-1, phi, 0], [1, -phi, 0], [-1, -phi, 0],
          [phi, 0, 1], [-phi, 0, 1], [phi, 0, -1], [-phi, 0, -1]
        ];
      })(),
      faces: [
        [0, 1, 8], [0, 8, 4], [0, 4, 5], [0, 5, 9], [0, 9, 1],
        [1, 6, 8], [8, 6, 10], [8, 10, 4], [4, 10, 2], [4, 2, 5],
        [5, 2, 11], [5, 11, 9], [9, 11, 7], [9, 7, 1], [1, 7, 6],
        [3, 6, 7], [3, 7, 11], [3, 11, 2], [3, 2, 10], [3, 10, 6]
      ],
      edges: [
        [0, 1], [0, 4], [0, 5], [0, 8], [0, 9],
        [1, 6], [1, 7], [1, 8], [1, 9],
        [2, 3], [2, 4], [2, 5], [2, 10], [2, 11],
        [3, 6], [3, 7], [3, 10], [3, 11],
        [4, 5], [4, 8], [4, 10],
        [5, 9], [5, 11],
        [6, 7], [6, 8], [6, 10],
        [7, 9], [7, 11],
        [8, 10], [9, 11]
      ]
    }
  };

  const renderedElements = useMemo(() => {
    const shape = SHAPES[baseShape];
    const { vertices, faces, edges } = shape;

    // 归一化顶点
    const maxDist = Math.max(...vertices.map(v => Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2)));
    const normalizedVertices = vertices.map(v => v.map(c => c / maxDist));

    // 生成星形顶点和面/边
    const allVertices = [...normalizedVertices];
    const starFaces = []; // 存储三角形面 [p, v1, v2]
    const starEdges = showBase ? edges.map(e => ({indices: e, isBase: true})) : [];

    faces.forEach((face) => {
      // 计算面中心
      const center = [0, 0, 0];
      face.forEach(vi => {
        center[0] += normalizedVertices[vi][0];
        center[1] += normalizedVertices[vi][1];
        center[2] += normalizedVertices[vi][2];
      });
      center[0] /= face.length;
      center[1] /= face.length;
      center[2] /= face.length;

      // 计算法向量
      const len = Math.sqrt(center[0]**2 + center[1]**2 + center[2]**2);
      const normal = center.map(c => c / len);

      // 星形尖点
      const starVertex = [
        center[0] + normal[0] * stellationDepth,
        center[1] + normal[1] * stellationDepth,
        center[2] + normal[2] * stellationDepth
      ];
      
      const starIdx = allVertices.length;
      allVertices.push(starVertex);

      // 构建几何元素
      // 对面的每条边 (vi, v_next), 构建三角形 (starIdx, vi, v_next)
      // 注意: face 顶点顺序应该是逆时针或顺时针
      for(let i=0; i<face.length; i++) {
          const v1 = face[i];
          const v2 = face[(i+1)%face.length];
          
          starFaces.push([starIdx, v1, v2]);
          starEdges.push({indices: [starIdx, v1], isBase: false});
      }
    });

    // 旋转所有顶点
    const rotatedVertices = allVertices.map(v => {
      let r = [...v];
      r = rotateX(r, rx);
      r = rotateY(r, ry);
      r = rotateZ(r, rz);
      return r;
    });

    // 投影
    const projectedVertices = rotatedVertices.map(v => ({
      x: 150 + v[0] * scale,
      y: 150 + v[1] * scale,
      z: v[2]
    }));

    if (styleType === 'solid') {
        const faceElements = starFaces.map(faceIndices => {
             const faceVerts = faceIndices.map(i => rotatedVertices[i]);
             const projVerts = faceIndices.map(i => projectedVertices[i]);
             
             let zSum = 0;
             faceVerts.forEach(v => zSum += v[2]);
             const depth = zSum / faceVerts.length;
             
             const d = 'M ' + projVerts.map(p => `${p.x},${p.y}`).join(' L ') + ' Z';
             return { type: 'face', d, depth };
        });
        
        faceElements.sort((a,b) => a.depth - b.depth);
        return faceElements;
    } else {
        const lineElements = starEdges.map(e => {
            const [i, j] = e.indices;
            return {
                type: 'line',
                from: projectedVertices[i],
                to: projectedVertices[j],
                depth: (rotatedVertices[i][2] + rotatedVertices[j][2]) / 2,
                isBase: e.isBase
            };
        });
        
        lineElements.sort((a,b) => a.depth - b.depth);
        return lineElements;
    }
  }, [baseShape, stellationDepth, showBase, rx, ry, rz, scale, styleType]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g strokeLinecap="round" strokeLinejoin="round">
        {renderedElements.map((el, i) => {
            if (el.type === 'line') {
                return (
                  <line
                    key={i}
                    x1={el.from.x}
                    y1={el.from.y}
                    x2={el.to.x}
                    y2={el.to.y}
                    {...renderProps}
                    stroke={renderProps.stroke === 'none' ? renderProps.fill : renderProps.stroke}
                    opacity={0.4 + (el.depth + 1) * 0.3}
                  />
                );
            } else {
                // Solid mode
                const opacity = 0.6 + (el.depth + 1.2) * 0.25;
                const clampedOpacity = Math.max(0.3, Math.min(0.95, opacity));
                return (
                    <path
                        key={i}
                        d={el.d}
                        fill={colors[i % colors.length]}
                        fillOpacity={clampedOpacity}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth={0.5}
                    />
                );
            }
        })}
      </g>
    </svg>
  );
};

export default StellatedPolyhedronLogo;
