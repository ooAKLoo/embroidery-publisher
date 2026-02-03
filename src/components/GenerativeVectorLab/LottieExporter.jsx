/**
 * Lottie 导出器
 *
 * 使用与预览完全相同的 LottieGenerator 生成动画
 * 导出结果和预览 100% 一致
 */

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import lottie from "lottie-web";
import { generateLottieAnimation, ANIMATION_MODES } from "./lottie";

function LottieExporter({ config, className = "" }) {
  const [selectedMode, setSelectedMode] = useState("morphScale");
  const [fps, setFps] = useState(60);
  const [size, setSize] = useState(512);
  const [copied, setCopied] = useState(false);

  const previewRef = useRef(null);
  const animationRef = useRef(null);

  // 生成 Lottie 数据 - 使用与预览完全相同的函数
  const lottieData = useMemo(() => {
    return generateLottieAnimation(config, selectedMode, { size, fps });
  }, [config, selectedMode, size, fps]);

  const lottieString = useMemo(() => {
    return JSON.stringify(lottieData, null, 2);
  }, [lottieData]);

  // 预览动画
  useEffect(() => {
    if (!previewRef.current || !lottieData) return;

    if (animationRef.current) {
      animationRef.current.destroy();
    }

    animationRef.current = lottie.loadAnimation({
      container: previewRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: lottieData,
    });

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
        animationRef.current = null;
      }
    };
  }, [lottieData]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(lottieData));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [lottieData]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(lottieData)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generative-logo-${selectedMode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [lottieData, selectedMode]);

  return (
    <div className={`bg-white rounded-2xl border border-zinc-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 to-cyan-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">Lottie 动画导出</h3>
            <p className="text-xs text-zinc-500">预览和导出 100% 一致</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 预览区域 */}
        <div className="flex justify-center">
          <div
            className="bg-zinc-50 rounded-xl border border-zinc-200 p-4"
            style={{ backgroundColor: config.canvasBg || "#ffffff" }}
          >
            <div
              ref={previewRef}
              style={{ width: 120, height: 120 }}
            />
          </div>
        </div>

        {/* 动画模式选择 */}
        <div>
          <label className="text-xs font-medium text-zinc-500 mb-2 block">动画模式</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ANIMATION_MODES).map(([mode, modeConfig]) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                  selectedMode === mode
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                <span>{modeConfig.icon}</span>
                {modeConfig.name}
              </button>
            ))}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            {ANIMATION_MODES[selectedMode]?.description}
          </p>
        </div>

        {/* 导出设置 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">帧率</label>
            <select
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg"
            >
              <option value={30}>30 fps</option>
              <option value={60}>60 fps</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium text-zinc-500 mb-1.5 block">尺寸</label>
            <select
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg"
            >
              <option value={256}>256px</option>
              <option value={512}>512px</option>
              <option value={1024}>1024px</option>
            </select>
          </div>
        </div>

        {/* 文件信息 */}
        <div className="bg-zinc-50 rounded-xl p-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-zinc-800">{lottieData.op}</div>
              <div className="text-xs text-zinc-500">总帧数</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-800">{(lottieData.op / fps).toFixed(2)}s</div>
              <div className="text-xs text-zinc-500">时长</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-zinc-800">{(lottieString.length / 1024).toFixed(1)}KB</div>
              <div className="text-xs text-zinc-500">文件大小</div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载 .json
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                复制
              </>
            )}
          </button>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="px-4 py-3 border-t border-zinc-100 bg-emerald-50/50">
        <div className="text-xs text-emerald-700 flex items-start gap-2">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong>预览即所得</strong> - 导出的动画和上方预览完全一致
          </div>
        </div>
      </div>

      {/* 平台支持 */}
      <div className="px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
        <div className="text-xs text-zinc-500 space-y-2">
          <p className="font-medium text-zinc-600">支持平台:</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-zinc-100">
              <span className="text-base">🎬</span>
              <div>
                <div className="font-medium text-zinc-700">Remotion</div>
                <code className="text-[10px] text-emerald-600">@remotion/lottie</code>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-zinc-100">
              <span className="text-base">🌐</span>
              <div>
                <div className="font-medium text-zinc-700">Web</div>
                <code className="text-[10px] text-emerald-600">lottie-web</code>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-zinc-100">
              <span className="text-base">🎨</span>
              <div>
                <div className="font-medium text-zinc-700">After Effects</div>
                <code className="text-[10px] text-emerald-600">Bodymovin</code>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-zinc-100">
              <span className="text-base">📱</span>
              <div>
                <div className="font-medium text-zinc-700">iOS / Android</div>
                <code className="text-[10px] text-emerald-600">Lottie SDK</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LottieExporter;
