import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Suspense, useMemo } from 'react';
import { ThreeCanvas } from '@remotion/three';
import { EffectComposer, Noise, Vignette, Bloom } from '@react-three/postprocessing';
import { TunnelScene } from './TunnelScene';
import { pickIndices } from '../utils/random';

const BASE_PHASES = {
  text: [0, 2],
  collapse: [2, 3.2],
  tunnel: [3.2, 8.5],
  outro: [8.5, 12]
};

const getFlashOpacity = (frame, flashEvents, flashFrames) => {
  let maxOpacity = 0;
  flashEvents.forEach((event) => {
    if (frame < event.flashFrame) return;
    const opacity = interpolate(
      frame,
      [event.flashFrame, event.flashFrame + flashFrames],
      [1, 0],
      { extrapolateRight: 'clamp' }
    );
    if (opacity > maxOpacity) maxOpacity = opacity;
  });
  return maxOpacity;
};

const createPlaceholder = (index) => {
  const hue = (index * 36) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="hsl(${hue},70%,60%)"/><stop offset="100%" stop-color="hsl(${(hue + 40) % 360},70%,35%)"/></linearGradient></defs><rect width="640" height="640" fill="url(#g)"/><text x="50%" y="52%" fill="white" font-size="72" font-family="Arial" text-anchor="middle">IMG ${index + 1}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const MemoryTunnelVideo = (props) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();
  const durationSeconds = durationInFrames / fps;
  const phaseMode = props.phaseMode || 'fixed';
  const durationRatio = (props.duration || 12) / 12;
  const phases = useMemo(() => {
    if (phaseMode === 'scale') {
      return {
        text: [BASE_PHASES.text[0] * durationRatio, BASE_PHASES.text[1] * durationRatio],
        collapse: [BASE_PHASES.collapse[0] * durationRatio, BASE_PHASES.collapse[1] * durationRatio],
        tunnel: [BASE_PHASES.tunnel[0] * durationRatio, BASE_PHASES.tunnel[1] * durationRatio],
        outro: [BASE_PHASES.outro[0] * durationRatio, BASE_PHASES.outro[1] * durationRatio]
      };
    }
    return BASE_PHASES;
  }, [durationRatio, phaseMode]);

  const images = props.images?.length ? props.images : Array.from({ length: 40 }, (_, i) => createPlaceholder(i));
  const highlightCount = Math.min(4, images.length);
  const highlightIndices = props.highlightIndices?.length
    ? props.highlightIndices
    : pickIndices(highlightCount, images.length, (props.seed || 1) + 7);

  const flashFrames = Math.max(2, Math.round((props.flashDuration || 0.15) * fps));
  const highlightSpacing = 1.2 * durationRatio;
  const highlightDuration = 0.9;
  const highlightStart = Math.max(phases.tunnel[0] + 0.3 * durationRatio, 3.5 * durationRatio);

  const flashEvents = useMemo(() => {
    return highlightIndices.map((index, idx) => {
      const start = Math.round((highlightStart + idx * highlightSpacing) * fps);
      const peak = start + Math.round(0.55 * fps);
      const end = start + Math.round(highlightDuration * fps);
      const freezeFrames = Math.max(1, Math.round(0.08 * fps));
      return {
        index,
        start,
        peak,
        end,
        freezeFrames,
        flashFrame: peak
      };
    });
  }, [highlightIndices, fps, highlightSpacing, highlightStart]);

  const flashOpacity = getFlashOpacity(frame, flashEvents, flashFrames);

  const overlayColor = props.colorGrading === 'cool'
    ? 'rgba(120, 165, 255, 0.14)'
    : props.colorGrading === 'warm'
      ? 'rgba(255, 196, 147, 0.16)'
      : 'transparent';

  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0e14' }}>
      <ThreeCanvas
        width={width}
        height={height}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 45, position: [0, 0, 8] }}
      >
        <Suspense fallback={null}>
          <TunnelScene
            frame={frame}
            fps={fps}
            width={width}
            height={height}
            duration={durationSeconds}
            images={images}
            titleText={props.titleText}
            tunnelSpeed={props.tunnelSpeed}
            cardScaleMax={props.cardScaleMax}
            seed={props.seed}
            flashEvents={flashEvents}
            phases={phases}
          />
          {(props.vignette || props.filmGrain) && (
            <EffectComposer>
              <Bloom intensity={0.3} luminanceThreshold={0.2} mipmapBlur />
              {props.vignette && (
                <Vignette eskil={false} offset={0.25} darkness={0.9} />
              )}
              {props.filmGrain && (
                <Noise opacity={0.25} />
              )}
            </EffectComposer>
          )}
        </Suspense>
      </ThreeCanvas>

      {overlayColor !== 'transparent' && (
        <AbsoluteFill style={{ backgroundColor: overlayColor, mixBlendMode: 'screen' }} />
      )}

      {flashOpacity > 0 && (
        <AbsoluteFill style={{ backgroundColor: 'white', opacity: flashOpacity }} />
      )}

      {flashEvents.map((event) => (
        <Sequence
          key={`audio-${event.index}`}
          from={event.flashFrame}
          durationInFrames={Math.max(2, flashFrames)}
        >
          <Audio src={staticFile('audio/camera-click.wav')} volume={0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
