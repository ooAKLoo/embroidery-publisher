import { useState, useMemo, useCallback } from 'react';
import ControlPanel from './ControlPanel';

const DEFAULT_CONFIG = {
  // 几何参数
  circleSize: 150,
  spreadDistance: 0.5,
  layerCount: 8,
  circlesPerLayer: 8,
  // 外观
  borderWidth: 10,
  borderColor: '#ffffff',
  fillOpacity: 0.05,
  fillColor: '#000000',
  bgColor: '#111111',
  // 动画
  baseSpeed: 1.5,
  speedMultiplier: 1,
  animationEasing: 'ease-in-out',
  paused: false,
  // 变换
  globalScale: 1,
  rotationRange: 1,
};

function DeepRings() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const handleConfigChange = useCallback((updates) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  // 预计算每个圆的偏移位置
  const circleOffsets = useMemo(() => {
    const { circleSize, spreadDistance, circlesPerLayer } = config;
    const d = circleSize * spreadDistance;
    const offsets = [];
    for (let i = 0; i < circlesPerLayer; i++) {
      const angle = (i / circlesPerLayer) * Math.PI * 2;
      offsets.push({
        x: Math.cos(angle) * d,
        y: Math.sin(angle) * d,
      });
    }
    return offsets;
  }, [config.circleSize, config.spreadDistance, config.circlesPerLayer]);

  // 生成动画关键帧的 style 标签
  const animationStyles = useMemo(() => {
    const { layerCount, baseSpeed, speedMultiplier, rotationRange, animationEasing, paused } = config;
    let css = '';
    for (let i = 2; i <= layerCount; i++) {
      const duration = baseSpeed * i * speedMultiplier;
      const toRotation = i * (rotationRange / layerCount);
      const name = `dr-turn-${i}`;
      css += `
        @keyframes ${name} {
          from { transform: rotate(0turn); }
          to { transform: rotate(${toRotation}turn); }
        }
      `;
      css += `
        .dr-base-${i} {
          transform: rotate(${(i * 0.1).toFixed(2)}turn);
          animation: ${name} ${duration.toFixed(2)}s ${animationEasing} infinite alternate;
          ${paused ? 'animation-play-state: paused;' : ''}
        }
      `;
    }
    return css;
  }, [config.layerCount, config.baseSpeed, config.speedMultiplier, config.rotationRange, config.animationEasing, config.paused]);

  const containerSize = config.circleSize * 2 * config.globalScale;

  return (
    <div className="flex h-full w-full bg-white text-zinc-900 overflow-hidden rounded-2xl">
      {/* 左侧控制面板 */}
      <ControlPanel config={config} onChange={handleConfigChange} onReset={handleReset} />

      {/* 右侧画布 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-zinc-200 bg-white flex items-center justify-between px-6">
          <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Deep Rings
          </h2>
          <span className="text-xs text-zinc-400">
            {config.layerCount} layers / {config.circlesPerLayer} circles
          </span>
        </div>

        <div
          className="flex-1 relative overflow-hidden flex items-center justify-center"
          style={{ background: config.bgColor }}
        >
          <style>{animationStyles}</style>

          <div style={{ transform: `scale(${config.globalScale})` }}>
            {Array.from({ length: config.layerCount }, (_, i) => (
              <div
                key={i}
                className={i >= 1 ? `dr-base-${i + 1}` : undefined}
                style={{
                  width: containerSize / config.globalScale,
                  height: containerSize / config.globalScale,
                  position: 'absolute',
                  margin: 'auto',
                  top: 0, left: 0, right: 0, bottom: 0,
                }}
              >
                {circleOffsets.map((offset, j) => (
                  <div
                    key={j}
                    style={{
                      position: 'absolute',
                      width: config.circleSize,
                      height: config.circleSize,
                      borderRadius: '50%',
                      border: `${config.borderWidth}px solid ${config.borderColor}`,
                      margin: 'auto',
                      top: 0, left: 0, right: 0, bottom: 0,
                      transform: `translate(${offset.x}px, ${offset.y}px)`,
                      background: i > 0
                        ? `${config.fillColor}${Math.round(config.fillOpacity * 255).toString(16).padStart(2, '0')}`
                        : 'transparent',
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeepRings;
