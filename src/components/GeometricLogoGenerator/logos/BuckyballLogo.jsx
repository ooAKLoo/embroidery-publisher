import { useMemo } from 'react';
import { rotateX, rotateY, rotateZ } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getSvgStrokeProps } from '../constants/commonStyles';
import { PLATONIC_SOLIDS } from '../constants/polyhedra';

/**
 * 巴克球 / 富勒烯 Logo
 * 截角二十面体，由12个五边形和20个六边形组成
 * 经典的足球形状，科技感极强
 */
const BuckyballLogo = ({
  styleType = 'line',            // 'line' | 'solid'
  rotationX: rx = 0.4,
  rotationY: ry = 0.3,
  rotationZ: rz = 0,
  scale = 85,
  strokeWidth = 2,
  colors = ['#0ea5e9', '#6366f1', '#8b5cf6'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('buckyball', colors);
  const strokeProps = getSvgStrokeProps(commonStyles, strokeWidth);

  // 通过截角二十面体构建几何体 (Truncated Icosahedron)
  const geometry = useMemo(() => {
    // 1. 获取正二十面体数据 (手动定义以确保面索引正确)
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawVertices = [
      [0,1,phi], [0,1,-phi], [0,-1,phi], [0,-1,-phi],
      [1,phi,0], [1,-phi,0], [-1,phi,0], [-1,-phi,0],
      [phi,0,1], [phi,0,-1], [-phi,0,1], [-phi,0,-1]
    ];
    // 归一化
    const icoVertices = rawVertices.map(v => {
      const len = Math.sqrt(v[0]**2 + v[1]**2 + v[2]**2);
      return v.map(c => c / len);
    });

    const newVertices = [];
    const pentagonFaces = []; // 来自原顶点
    const hexagonFaces = [];  // 来自原面
    
    // 辅助: 记录每条边上的两个新顶点索引
    const edgeMap = {}; // key: "min_max", value: [idx_near_min, idx_near_max]

    const addVert = (v) => {
      newVertices.push(v);
      return newVertices.length - 1;
    };

    const interpolate = (v1, v2, t) => [
        v1[0] + (v2[0]-v1[0])*t,
        v1[1] + (v2[1]-v1[1])*t,
        v1[2] + (v2[2]-v1[2])*t
    ];

    // 1. 遍历所有可能的边 (距离约为 1.05 * R, 归一化后是定值)
    // 利用几何性质：两个顶点距离 < 1.2
    let vertexCount = 0;
    for(let i=0; i<12; i++) {
        for(let j=i+1; j<12; j++) {
            const distSq = (icoVertices[i][0]-icoVertices[j][0])**2 + 
                           (icoVertices[i][1]-icoVertices[j][1])**2 + 
                           (icoVertices[i][2]-icoVertices[j][2])**2;
            if(distSq > 0.1 && distSq < 1.2) { // 是边
                const v_i = interpolate(icoVertices[i], icoVertices[j], 1/3); 
                const v_j = interpolate(icoVertices[i], icoVertices[j], 2/3);
                
                const idx_i = addVert(v_i);
                const idx_j = addVert(v_j);
                edgeMap[`${i}_${j}`] = [idx_i, idx_j];
            }
        }
    }

    // 2. 生成五边形面 (围绕每个原顶点)
    for(let i=0; i<12; i++) {
        const neighbors = [];
        for(let j=0; j<12; j++) {
            if(i===j) continue;
            const key = i < j ? `${i}_${j}` : `${j}_${i}`;
            if(edgeMap[key]) neighbors.push(j);
        }
        
        // 排序邻居形成五边形
        // 投影到切平面排序
        const center = icoVertices[i];
        // 构造正交基
        let u = [0,0,0];
        if(Math.abs(center[0]) < 0.9) u=[1,0,0]; else u=[0,1,0];
        // u = u - proj_n(u)
        const dot = u[0]*center[0] + u[1]*center[1] + u[2]*center[2];
        u = [u[0]-dot*center[0], u[1]-dot*center[1], u[2]-dot*center[2]];
        const ul = Math.sqrt(u[0]**2+u[1]**2+u[2]**2);
        u = u.map(c=>c/ul);
        const v = [
            center[1]*u[2]-center[2]*u[1],
            center[2]*u[0]-center[0]*u[2],
            center[0]*u[1]-center[1]*u[0]
        ];

        neighbors.sort((a,b) => {
            const va = icoVertices[a], vb = icoVertices[b];
            const angA = Math.atan2(
                (va[0]-center[0])*v[0] + (va[1]-center[1])*v[1] + (va[2]-center[2])*v[2],
                (va[0]-center[0])*u[0] + (va[1]-center[1])*u[1] + (va[2]-center[2])*u[2]
            );
            const angB = Math.atan2(
                (vb[0]-center[0])*v[0] + (vb[1]-center[1])*v[1] + (vb[2]-center[2])*v[2],
                (vb[0]-center[0])*u[0] + (vb[1]-center[1])*u[1] + (vb[2]-center[2])*u[2]
            );
            return angA - angB;
        });

        const faceIndices = neighbors.map(n => {
            const key = i < n ? `${i}_${n}` : `${n}_${i}`;
            const pair = edgeMap[key];
            return (i < n) ? pair[0] : pair[1];
        });
        pentagonFaces.push(faceIndices);
    }

    // 3. 生成六边形面 (寻找三角形面然后转换)
    const processedTris = new Set();
    // 遍历所有三元组寻找三角形
    for(let i=0; i<12; i++) {
        for(let j=i+1; j<12; j++) {
            for(let k=j+1; k<12; k++) {
                const key1 = `${i}_${j}`, key2 = `${j}_${k}`, key3 = i<k?`${i}_${k}`:`${k}_${i}`;
                if(edgeMap[key1] && edgeMap[key2] && edgeMap[key3]) {
                     // 找到三角形 (i,j,k)
                     // 构建六边形顶点: ij(j), jk(j), jk(k), ki(k), ki(i), ij(i) 
                     // 需要顺时针或逆时针排序
                     const triCenter = [
                         (icoVertices[i][0]+icoVertices[j][0]+icoVertices[k][0])/3,
                         (icoVertices[i][1]+icoVertices[j][1]+icoVertices[k][1])/3,
                         (icoVertices[i][2]+icoVertices[j][2]+icoVertices[k][2])/3
                     ];
                     
                     // 收集这三条边上的6个点
                     const pts = [];
                     [key1, key2, key3].forEach(key => {
                         edgeMap[key].forEach(idx => pts.push(idx));
                     });
                     
                     // 排序
                     // 同样构建基座
                     const n = triCenter; // normal
                     const nl = Math.sqrt(n[0]**2+n[1]**2+n[2]**2);
                     const nn = n.map(c=>c/nl);
                     let tu = [0,0,0];
                     if(Math.abs(nn[0])<0.9) tu=[1,0,0]; else tu=[0,1,0];
                     const tdot = tu[0]*nn[0] + tu[1]*nn[1] + tu[2]*nn[2];
                     tu = [tu[0]-tdot*nn[0], tu[1]-tdot*nn[1], tu[2]-tdot*nn[2]];
                     const tul = Math.sqrt(tu[0]**2+tu[1]**2+tu[2]**2);
                     tu = tu.map(c=>c/tul);
                     const tv = [
                         nn[1]*tu[2]-nn[2]*tu[1],
                         nn[2]*tu[0]-nn[0]*tu[2],
                         nn[0]*tu[1]-nn[1]*tu[0]
                     ];
                     
                     pts.sort((a,b) => {
                         const va = newVertices[a], vb = newVertices[b];
                         const angA = Math.atan2(
                             (va[0]-triCenter[0])*tv[0] + (va[1]-triCenter[1])*tv[1] + (va[2]-triCenter[2])*tv[2],
                             (va[0]-triCenter[0])*tu[0] + (va[1]-triCenter[1])*tu[1] + (va[2]-triCenter[2])*tu[2]
                         );
                         const angB = Math.atan2(
                             (vb[0]-triCenter[0])*tv[0] + (vb[1]-triCenter[1])*tv[1] + (vb[2]-triCenter[2])*tv[2],
                             (vb[0]-triCenter[0])*tu[0] + (vb[1]-triCenter[1])*tu[1] + (vb[2]-triCenter[2])*tu[2]
                         );
                         return angA - angB;
                     });
                     
                     hexagonFaces.push(pts);
                }
            }
        }
    }

    return { 
        vertices: newVertices, 
        faces: [...pentagonFaces.map(f=>({indices:f, type:'pent'})), ...hexagonFaces.map(f=>({indices:f, type:'hex'}))] 
    };

  }, []);

  const renderedElements = useMemo(() => {
    const { vertices, faces } = geometry;
    if(!vertices.length) return [];

    // 旋转
    const rotatedVertices = vertices.map(v => {
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
      const faceElements = faces.map(face => {
        const faceVerts = face.indices.map(i => rotatedVertices[i]);
        const projVerts = face.indices.map(i => projectedVertices[i]);
        
        let zSum = 0;
        faceVerts.forEach(v => zSum += v[2]);
        const depth = zSum / faceVerts.length;

        const d = 'M ' + projVerts.map(p => `${p.x},${p.y}`).join(' L ') + ' Z';
        return { type: 'face', d, depth, faceType: face.type };
      });
      
      faceElements.sort((a,b) => a.depth - b.depth);
      return faceElements;
    } else {
      const edgeSet = new Set();
      const lineElements = [];
      
      faces.forEach(face => {
         const idxs = face.indices;
         for(let i=0; i<idxs.length; i++) {
             const u = idxs[i];
             const v = idxs[(i+1)%idxs.length];
             const key = u < v ? `${u}_${v}` : `${v}_${u}`;
             if(!edgeSet.has(key)) {
                 edgeSet.add(key);
                 lineElements.push({
                     type: 'line',
                     from: projectedVertices[u],
                     to: projectedVertices[v],
                     depth: (rotatedVertices[u][2] + rotatedVertices[v][2]) / 2
                 });
             }
         }
      });
      lineElements.sort((a,b) => a.depth - b.depth);
      return lineElements;
    }
  }, [geometry, rx, ry, rz, scale, styleType]);

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
                    <line key={i} x1={el.from.x} y1={el.from.y} x2={el.to.x} y2={el.to.y} 
                          opacity={0.4 + (el.depth + 1) * 0.3} />
                );
            } else {
                const baseColor = el.faceType === 'hex' ? colors[0] : (colors[1] || colors[0]);
                const opacity = 0.6 + (el.depth + 1.2) * 0.25;
                const clampedOpacity = Math.max(0.2, Math.min(0.95, opacity));
                
                return (
                    <path key={i} d={el.d} fill={baseColor} fillOpacity={clampedOpacity}
                          stroke={el.faceType === 'hex' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)'}
                          strokeWidth={strokeWidth * 0.5} />
                );
            }
        })}
      </g>
    </svg>
  );
};

export default BuckyballLogo;
