// Procedural Audio Haptics via Web Audio API (Zero External Assets, 0ms Network Latency)
class HapticAudioEngine {
  private ctx: AudioContext | null = null;
  private panner: StereoPannerNode | null = null;
  private muted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      try {
        this.panner = this.ctx.createStereoPanner();
        this.panner.connect(this.ctx.destination);
      } catch {
        // Fallback for browsers without StereoPanner
      }
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Tactile Mechanical Click on :active
   */
  public click(pan = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.panner) {
        this.panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      }

      osc.type = 'triangle';
      // Pitch drops from 400Hz to 80Hz in 35ms (sonar radar click)
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      if (this.panner) {
        osc.connect(gain);
        gain.connect(this.panner);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Audio safety
    }
  }

  /**
   * Radar Sweep Ping / High-tech Sub-Nav Tick
   */
  public tick(pan = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (this.panner) {
        this.panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
      }

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 crystal radar ping

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      if (this.panner) {
        osc.connect(gain);
        gain.connect(this.panner);
      } else {
        osc.connect(gain);
        gain.connect(this.ctx.destination);
      }

      osc.start(now);
      osc.stop(now + 0.03);
    } catch {
      // Audio safety
    }
  }

  /**
   * Verified Oracle Proof / Payout Success Chime
   */
  public success() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High cyber chord: F#5 (739.99Hz) and A#5 (932.33Hz)
      const notes = [739.99, 932.33];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.035, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {
      // Audio safety
    }
  }

  /**
   * Oracle Fraud Rejection / Anomaly Thump
   */
  public error() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Audio safety
    }
  }
}

export const haptics = new HapticAudioEngine();
