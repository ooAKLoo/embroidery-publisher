import { useState, useRef, useEffect, useCallback } from 'react';
import { AudioAnalyzer } from './audioAnalyzer';
import { ParticleSystem } from './particleSystem';
import { CanvasRenderer } from './renderer';
import { PALETTES, FORMATIONS, ENERGY_MAP, DEFAULT_CONFIG } from './presets';

// ═══════════════════════════════════════════════════════════════════
//  Choreographer — maps audio energy to formations with hysteresis
// ═══════════════════════════════════════════════════════════════════
function pickFormation(smoothedEnergy) {
  for (const tier of ENERGY_MAP) {
    if (smoothedEnergy <= tier.max) return tier.formation;
  }
  return 'grid';
}

// ═══════════════════════════════════════════════════════════════════
//  Main component
// ═══════════════════════════════════════════════════════════════════
export default function MusicNarrativeEngine() {
  const canvasRef   = useRef(null);
  const audioRef    = useRef(null);
  const analyzerRef = useRef(null);
  const systemRef   = useRef(null);
  const rendererRef = useRef(null);
  const rafRef      = useRef(null);
  const sizeRef     = useRef({ w: 0, h: 0 });
  const energyRef   = useRef(0);          // smoothed energy for choreography
  const formRef     = useRef('grid');      // current auto-formation
  const holdRef     = useRef(0);           // hysteresis cooldown

  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [curTime, setCurTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [panelOpen, setPanelOpen] = useState(true);

  // ── helpers ──
  const set = (k, v) => setCfg(prev => ({ ...prev, [k]: v }));
  const toggleMod = (k) =>
    setCfg(prev => ({ ...prev, modifiers: { ...prev.modifiers, [k]: !prev.modifiers[k] } }));
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
        sizeRef.current = { w: width, h: height };
        if (systemRef.current) systemRef.current.resize(width, height);
      }
    });
    obs.observe(canvas.parentElement);
    return () => obs.disconnect();
  }, []);

  // ── Re-init system when grid size changes ──
  useEffect(() => {
    const { w, h } = sizeRef.current;
    if (w > 0 && h > 0) {
      systemRef.current = new ParticleSystem(w, h, cfg.cols, cfg.rows);
    }
  }, [cfg.cols, cfg.rows]);

  // ── Animation loop ──
  useEffect(() => {
    let alive = true;
    const loop = () => {
      if (!alive) return;
      const { w, h } = sizeRef.current;

      // Lazy-init
      if (!systemRef.current && w > 0 && h > 0) {
        systemRef.current = new ParticleSystem(w, h, cfg.cols, cfg.rows);
      }
      if (!rendererRef.current && canvasRef.current) {
        rendererRef.current = new CanvasRenderer(canvasRef.current);
      }
      const sys = systemRef.current;
      const ren = rendererRef.current;
      if (!sys || !ren) { rafRef.current = requestAnimationFrame(loop); return; }

      // Audio data
      const audio = analyzerRef.current?.analyze() ||
        { rms: 0, lowEnergy: 0, midEnergy: 0, highEnergy: 0, isBeat: false, isDownbeat: false, beatStrength: 0, bpm: 0, isOnset: false, spectralCentroid: 0 };

      // ── Choreographer: auto-formation switching ──
      if (cfg.autoChoreography) {
        energyRef.current += (audio.rms - energyRef.current) * 0.04; // smooth
        holdRef.current = Math.max(0, holdRef.current - 1);

        const desired = pickFormation(energyRef.current);
        if (desired !== formRef.current && holdRef.current <= 0) {
          formRef.current = desired;
          holdRef.current = 40; // ~40 frames cooldown (~0.67s) before next switch
          sys.applyFormation(desired);
        }
      }

      // Update system
      sys.update(audio, cfg);

      // Render
      ren.render(sys, audio, {
        palette: cfg.palette,
        showConnections: cfg.showConnections,
        trailEffect: cfg.trailEffect,
        showColumns: cfg.showColumns,
      });

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

  // ── Manual formation ──
  const setFormation = (name) => {
    set('formation', name);
    set('autoChoreography', false);
    formRef.current = name;
    systemRef.current?.applyFormation(name);
  };

  // ── Cleanup ──
  useEffect(() => () => {
    analyzerRef.current?.destroy();
    rendererRef.current?.destroy();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, []);

  // ─────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────
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

        {/* Top-right: panel toggle */}
        <button
          onClick={() => setPanelOpen(!panelOpen)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg bg-black/40 backdrop-blur hover:bg-black/60 text-white/50 hover:text-white/80 flex items-center justify-center transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {panelOpen
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            }
          </svg>
        </button>

        {/* ── Side panel ── */}
        {panelOpen && (
          <div className="absolute top-14 right-3 w-56 bg-black/50 backdrop-blur-xl rounded-xl border border-white/[0.06] p-3 space-y-3.5 z-10 max-h-[calc(100%-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {/* Formation */}
            <Section title="Formation">
              <Chip active={cfg.autoChoreography} onClick={() => set('autoChoreography', true)}>Auto</Chip>
              {Object.entries(FORMATIONS).map(([k, v]) => (
                <Chip key={k} active={!cfg.autoChoreography && cfg.formation === k} onClick={() => setFormation(k)}>{v.name}</Chip>
              ))}
            </Section>

            {/* Palette */}
            <Section title="Palette">
              {Object.entries(PALETTES).map(([k, v]) => (
                <Chip key={k} active={cfg.palette === k} onClick={() => set('palette', k)}>{v.name}</Chip>
              ))}
            </Section>

            {/* Intensity */}
            <Section title={`Intensity ${Math.round(cfg.intensity * 100)}%`}>
              <input type="range" min="0" max="1" step="0.05" value={cfg.intensity}
                onChange={e => set('intensity', +e.target.value)}
                className="w-full h-1 appearance-none bg-white/10 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/70"
              />
            </Section>

            {/* Modifiers */}
            <Section title="Modifiers">
              {Object.keys(cfg.modifiers).map(k => (
                <Chip key={k} active={cfg.modifiers[k]} onClick={() => toggleMod(k)}>{k}</Chip>
              ))}
            </Section>

            {/* Toggles */}
            <Section title="Render">
              <Chip active={cfg.showColumns} onClick={() => set('showColumns', !cfg.showColumns)}>Columns</Chip>
              <Chip active={cfg.showConnections} onClick={() => set('showConnections', !cfg.showConnections)}>Lines</Chip>
              <Chip active={cfg.trailEffect} onClick={() => set('trailEffect', !cfg.trailEffect)}>Trail</Chip>
            </Section>
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

            {/* Quick palette chips */}
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

// ── Tiny UI primitives ──────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <div className="text-[10px] text-white/30 mb-1.5 uppercase tracking-widest font-medium">{title}</div>
      <div className="flex flex-wrap gap-1">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick}
      className={`px-2 py-[3px] rounded text-[10px] capitalize transition-all ${
        active ? 'bg-white/15 text-white/90' : 'bg-white/[0.04] text-white/35 hover:bg-white/[0.08] hover:text-white/55'
      }`}>
      {children}
    </button>
  );
}
