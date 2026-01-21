import { useMemo } from 'react';
import { generateLayers } from './utils/geometry';

// 生成噪点背景
const generateNoiseDataUri = (opacity) => {
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
      <filter id='noise'>
        <feTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/>
      </filter>
      <rect width='100%' height='100%' filter='url(#noise)' opacity='${opacity}'/>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

function Artboard({ config, width = 800, height = 800 }) {
  const layers = useMemo(() => generateLayers(config, width, height), [config, width, height]);

  // 导出处理
  const handleDownload = (format) => {
    const svgEl = document.getElementById('neongeo-svg');
    if (!svgEl) return;

    if (format === 'svg') {
      const data = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `neongeo-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const data = new XMLSerializer().serializeToString(svgEl);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#050505';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0);
          const pngUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = pngUrl;
          link.download = `neongeo-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(data);
    }
  };

  return (
    <div className="relative group w-full h-full flex items-center justify-center bg-[#0a0a0a] overflow-hidden rounded-lg shadow-2xl border border-gray-800">
      {/* 噪点层 */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
        style={{ 
          backgroundImage: `url("${generateNoiseDataUri(config.noiseOpacity)}")`,
          opacity: 1 
        }}
      />
      
      {/* 渐晕 */}
      <div 
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(circle, transparent 30%, rgba(0,0,0,0.8) 100%)'
        }}
      />

      {/* 主 SVG */}
      <svg
        id="neongeo-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="max-w-full max-h-full transition-all duration-300 ease-out"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* 辉光滤镜 */}
          <filter id="glow-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          {/* 霓虹光晕 */}
          <filter id="neon-bloom" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur2" />
            <feComposite in="blur1" in2="SourceGraphic" operator="over" result="comp1"/>
            <feComposite in="blur2" in2="comp1" operator="over" result="comp2"/>
          </filter>
        </defs>

        {/* 背景 */}
        <rect width={width} height={height} fill="#050505" />

        {/* 渲染图层 - 外发光 */}
        <g filter={config.glowStrength > 0.1 ? "url(#neon-bloom)" : ""}>
          {layers.map((layer) => (
            <path
              key={layer.id}
              d={layer.pathData}
              fill="none"
              stroke={layer.color}
              strokeWidth={layer.strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.3 + (config.glowStrength * 0.5)}
              style={{ mixBlendMode: 'screen' }}
            />
          ))}
        </g>
        
        {/* 核心线条 */}
        <g>
          {layers.map((layer) => (
            <path
              key={`core-${layer.id}`}
              d={layer.pathData}
              fill="none"
              stroke={layer.color}
              strokeWidth={layer.strokeWidth * 0.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={1}
            />
          ))}
        </g>
      </svg>

      {/* 导出按钮 */}
      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
        <button 
          onClick={() => handleDownload('svg')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10 font-medium"
        >
          SVG
        </button>
        <button 
          onClick={() => handleDownload('png')}
          className="bg-white/10 hover:bg-white/20 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/10 font-medium"
        >
          PNG
        </button>
      </div>
    </div>
  );
}

export default Artboard;
