import { useCallback, useRef, useState } from 'react';
import Controls from './Controls';
import { DEFAULT_CONFIG } from './constants';
import { describeArc, describeRibbon, downloadSVG } from './utils';
import { PreviewToolbar } from '../../shared/icon-export';

function GeometricSpiralGenerator() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [bgColor, setBgColor] = useState('#000000');
  const [iconScale, setIconScale] = useState(0.7);
  const [borderRadius, setBorderRadius] = useState(0.22);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState('');
  const previewRef = useRef(null);

  const handleRandomize = () => {
    const isGradient = Math.random() > 0.4;
    const isRibbon = Math.random() > 0.3;
    const nextArcRadius = Math.floor(Math.random() * 200) + 50;
    const nextArcAngle = Math.floor(Math.random() * 160) + 60;
    setConfig({
      segments: Math.floor(Math.random() * 12) + 3,
      radius: Math.floor(Math.random() * 150) + 30,
      arcRadius: nextArcRadius,
      arcAngle: nextArcAngle,
      arcLength: nextArcRadius * ((nextArcAngle * Math.PI) / 180),
      rotation: Math.floor(Math.random() * 360),
      tilt: Math.floor(Math.random() * 180) - 90,
      strokeWidth: isRibbon ? Math.floor(Math.random() * 60) + 20 : Math.floor(Math.random() * 5) + 1,
      strokeOpacity: isRibbon ? 0.2 : 0.8,
      fillOpacity: 0.5 + Math.random() * 0.5,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      color2: `hsl(${Math.random() * 360}, 70%, 40%)`,
      fillMode: isGradient ? (Math.random() > 0.5 ? 'linear-gradient' : 'radial-gradient') : 'solid',
      blendMode: Math.random() > 0.5 ? 'screen' : 'normal',
      shapeMode: isRibbon ? 'ribbon' : 'stroke',
      glossy: Math.random() > 0.5,
      lockArcLength: false,
      ribbonCap: isRibbon ? (Math.random() > 0.5 ? 'round' : 'flat') : 'flat'
    });
  };

  const handleDownload = () => {
    const svg = previewRef.current?.querySelector('svg');
    if (svg) downloadSVG(svg.outerHTML);
  };

  const parseReadmeConfig = useCallback((text) => {
    const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/i);
    const candidate = jsonBlockMatch ? jsonBlockMatch[1].trim() : text.trim();
    if (!candidate) {
      throw new Error('未找到可解析的 JSON 内容');
    }
    return JSON.parse(candidate);
  }, []);

  const handleApplyImport = useCallback(() => {
    try {
      setImportError('');
      const payload = parseReadmeConfig(importText);
      const sourceConfig = payload?.config ?? payload;
      if (!sourceConfig || typeof sourceConfig !== 'object') {
        throw new Error('未找到可用的配置对象');
      }
      const nextConfig = { ...DEFAULT_CONFIG, ...sourceConfig };
      setConfig(nextConfig);
      if (payload?.export?.bgColor) {
        setBgColor(payload.export.bgColor);
      }
      if (payload?.export?.iconScale !== undefined) {
        setIconScale(payload.export.iconScale);
      }
      if (payload?.export?.borderRadius !== undefined) {
        setBorderRadius(payload.export.borderRadius);
      }
      setShowImport(false);
      setImportText('');
    } catch (err) {
      setImportError(err?.message || '解析失败，请确认内容格式');
    }
  }, [importText, parseReadmeConfig]);

  const toDegrees = (rad) => (rad * 180) / Math.PI;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const arcLengthValue = config.arcLength ?? (config.arcRadius * ((config.arcAngle * Math.PI) / 180));
  const effectiveArcAngle = config.lockArcLength
    ? clamp(toDegrees(arcLengthValue / Math.max(1, config.arcRadius)), 1, 360)
    : config.arcAngle;

  const halfAngle = effectiveArcAngle / 2;
  const pathD = config.shapeMode === 'ribbon'
    ? describeRibbon(0, 0, config.arcRadius, config.strokeWidth, -halfAngle, halfAngle, config.ribbonCap)
    : describeArc(0, 0, config.arcRadius, -halfAngle, halfAngle);

  // 交错绘制顺序，避免相邻叠加导致最后一段更突出
  const buildRenderOrder = (count) => {
    const total = Math.max(1, count);
    const half = Math.ceil(total / 2);
    const order = [];
    for (let i = 0; i < half; i += 1) {
      order.push(i);
      const mirror = i + half;
      if (mirror < total) order.push(mirror);
    }
    return order;
  };

  const safeSegments = Math.max(1, config.segments);
  const items = buildRenderOrder(safeSegments).map((index) => ({
    id: index,
    rotation: (360 / safeSegments) * index + (config.rotation || 0)
  }));

  const getFill = () => {
    if (config.fillMode === 'none') return 'none';
    if (config.fillMode === 'solid') return config.color;
    return 'url(#spiral-gradient)';
  };

  const readmeMeta = {
    generator: 'GeometricSpiralGenerator',
    config,
    export: {
      bgColor,
      iconScale,
      borderRadius
    }
  };

  return (
    <div className="h-full w-full bg-white rounded-2xl overflow-hidden flex relative">
      <aside className="w-80 flex-shrink-0 bg-[#f8f8f8] rounded-2xl p-4">
        <Controls
          config={config}
          onChange={setConfig}
          onRandomize={handleRandomize}
          onDownload={handleDownload}
          onImport={() => {
            setImportError('');
            setShowImport(true);
          }}
          onExportChange={(exp) => {
            if (exp.bgColor !== undefined) setBgColor(exp.bgColor);
            if (exp.iconScale !== undefined) setIconScale(exp.iconScale);
            if (exp.borderRadius !== undefined) setBorderRadius(exp.borderRadius);
          }}
        />
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundColor: bgColor }} />
          {/* radial overlay removed for light theme */}

          <div ref={previewRef} className="relative z-10 w-full h-full flex items-center justify-center">
            <svg
              width="100%"
              height="100%"
              viewBox="-300 -300 600 600"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full max-w-[820px] max-h-[820px]"
            >
              <defs>
                {config.fillMode === 'linear-gradient' ? (
                  <linearGradient id="spiral-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    {config.glossy ? (
                      <>
                        <stop offset="0%" stopColor={config.color} />
                        <stop offset="50%" stopColor={config.color2} />
                        <stop offset="100%" stopColor={config.color} />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor={config.color} />
                        <stop offset="100%" stopColor={config.color2} />
                      </>
                    )}
                  </linearGradient>
                ) : null}
                {config.fillMode === 'radial-gradient' ? (
                  <radialGradient id="spiral-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    {config.glossy ? (
                      <>
                        <stop offset="0%" stopColor={config.color2} />
                        <stop offset="50%" stopColor={config.color} />
                        <stop offset="100%" stopColor={config.color2} />
                      </>
                    ) : (
                      <>
                        <stop offset="0%" stopColor={config.color} />
                        <stop offset="100%" stopColor={config.color2} stopOpacity="0" />
                      </>
                    )}
                  </radialGradient>
                ) : null}
              </defs>
              {items.map((item) => (
                <g key={item.id} transform={`rotate(${item.rotation})`}>
                  <g transform={`translate(0, -${config.radius}) rotate(${config.tilt})`}>
                    <path
                      d={pathD}
                      fill={getFill()}
                      fillOpacity={config.fillMode === 'none' ? 0 : config.fillOpacity}
                      stroke={config.color}
                      strokeWidth={config.shapeMode === 'stroke' ? config.strokeWidth : 1}
                      strokeLinecap="round"
                      strokeOpacity={config.strokeOpacity}
                      style={{ mixBlendMode: config.blendMode }}
                    />
                  </g>
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-zinc-200 bg-white">
          <PreviewToolbar
            svgRef={previewRef}
            logoName="spiral-generator"
            bgColor={bgColor}
            setBgColor={setBgColor}
            iconScale={iconScale}
            setIconScale={setIconScale}
            borderRadius={borderRadius}
            setBorderRadius={setBorderRadius}
            readmeMeta={readmeMeta}
          />
        </div>
      </main>

      {showImport && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="w-[560px] max-w-[92vw] bg-white rounded-xl shadow-xl border border-zinc-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-zinc-800">从 README 恢复参数</h3>
              <button
                onClick={() => setShowImport(false)}
                className="text-zinc-500 hover:text-zinc-800 text-xs"
              >
                关闭
              </button>
            </div>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="粘贴 README 中的“生成参数”JSON 区块或直接粘贴 JSON"
              className="w-full h-44 text-xs font-mono text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            {importError && (
              <div className="mt-2 text-xs text-red-600">{importError}</div>
            )}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleApplyImport}
                className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
              >
                解析并恢复
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GeometricSpiralGenerator;
