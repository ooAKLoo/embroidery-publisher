import { useMemo } from 'react';
import { getRenderProps, DEFAULT_COMMON_STYLES } from '../constants/commonStyles';

// 螺旋线Logo - 阿基米德螺线、黄金螺旋
const SpiralLogo = ({
  spiralType = 'archimedean',  // 'archimedean' | 'golden' | 'fermat' | 'hyperbolic'
  turns = 5,                   // 圈数
  spacing = 15,                // 间距
  direction = 'outward',       // 'outward' | 'inward'
  rotation = 0,                // 旋转角度
  strokeWidth = 2,
  colors = ['#1a1a1a', '#ffffff'],
  commonStyles = {},
}) => {
  const color = colors[0] || '#1a1a1a';
  const renderProps = getRenderProps(commonStyles, color, strokeWidth);
  const path = useMemo(() => {
    const cx = 150, cy = 150;
    const maxRadius = 115;
    const points = [];
    const segments = turns * 72; // 每圈72个点

    const rotationRad = (rotation * Math.PI) / 180;
    const PHI = (1 + Math.sqrt(5)) / 2; // 黄金比例

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const angle = t * turns * 2 * Math.PI + rotationRad;
      let r;

      switch (spiralType) {
        case 'archimedean':
          // 阿基米德螺线: r = a + b*θ
          r = t * maxRadius;
          break;
        case 'golden':
          // 黄金螺旋: r = a * φ^(θ/90°)
          r = 5 * Math.pow(PHI, (angle - rotationRad) / (Math.PI / 2));
          if (r > maxRadius) r = maxRadius;
          break;
        case 'fermat':
          // 费马螺线: r = a * √θ
          r = Math.sqrt(t) * maxRadius;
          break;
        case 'hyperbolic':
          // 双曲螺线: r = a / θ (从外向内)
          const theta = 0.5 + t * 3;
          r = maxRadius / theta;
          break;
        default:
          r = t * maxRadius;
      }

      if (direction === 'inward') {
        r = maxRadius - r;
        if (r < 0) r = 0;
      }

      points.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      });
    }

    // 生成平滑路径
    if (points.length < 2) return '';

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }

    return d;
  }, [spiralType, turns, spacing, direction, rotation]);

  // 螺旋线使用渐变效果
  const renderMode = commonStyles.renderMode || DEFAULT_COMMON_STYLES.renderMode;
  const fillOpacity = commonStyles.fillOpacity || DEFAULT_COMMON_STYLES.fillOpacity;

  return (
    <svg viewBox="0 0 300 300" className="w-full h-full">
      <defs>
        <linearGradient id="spiralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={direction === 'outward' ? (renderMode === 'fill' ? fillOpacity * 0.2 : 0.2) : (renderMode === 'fill' ? fillOpacity : 1)} />
          <stop offset="100%" stopColor={color} stopOpacity={direction === 'outward' ? (renderMode === 'fill' ? fillOpacity : 1) : (renderMode === 'fill' ? fillOpacity * 0.2 : 0.2)} />
        </linearGradient>
      </defs>
      <path
        d={path}
        stroke="url(#spiralGrad)"
        strokeWidth={renderProps.strokeWidth || strokeWidth}
        strokeLinecap={renderProps.strokeLinecap}
        strokeLinejoin={renderProps.strokeLinejoin}
        fill="none"
      />
    </svg>
  );
};

export default SpiralLogo;
