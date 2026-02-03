/**
 * AnimatedLogoIcon - 动画图标组件
 *
 * 使用 Lottie 作为统一动画引擎
 * 预览和导出使用完全相同的渲染逻辑
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import lottie from "lottie-web";
import { generateLottieAnimation, ANIMATION_MODES } from "./lottie";

/**
 * 核心动画图标组件
 */
function AnimatedLogoIcon({
  config,
  size = 40,
  mode = "morphScale",
  autoPlay = false,
  showMenu = true,
  enableBreathing = true,
  onModeChange,
  onPlay,
  onComplete,
  className = "",
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [menuOpen, setMenuOpen] = useState(false);
  const [key, setKey] = useState(0);

  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const menuRef = useRef(null);

  // 同步外部 mode 变化
  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  // 生成 Lottie 数据
  const lottieData = useMemo(() => {
    if (!config) return null;
    return generateLottieAnimation(config, currentMode, { size: 512, fps: 60 });
  }, [config, currentMode, key]);

  // 初始化和播放 Lottie
  useEffect(() => {
    if (!containerRef.current || !lottieData) return;

    // 销毁旧实例
    if (animationRef.current) {
      animationRef.current.destroy();
      animationRef.current = null;
    }

    // 创建新实例
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: false,
      autoplay: isPlaying,
      animationData: lottieData,
    });

    // 播放完成回调
    animationRef.current.addEventListener("complete", () => {
      setIsPlaying(false);
      onComplete?.();
    });

    // 如果不是自动播放，跳到最后一帧显示完整图形
    if (!isPlaying) {
      animationRef.current.goToAndStop(animationRef.current.totalFrames - 1, true);
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [lottieData, isPlaying, onComplete]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 监听 config 变化，自动触发动画
  useEffect(() => {
    if (autoPlay && config) {
      setIsPlaying(true);
      setKey((k) => k + 1);
    }
  }, [config, autoPlay]);

  // 播放动画
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    setKey((k) => k + 1);
    onPlay?.();
  }, [onPlay]);

  // 选择动画模式
  const handleModeSelect = useCallback((newMode) => {
    setCurrentMode(newMode);
    setMenuOpen(false);
    onModeChange?.(newMode);

    // 切换模式后自动播放一次
    setTimeout(() => {
      setIsPlaying(true);
      setKey((k) => k + 1);
      onPlay?.();
    }, 50);
  }, [onModeChange, onPlay]);

  // 呼吸动画样式
  const breathingStyle = enableBreathing && !isPlaying
    ? {
        animation: "breathing 2.4s ease-in-out infinite",
      }
    : {};

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* CSS for breathing animation */}
      <style>{`
        @keyframes breathing {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-2px) rotate(0.5deg); }
        }
      `}</style>

      {/* Logo 图标 */}
      <button
        onClick={handlePlay}
        className="relative flex items-center justify-center cursor-pointer hover:scale-105 transition-transform active:scale-95"
        title="点击重播动画"
        style={{ width: size, height: size, ...breathingStyle }}
      >
        <div
          ref={containerRef}
          style={{ width: size, height: size }}
        />
      </button>

      {/* 动画模式菜单按钮 */}
      {showMenu && (
        <div className="relative ml-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors text-xs"
            title="切换动画模式"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 下拉菜单 */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden z-50"
              >
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    动画模式
                  </div>
                  {Object.entries(ANIMATION_MODES).map(([modeKey, { name, description, icon }]) => (
                    <button
                      key={modeKey}
                      onClick={() => handleModeSelect(modeKey)}
                      className={`w-full px-3 py-2 flex items-center gap-3 text-left hover:bg-zinc-50 transition-colors ${
                        currentMode === modeKey ? "bg-indigo-50 text-indigo-600" : "text-zinc-700"
                      }`}
                    >
                      <span className="text-sm w-5 text-center opacity-70">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{name}</div>
                        <div className="text-xs text-zinc-400 truncate">{description}</div>
                      </div>
                      {currentMode === modeKey && (
                        <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
                <div className="border-t border-zinc-100 px-3 py-2 bg-zinc-50/50">
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    点击图标可重播动画
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default AnimatedLogoIcon;
export { ANIMATION_MODES };
