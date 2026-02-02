import { AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { Suspense, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { EffectComposer, Noise, Vignette, Bloom } from '@react-three/postprocessing';
import { MosaicTextScene } from './MosaicTextScene';
import { AppleInterfaceUI } from './AppleInterfaceUI';
import './styles.css';

// 阶段时间配置（基于10秒总时长）
const BASE_PHASES = {
  mosaic: [0, 2],           // 阶段1: 蒙太奇文字开场
  zoom: [2, 3.5],           // 阶段2: 极速缩放
  interface: [3.5, 7],      // 阶段3: Apple 界面展示
  explosion: [7, 10]        // 阶段4: 碎片化炸裂
};

// 创建占位图片
const createPlaceholder = (index) => {
  const hue = (index * 36) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="hsl(${hue},70%,60%)"/><stop offset="100%" stop-color="hsl(${(hue + 40) % 360},70%,35%)"/></linearGradient></defs><rect width="640" height="640" fill="url(#g)"/><text x="50%" y="52%" fill="white" font-size="72" font-family="Arial" text-anchor="middle">IMG ${index + 1}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PhotoMosaicVideo = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const durationSeconds = durationInFrames / fps;
  const durationRatio = (props.duration || 10) / 10;

  // 计算各阶段的时间点
  const phases = useMemo(() => ({
    mosaic: [BASE_PHASES.mosaic[0] * durationRatio, BASE_PHASES.mosaic[1] * durationRatio],
    zoom: [BASE_PHASES.zoom[0] * durationRatio, BASE_PHASES.zoom[1] * durationRatio],
    interface: [BASE_PHASES.interface[0] * durationRatio, BASE_PHASES.interface[1] * durationRatio],
    explosion: [BASE_PHASES.explosion[0] * durationRatio, BASE_PHASES.explosion[1] * durationRatio]
  }), [durationRatio]);

  // 图片数据
  const images = props.images?.length
    ? props.images
    : Array.from({ length: 60 }, (_, i) => createPlaceholder(i));

  const coreImage = props.coreSubjectImage || images[0];
  const time = frame / fps;

  // 计算各阶段的进度
  const mosaicProgress = interpolate(
    time,
    [phases.mosaic[0], phases.mosaic[1]],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const zoomProgress = interpolate(
    time,
    [phases.zoom[0], phases.zoom[1]],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const interfaceProgress = interpolate(
    time,
    [phases.interface[0], phases.interface[0] + 0.5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const explosionProgress = interpolate(
    time,
    [phases.explosion[0], phases.explosion[1]],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 界面显示状态
  const showInterface = time >= phases.interface[0] && time < phases.explosion[0] + 0.3;
  const interfaceScale = interpolate(
    time,
    [phases.interface[0], phases.interface[0] + 0.4, phases.explosion[0], phases.explosion[0] + 0.3],
    [0.6, 1, 1, 1.2],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const interfaceOpacity = interpolate(
    time,
    [phases.interface[0], phases.interface[0] + 0.3, phases.explosion[0], phases.explosion[0] + 0.3],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 径向模糊强度
  const radialBlurIntensity = interpolate(
    time,
    [phases.zoom[0], phases.zoom[0] + 0.3, phases.zoom[1] - 0.3, phases.zoom[1]],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 色彩调性叠加
  const overlayColor = props.colorGrading === 'cool'
    ? 'rgba(120, 165, 255, 0.12)'
    : props.colorGrading === 'warm'
      ? 'rgba(255, 196, 147, 0.14)'
      : 'transparent';

  return (
    <AbsoluteFill style={{ backgroundColor: '#0a0c12' }}>
      {/* Three.js 场景 - 蒙太奇文字和粒子 */}
      <ThreeCanvas
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 50, position: [0, 0, 10] }}
      >
        <Suspense fallback={null}>
          <MosaicTextScene
            frame={frame}
            fps={fps}
            width={width}
            height={height}
            duration={durationSeconds}
            images={images}
            inputText={props.inputText}
            phases={phases}
            mosaicProgress={mosaicProgress}
            zoomProgress={zoomProgress}
            explosionProgress={explosionProgress}
            particleCount={props.particleCount}
            zoomIntensity={props.zoomIntensity}
            seed={props.seed}
          />
          {(props.vignette || props.filmGrain) && (
            <EffectComposer>
              <Bloom intensity={0.4} luminanceThreshold={0.15} mipmapBlur />
              {props.vignette && (
                <Vignette eskil={false} offset={0.2} darkness={0.85} />
              )}
              {props.filmGrain && (
                <Noise opacity={0.18} />
              )}
            </EffectComposer>
          )}
        </Suspense>
      </ThreeCanvas>

      {/* 径向模糊叠加层 */}
      {radialBlurIntensity > 0 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at center, transparent 0%, transparent 20%, rgba(0,0,0,${radialBlurIntensity * 0.4}) 100%)`,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* 色彩调性叠加 */}
      {overlayColor !== 'transparent' && (
        <AbsoluteFill style={{ backgroundColor: overlayColor, mixBlendMode: 'screen' }} />
      )}

      {/* Apple 界面 UI */}
      {showInterface && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: interfaceOpacity,
            transform: `scale(${interfaceScale})`,
            pointerEvents: 'none'
          }}
        >
          <AppleInterfaceUI
            coreImage={coreImage}
            width={width}
            height={height}
            progress={interfaceProgress}
          />
        </AbsoluteFill>
      )}

      {/* 闪光效果 - 缩放到接口过渡时 */}
      {time >= phases.zoom[1] - 0.1 && time <= phases.interface[0] + 0.2 && (
        <AbsoluteFill
          style={{
            backgroundColor: 'white',
            opacity: interpolate(
              time,
              [phases.zoom[1] - 0.1, phases.zoom[1], phases.interface[0] + 0.2],
              [0, 0.9, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
            )
          }}
        />
      )}
    </AbsoluteFill>
  );
};
