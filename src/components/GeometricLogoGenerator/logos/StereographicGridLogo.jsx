import { useMemo } from 'react';
import { rotateX, rotateY, rotateZ } from '../utils/math';
import { GradientDefs, generateGradientId, getStroke } from '../utils/gradient';
import { getRenderProps } from '../constants/commonStyles';

/**
 * 球极投影网格 Logo
 * 球面网格的投影，产生全球化、网络、连接的视觉效果
 */
const StereographicGridLogo = ({
  latitudeLines = 6,             // 纬线数量
  longitudeLines = 12,           // 经线数量
  gridStyle = 'full',            // 网格样式: full, hemisphere, quarter
  showEquator = true,            // 强调赤道线
  styleType = 'line',            // 'line' | 'solid'
  rotationX: rx = 0.3,
  rotationY: ry = 0.2,
  rotationZ: rz = 0,
  scale = 90,
  strokeWidth = 2,
  colors = ['#3b82f6', '#06b6d4', '#10b981'],
  commonStyles = {}
}) => {
  const gradientId = generateGradientId('stereographic', colors);
  const stroke = getStroke(gradientId, colors);
  const renderProps = getRenderProps(commonStyles, stroke, strokeWidth);

  // 生成网格顶点数据
  const gridData = useMemo(() => {
    // 顶点网格: vertices[lat][lon]
    const vertices = [];
    const quads = [];
    const lines = [];

    // 0. 生成所有顶点
    // lat from 0 (pole) to pi (pole)
    // gridStyle affects range
    let startPhi = 0.1; // avoid singularity at pole slightly
    let endPhi = Math.PI - 0.1;
    
    if (gridStyle === 'hemisphere') endPhi = Math.PI / 2;
    if (gridStyle === 'quarter') {
        startPhi = 0; 
        endPhi = Math.PI / 2;
    }

    const latCount = latitudeLines + 1; // intervals -> lines
    const lonCount = longitudeLines; 

    // 生成顶点矩阵
    for (let i = 0; i <= latCount; i++) {
        const phi = startPhi + (i / latCount) * (endPhi - startPhi);
        const latRow = [];
        
        // Longitude: 0 to 2PI
        // quarter: 0 to PI/2? Usually projection assumes full sphere rotation
        // Let's assume full longitude for sphere/hemisphere, quarter implies geometry clip?
        // Description says "Stereographic Grid", usually full sphere.
        // If quarter, we clip lon? Let's assume full lon for now unless style implies otherwise.
        
        for (let j = 0; j < lonCount; j++) {
            const theta = (j / lonCount) * 2 * Math.PI;
            
            // Sphere coords
             const x = Math.sin(phi) * Math.cos(theta);
             const y = Math.sin(phi) * Math.sin(theta);
             const z = Math.cos(phi);
             
             latRow.push([x,y,z]);
        }
        vertices.push(latRow);
    }
    
    // 1. 生成面 (Quads)
    for (let i = 0; i < latCount; i++) {
        for (let j = 0; j < lonCount; j++) {
            const v1 = vertices[i][j];
            const v2 = vertices[i][(j + 1) % lonCount];
            const v3 = vertices[i + 1] ? vertices[i + 1][(j + 1) % lonCount] : null;
            const v4 = vertices[i + 1] ? vertices[i + 1][j] : null;

            if (v1 && v2 && v3 && v4) {
                 quads.push([v1, v2, v3, v4]);
            }
        }
    }
    
    // 2. 生成线 (Lat/Lon lines)
    // 简化: 复用 quads 的边或重新生成高精度线
    // 这里为了 solid/line 切换，如果 mode=line，我们需要高精度曲线
    // 如果 mode=solid，quads 足够
    // 我们保留原有逻辑用于 line 模式的高精度渲染? 
    // 或者统一使用 quad 边缘? quad 边缘是直的， sphere lines are curved.
    // 若要 curved lines, need more segments per cell.
    // 简单起见，solid 模式下 grid 也是 straight edges of quads.
    // 用户看重 visual effect.
    
    // Line mode: high-res lines from previous logic?
    // Let's stick to quads for structure to ensure fill matches stroke.
    // But curved lines look better. 
    // Compromise: solid mode uses quads (flat approx), line mode uses high res.
    
    // Line generation (High Res) for Line Mode
    // ... (Old logic handles this well).
    // Let's bring back old logic for lines if styleType == line.
    
    return { quads, vertices };
  }, [latitudeLines, longitudeLines, gridStyle]);

  // 高精度线逻辑 (仅用于 Line 模式)
  const highResLines = useMemo(() => {
      if (styleType === 'solid') return [];
      const segments = 36;
      const lines = [];

      // Lats
      for (let lat = 1; lat < latitudeLines; lat++) {
         const phi = (lat/latitudeLines) * Math.PI;
         if (gridStyle === 'hemisphere' && Math.cos(phi) < 0) continue;
         const r = Math.sin(phi);
         const z = Math.cos(phi);
         const pts = [];
         for(let i=0; i<=segments; i++){
             const th = (i/segments)*2*Math.PI;
             pts.push([r*Math.cos(th), r*Math.sin(th), z]);
         }
         lines.push({points: pts, isEquator: Math.abs(phi-Math.PI/2)<0.1});
      }
      
      // Lons
      for (let lon = 0; lon < longitudeLines; lon++) {
          const th = (lon/longitudeLines)*2*Math.PI;
          const pts = [];
          const start = 0, end = (gridStyle==='hemisphere'||gridStyle==='quarter')?Math.PI/2 : Math.PI;
          for(let i=0; i<=segments; i++){
              const phi = start + (i/segments)*(end-start);
              pts.push([Math.sin(phi)*Math.cos(th), Math.sin(phi)*Math.sin(th), Math.cos(phi)]);
          }
          lines.push({points: pts, isEquator: false});
      }
      return lines;
  }, [latitudeLines, longitudeLines, gridStyle, styleType]);

  const renderedElements = useMemo(() => {
    // 变换函数
    const transform = (v) => {
        let r = [...v];
        r = rotateX(r, rx);
        r = rotateY(r, ry);
        r = rotateZ(r, rz);
        return {
            x: 150 + r[0] * scale,
            y: 150 + r[1] * scale,
            z: r[2],
            origZ: r[2] // depth
        };
    };

    if (styleType === 'solid') {
        const { quads } = gridData;
        const faces = quads.map(q => {
             const proj = q.map(transform);
             const depth = proj.reduce((sum, p) => sum + p.z, 0) / 4;
             const d = 'M ' + proj.map(p => `${p.x},${p.y}`).join(' L ') + ' Z';
             return { type: 'face', d, depth };
        });
        faces.sort((a,b) => a.depth - b.depth);
        return faces;
    } else {
        const segments = [];
        highResLines.forEach(({points, isEquator}) => {
            const proj = points.map(transform);
            for(let i=0; i<proj.length-1; i++){
                segments.push({
                    type: 'line',
                    from: proj[i],
                    to: proj[i+1],
                    depth: (proj[i].z + proj[i+1].z)/2,
                    isEquator
                });
            }
        });
        segments.sort((a,b) => a.depth - b.depth);
        return segments;
    }
  }, [gridData, highResLines, rx, ry, rz, scale, styleType]);

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <GradientDefs id={gradientId} colors={colors} />
      <g strokeLinecap="round" strokeLinejoin="round">
        {renderedElements.map((el, i) => {
            if (el.type === 'line') {
                const lineStroke = renderProps.stroke === 'none' ? renderProps.fill : renderProps.stroke;
                return (
                  <line
                    key={i}
                    x1={el.from.x}
                    y1={el.from.y}
                    x2={el.to.x}
                    y2={el.to.y}
                    {...renderProps}
                    stroke={lineStroke}
                    strokeWidth={el.isEquator ? strokeWidth * 1.5 : strokeWidth}
                    opacity={0.4 + (el.depth + 1) * 0.3}
                  />
                );
            } else {
                const opacity = 0.5 + (el.depth + 1) * 0.25;
                const clampedOpacity = Math.max(0.1, Math.min(0.9, opacity));
                return (
                    <path
                        key={i}
                        d={el.d}
                        fill={colors[i % colors.length]} // Checkerboard effect? or gradient?
                        // fill={((i%2)) ? colors[0] : colors[1]} // Simple pattern
                        fillOpacity={clampedOpacity}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={0.5}
                    />
                );
            }
        })}
      </g>
    </svg>
  );
};

export default StereographicGridLogo;
