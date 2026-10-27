// Lightweight Web Audio synthesis engine — no external sound files required.
// Provides the sound events named in the spec via procedural synthesis.
//
// Real mechanical/liquid sounds are rarely a single pure tone or a single
// filtered noise band — they're a tone (or hum) PLUS a noise texture PLUS
// some slow modulation (pitch wobble, rhythmic pulsing, amplitude flutter)
// that a single oscillator or filtered-noise burst can't produce alone.
// Each sound below layers at least two of those three ingredients.

class SoundManager {
  private ctx: AudioContext | null = null;
  private loops: Map<string, { stop: () => void }> = new Map();

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  // A real button click is a short broadband transient (the mechanism)
  // plus a faint resonant tone (the housing) — not a clean square wave.
  click() {
    const ctx = this.getCtx();
    const t0 = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(ctx, 0.03);
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2800;
    noiseFilter.Q.value = 1.2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, t0);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.02);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(t0);
    noise.stop(t0 + 0.03);

    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, t0);
    osc.frequency.exponentialRampToValueAtTime(900, t0 + 0.04);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + 0.05);
  }

  // Individual beans clattering — a tonal tick (bean hitting glass/beans)
  // plus a bit of high noise (grit/dust) so it doesn't read as pure bells.
  beanDrop() {
    const ctx = this.getCtx();
    for (let i = 0; i < 6; i++) {
      const delay = i * 0.05 + Math.random() * 0.03;
      const t = ctx.currentTime + delay;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 600 + Math.random() * 400;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.08, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer(ctx, 0.04);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 4000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.02, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
      noise.start(t);
      noise.stop(t + 0.04);
    }
  }

  cupSlide() {
    const ctx = this.getCtx();
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx, 0.3);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2500;
    filter.Q.value = 2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
  }

  private startLoop(
    key: string,
    build: (ctx: AudioContext) => { nodes: AudioNode[]; stop: () => void },
  ) {
    this.stopLoop(key);
    const ctx = this.getCtx();
    const { stop } = build(ctx);
    this.loops.set(key, { stop });
  }

  stopLoop(key: string) {
    const existing = this.loops.get(key);
    if (existing) {
      existing.stop();
      this.loops.delete(key);
    }
  }

  // A burr grinder is a motor hum (buzzy, not a pure sine) underneath a
  // gritty crunching texture, and real motors wobble slightly in pitch
  // under load rather than holding a perfectly fixed frequency.
  grindLoop() {
    this.startLoop('grind', (ctx) => {
      const t0 = ctx.currentTime;

      const motor = ctx.createOscillator();
      motor.type = 'sawtooth';
      motor.frequency.value = 130;
      const motorWobble = ctx.createOscillator();
      motorWobble.frequency.value = 5.5;
      const motorWobbleGain = ctx.createGain();
      motorWobbleGain.gain.value = 6;
      motorWobble.connect(motorWobbleGain).connect(motor.frequency);
      const motorFilter = ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.value = 500;
      const motorGain = ctx.createGain();
      motorGain.gain.value = 0.05;
      motor.connect(motorFilter).connect(motorGain);

      const crunch = ctx.createBufferSource();
      crunch.buffer = this.noiseBuffer(ctx, 2);
      crunch.loop = true;
      const crunchFilter = ctx.createBiquadFilter();
      crunchFilter.type = 'bandpass';
      crunchFilter.frequency.value = 900;
      crunchFilter.Q.value = 0.7;
      // Irregular amplitude flutter is what makes filtered noise read as
      // "beans crunching" instead of a smooth, obviously synthetic hiss.
      const crunchTremolo = ctx.createOscillator();
      crunchTremolo.type = 'square';
      crunchTremolo.frequency.value = 22;
      const crunchTremoloGain = ctx.createGain();
      crunchTremoloGain.gain.value = 0.045;
      const crunchGain = ctx.createGain();
      crunchGain.gain.value = 0.07;
      crunchTremolo.connect(crunchTremoloGain).connect(crunchGain.gain);
      crunch.connect(crunchFilter).connect(crunchGain);

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, t0);
      master.gain.linearRampToValueAtTime(1, t0 + 0.2);
      motorGain.connect(master);
      crunchGain.connect(master);
      master.connect(ctx.destination);

      motor.start(t0);
      motorWobble.start(t0);
      crunch.start(t0);
      crunchTremolo.start(t0);

      return {
        nodes: [motor, motorWobble, crunch, crunchTremolo, master],
        stop: () => {
          master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          setTimeout(() => {
            motor.stop();
            motorWobble.stop();
            crunch.stop();
            crunchTremolo.stop();
          }, 200);
        },
      };
    });
  }

  // A vibration pump doesn't hum smoothly — it pulses in short rhythmic
  // bursts (its characteristic "putt-putt-putt"), layered with a low hum
  // and a little filtered noise for mechanical grit.
  pumpLoop() {
    this.startLoop('pump', (ctx) => {
      const t0 = ctx.currentTime;

      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.value = 65;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.06;
      hum.connect(humGain);

      const pulse = ctx.createOscillator();
      pulse.type = 'triangle';
      pulse.frequency.value = 140;
      const pulseLFO = ctx.createOscillator();
      pulseLFO.type = 'square';
      pulseLFO.frequency.value = 11; // rhythmic pulsing rate
      const pulseLFOGain = ctx.createGain();
      pulseLFOGain.gain.value = 0.05;
      const pulseGain = ctx.createGain();
      pulseGain.gain.value = 0.01;
      pulseLFO.connect(pulseLFOGain).connect(pulseGain.gain);
      pulse.connect(pulseGain);

      const grit = ctx.createBufferSource();
      grit.buffer = this.noiseBuffer(ctx, 2);
      grit.loop = true;
      const gritFilter = ctx.createBiquadFilter();
      gritFilter.type = 'bandpass';
      gritFilter.frequency.value = 300;
      gritFilter.Q.value = 1;
      const gritGain = ctx.createGain();
      gritGain.gain.value = 0.025;
      grit.connect(gritFilter).connect(gritGain);

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, t0);
      master.gain.linearRampToValueAtTime(1, t0 + 0.2);
      humGain.connect(master);
      pulseGain.connect(master);
      gritGain.connect(master);
      master.connect(ctx.destination);

      hum.start(t0);
      pulse.start(t0);
      pulseLFO.start(t0);
      grit.start(t0);

      return {
        nodes: [hum, pulse, pulseLFO, grit, master],
        stop: () => {
          master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          setTimeout(() => {
            hum.stop();
            pulse.stop();
            pulseLFO.stop();
            grit.stop();
          }, 200);
        },
      };
    });
  }

  // A poured stream isn't a flat filtered-noise wash — it flutters with
  // the stream's own turbulence, and gains a subtle higher, splashier
  // layer where it strikes the surface.
  pourLoop() {
    this.startLoop('pour', (ctx) => {
      const t0 = ctx.currentTime;

      const stream = ctx.createBufferSource();
      stream.buffer = this.noiseBuffer(ctx, 2);
      stream.loop = true;
      const streamFilter = ctx.createBiquadFilter();
      streamFilter.type = 'lowpass';
      streamFilter.frequency.value = 1400;
      const streamFlutter = ctx.createOscillator();
      streamFlutter.frequency.value = 7;
      const streamFlutterGain = ctx.createGain();
      streamFlutterGain.gain.value = 0.012;
      const streamGain = ctx.createGain();
      streamGain.gain.value = 0.045;
      streamFlutter.connect(streamFlutterGain).connect(streamGain.gain);
      stream.connect(streamFilter).connect(streamGain);

      const splash = ctx.createBufferSource();
      splash.buffer = this.noiseBuffer(ctx, 2);
      splash.loop = true;
      const splashFilter = ctx.createBiquadFilter();
      splashFilter.type = 'bandpass';
      splashFilter.frequency.value = 3200;
      splashFilter.Q.value = 0.6;
      const splashFlutter = ctx.createOscillator();
      splashFlutter.type = 'sawtooth';
      splashFlutter.frequency.value = 13;
      const splashFlutterGain = ctx.createGain();
      splashFlutterGain.gain.value = 0.01;
      const splashGain = ctx.createGain();
      splashGain.gain.value = 0.012;
      splashFlutter.connect(splashFlutterGain).connect(splashGain.gain);
      splash.connect(splashFilter).connect(splashGain);

      const master = ctx.createGain();
      master.gain.setValueAtTime(0, t0);
      master.gain.linearRampToValueAtTime(1, t0 + 0.2);
      streamGain.connect(master);
      splashGain.connect(master);
      master.connect(ctx.destination);

      stream.start(t0);
      streamFlutter.start(t0);
      splash.start(t0);
      splashFlutter.start(t0);

      return {
        nodes: [stream, streamFlutter, splash, splashFlutter, master],
        stop: () => {
          master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
          setTimeout(() => {
            stream.stop();
            streamFlutter.stop();
            splash.stop();
            splashFlutter.stop();
          }, 250);
        },
      };
    });
  }

  steamHiss(duration = 1.5) {
    const ctx = this.getCtx();
    const t0 = ctx.currentTime;

    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx, duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 6000;

    // A faint flutter keeps a sustained hiss from reading as a static,
    // obviously-looped noise sample.
    const flutter = ctx.createOscillator();
    flutter.frequency.value = 9;
    const flutterGain = ctx.createGain();
    flutterGain.gain.value = 0.006;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, t0);
    gain.gain.linearRampToValueAtTime(0.02, t0 + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
    flutter.connect(flutterGain).connect(gain.gain);

    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t0);
    flutter.start(t0);
    flutter.stop(t0 + duration);
  }

  stopAll() {
    for (const key of Array.from(this.loops.keys())) this.stopLoop(key);
  }
}

export const soundManager = new SoundManager();
