// Web Audio API Synthesizer & Background Music Engine for Dart Berhadiah
class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private bgmEnabled: boolean = true;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private masterBgmGain: GainNode | null = null;

  // 116 BPM -> 16th note = 60 / 116 / 4 = 0.1293 seconds
  private readonly stepDuration: number = 0.1293;
  private readonly totalSteps: number = 32;

  // Cheerful, friendly melody loop (marimba/bell style)
  private readonly melodyNotes: { [step: number]: { freq: number; dur: number } } = {
    0: { freq: 523.25, dur: 0.18 },  // C5
    2: { freq: 659.25, dur: 0.18 },  // E5
    4: { freq: 783.99, dur: 0.22 },  // G5
    6: { freq: 880.00, dur: 0.18 },  // A5
    8: { freq: 783.99, dur: 0.25 },  // G5
    10: { freq: 659.25, dur: 0.18 }, // E5
    12: { freq: 587.33, dur: 0.20 }, // D5
    14: { freq: 523.25, dur: 0.22 }, // C5
    16: { freq: 440.00, dur: 0.18 }, // A4
    18: { freq: 523.25, dur: 0.18 }, // C5
    20: { freq: 659.25, dur: 0.20 }, // E5
    22: { freq: 698.46, dur: 0.18 }, // F5
    24: { freq: 783.99, dur: 0.26 }, // G5
    26: { freq: 587.33, dur: 0.18 }, // D5
    28: { freq: 659.25, dur: 0.20 }, // E5
    30: { freq: 523.25, dur: 0.26 }, // C5
  };

  // Warm acoustic-like bassline
  private readonly bassNotes: { [step: number]: { freq: number; dur: number } } = {
    0: { freq: 130.81, dur: 0.22 }, // C3
    4: { freq: 196.00, dur: 0.22 }, // G3
    8: { freq: 220.00, dur: 0.22 }, // A3
    12: { freq: 196.00, dur: 0.22 }, // G3
    16: { freq: 174.61, dur: 0.22 }, // F3
    20: { freq: 220.00, dur: 0.22 }, // A3
    24: { freq: 196.00, dur: 0.22 }, // G3
    28: { freq: 146.83, dur: 0.22 }, // D3
  };

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Alias for backward compatibility
  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setBgmEnabled(enabled: boolean) {
    this.bgmEnabled = enabled;
    if (this.masterBgmGain && this.ctx) {
      const targetGain = enabled ? 0.045 : 0.0001;
      this.masterBgmGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
    }
    if (enabled && !this.isBgmPlaying) {
      this.startBgm();
    } else if (!enabled && this.isBgmPlaying) {
      this.stopBgm();
    }
  }

  public isBgmActive(): boolean {
    return this.bgmEnabled;
  }

  public init() {
    this.getContext();
    if (this.bgmEnabled && !this.isBgmPlaying) {
      this.startBgm();
    }
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // ================= BACKGROUND MUSIC (BGM) ENGINE =================

  public startBgm() {
    if (this.isBgmPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (!this.masterBgmGain) {
      this.masterBgmGain = ctx.createGain();
      this.masterBgmGain.gain.setValueAtTime(this.bgmEnabled ? 0.045 : 0.0001, ctx.currentTime);
      this.masterBgmGain.connect(ctx.destination);
    }

    this.isBgmPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.05;

    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
    }

    // High frequency lookahead clock (runs every 40ms)
    this.bgmTimer = window.setInterval(() => {
      this.scheduleBgmNotes();
    }, 40);
  }

  public stopBgm() {
    if (this.bgmTimer) {
      window.clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
    this.isBgmPlaying = false;
  }

  private scheduleBgmNotes() {
    const ctx = this.getContext();
    if (!ctx || !this.isBgmPlaying || !this.masterBgmGain) return;

    // Lookahead: schedule up to 0.15s in the future
    while (this.nextNoteTime < ctx.currentTime + 0.15) {
      const step = this.currentStep;
      const time = this.nextNoteTime;

      // 1. Play melody note if scheduled at this step
      if (this.melodyNotes[step]) {
        this.playSynthesizedNote(
          this.melodyNotes[step].freq,
          time,
          this.melodyNotes[step].dur,
          'triangle',
          0.85
        );
      }

      // 2. Play bass note if scheduled at this step
      if (this.bassNotes[step]) {
        this.playSynthesizedNote(
          this.bassNotes[step].freq,
          time,
          this.bassNotes[step].dur,
          'sine',
          0.7
        );
      }

      // 3. Soft rhythmic maraca / tick on off-beats
      if (step % 4 === 2) {
        this.playPercussionTick(time);
      }

      // Advance clock
      this.nextNoteTime += this.stepDuration;
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
    }
  }

  private playSynthesizedNote(
    freq: number,
    time: number,
    duration: number,
    type: OscillatorType,
    relativeVolume: number
  ) {
    if (!this.ctx || !this.masterBgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);

      // Lowpass filter to give gentle warmth (no harsh high harmonics)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, time);

      // Quick envelope for marimba/chime feel
      noteGain.gain.setValueAtTime(0.001, time);
      noteGain.gain.linearRampToValueAtTime(relativeVolume, time + 0.012);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterBgmGain);

      osc.start(time);
      osc.stop(time + duration + 0.02);
    } catch {
      // Audio node cleanup on error
    }
  }

  private playPercussionTick(time: number) {
    if (!this.ctx || !this.masterBgmGain) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'highpass' as unknown as OscillatorType; // high noise burst
      osc.type = 'square';
      osc.frequency.setValueAtTime(1400, time);

      gain.gain.setValueAtTime(0.08, time);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.03);

      osc.connect(gain);
      gain.connect(this.masterBgmGain);

      osc.start(time);
      osc.stop(time + 0.035);
    } catch {}
  }

  // ================= SOUND EFFECTS (SFX) =================

  // Button click
  public playClick() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(960, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  // Whoosh sound when dart is thrown
  public playThrow() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const bufferSize = ctx.sampleRate * 0.35;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3;
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.22);
      filter.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noise.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // Thud/impact sound when dart hits the board
  public playHit() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Low punch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.45, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);

      // Snap click
      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(850, ctx.currentTime);
      snap.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.05);
      snapGain.gain.setValueAtTime(0.22, ctx.currentTime);
      snapGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      snap.connect(snapGain);
      snapGain.connect(ctx.destination);

      snap.start();
      snap.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  // Victory fanfare for winning score / prize
  public playWin() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.1 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.42);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.46);
      });
    } catch {}
  }

  // Comical slide for ZONK
  public playZonk() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';

      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.48);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.32);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(750, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.48);
    } catch {}
  }

  // Sparkly sound for COBA LAGI (extra chance)
  public playExtraChance() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const pitches = [440, 554.37, 659.25, 880, 1108.73];
      pitches.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.07);

        gain.gain.setValueAtTime(0.2, now + i * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.26);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.07);
        osc.stop(now + i * 0.07 + 0.26);
      });
    } catch {}
  }

  // Fanfare for Claiming Prize
  public playClaimPrize() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const chords = [
        [523.25, 659.25, 783.99],
        [587.33, 739.99, 880.0],
        [659.25, 830.61, 987.77],
        [783.99, 987.77, 1174.66, 1567.98],
      ];
      chords.forEach((chord, step) => {
        const chordTime = now + step * 0.15;
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, chordTime);

          gain.gain.setValueAtTime(0.14, chordTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            chordTime + (step === chords.length - 1 ? 0.8 : 0.25)
          );

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(chordTime);
          osc.stop(chordTime + (step === chords.length - 1 ? 0.85 : 0.28));
        });
      });
    } catch {}
  }
}

export const soundManager = new SoundManager();
