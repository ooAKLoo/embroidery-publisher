/**
 * AudioAnalyzer — extracts real-time musical features via Web Audio API.
 *
 * Dual AnalyserNode architecture:
 *   analyserFreq  — high smoothing (0.82) for stable frequency bands
 *   analyserOnset — low smoothing  (0.3)  for sharp transient detection
 *
 * Outputs per frame:
 *   rms              — overall loudness  (0..~0.5)
 *   lowEnergy        — bass   0–250 Hz   (0..1)
 *   midEnergy        — mid  250–4000 Hz   (0..1)
 *   highEnergy       — treble 4000+ Hz    (0..1)
 *   isBeat           — discrete beat event (adaptive + tempo-locked)
 *   isDownbeat       — strong beat (first beat of bar)
 *   beatStrength     — how strong this beat is (0..1)
 *   bpm              — estimated BPM (0 if not yet stable)
 *   isOnset          — transient / onset event
 *   spectralCentroid — brightness metric (0..1)
 */
export class AudioAnalyzer {
  constructor() {
    this.ctx = null;
    this.analyserFreq = null;
    this.analyserOnset = null;
    this.source = null;
    this.silentGain = null;

    this.timeDomain = null;
    this.freqData = null;
    this.onsetFreqData = null;
    this.prevSpectrum = null;

    // sample-rate derived
    this.sampleRate = 0;
    this.binHz = 0;

    // RMS
    this.rmsHistory = [];
    this.rmsHistoryLen = 30;

    // Beat tracking (time-based, ms)
    this.lastBeatTime = 0;
    this.lastOnsetTime = 0;
    this.prevFlux = 0;

    // Tempo estimation
    this.beatTimes = [];       // timestamps (ms) of recent beats
    this.beatTimesMax = 24;
    this.estimatedBPM = 0;
    this.beatInterval = 0;     // ms between beats derived from BPM
    this.beatPhase = 0;        // counts beats within a bar (0 = downbeat)
    this.beatsPerBar = 4;      // assume 4/4

    // Adaptive threshold: bass energy history
    this.bassHistory = [];
    this.bassHistoryLen = 60;  // ~1s at 60fps

    this.ready = false;
  }

  /** Call once, passing the <audio> element. */
  init(audioEl) {
    if (this.ready) return;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();

    // ── Frequency analyser — smooth, for band energy ──
    this.analyserFreq = this.ctx.createAnalyser();
    this.analyserFreq.fftSize = 2048;
    this.analyserFreq.smoothingTimeConstant = 0.82;

    // ── Onset analyser — sharp, for transient detection ──
    this.analyserOnset = this.ctx.createAnalyser();
    this.analyserOnset.fftSize = 2048;
    this.analyserOnset.smoothingTimeConstant = 0.3;

    // Route: source → both analysers; only freq analyser audible
    this.source = this.ctx.createMediaElementSource(audioEl);
    this.source.connect(this.analyserFreq);
    this.analyserFreq.connect(this.ctx.destination);

    // Onset analyser kept alive via silent gain (no audible doubling)
    this.silentGain = this.ctx.createGain();
    this.silentGain.gain.value = 0;
    this.source.connect(this.analyserOnset);
    this.analyserOnset.connect(this.silentGain);
    this.silentGain.connect(this.ctx.destination);

    const len = this.analyserFreq.frequencyBinCount;
    this.timeDomain = new Uint8Array(len);
    this.freqData = new Uint8Array(len);
    this.onsetFreqData = new Uint8Array(len);
    this.prevSpectrum = new Float32Array(len);

    this.sampleRate = this.ctx.sampleRate;
    this.binHz = this.sampleRate / this.analyserFreq.fftSize;
    this.ready = true;
  }

  /** Must be called inside a user gesture before playback. */
  resume() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  /** Returns feature object. Safe to call even when not ready. */
  analyze() {
    const zero = {
      rms: 0, lowEnergy: 0, midEnergy: 0, highEnergy: 0,
      isBeat: false, isDownbeat: false, beatStrength: 0, bpm: 0,
      isOnset: false, spectralCentroid: 0,
    };
    if (!this.analyserFreq) return zero;

    const now = performance.now();

    // Grab data from both analysers
    this.analyserFreq.getByteTimeDomainData(this.timeDomain);
    this.analyserFreq.getByteFrequencyData(this.freqData);
    this.analyserOnset.getByteFrequencyData(this.onsetFreqData);
    const N = this.freqData.length;

    // ── RMS (from time-domain) ──────────────────────
    let sum = 0;
    for (let i = 0; i < this.timeDomain.length; i++) {
      const v = (this.timeDomain[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / this.timeDomain.length);
    this.rmsHistory.push(rms);
    if (this.rmsHistory.length > this.rmsHistoryLen) this.rmsHistory.shift();
    const avgRMS = this.rmsHistory.reduce((a, b) => a + b, 0) / this.rmsHistory.length;

    // ── Frequency bands (Hz-based) ──────────────────
    const loBin = Math.max(1, Math.floor(250 / this.binHz));    // 0–250 Hz  (bass)
    const miBin = Math.floor(4000 / this.binHz);                // 250–4 kHz (mid)
    let sL = 0, sM = 0, sH = 0;
    for (let i = 1; i < loBin; i++) sL += this.freqData[i];
    for (let i = loBin; i < miBin; i++) sM += this.freqData[i];
    for (let i = miBin; i < N; i++) sH += this.freqData[i];
    const lowEnergy  = loBin > 1    ? sL / ((loBin - 1) * 255) : 0;
    const midEnergy  = miBin > loBin ? sM / ((miBin - loBin) * 255) : 0;
    const highEnergy = N > miBin     ? sH / ((N - miBin) * 255) : 0;

    // ── Spectral flux (from onset analyser — sharper response) ──
    let flux = 0;
    for (let i = 0; i < N; i++) {
      const c = this.onsetFreqData[i] / 255;
      const d = c - this.prevSpectrum[i];
      if (d > 0) flux += d;
      this.prevSpectrum[i] = c;
    }

    // ── Beat detection (adaptive threshold + tempo lock) ─────
    this.bassHistory.push(lowEnergy);
    if (this.bassHistory.length > this.bassHistoryLen) this.bassHistory.shift();

    // Adaptive threshold: mean + C × stdDev of bass energy
    let bSum = 0;
    for (const e of this.bassHistory) bSum += e;
    const bAvg = bSum / this.bassHistory.length;
    let bVar = 0;
    for (const e of this.bassHistory) bVar += (e - bAvg) * (e - bAvg);
    const bStd = Math.sqrt(bVar / this.bassHistory.length);

    const beatThreshold = bAvg + 1.3 * bStd + 0.01;

    const timeSinceBeat = now - this.lastBeatTime;
    // Minimum interval: half estimated beat interval, or 200 ms fallback
    const minInterval = this.beatInterval > 0 ? this.beatInterval * 0.4 : 200;

    const candidate = lowEnergy > beatThreshold
      && timeSinceBeat > minInterval
      && rms > 0.025;

    let isBeat = false;
    let beatStrength = 0;

    if (candidate) {
      if (this.beatInterval > 0) {
        // Accept if close to predicted beat, or if we've waited too long
        const predicted = this.lastBeatTime + this.beatInterval;
        const drift = Math.abs(now - predicted);
        const tolerance = this.beatInterval * 0.35;
        if (drift < tolerance || timeSinceBeat > this.beatInterval * 1.8) {
          isBeat = true;
        }
      } else {
        // No tempo yet — accept raw detection
        isBeat = true;
      }
    }

    // Missed-beat recovery: if we've waited 1.6× the expected interval
    if (!isBeat && this.beatInterval > 0 && timeSinceBeat > this.beatInterval * 1.6) {
      if (rms > avgRMS * 0.8) isBeat = true;
    }

    let isDownbeat = false;

    if (isBeat) {
      beatStrength = Math.min(1, (lowEnergy - bAvg) / (bStd + 0.001));
      this.lastBeatTime = now;
      this.beatTimes.push(now);
      if (this.beatTimes.length > this.beatTimesMax) this.beatTimes.shift();

      this._updateTempo();

      this.beatPhase = (this.beatPhase + 1) % this.beatsPerBar;
      isDownbeat = this.beatPhase === 0;
    }

    // ── Onset detection (time-based cooldown) ────────
    const timeSinceOnset = now - this.lastOnsetTime;
    const isOnset = flux > this.prevFlux * 1.8 + 0.04 && timeSinceOnset > 80;
    if (isOnset) this.lastOnsetTime = now;
    this.prevFlux = flux * 0.7 + this.prevFlux * 0.3;

    // ── Spectral centroid ────────────────────────────
    let wSum = 0, wTotal = 0;
    for (let i = 0; i < N; i++) { wSum += i * this.freqData[i]; wTotal += this.freqData[i]; }
    const spectralCentroid = wTotal > 0 ? wSum / wTotal / N : 0;

    return {
      rms, lowEnergy, midEnergy, highEnergy,
      isBeat, isDownbeat, beatStrength, bpm: this.estimatedBPM,
      isOnset, spectralCentroid,
    };
  }

  /** Estimate BPM from recent beat timestamps via IOI median clustering. */
  _updateTempo() {
    const times = this.beatTimes;
    if (times.length < 4) return;

    // Inter-onset intervals
    const iois = [];
    for (let i = 1; i < times.length; i++) {
      iois.push(times[i] - times[i - 1]);
    }

    // Keep only plausible intervals: 30–240 BPM → 250–2000 ms
    const valid = iois.filter(d => d > 250 && d < 2000);
    if (valid.length < 3) return;

    valid.sort((a, b) => a - b);
    const median = valid[Math.floor(valid.length / 2)];

    // Weighted average of IOIs within 20% of median
    let wSum = 0, wCnt = 0;
    for (const d of valid) {
      if (Math.abs(d - median) < median * 0.2) { wSum += d; wCnt++; }
    }
    if (wCnt < 2) return;

    const newInterval = wSum / wCnt;
    // Smooth transition
    this.beatInterval = this.beatInterval > 0
      ? this.beatInterval + (newInterval - this.beatInterval) * 0.3
      : newInterval;
    this.estimatedBPM = Math.round(60000 / this.beatInterval);
  }

  destroy() {
    try { this.source?.disconnect(); } catch (_) {}
    try { this.silentGain?.disconnect(); } catch (_) {}
    if (this.ctx && this.ctx.state !== 'closed') this.ctx.close();
    this.ready = false;
  }
}
