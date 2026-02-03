/**
 * Lottie 播放器组件
 *
 * 使用 lottie-web 播放 Lottie 动画
 * 这确保预览和导出使用完全相同的渲染引擎
 */

import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import lottie from "lottie-web";
import { generateLottieAnimation, ANIMATION_MODES } from "./LottieGenerator";

/**
 * Lottie 播放器
 *
 * @param {Object} props
 * @param {Object} props.animationData - Lottie JSON 数据 (优先使用)
 * @param {Object} props.config - 图形配置 (如果没有 animationData，会自动生成)
 * @param {string} props.mode - 动画模式
 * @param {number} props.size - 播放器尺寸
 * @param {boolean} props.autoPlay - 是否自动播放
 * @param {boolean} props.loop - 是否循环
 * @param {Function} props.onComplete - 播放完成回调
 * @param {Function} props.onReady - 动画加载完成回调
 */
function LottiePlayer({
  animationData = null,
  config = null,
  mode = "morphScale",
  size = 100,
  autoPlay = true,
  loop = false,
  onComplete,
  onReady,
  className = "",
  style = {},
}) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [isReady, setIsReady] = useState(false);

  // 如果没有提供 animationData，则根据 config 生成
  const lottieData = useMemo(() => {
    if (animationData) return animationData;
    if (config) {
      return generateLottieAnimation(config, mode, { size: 512, fps: 60 });
    }
    return null;
  }, [animationData, config, mode]);

  // 初始化 Lottie 实例
  useEffect(() => {
    if (!containerRef.current || !lottieData) return;

    // 销毁旧实例
    if (animationRef.current) {
      animationRef.current.destroy();
    }

    // 创建新实例
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: loop,
      autoplay: autoPlay,
      animationData: lottieData,
    });

    // 事件监听
    animationRef.current.addEventListener("DOMLoaded", () => {
      setIsReady(true);
      onReady?.();
    });

    animationRef.current.addEventListener("complete", () => {
      onComplete?.();
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [lottieData, loop, autoPlay, onComplete, onReady]);

  // 播放控制方法
  const play = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.goToAndPlay(0, true);
    }
  }, []);

  const pause = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.pause();
    }
  }, []);

  const stop = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
    }
  }, []);

  // 暴露控制方法给父组件
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.lottiePlay = play;
      containerRef.current.lottiePause = pause;
      containerRef.current.lottieStop = stop;
    }
  }, [play, pause, stop]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    />
  );
}

/**
 * 带控制按钮的 Lottie 播放器
 */
function LottiePlayerWithControls({
  config,
  mode = "morphScale",
  size = 200,
  showModeSelector = true,
  onModeChange,
  className = "",
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [key, setKey] = useState(0);
  const playerRef = useRef(null);

  const handleModeChange = useCallback((newMode) => {
    setCurrentMode(newMode);
    setKey(k => k + 1); // 强制重新创建动画
    onModeChange?.(newMode);
  }, [onModeChange]);

  const handleReplay = useCallback(() => {
    setKey(k => k + 1);
  }, []);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* 播放器 */}
      <div
        ref={playerRef}
        onClick={handleReplay}
        className="cursor-pointer hover:scale-105 transition-transform"
        title="点击重播"
      >
        <LottiePlayer
          key={key}
          config={config}
          mode={currentMode}
          size={size}
          autoPlay={true}
          loop={false}
        />
      </div>

      {/* 模式选择器 */}
      {showModeSelector && (
        <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
          {Object.entries(ANIMATION_MODES).map(([modeKey, modeConfig]) => (
            <button
              key={modeKey}
              onClick={() => handleModeChange(modeKey)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                currentMode === modeKey
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
              title={modeConfig.description}
            >
              <span className="mr-1">{modeConfig.icon}</span>
              {modeConfig.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LottiePlayer;
export { LottiePlayer, LottiePlayerWithControls, ANIMATION_MODES };
