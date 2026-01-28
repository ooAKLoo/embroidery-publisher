export default function EditorCanvas({ config, centerImage, centerAspect, items }) {
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const hexToRgb = (hex) => {
    if (!hex || typeof hex !== 'string') {
      return { r: 120, g: 130, b: 150 };
    }
    const normalized = hex.replace('#', '').trim();
    if (normalized.length === 3) {
      const r = parseInt(normalized[0] + normalized[0], 16);
      const g = parseInt(normalized[1] + normalized[1], 16);
      const b = parseInt(normalized[2] + normalized[2], 16);
      return { r, g, b };
    }
    if (normalized.length === 6) {
      const r = parseInt(normalized.slice(0, 2), 16);
      const g = parseInt(normalized.slice(2, 4), 16);
      const b = parseInt(normalized.slice(4, 6), 16);
      return { r, g, b };
    }
    return { r: 120, g: 130, b: 150 };
  };

  const toRgba = (hex, opacity) => {
    const { r, g, b } = hexToRgb(hex);
    const safeOpacity = clamp(opacity ?? 0.2, 0, 1);
    return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
  };

  const toRgbaFromRgb = ({ r, g, b }, opacity) => {
    const safeOpacity = clamp(opacity ?? 0.2, 0, 1);
    return `rgba(${r}, ${g}, ${b}, ${safeOpacity})`;
  };

  const rgbToHsl = (r, g, b) => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;
    let h = 0;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    if (delta !== 0) {
      if (max === rn) {
        h = ((gn - bn) / delta) % 6;
      } else if (max === gn) {
        h = (bn - rn) / delta + 2;
      } else {
        h = (rn - gn) / delta + 4;
      }
      h *= 60;
      if (h < 0) h += 360;
    }

    return { h, s, l };
  };

  const hslToRgb = (h, s, l) => {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let rn = 0;
    let gn = 0;
    let bn = 0;

    if (h >= 0 && h < 60) {
      rn = c;
      gn = x;
    } else if (h >= 60 && h < 120) {
      rn = x;
      gn = c;
    } else if (h >= 120 && h < 180) {
      gn = c;
      bn = x;
    } else if (h >= 180 && h < 240) {
      gn = x;
      bn = c;
    } else if (h >= 240 && h < 300) {
      rn = x;
      bn = c;
    } else {
      rn = c;
      bn = x;
    }

    return {
      r: Math.round((rn + m) * 255),
      g: Math.round((gn + m) * 255),
      b: Math.round((bn + m) * 255)
    };
  };

  const deriveShadowRgb = (hex) => {
    const { r, g, b } = hexToRgb(hex);
    const { h, s, l } = rgbToHsl(r, g, b);
    const shadowL = clamp(l * 0.42, 0, 0.45);
    const shadowS = clamp(s * 0.6, 0, 0.7);
    return hslToRgb(h, shadowS, shadowL);
  };

  const containerStyle = {
    perspective: `${config.perspective}px`,
    perspectiveOrigin: '50% 50%'
  };

  const centerImgSrc = centerImage || 'https://picsum.photos/id/2/400/800';
  const safeAspect = centerAspect && centerAspect > 0 ? centerAspect : 0.5;
  const maxWidth = 360;
  const maxHeight = 520;
  const frameWidth =
    safeAspect >= maxWidth / maxHeight ? maxWidth : maxHeight * safeAspect;
  const frameHeight =
    safeAspect >= maxWidth / maxHeight ? maxWidth / safeAspect : maxHeight;
  const heroBorderWidth = clamp(config.heroBorderWidth ?? 1, 0, 10);
  const heroBorderOpacity = clamp(config.heroBorderOpacity ?? 0.6, 0, 1);
  const heroDropDistance = clamp(config.heroDropDistance ?? 26, 0, 80);
  const heroDropStrength = clamp(config.heroDropStrength ?? 0.6, 0, 1);
  const heroInnerStrength = clamp(config.heroInnerStrength ?? 0.18, 0, 1);
  const shadowRgb = deriveShadowRgb(config.heroBorderColor ?? '#e2e8f0');

  const dropOpacityBase = clamp(0.12 + heroBorderWidth * 0.04, 0.08, 0.45);
  const dropOpacity = clamp(dropOpacityBase * heroDropStrength, 0, 0.5);
  const dropBlur = Math.round(heroDropDistance * 2.4 + heroBorderWidth * 3);
  const dropSpread = Math.round(Math.max(0, heroBorderWidth * 0.35 - 0.5));

  const innerOpacityBase = clamp(0.08 + heroBorderWidth * 0.03, 0.05, 0.28);
  const innerOpacity = clamp(innerOpacityBase * heroInnerStrength, 0, 0.4);
  const innerBlur = Math.round(10 + heroBorderWidth * 2 + heroDropDistance * 0.2);
  const innerOffset = Math.round(2 + heroBorderWidth * 0.25);
  const shadowLayers = [];

  if (heroDropStrength > 0) {
    shadowLayers.push(
      `${0}px ${heroDropDistance}px ${dropBlur}px ${dropSpread}px ${toRgbaFromRgb(
        shadowRgb,
        dropOpacity
      )}`
    );
  }

  if (heroInnerStrength > 0) {
    shadowLayers.push(
      `inset 0 ${innerOffset}px ${innerBlur}px 0 ${toRgbaFromRgb(
        shadowRgb,
        innerOpacity
      )}`
    );
  }

  const heroFrameStyle = {
    borderStyle: heroBorderWidth > 0 ? 'solid' : 'none',
    borderWidth: heroBorderWidth ? `${heroBorderWidth}px` : undefined,
    borderColor: toRgba(config.heroBorderColor ?? '#e2e8f0', heroBorderOpacity),
    boxShadow: shadowLayers.length > 0 ? shadowLayers.join(', ') : 'none'
  };

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden relative select-none bg-[#eef0f3]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.9),_rgba(238,240,243,1)_55%,_rgba(227,230,236,1)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.6),_rgba(255,255,255,0)_65%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(255,255,255,0.6),_rgba(255,255,255,0))]" />
      </div>

      <svg
        className="absolute inset-0 pointer-events-none opacity-50"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(120,130,150,0.18)" strokeWidth="0.4" strokeDasharray="1 2" />
        <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(120,130,150,0.16)" strokeWidth="0.35" strokeDasharray="1.2 2.4" />
        <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(120,130,150,0.12)" strokeWidth="0.3" strokeDasharray="1.4 2.8" />
      </svg>

      <div
        style={containerStyle}
        className="relative w-full h-full"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-0 h-0" style={{ transformStyle: 'preserve-3d' }}>
            {config.showGuides && (
              <svg
                className="absolute top-0 left-0 overflow-visible opacity-20 pointer-events-none"
                style={{ transform: 'translate(-50%, -50%)', width: '1px', height: '1px' }}
              >
                {items.map((item) => (
                  <line
                    key={`line-${item.id}`}
                    x1={0}
                    y1={0}
                    x2={item.x}
                    y2={item.y}
                    stroke="#000"
                    strokeWidth="1"
                    strokeDasharray="5,5"
                  />
                ))}
              </svg>
            )}

            {items.map((item) => {
              const dist = Math.sqrt(item.x * item.x + item.y * item.y + item.z * item.z);
              const blurAmount = Math.min((dist / config.spreadRadius) * config.blurStrength, 10);
              const opacity = 1 - (Math.abs(item.z) / (config.spreadRadius * 2)) * 0.3;

              const itemStyle = {
                transform: `
                  translate3d(${item.x}px, ${item.y}px, ${item.z}px)
                  rotateX(${item.rotateX}deg)
                  rotateY(${item.rotateY}deg)
                  rotateZ(${item.rotateZ}deg)
                  scale(${item.scale * config.itemScaleBase})
                `,
                filter: `blur(${blurAmount}px)`,
                opacity: Math.max(0.4, opacity),
                zIndex: Math.floor(item.z)
              };

              return (
                <div
                  key={item.id}
                  className="absolute top-1/2 left-1/2 w-48 h-72 -ml-24 -mt-36 bg-white rounded-2xl shadow-[0_20px_50px_rgba(60,70,90,0.18)] overflow-hidden transition-all duration-700 ease-out border border-white/60"
                  style={itemStyle}
                >
                  <img src={item.src} alt="" className="w-full h-full object-cover" draggable={false} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-transparent to-white/10 pointer-events-none" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/40 pointer-events-none" />
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="absolute top-1/2 left-1/2 z-50 overflow-hidden transition-transform duration-300 rounded-2xl bg-white"
          style={{
            width: `${frameWidth}px`,
            height: `${frameHeight}px`,
            marginLeft: `${-frameWidth / 2}px`,
            marginTop: `${-frameHeight / 2}px`,
            transform: `scale(${config.centerScale})`,
            ...heroFrameStyle
          }}
        >
          <img
            src={centerImgSrc}
            alt="Center"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
