import { Composition } from 'remotion';
import { MemoryTunnelVideo } from './compositions/MemoryTunnelVideo';
import { PhotoMosaicVideo } from './compositions/PhotoMosaicVideo';
import { GenerativeLogoVideo, generativeLogoDefaultProps, demoLottieData } from './compositions/GenerativeLogoVideo';

const defaultProps = {
  images: [],
  titleText: '你是否也有这样的瞬间',
  fps: 30,
  duration: 12,
  resolution: [1920, 1080],
  tunnelSpeed: 420,
  cardScaleMax: 2.6,
  flashDuration: 0.15,
  colorGrading: 'warm',
  vignette: true,
  filmGrain: true,
  phaseMode: 'fixed',
  seed: 2026
};

// PhotoMosaicVideo 默认配置
const photoMosaicDefaultProps = {
  images: [],
  inputText: '回忆',
  coreSubjectImage: null,
  fps: 30,
  duration: 10,
  resolution: [1080, 1920], // 竖屏
  particleCount: 800,
  zoomIntensity: 1.0,
  colorGrading: 'warm',
  vignette: true,
  filmGrain: true,
  seed: 2026
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MemoryTunnelVideo"
        component={MemoryTunnelVideo}
        durationInFrames={Math.round(defaultProps.duration * defaultProps.fps)}
        fps={defaultProps.fps}
        width={defaultProps.resolution[0]}
        height={defaultProps.resolution[1]}
        defaultProps={defaultProps}
        calculateMetadata={({ props }) => {
          const fps = Number(props.fps || defaultProps.fps);
          const duration = Number(props.duration || defaultProps.duration);
          const resolution = props.resolution || defaultProps.resolution;
          return {
            fps,
            durationInFrames: Math.round(duration * fps),
            width: resolution[0],
            height: resolution[1]
          };
        }}
      />
      <Composition
        id="PhotoMosaicVideo"
        component={PhotoMosaicVideo}
        durationInFrames={Math.round(photoMosaicDefaultProps.duration * photoMosaicDefaultProps.fps)}
        fps={photoMosaicDefaultProps.fps}
        width={photoMosaicDefaultProps.resolution[0]}
        height={photoMosaicDefaultProps.resolution[1]}
        defaultProps={photoMosaicDefaultProps}
        calculateMetadata={({ props }) => {
          const fps = Number(props.fps || photoMosaicDefaultProps.fps);
          const duration = Number(props.duration || photoMosaicDefaultProps.duration);
          const resolution = props.resolution || photoMosaicDefaultProps.resolution;
          return {
            fps,
            durationInFrames: Math.round(duration * fps),
            width: resolution[0],
            height: resolution[1]
          };
        }}
      />
      <Composition
        id="GenerativeLogoVideo"
        component={GenerativeLogoVideo}
        durationInFrames={90}
        fps={60}
        width={1080}
        height={1080}
        defaultProps={{
          ...generativeLogoDefaultProps,
          lottieData: demoLottieData, // 使用演示动画
        }}
        calculateMetadata={({ props }) => {
          // 从 Lottie 数据中获取帧率和总帧数
          const lottie = props.lottieData || demoLottieData;
          const fps = lottie?.fr || 60;
          const totalFrames = lottie?.op || 72;
          return {
            fps,
            durationInFrames: totalFrames,
            width: lottie?.w || 1080,
            height: lottie?.h || 1080,
          };
        }}
      />
    </>
  );
};
