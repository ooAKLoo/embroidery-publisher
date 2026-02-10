import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

const DEFAULT_CONFIG = {
  colorMode: 'color',
  hierarchical: 'stacked',
  mode: 'spline',
  filterSpeckle: 4,
  colorPrecision: 6,
  layerDifference: 16,
  cornerThreshold: 60,
  lengthThreshold: 4,
  maxIterations: 10,
  spliceThreshold: 45
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

function SliderRow({ label, value, onChange, min, max, step, hint }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={event => onChange(Number(event.target.value))}
        className="w-full accent-slate-900"
      />
      {hint ? <div className="text-[10px] text-slate-400">{hint}</div> : null}
    </div>
  );
}

function ToggleButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {children}
    </button>
  );
}

function VTracerStudio() {
  const [sourceName, setSourceName] = useState('');
  const [sourceDataUrl, setSourceDataUrl] = useState('');
  const [svgText, setSvgText] = useState('');
  const [previewTab, setPreviewTab] = useState('svg');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [usePathPrecision, setUsePathPrecision] = useState(false);
  const [pathPrecision, setPathPrecision] = useState(8);
  const [svgUrl, setSvgUrl] = useState('');
  const latestConfigRef = useRef(null);
  const latestSourceRef = useRef('');
  const pendingRef = useRef(false);
  const processingRef = useRef(false);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    if (!svgText) {
      setSvgUrl('');
      return;
    }
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setSvgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [svgText]);

  const configPayload = useMemo(
    () => ({
      ...config,
      pathPrecision: usePathPrecision ? pathPrecision : null
    }),
    [config, usePathPrecision, pathPrecision]
  );

  const loadFile = useCallback(async file => {
    if (!file || !file.type.startsWith('image/')) {
      setError('请选择图片文件（PNG/JPG/WebP 等）');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setSourceName(file.name);
      setSourceDataUrl(String(dataUrl));
      setSvgText('');
      setPreviewTab('svg');
      setError('');
    } catch (err) {
      setError(err.message || '读取图片失败');
    }
  }, []);

  const handleFileChange = useCallback(
    async event => {
      const file = event.target.files?.[0];
      if (file) {
        await loadFile(file);
      }
      event.target.value = '';
    },
    [loadFile]
  );

  const handleDrop = useCallback(
    async event => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        await loadFile(file);
      }
    },
    [loadFile]
  );

  useEffect(() => {
    latestConfigRef.current = configPayload;
  }, [configPayload]);

  useEffect(() => {
    latestSourceRef.current = sourceDataUrl;
  }, [sourceDataUrl]);

  const generateSvg = useCallback(async () => {
    if (!latestSourceRef.current || !latestConfigRef.current) return;
    if (processingRef.current) {
      pendingRef.current = true;
      return;
    }
    processingRef.current = true;
    setIsProcessing(true);
    setError('');
    try {
      const result = await invoke('vectorize_image', {
        imageBase64: latestSourceRef.current,
        config: latestConfigRef.current
      });
      setSvgText(result);
      setPreviewTab('svg');
    } catch (err) {
      setError(err?.message || '生成 SVG 失败');
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
      if (pendingRef.current) {
        pendingRef.current = false;
        generateSvg();
      }
    }
  }, []);

  useEffect(() => {
    if (!autoUpdate || !sourceDataUrl) return;
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      generateSvg();
    }, 650);
    return () => window.clearTimeout(debounceTimerRef.current);
  }, [autoUpdate, sourceDataUrl, configPayload, generateSvg]);

  const handleDownload = useCallback(() => {
    if (!svgText) return;
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = sourceName
      ? sourceName.replace(/\.[^.]+$/, '.svg')
      : 'vtracer.svg';
    anchor.click();
    URL.revokeObjectURL(url);
  }, [svgText, sourceName]);

  return (
    <div className="h-full flex gap-4">
      <div className="flex-1 bg-white rounded-2xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">VTracer 矢量化</h2>
            <p className="text-xs text-slate-500">上传图片，一键生成可编辑 SVG</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              className="accent-slate-900"
              checked={autoUpdate}
              onChange={event => setAutoUpdate(event.target.checked)}
            />
            自动更新
          </label>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer">
            上传图片
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {sourceName ? (
            <span className="text-xs text-slate-500 truncate max-w-[240px]">
              {sourceName}
            </span>
          ) : null}
          <button
            type="button"
            onClick={generateSvg}
            disabled={!sourceDataUrl || isProcessing}
            className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '处理中…' : '生成 SVG'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!svgText}
            className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下载 SVG
          </button>
          {svgText ? (
            <span className="text-[10px] text-slate-400">
              {Math.round(svgText.length / 1024)} KB
            </span>
          ) : null}
        </div>

        <div
          className="flex-1 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-4 flex flex-col gap-4"
          onDragOver={event => event.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="flex items-center gap-2">
            <ToggleButton
              active={previewTab === 'source'}
              onClick={() => setPreviewTab('source')}
            >
              原图
            </ToggleButton>
            <ToggleButton
              active={previewTab === 'svg'}
              onClick={() => setPreviewTab('svg')}
            >
              SVG
            </ToggleButton>
            {error ? <span className="text-xs text-rose-500 ml-2">{error}</span> : null}
          </div>

          <div className="flex-1 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden">
            {!sourceDataUrl ? (
              <div className="text-center text-sm text-slate-400">
                拖拽或上传图片开始矢量化
              </div>
            ) : previewTab === 'source' ? (
              <img
                src={sourceDataUrl}
                alt="source"
                className="max-w-full max-h-full object-contain"
              />
            ) : svgUrl ? (
              <img
                src={svgUrl}
                alt="svg preview"
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="text-center text-sm text-slate-400">
                生成 SVG 后可在此预览
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-80 bg-white rounded-2xl p-4 overflow-y-auto space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Clustering</h3>
          <div className="flex gap-2">
            <ToggleButton
              active={config.colorMode === 'binary'}
              onClick={() => setConfig(prev => ({ ...prev, colorMode: 'binary' }))}
            >
              B/W
            </ToggleButton>
            <ToggleButton
              active={config.colorMode === 'color'}
              onClick={() => setConfig(prev => ({ ...prev, colorMode: 'color' }))}
            >
              COLOR
            </ToggleButton>
          </div>

          <div className="flex gap-2">
            <ToggleButton
              active={config.hierarchical === 'cutout'}
              onClick={() => setConfig(prev => ({ ...prev, hierarchical: 'cutout' }))}
            >
              CUTOUT
            </ToggleButton>
            <ToggleButton
              active={config.hierarchical === 'stacked'}
              onClick={() => setConfig(prev => ({ ...prev, hierarchical: 'stacked' }))}
            >
              STACKED
            </ToggleButton>
          </div>
        </div>

        <div className="space-y-4">
          <SliderRow
            label="Filter Speckle"
            value={config.filterSpeckle}
            min={0}
            max={20}
            step={1}
            onChange={value => setConfig(prev => ({ ...prev, filterSpeckle: value }))}
          />
          <SliderRow
            label="Color Precision"
            value={config.colorPrecision}
            min={1}
            max={8}
            step={1}
            onChange={value => setConfig(prev => ({ ...prev, colorPrecision: value }))}
          />
          <SliderRow
            label="Gradient Step"
            value={config.layerDifference}
            min={1}
            max={100}
            step={1}
            onChange={value => setConfig(prev => ({ ...prev, layerDifference: value }))}
          />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-900">Curve Fitting</h3>
          <div className="flex gap-2">
            <ToggleButton
              active={config.mode === 'pixel'}
              onClick={() => setConfig(prev => ({ ...prev, mode: 'pixel' }))}
            >
              PIXEL
            </ToggleButton>
            <ToggleButton
              active={config.mode === 'polygon'}
              onClick={() => setConfig(prev => ({ ...prev, mode: 'polygon' }))}
            >
              POLYGON
            </ToggleButton>
            <ToggleButton
              active={config.mode === 'spline'}
              onClick={() => setConfig(prev => ({ ...prev, mode: 'spline' }))}
            >
              SPLINE
            </ToggleButton>
          </div>
        </div>

        <div className="space-y-4">
          <SliderRow
            label="Corner Threshold"
            value={config.cornerThreshold}
            min={0}
            max={180}
            step={1}
            onChange={value => setConfig(prev => ({ ...prev, cornerThreshold: value }))}
          />
          <SliderRow
            label="Segment Length"
            value={config.lengthThreshold}
            min={0}
            max={20}
            step={0.5}
            onChange={value => setConfig(prev => ({ ...prev, lengthThreshold: value }))}
          />
          <SliderRow
            label="Splice Threshold"
            value={config.spliceThreshold}
            min={0}
            max={90}
            step={1}
            onChange={value => setConfig(prev => ({ ...prev, spliceThreshold: value }))}
          />
        </div>

        <details className="space-y-3">
          <summary className="text-sm font-semibold text-slate-900 cursor-pointer">
            高级设置
          </summary>
          <div className="space-y-4 pt-2">
            <SliderRow
              label="Max Iterations"
              value={config.maxIterations}
              min={1}
              max={20}
              step={1}
              onChange={value => setConfig(prev => ({ ...prev, maxIterations: value }))}
            />
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  className="accent-slate-900"
                  checked={usePathPrecision}
                  onChange={event => setUsePathPrecision(event.target.checked)}
                />
                启用 Path Precision
              </label>
              <input
                type="number"
                min={1}
                max={12}
                step={1}
                value={pathPrecision}
                onChange={event => setPathPrecision(Number(event.target.value))}
                disabled={!usePathPrecision}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 disabled:bg-slate-100 disabled:text-slate-400"
              />
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default VTracerStudio;
