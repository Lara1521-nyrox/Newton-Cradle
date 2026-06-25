export class SoundManager {
  constructor() {
    this.masterVolume = 0.6;
    this.audioCtx = null;
    this.masterGain = null;
    this._lastClickTime = new Map();
  }

  _canPlayClick(pairIndex) {
    const now = performance.now();
    const last = this._lastClickTime.get(pairIndex) || 0;
    if (now - last < 30) return false;
    this._lastClickTime.set(pairIndex, now);
    return true;
  }

  setVolume(v) {
    this.masterVolume = v;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(v, this.audioCtx.currentTime);
    }
  }

  playClick(intensity = 1, pairIndex = -1) {
    if (pairIndex >= 0 && !this._canPlayClick(pairIndex)) return;
    if (!this._ensureContext()) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const baseFreq = 800 * (0.97 + Math.random() * 0.06);
    const partials = [1, 2.4, 3.8, 5.6];
    const ringDurations = [0.09, 0.07, 0.05, 0.04];
    const ringGains = [0.08, 0.05, 0.03, 0.02];

    const masterGain = ctx.createGain();
    const vol = Math.min(1, Math.max(0.05, intensity)) * 0.18;
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    masterGain.connect(this.masterGain);

    const noiseLen = Math.floor(ctx.sampleRate * 0.02);
    const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const noiseData = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) noiseData[i] = Math.random() * 2 - 1;

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuf;

    const bpFilter = ctx.createBiquadFilter();
    bpFilter.type = 'bandpass';
    bpFilter.frequency.value = 3500 + intensity * 2000;
    bpFilter.Q.value = 2;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    noiseSrc.connect(bpFilter);
    bpFilter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noiseSrc.start(now);
    noiseSrc.stop(now + 0.025);

    for (let i = 0; i < partials.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * partials[i], now);

      const pGain = ctx.createGain();
      pGain.gain.setValueAtTime(ringGains[i] * intensity, now);
      pGain.gain.exponentialRampToValueAtTime(0.001, now + ringDurations[i]);

      osc.connect(pGain);
      pGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + ringDurations[i] + 0.005);
    }
  }

  playLand() {
    if (!this._ensureContext()) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  _ensureContext() {
    if (this.audioCtx && this.audioCtx.state !== 'closed') return true;
    try {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.audioCtx.destination);
      return true;
    } catch {
      return false;
    }
  }

  dispose() {
    if (this.audioCtx) {
      this.audioCtx.close().catch(() => {});
      this.audioCtx = null;
      this.masterGain = null;
    }
  }
}
