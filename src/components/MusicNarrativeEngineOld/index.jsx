import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioAnalyzer } from '../MusicNarrativeEngine/audioAnalyzer';
import { CanvasRenderer } from './renderer';
import { PALETTES, DEFAULT_CONFIG } from '../MusicNarrativeEngine/presets';

export default function MusicNarrativeEngineOld() {
  const canvasRef   = useRef(null);
  const audioRef    = useRef(null);
  const analyzerRef = useRef(null);
  const rendererRef = useRef(null);
  const rafRef      = useRef(null);

  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [curTime, setCurTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [cfg, setCfg] = useState({ palette: 'cosmic' });

  // ── helpers ──
  const set = (k, v) => setCfg(prev => ({ ...prev, [k]: v }));
  const fmt = (t) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // ── File upload ──
  const onFileChange = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setPlaying(false);
    setCurTime(0);
  }, [audioUrl]);

  // ── Audio element events ──
  useEffect(() => {
    if (!audioUrl || !audioRef.current) return;
    const a = audioRef.current;
    a.src = audioUrl;
    a.load();
    const onMeta = () => setDur(a.duration || 0);
    const onTime = () => setCurTime(a.currentTime || 0);
    const onEnd  = () => setPlaying(false);
    a.addEventListener('loadedmetadata', onMeta);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('loadedmetadata', onMeta);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
    };
  }, [audioUrl]);

  // ── Canvas resize observer ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        if (width < 10 || height < 10) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    });
    obs.observe(canvas.parentElement);
    return () => obs.disconnect();
  }, []);

  // ── Animation loop ──
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      if (!rendererRef.current && canvasRef.current) {
        rendererRef.current = new CanvasRenderer(canvasRef.current);
      }
      const ren = rendererRef.current;
      if (!ren) { rafRef.current = requestAnimationFrame(loop); return; }

      const audio = analyzerRef.current?.analyze() ||
        { rms: 0, lowEnergy: 0, midEnergy: 0, highEnergy: 0, isBeat: false, isDownbeat: false, beatStrength: 0, bpm: 0, isOnset: false, spectralCentroid: 0 };

      ren.render(audio, cfg);

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, [cfg]);

  // ── Play/Pause ──
  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    if (!analyzerRef.current) {
      analyzerRef.current = new AudioAnalyzer();
      analyzerRef.current.init(a);
    }
    analyzerRef.current.resume();
    if (playing) a.pause(); else a.play();
    setPlaying(!playing);
  }, [playing, audioUrl]);

  // ── Seek ──
  const onSeek = useCallback((e) => {
    const a = audioRef.current;
    if (!a || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * dur;
  }, [dur]);

  // ── Cleanup ──
  useEffect(() => () => {
    analyzerRef.current?.destroy();
    rendererRef.current?.destroy();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, []);

  return (
    <div className="h-full flex flex-col bg-slate-950 rounded-2xl overflow-hidden relative select-none">
      <audio ref={audioRef} crossOrigin="anonymous" preload="auto" />

      {/* ── Canvas ── */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        {/* Upload prompt */}
        {!audioFile && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <label className="cursor-pointer group">
              <div className="flex flex-col items-center gap-4 px-14 py-12 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.08] transition-all">
                <svg className="w-14 h-14 text-white/30 group-hover:text-white/60 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 19V6l12-3v13M9 19c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2zm12-3c0 1.1-1.3 2-3 2s-3-.9-3-2 1.3-2 3-2 3 .9 3 2z" />
                </svg>
                <div className="text-white/50 text-sm font-light">Upload audio to begin</div>
                <div className="text-white/25 text-xs">MP3 / WAV / OGG / FLAC</div>
              </div>
              <input type="file" accept="audio/*" onChange={onFileChange} className="hidden" />
            </label>
          </div>
        )}

        {/* Top-left: file info + switch */}
        {audioFile && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur text-white/60 text-[11px] truncate max-w-52">
              {audioFile.name}
            </div>
            <label className="cursor-pointer px-2 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white/35 hover:text-white/70 text-[11px] transition-all backdrop-blur">
              Switch
              <input type="file" accept="audio/*" onChange={onFileChange} className="hidden" />
            </label>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      {audioFile && (
        <div className="flex-shrink-0 bg-black/30 backdrop-blur border-t border-white/[0.04]">
          {/* Progress */}
          <div className="px-4 pt-2.5 pb-0.5">
            <div className="h-1 bg-white/[0.08] rounded-full cursor-pointer group relative" onClick={onSeek}>
              <div className="h-full bg-white/35 group-hover:bg-white/55 rounded-full transition-colors"
                style={{ width: dur ? `${(curTime / dur) * 100}%` : '0%' }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/25 mt-0.5 font-mono">
              <span>{fmt(curTime)}</span><span>{fmt(dur)}</span>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 px-4 pb-2.5">
            <button onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.16] flex items-center justify-center text-white/80 transition-all">
              {playing ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Palette chips */}
            <div className="flex-1 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {Object.entries(PALETTES).map(([k, v]) => (
                <button key={k} onClick={() => set('palette', k)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-md text-[10px] transition-all ${
                    cfg.palette === k ? 'bg-white/15 text-white/90' : 'bg-white/[0.04] text-white/30 hover:bg-white/[0.08] hover:text-white/50'
                  }`}>
                  {v.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
