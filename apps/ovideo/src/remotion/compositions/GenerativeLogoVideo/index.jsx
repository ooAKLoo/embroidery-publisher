import { useCurrentFrame, useVideoConfig, staticFile, continueRender, delayRender } from 'remotion';
import { Lottie, getLottieMetadata } from '@remotion/lottie';
import { useEffect, useState } from 'react';

/**
 * Generative Logo Lottie 视频组件
 *
 * 方式 1: 使用本地 Lottie JSON 文件
 * 方式 2: 直接传入 Lottie 数据对象
 */
export function GenerativeLogoVideo({
  // Lottie 数据源 (二选一)
  lottieFile = null,        // 本地文件路径 (放在 public 目录下)
  lottieData = null,        // 直接传入的 Lottie JSON 对象

  // 背景色
  backgroundColor = '#ffffff',

  // 播放设置
  loop = false,
  playbackRate = 1,
}) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const [animationData, setAnimationData] = useState(lottieData);
  const [handle] = useState(() => lottieFile ? delayRender() : null);

  // 如果提供了文件路径，异步加载
  useEffect(() => {
    if (lottieFile && !lottieData) {
      fetch(staticFile(lottieFile))
        .then((res) => res.json())
        .then((data) => {
          setAnimationData(data);
          continueRender(handle);
        })
        .catch((err) => {
          console.error('Failed to load Lottie file:', err);
          continueRender(handle);
        });
    }
  }, [lottieFile, lottieData, handle]);

  if (!animationData) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor,
        }}
      >
        <div style={{ color: '#999', fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
      }}
    >
      <Lottie
        animationData={animationData}
        playbackRate={playbackRate}
        loop={loop}
        style={{
          width: '80%',
          height: '80%',
        }}
      />
    </div>
  );
}

// 默认配置
export const generativeLogoDefaultProps = {
  lottieFile: null,
  lottieData: null,
  backgroundColor: '#ffffff',
  loop: false,
  playbackRate: 1,
};

/**
 * 内置演示动画数据
 * 可以直接使用这个数据进行测试
 */
export const demoLottieData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 72,
  w: 512,
  h: 512,
  nm: "GenerativeLogo",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Demo Shape",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [0] }, { t: 20, s: [100] }] },
        r: { a: 1, k: [{ t: 0, s: [-180] }, { t: 72, s: [0] }] },
        p: { a: 0, k: [256, 256] },
        a: { a: 0, k: [256, 256] },
        s: { a: 1, k: [{ t: 0, s: [0, 0] }, { t: 72, s: [100, 100] }] },
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              p: { a: 0, k: [256, 256] },
              s: { a: 0, k: [200, 200] },
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.39, 0.4, 0.95, 1] },
              o: { a: 0, k: 100 },
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
            },
          ],
          nm: "Group",
        },
      ],
      ip: 0,
      op: 9999,
      st: 0,
    },
  ],
};

export default GenerativeLogoVideo;
