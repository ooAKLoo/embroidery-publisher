import { ShapeType, PaletteType } from "../constants";

// 角度转弧度
const toRad = (deg) => (deg * Math.PI) / 180;

// 点绕中心旋转
const rotatePoint = (p, c, angleRad) => {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  const dx = p.x - c.x;
  const dy = p.y - c.y;
  return {
    x: c.x + (dx * cos - dy * sin),
    y: c.y + (dx * sin + dy * cos),
  };
};

// 点相对中心缩放
const scalePoint = (p, c, s) => {
  return {
    x: c.x + (p.x - c.x) * s,
    y: c.y + (p.y - c.y) * s,
  };
};

// 生成基础形状点集
const getBaseShape = (type, size) => {
  const points = [];
  switch (type) {
    case ShapeType.SQUARE:
      points.push({ x: -size, y: -size });
      points.push({ x: size, y: -size });
      points.push({ x: size, y: size });
      points.push({ x: -size, y: size });
      break;
    case ShapeType.TRIANGLE:
      for (let i = 0; i < 3; i++) {
        const angle = toRad(30 + i * 120);
        points.push({
          x: size * 1.5 * Math.cos(angle),
          y: size * 1.5 * Math.sin(angle),
        });
      }
      break;
    case ShapeType.HEXAGON:
      for (let i = 0; i < 6; i++) {
        const angle = toRad(i * 60);
        points.push({
          x: size * Math.cos(angle),
          y: size * Math.sin(angle),
        });
      }
      break;
    case ShapeType.CIRCLE:
      for (let i = 0; i < 32; i++) {
        const angle = toRad(i * (360 / 32));
        points.push({
          x: size * Math.cos(angle),
          y: size * Math.sin(angle),
        });
      }
      break;
    default:
      break;
  }
  return points;
};

// 点集转 SVG 路径（带圆角）
const pointsToPath = (points, radius, closed = true) => {
  if (points.length < 3) return "";
  
  if (radius <= 0.5) {
    return `M ${points[0].x},${points[0].y} ` + 
           points.slice(1).map(p => `L ${p.x},${p.y}`).join(" ") + 
           (closed ? " Z" : "");
  }

  let d = "";
  const len = points.length;

  for (let i = 0; i < len; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % len];
    const pPrev = points[(i - 1 + len) % len];

    const v1 = { x: p1.x - pPrev.x, y: p1.y - pPrev.y };
    const len1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    
    const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const len2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    const r = Math.min(radius, len1 / 2, len2 / 2);

    const u1 = { x: v1.x / len1, y: v1.y / len1 };
    const u2 = { x: v2.x / len2, y: v2.y / len2 };

    const arcStart = { x: p1.x - u1.x * r, y: p1.y - u1.y * r };
    const arcEnd = { x: p1.x + u2.x * r, y: p1.y + u2.y * r };

    if (i === 0) {
      d += `M ${arcStart.x},${arcStart.y} `;
    } else {
      d += `L ${arcStart.x},${arcStart.y} `;
    }
    
    d += `Q ${p1.x},${p1.y} ${arcEnd.x},${arcEnd.y} `;
  }

  if (closed) d += "Z";
  return d;
};

// 色彩插值函数
const interpolateColor = (color1, color2, t) => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// 多色渐变插值
const interpolateMultiColor = (colors, t) => {
  if (t <= 0) return colors[0];
  if (t >= 1) return colors[colors.length - 1];
  
  const totalSegments = colors.length - 1;
  const scaledT = t * totalSegments;
  const segmentIndex = Math.floor(scaledT);
  const localT = scaledT - segmentIndex;
  
  return interpolateColor(colors[segmentIndex], colors[Math.min(segmentIndex + 1, colors.length - 1)], localT);
};

// 获取色板颜色
const getColor = (config, normalizedIndex) => {
  const palettes = {
    [PaletteType.NEON_SUNSET]: ['#0d0221', '#190835', '#271149', '#501f5c', '#802e5f', '#b63d5b', '#e04d50', '#fd6939', '#fd8e2c', '#feb41c'],
    [PaletteType.CYBER_BLUE]: ['#00f2ea', '#00d4e8', '#00b6e5', '#0098e3', '#007be0', '#3060df', '#6045de', '#902adc', '#c00fdb', '#ff0050'],
    [PaletteType.ACID_GREEN]: ['#ccff00', '#a8e800', '#84d100', '#60ba00', '#3ca300', '#188c00', '#007500', '#00611a', '#004d33', '#0022ff'],
    [PaletteType.HEATMAP]: ['#30123b', '#4662d7', '#35aaf8', '#1be5b5', '#72f95c', '#c8ef34', '#faba39', '#f66b19', '#ca2a04', '#7a0403'],
    [PaletteType.MONOCHROME]: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040', '#333333'],
  };
  
  const colors = palettes[config.palette] || palettes[PaletteType.NEON_SUNSET];
  return interpolateMultiColor(colors, normalizedIndex);
};

// 生成图层
export const generateLayers = (config, width, height) => {
  const layers = [];
  const centerX = width / 2;
  const centerY = height / 2;
  
  const baseSize = Math.min(width, height) * 0.4;
  
  const pivot = {
    x: centerX + config.pivotOffsetX,
    y: centerY + config.pivotOffsetY,
  };

  let currentPoints = getBaseShape(config.shape, baseSize).map(p => ({
    x: p.x + centerX,
    y: p.y + centerY
  }));

  for (let k = 0; k < config.iterations; k++) {
    const currentScaleAccumulated = Math.pow(config.scale, k);
    const effectiveRadius = config.cornerRadius * currentScaleAccumulated;

    const pathData = pointsToPath(currentPoints, effectiveRadius);
    
    const normalized = k / (config.iterations - 1 || 1);
    const color = getColor(config, normalized);

    layers.push({
      id: k,
      pathData,
      color,
      strokeWidth: Math.max(1, config.strokeWidth * currentScaleAccumulated),
      opacity: 1,
    });

    const rotRad = toRad(config.rotation);
    
    currentPoints = currentPoints.map(p => {
      let tp = rotatePoint(p, pivot, rotRad);
      tp = scalePoint(tp, pivot, config.scale);
      return tp;
    });
  }

  return layers;
};
