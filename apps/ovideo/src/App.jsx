import { useMemo, useRef, useState } from 'react';
import { Player } from '@remotion/player';
import { MemoryTunnelVideo } from './remotion/compositions/MemoryTunnelVideo';

const defaultConfig = {
  resolution: '1920x1080',
  fps: 30,
  duration: 12,
  tunnelSpeed: 420,
  cardScaleMax: 2.6,
  flashDuration: 0.15,
  colorGrading: 'warm',
  vignette: true,
  filmGrain: true,
  seed: 2026
};

const phases = [
  { name: '图片排字', range: '0-2s' },
  { name: '散开与隧道入口', range: '2-3.2s' },
  { name: '隧道穿梭与特写', range: '3.2-8.5s' },
  { name: '收尾聚合', range: '8.5-12s' }
];

const parseResolution = (value) => {
  const [w, h] = value.split('x').map(Number);
  return [w || 1920, h || 1080];
};

const ipc = window.ovideo;

const toFileUrl = (filePath) => encodeURI(`file://${filePath}`);
const toOvideoUrl = (filePath) => encodeURI(`ovideo://${filePath}`);

export default function App() {
  const [titleText, setTitleText] = useState('你是否也有这样的瞬间');
  const [images, setImages] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [config, setConfig] = useState(defaultConfig);
  const [renderStatus, setRenderStatus] = useState('');
  const [renderProgress, setRenderProgress] = useState(0);
  const fileInputRef = useRef(null);
  const hasIPC = Boolean(ipc?.openImages);

  const selectedImages = useMemo(() => {
    const set = new Set(selectedIds);
    return images.filter((item) => set.has(item.id));
  }, [images, selectedIds]);

  const inputProps = useMemo(() => {
    const [width, height] = parseResolution(config.resolution);
    return {
      images: selectedImages.map((item) => item.preview),
      titleText,
      fps: Number(config.fps),
      duration: Number(config.duration),
      resolution: [width, height],
      tunnelSpeed: Number(config.tunnelSpeed),
      cardScaleMax: Number(config.cardScaleMax),
      flashDuration: Number(config.flashDuration),
      colorGrading: config.colorGrading,
      vignette: config.vignette,
      filmGrain: config.filmGrain,
      seed: Number(config.seed)
    };
  }, [config, selectedImages, titleText]);

  const renderInputProps = useMemo(() => {
    const [width, height] = parseResolution(config.resolution);
    return {
      images: selectedImages.map((item) => item.fileUrl),
      titleText,
      fps: Number(config.fps),
      duration: Number(config.duration),
      resolution: [width, height],
      tunnelSpeed: Number(config.tunnelSpeed),
      cardScaleMax: Number(config.cardScaleMax),
      flashDuration: Number(config.flashDuration),
      colorGrading: config.colorGrading,
      vignette: config.vignette,
      filmGrain: config.filmGrain,
      seed: Number(config.seed)
    };
  }, [config, selectedImages, titleText]);

  const durationInFrames = Math.round(Number(config.duration) * Number(config.fps));
  const [width, height] = parseResolution(config.resolution);

  const addImageItems = (items) => {
    if (!items.length) return;
    setImages((prev) => {
      const existing = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      items.forEach((item) => {
        if (!existing.has(item.id)) merged.push(item);
      });
      return merged;
    });
    setSelectedIds((prev) => {
      const set = new Set(prev);
      items.forEach((item) => set.add(item.id));
      return Array.from(set);
    });
  };

  const handlePickImages = async () => {
    if (hasIPC) {
      try {
        const paths = await ipc.openImages();
        if (!paths?.length) return;
        const next = paths.map((path) => ({
          id: path,
          path,
          preview: toOvideoUrl(path),
          fileUrl: toFileUrl(path)
        }));
        addImageItems(next);
      } catch (error) {
        setRenderStatus(`选择图片失败：${error?.message || error}`);
      }
      return;
    }
    fileInputRef.current?.click();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    if (!files.length) return;
    const next = files.map((file) => {
      const filePath = file.path || file.name;
      return {
        id: filePath,
        path: filePath,
        preview: file.path ? toOvideoUrl(file.path) : URL.createObjectURL(file),
        fileUrl: file.path ? toFileUrl(file.path) : null
      };
    });
    addImageItems(next);
  };

  const handleFileInput = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    const next = files.map((file) => ({
      id: file.path || file.name,
      path: file.path || file.name,
      preview: file.path ? toOvideoUrl(file.path) : URL.createObjectURL(file),
      fileUrl: file.path ? toFileUrl(file.path) : null
    }));
    addImageItems(next);
    event.target.value = '';
  };

  const handleRender = async () => {
    if (!ipc?.renderVideo || selectedImages.length === 0) return;
    const missing = selectedImages.filter((item) => !item.fileUrl);
    if (missing.length) {
      setRenderStatus('部分素材无法读取本地路径，请使用“选择图片”导入。');
      return;
    }
    setRenderStatus('渲染中...');
    setRenderProgress(0);
    ipc.onRenderProgress((progress) => setRenderProgress(progress));
    ipc.onRenderDone((output) => {
      setRenderStatus(`渲染完成：${output}`);
    });
    ipc.onRenderError((message) => {
      setRenderStatus(`渲染失败：${message}`);
    });
    await ipc.renderVideo({
      inputProps: renderInputProps
    });
  };

  return (
    <div className="app" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <aside className="sidebar">
        <div className="brand">ovideo</div>

        <div className="card">
          <div className="label">输入文字</div>
          <input
            className="input"
            value={titleText}
            onChange={(event) => setTitleText(event.target.value)}
          />
        </div>

        <div className="card">
          <div className="label">分辨率</div>
          <select
            value={config.resolution}
            onChange={(event) => setConfig((prev) => ({ ...prev, resolution: event.target.value }))}
          >
            <option value="1920x1080">16:9 1920×1080</option>
            <option value="1080x1920">9:16 1080×1920</option>
            <option value="1080x1080">1:1 1080×1080</option>
          </select>
          <div className="row" style={{ marginTop: 10 }}>
            <input
              className="input"
              type="number"
              value={config.fps}
              onChange={(event) => setConfig((prev) => ({ ...prev, fps: event.target.value }))}
              placeholder="fps"
            />
            <input
              className="input"
              type="number"
              value={config.duration}
              onChange={(event) => setConfig((prev) => ({ ...prev, duration: event.target.value }))}
              placeholder="时长"
            />
          </div>
        </div>

        <div className="card">
          <div className="label">特效强度</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <label className="label">隧道速度 {config.tunnelSpeed}</label>
            <input
              type="range"
              min="200"
              max="600"
              value={config.tunnelSpeed}
              onChange={(event) => setConfig((prev) => ({ ...prev, tunnelSpeed: Number(event.target.value) }))}
            />
            <label className="label">卡片放大 {config.cardScaleMax}</label>
            <input
              type="range"
              min="2"
              max="3"
              step="0.1"
              value={config.cardScaleMax}
              onChange={(event) => setConfig((prev) => ({ ...prev, cardScaleMax: Number(event.target.value) }))}
            />
            <label className="label">闪光时长 {config.flashDuration}s</label>
            <input
              type="range"
              min="0.1"
              max="0.2"
              step="0.01"
              value={config.flashDuration}
              onChange={(event) => setConfig((prev) => ({ ...prev, flashDuration: Number(event.target.value) }))}
            />
          </div>
        </div>

        <div className="card">
          <div className="label">素材管理</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="secondary-btn" onClick={handlePickImages}>选择图片</button>
            <button
              className="secondary-btn"
              onClick={() => setSelectedIds(images.map((item) => item.id))}
            >
              全选
            </button>
            <button className="secondary-btn" onClick={() => setSelectedIds([])}>清空</button>
          </div>
          <div className="status" style={{ marginTop: 8 }}>
            已选 {selectedImages.length} / {images.length}
          </div>
          {!hasIPC && (
            <div className="status" style={{ marginTop: 6 }}>
              未检测到 Electron IPC，已启用浏览器文件选择模式。
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
        </div>

        <button
          className="primary-btn"
          onClick={handleRender}
          disabled={selectedImages.length === 0}
        >
          开始导出 MP4
        </button>
        <div className="status">
          {renderStatus || `渲染进度：${Math.round(renderProgress * 100)}%`}
        </div>
      </aside>

      <main className="content">
        <div className="preview-card">
          <div className="preview-header">
            <div>
              <div style={{ fontSize: 20, fontWeight: 600 }}>动画预览</div>
              <div className="status">拖拽图片到窗口即可导入</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {phases.map((phase) => (
                <span key={phase.name} className="badge">{phase.range}</span>
              ))}
            </div>
          </div>
          <Player
            component={MemoryTunnelVideo}
            durationInFrames={durationInFrames}
            fps={Number(config.fps)}
            compositionWidth={width}
            compositionHeight={height}
            style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }}
            inputProps={inputProps}
            controls
            loop
          />
        </div>

        <div className="card">
          <div className="label">已导入素材</div>
          <div className="grid">
            {images.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`thumb ${selected ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedIds((prev) =>
                      prev.includes(item.id)
                        ? prev.filter((id) => id !== item.id)
                        : [...prev, item.id]
                    );
                  }}
                >
                  <img src={item.preview} alt="preview" />
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
