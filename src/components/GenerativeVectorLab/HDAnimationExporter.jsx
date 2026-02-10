import { useState, useCallback, useRef, useEffect } from "react";
import { ANIMATION_MODES } from "./lottie";

// ============ 动画缓动函数 ============
function _easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function _spring(t) { return 1 - Math.exp(-6 * t) * Math.cos(6.5 * t); }
function _clamp(v, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }

// ============ 动画状态计算 ============
function calcAnimState(mode, progress, index = 0, total = 1) {
  switch (mode) {
    case "morphScale": {
      const p = _spring(progress);
      return { scale: p, rotation: -180 * (1 - p), opacity: _clamp(progress / 0.2) };
    }
    case "fadeScale": {
      const p = _easeOutCubic(progress);
      return { scale: 0.7 + 0.3 * p, rotation: 0, opacity: p };
    }
    case "rotateIn": {
      const p = _easeOutCubic(progress);
      return { scale: 0.5 + 0.5 * p, rotation: -90 * (1 - p), opacity: _clamp(progress / 0.3) };
    }
    case "popIn": {
      const p = _spring(_clamp(progress * 1.3));
      return { scale: p, rotation: 0, opacity: _clamp(progress / 0.15) };
    }
    case "staggerPetal": {
      const delay = (index / Math.max(1, total)) * 0.6;
      const p = _easeOutCubic(_clamp((progress - delay) / 0.4));
      return { scale: 0.3 + 0.7 * p, rotation: 0, opacity: p };
    }
    default: return { scale: 1, rotation: 0, opacity: 1 };
  }
}

// ============ SVG → Image 工具 ============
// bgColor: 可选背景色，嵌入到 SVG 内部作为底色（用于 alpha matting）
function svgToImg(svgEl, w, h, bgColor = null) {
  return new Promise((resolve, reject) => {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width", w);
    clone.setAttribute("height", h);
    clone.removeAttribute("class");
    if (bgColor) {
      const ns = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", w);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", bgColor);
      clone.insertBefore(rect, clone.firstChild);
    }
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

async function splitShapeImages(svgEl, w, h, bgColor = null) {
  const paths = svgEl.querySelectorAll("path");
  if (!paths.length) return [];
  const imgs = [];
  for (let i = 0; i < paths.length; i++) {
    const clone = svgEl.cloneNode(true);
    clone.setAttribute("width", w);
    clone.setAttribute("height", h);
    clone.removeAttribute("class");
    if (bgColor) {
      const ns = "http://www.w3.org/2000/svg";
      const rect = document.createElementNS(ns, "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", w);
      rect.setAttribute("height", h);
      rect.setAttribute("fill", bgColor);
      clone.insertBefore(rect, clone.firstChild);
    }
    clone.querySelectorAll("path").forEach((p, j) => {
      if (j !== i) p.setAttribute("opacity", "0");
    });
    const str = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = await new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => { URL.revokeObjectURL(url); res(im); };
      im.onerror = rej;
      im.src = url;
    });
    imgs.push(img);
  }
  return imgs;
}

// ============ 绘制动画帧（仅形状，不含背景） ============
function drawAnimated(ctx, mode, progress, size, fullImg, shapeImgs) {
  if (mode === "staggerPetal" && shapeImgs.length > 0) {
    for (let i = 0; i < shapeImgs.length; i++) {
      const st = calcAnimState(mode, progress, i, shapeImgs.length);
      ctx.save();
      ctx.globalAlpha = st.opacity;
      ctx.translate(size / 2, size / 2);
      ctx.scale(st.scale, st.scale);
      ctx.translate(-size / 2, -size / 2);
      ctx.drawImage(shapeImgs[i], 0, 0, size, size);
      ctx.restore();
    }
  } else if (fullImg) {
    const st = calcAnimState(mode, progress);
    ctx.save();
    ctx.globalAlpha = st.opacity;
    ctx.translate(size / 2, size / 2);
    ctx.rotate(st.rotation * Math.PI / 180);
    ctx.scale(st.scale, st.scale);
    ctx.translate(-size / 2, -size / 2);
    ctx.drawImage(fullImg, 0, 0, size, size);
    ctx.restore();
  }
}

// ============ Alpha Matting 透明渲染 ============
// 原理：分别在白色和黑色背景上渲染同一帧，通过像素差值精确计算 alpha 通道
// 这样可以完美处理 SVG evenodd fill-rule、clip-path 等复杂透明效果
function renderFrameTransparent(ctx, mode, progress, size, matteData) {
  const { whiteImg, blackImg, whiteShapeImgs, blackShapeImgs, tmpW, tmpB } = matteData;
  const ctxW = tmpW.getContext("2d");
  const ctxB = tmpB.getContext("2d");

  // 白底渲染
  ctxW.clearRect(0, 0, size, size);
  ctxW.fillStyle = "#ffffff";
  ctxW.fillRect(0, 0, size, size);
  drawAnimated(ctxW, mode, progress, size, whiteImg, whiteShapeImgs);

  // 黑底渲染
  ctxB.clearRect(0, 0, size, size);
  ctxB.fillStyle = "#000000";
  ctxB.fillRect(0, 0, size, size);
  drawAnimated(ctxB, mode, progress, size, blackImg, blackShapeImgs);

  // 从白底-黑底差值中提取 alpha，从黑底中恢复原色
  const wData = ctxW.getImageData(0, 0, size, size);
  const bData = ctxB.getImageData(0, 0, size, size);
  const out = ctx.createImageData(size, size);
  const w = wData.data, b = bData.data, o = out.data;

  for (let i = 0; i < w.length; i += 4) {
    // alpha = 255 - avg(白-黑) 差值；完全不透明区域白==黑所以差为0→alpha=255
    const a = 255 - Math.round((w[i] - b[i] + w[i + 1] - b[i + 1] + w[i + 2] - b[i + 2]) / 3);
    const ac = Math.max(0, Math.min(255, a));
    if (ac > 0) {
      // 从黑底渲染恢复直通色 (straight alpha color)
      o[i]     = Math.min(255, Math.round(b[i] * 255 / ac));
      o[i + 1] = Math.min(255, Math.round(b[i + 1] * 255 / ac));
      o[i + 2] = Math.min(255, Math.round(b[i + 2] * 255 / ac));
    }
    o[i + 3] = ac;
  }

  ctx.putImageData(out, 0, 0);
}

// ============ 渲染单帧（统一入口） ============
function renderFrame(ctx, mode, progress, size, fullImg, shapeImgs, bgColor, transparentBg = false, matteData = null) {
  ctx.clearRect(0, 0, size, size);

  if (transparentBg && matteData) {
    renderFrameTransparent(ctx, mode, progress, size, matteData);
  } else {
    if (!transparentBg) {
      ctx.fillStyle = bgColor || "#ffffff";
      ctx.fillRect(0, 0, size, size);
    }
    drawAnimated(ctx, mode, progress, size, fullImg, shapeImgs);
  }
}

// ============ 导出器组件 ============
export default function HDAnimationExporter({ config, previewRef, onClose }) {
  const [mode, setMode] = useState("morphScale");
  const [size, setSize] = useState(512);
  const [fps, setFps] = useState(60);
  const [exporting, setExporting] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef({
    raf: null, startTime: 0, running: false,
    fullImg: null, shapeImgs: [],
    // alpha matting 所需的白底/黑底版本
    whiteImg: null, blackImg: null,
    whiteShapeImgs: [], blackShapeImgs: [],
    tmpW: null, tmpB: null,
  });

  const shapeCount = config.count || 1;
  const duration = (ANIMATION_MODES[mode]?.duration || 800) + (mode === "staggerPetal" ? shapeCount * 40 : 0);
  const bgColor = config.canvasBg ?? "#ffffff";

  // 预渲染 SVG 为图片（普通版 + 白底/黑底 matting 版）
  useEffect(() => {
    const svg = previewRef?.current?.querySelector("svg");
    if (!svg) return;
    let cancelled = false;
    (async () => {
      // 普通版（无背景）用于非透明模式
      const full = await svgToImg(svg, size, size);
      if (cancelled) return;
      animRef.current.fullImg = full;

      // 白底/黑底版本用于透明模式 alpha matting
      const [whiteImg, blackImg] = await Promise.all([
        svgToImg(svg, size, size, "#ffffff"),
        svgToImg(svg, size, size, "#000000"),
      ]);
      if (cancelled) return;
      animRef.current.whiteImg = whiteImg;
      animRef.current.blackImg = blackImg;

      if (mode === "staggerPetal") {
        const [shapes, whiteShapes, blackShapes] = await Promise.all([
          splitShapeImages(svg, size, size),
          splitShapeImages(svg, size, size, "#ffffff"),
          splitShapeImages(svg, size, size, "#000000"),
        ]);
        if (cancelled) return;
        animRef.current.shapeImgs = shapes;
        animRef.current.whiteShapeImgs = whiteShapes;
        animRef.current.blackShapeImgs = blackShapes;
      } else {
        animRef.current.shapeImgs = [];
        animRef.current.whiteShapeImgs = [];
        animRef.current.blackShapeImgs = [];
      }

      // 创建/复用 matting 临时画布
      if (!animRef.current.tmpW || animRef.current.tmpW.width !== size) {
        const tmpW = document.createElement("canvas");
        tmpW.width = size; tmpW.height = size;
        tmpW.getContext("2d", { willReadFrequently: true });
        animRef.current.tmpW = tmpW;

        const tmpB = document.createElement("canvas");
        tmpB.width = size; tmpB.height = size;
        tmpB.getContext("2d", { willReadFrequently: true });
        animRef.current.tmpB = tmpB;
      }
    })();
    return () => { cancelled = true; };
  }, [config, mode, size, previewRef]);

  // 预览动画循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: transparentBg });
    animRef.current.running = true;
    animRef.current.startTime = 0;

    function loop() {
      if (!animRef.current.running) return;
      const now = performance.now();
      if (!animRef.current.startTime) animRef.current.startTime = now;
      const elapsed = now - animRef.current.startTime;
      const totalLoop = duration + 800;
      const t = elapsed % totalLoop;
      const progress = Math.min(t / duration, 1);

      const matteData = transparentBg && animRef.current.tmpW ? {
        whiteImg: animRef.current.whiteImg,
        blackImg: animRef.current.blackImg,
        whiteShapeImgs: animRef.current.whiteShapeImgs,
        blackShapeImgs: animRef.current.blackShapeImgs,
        tmpW: animRef.current.tmpW,
        tmpB: animRef.current.tmpB,
      } : null;

      renderFrame(ctx, mode, progress, size, animRef.current.fullImg, animRef.current.shapeImgs, bgColor, transparentBg, matteData);
      animRef.current.raf = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      animRef.current.running = false;
      if (animRef.current.raf) cancelAnimationFrame(animRef.current.raf);
    };
  }, [config, mode, size, duration, bgColor, transparentBg]);

  // 导出 WebM 视频
  const handleExport = useCallback(async () => {
    const svg = previewRef?.current?.querySelector("svg");
    if (!svg) return;
    setExporting(true);
    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = size;
      exportCanvas.height = size;
      const ctx = exportCanvas.getContext("2d", { willReadFrequently: transparentBg });

      // 普通版
      const fullImg = await svgToImg(svg, size, size);
      const shapeImgs = mode === "staggerPetal" ? await splitShapeImages(svg, size, size) : [];

      // alpha matting 版本
      let matteData = null;
      if (transparentBg) {
        const [whiteImg, blackImg] = await Promise.all([
          svgToImg(svg, size, size, "#ffffff"),
          svgToImg(svg, size, size, "#000000"),
        ]);
        const [whiteShapeImgs, blackShapeImgs] = mode === "staggerPetal"
          ? await Promise.all([
              splitShapeImages(svg, size, size, "#ffffff"),
              splitShapeImages(svg, size, size, "#000000"),
            ])
          : [[], []];

        const tmpW = document.createElement("canvas");
        tmpW.width = size; tmpW.height = size;
        tmpW.getContext("2d", { willReadFrequently: true });
        const tmpB = document.createElement("canvas");
        tmpB.width = size; tmpB.height = size;
        tmpB.getContext("2d", { willReadFrequently: true });

        matteData = { whiteImg, blackImg, whiteShapeImgs, blackShapeImgs, tmpW, tmpB };
      }

      const stream = exportCanvas.captureStream(fps);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8000000 });
      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);

      const blob = await new Promise((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
        recorder.start();
        const holdFrames = Math.ceil(0.5 * fps);
        const animFrames = Math.ceil(duration / 1000 * fps);
        const totalFrames = animFrames + holdFrames;
        let frame = 0;

        function tick() {
          const progress = Math.min(frame / animFrames, 1);
          renderFrame(ctx, mode, progress, size, fullImg, shapeImgs, bgColor, transparentBg, matteData);
          frame++;
          if (frame <= totalFrames) { requestAnimationFrame(tick); } else { recorder.stop(); }
        }
        tick();
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `logo-anim-${mode}-${size}px${transparentBg ? "-alpha" : ""}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("HD export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [config, mode, size, fps, duration, bgColor, transparentBg, previewRef]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[560px] max-w-[90vw] max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-xl">
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-100 bg-gradient-to-r from-violet-50 to-fuchsia-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6.47L5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-800">高清动画导出</h3>
              <p className="text-xs text-zinc-500">100% 还原 · WebM 视频</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 预览 */}
          <div className="flex justify-center">
            <div
              className="rounded-xl border border-zinc-200 overflow-hidden"
              style={transparentBg
                ? { backgroundImage: "repeating-conic-gradient(#e4e4e7 0% 25%, #fff 0% 50%)", backgroundSize: "16px 16px" }
                : { backgroundColor: bgColor }
              }
            >
              <canvas ref={canvasRef} style={{ width: 200, height: 200 }} />
            </div>
          </div>

          {/* 动画模式 */}
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-2 block">动画模式</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(ANIMATION_MODES).map(([key, m]) => (
                <button key={key} onClick={() => setMode(key)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                    mode === key ? "bg-violet-500 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}>
                  <span>{m.icon}</span>{m.name}
                </button>
              ))}
            </div>
          </div>

          {/* 透明背景 */}
          <label className="flex items-center justify-between cursor-pointer py-1 px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-zinc-600">透明背景</span>
              <span className="text-xs text-zinc-400">(WebM Alpha 通道)</span>
            </div>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative ${transparentBg ? 'bg-violet-500' : 'bg-zinc-300'}`}
              onClick={() => setTransparentBg(!transparentBg)}
            >
              <div className={`w-4 h-4 rounded-full bg-white shadow absolute top-0.5 transition-transform ${transparentBg ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </label>

          {/* 参数 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">帧率</label>
              <select value={fps} onChange={(e) => setFps(Number(e.target.value))} className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg">
                <option value={30}>30 fps</option>
                <option value={60}>60 fps</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-zinc-500 mb-1.5 block">分辨率</label>
              <select value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full px-3 py-1.5 text-sm bg-zinc-50 border border-zinc-200 rounded-lg">
                <option value={512}>512px</option>
                <option value={1024}>1024px</option>
                <option value={2048}>2048px (4K)</option>
              </select>
            </div>
          </div>

          {/* 统计 */}
          <div className="bg-zinc-50 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-zinc-800">{Math.ceil(duration / 1000 * fps)}</div>
                <div className="text-xs text-zinc-500">总帧数</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-800">{((duration + 500) / 1000).toFixed(1)}s</div>
                <div className="text-xs text-zinc-500">时长</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-zinc-800">{size}px</div>
                <div className="text-xs text-zinc-500">分辨率</div>
              </div>
            </div>
          </div>

          {/* 导出按钮 */}
          <button onClick={handleExport} disabled={exporting}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2">
            {exporting ? (
              <><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60"/></svg>导出中...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>导出 WebM 视频</>
            )}
          </button>
          <p className="text-xs text-zinc-400 text-center">渐变 · 阴影 · 模糊等效果 100% 还原，可用 FFmpeg 转 MP4</p>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
