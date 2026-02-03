/**
 * 动画模式展示台
 * 展示所有可用的 Lottie 动画效果
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import lottie from "lottie-web";
import { generateLottieAnimation, ANIMATION_MODES } from "./lottie";

/**
 * 单个动画预览卡片
 */
function AnimationPreviewCard({
  config,
  mode,
  modeConfig,
  size = 64,
  isSelected,
  onSelect,
  autoPlay = false,
}) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  // 生成并播放动画
  useEffect(() => {
    if (!containerRef.current || !config) return;

    const lottieData = generateLottieAnimation(config, mode, { size: 512, fps: 60 });

    if (animationRef.current) {
      animationRef.current.destroy();
    }

    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: autoPlay,
      animationData: lottieData,
    });

    // 不自动播放时，显示最后一帧
    if (!autoPlay) {
      animationRef.current.goToAndStop(animationRef.current.totalFrames - 1, true);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [config, mode, autoPlay]);

  // 点击时重新播放
  const handleClick = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.goToAndPlay(0, true);
    }
    onSelect?.(mode);
  }, [mode, onSelect]);

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative p-4 rounded-xl border-2 transition-all ${
        isSelected
          ? "border-indigo-500 bg-indigo-50/50 shadow-lg shadow-indigo-100"
          : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-zinc-100/50"
      }`}
    >
      {/* 选中标记 */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"
        >
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </motion.div>
      )}

      {/* 动画预览 */}
      <div
        className="flex items-center justify-center mb-3"
        style={{ height: size }}
      >
        <div
          ref={containerRef}
          style={{ width: size, height: size }}
        />
      </div>

      {/* 模式信息 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-sm opacity-60">{modeConfig.icon}</span>
          <span className={`text-sm font-medium ${isSelected ? "text-indigo-700" : "text-zinc-700"}`}>
            {modeConfig.name}
          </span>
        </div>
        <p className="text-xs text-zinc-400">{modeConfig.description}</p>
      </div>

      {/* 点击播放提示 */}
      <div className="mt-2 text-center">
        <span className="text-[10px] text-zinc-300 uppercase tracking-wider">
          Click to play
        </span>
      </div>
    </motion.button>
  );
}

/**
 * 动画模式展示台
 */
function AnimationShowcase({
  config,
  size = 64,
  onSelect,
  selectedMode = "morphScale",
  className = "",
}) {
  const [playingModes, setPlayingModes] = useState({});

  const handlePlayAll = useCallback(() => {
    const modes = Object.keys(ANIMATION_MODES);
    modes.forEach((mode, index) => {
      setTimeout(() => {
        setPlayingModes(prev => ({ ...prev, [mode]: Date.now() }));
      }, index * 200);
    });
  }, []);

  const handleSelect = useCallback((mode) => {
    onSelect?.(mode);
  }, [onSelect]);

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800">动画效果展示</h3>
          <p className="text-xs text-zinc-400 mt-0.5">选择一种动画模式应用到图标</p>
        </div>
        <button
          onClick={handlePlayAll}
          className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          全部播放
        </button>
      </div>

      {/* Showcase Grid */}
      <div className="p-4">
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(ANIMATION_MODES).map(([mode, modeConfig]) => (
            <AnimationPreviewCard
              key={`${mode}-${playingModes[mode] || 0}`}
              config={config}
              mode={mode}
              modeConfig={modeConfig}
              size={size}
              isSelected={selectedMode === mode}
              onSelect={handleSelect}
              autoPlay={!!playingModes[mode]}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>当前选择：<span className="text-zinc-600 font-medium">{ANIMATION_MODES[selectedMode]?.name}</span></span>
          <span>点击卡片选择动画模式</span>
        </div>
      </div>
    </div>
  );
}

/**
 * 紧凑型动画选择器
 */
function CompactAnimationSelector({
  config,
  size = 32,
  onSelect,
  selectedMode = "morphScale",
  className = "",
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Object.entries(ANIMATION_MODES).map(([mode, { name, icon }]) => {
        const containerRef = useRef(null);
        const animationRef = useRef(null);

        useEffect(() => {
          if (!containerRef.current || !config) return;

          const lottieData = generateLottieAnimation(config, mode, { size: 512, fps: 60 });

          if (animationRef.current) {
            animationRef.current.destroy();
          }

          animationRef.current = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: lottieData,
          });

          animationRef.current.goToAndStop(animationRef.current.totalFrames - 1, true);

          return () => {
            if (animationRef.current) {
              animationRef.current.destroy();
            }
          };
        }, [config, mode]);

        return (
          <button
            key={mode}
            onClick={() => onSelect?.(mode)}
            title={name}
            className={`relative p-1.5 rounded-lg transition-all ${
              selectedMode === mode
                ? "bg-indigo-100 ring-2 ring-indigo-500 ring-offset-1"
                : "bg-zinc-100 hover:bg-zinc-200"
            }`}
          >
            <div ref={containerRef} style={{ width: size, height: size }} />
          </button>
        );
      })}
    </div>
  );
}

/**
 * 动画演示弹窗
 */
function AnimationDemoModal({
  config,
  isOpen,
  onClose,
  onSelect,
  selectedMode = "morphScale",
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-[800px] max-w-[90vw] max-h-[80vh] overflow-auto"
      >
        <AnimationShowcase
          config={config}
          size={80}
          onSelect={(mode) => {
            onSelect?.(mode);
            onClose?.();
          }}
          selectedMode={selectedMode}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
}

export default AnimationShowcase;
export { CompactAnimationSelector, AnimationDemoModal };
