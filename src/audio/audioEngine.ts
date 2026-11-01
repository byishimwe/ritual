/**
 * Procedural audio service.
 *
 * Every sound in Ritual is synthesised at runtime: the exhibition machine must
 * work offline, and a small set of carefully layered synthesis graphs conveys
 * mechanical character better than a mismatched set of short samples.
 *
 * The service is a *presentation* system. It reacts to domain events and never
 * decides what the machine is doing. All nodes are owned here: loops fade and
 * schedule their own stop, one-shots disconnect on `ended`, and a reset stops
 * everything in one call so no sound survives into the next session.
 */

type LoopName = 'grind' | 'pump' | 'pour';

interface Loop {
  gain: GainNode;
  stop: (fadeSeconds: number) => void;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private loops = new Map<LoopName, Loop>();
  private suspended = false;
  private noiseCache: AudioBuffer | null = null;

  get isReady(): boolean {
    return this.ctx !== null && this.ctx.state === 'running' && !this.suspended;
  }

  /** Must be called from a user gesture. Safe to call repeatedly. */
  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      const master = this.ctx.createGain();
      master.gain.value = 0.85;
      // A gentle limiter keeps stacked one-shots from clipping.
      const limiter = this.ctx.createDynamicsCompressor();
      limiter.threshold.value = -8;
      limiter.knee.value = 6;
      limiter.ratio.value = 12;
      limiter.attack.value = 0.003;
      limiter.release.value = 0.18;
      master.connect(limiter).connect(this.ctx.destination);
      this.master = master;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    this.suspended = false;
  }

  suspend(): void {
    this.suspended = true;
    this.stopAll();
    if (this.ctx && this.ctx.state === 'running') void this.ctx.suspend();
  }

  resume(): void {
    if (!this.ctx) return;
    this.suspended = false;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private get active(): AudioContext | null {
    if (!this.ctx || !this.master || this.suspended) return null;
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!this.noiseCache || this.noiseCache.sampleRate !== ctx.sampleRate) {
      const length = Math.floor(ctx.sampleRate * 2);
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
      this.noiseCache = buffer;
    }
    return this.noiseCache;
  }

  private disposeAfter(source: AudioScheduledSourceNode, nodes: AudioNode[]): void {
    source.onended = () => {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          // Already detached.
        }
      }
    };
  }

  // ---------------------------------------------------------------- one-shots

  buttonDown(kind: 'power' | 'make' | 'pour' = 'power'): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const pitch = kind === 'power' ? 1180 : kind === 'make' ? 1320 : 1420;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer(ctx);
    noise.loop = false;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 2600;
    noiseFilter.Q.value = 1.1;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.14, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.028);
    noise.connect(noiseFilter).connect(noiseGain).connect(this.master);
    noise.start(t, Math.random());
    noise.stop(t + 0.03);
    this.disposeAfter(noise, [noiseFilter, noiseGain]);

    const tone = ctx.createOscillator();
    tone.type = 'square';
    tone.frequency.setValueAtTime(pitch, t);
    tone.frequency.exponentialRampToValueAtTime(pitch * 0.62, t + 0.045);
    const toneGain = ctx.createGain();
    toneGain.gain.setValueAtTime(0.055, t);
    toneGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.055);
    tone.connect(toneGain).connect(this.master);
    tone.start(t);
    tone.stop(t + 0.06);
    this.disposeAfter(tone, [toneGain]);
  }

  buttonUp(kind: 'power' | 'make' | 'pour' = 'power'): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const tone = ctx.createOscillator();
    tone.type = 'triangle';
    tone.frequency.value = kind === 'power' ? 720 : 820;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.025, t);
    gain.gain.exponentialRampToValueAtTime(0.0006, t + 0.06);
    tone.connect(gain).connect(this.master);
    tone.start(t);
    tone.stop(t + 0.07);
    this.disposeAfter(tone, [gain]);
  }

  /** A quiet mechanical refusal — never an error chime. */
  reject(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const tone = ctx.createOscillator();
    tone.type = 'sine';
    tone.frequency.setValueAtTime(196, t);
    tone.frequency.exponentialRampToValueAtTime(150, t + 0.11);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0006, t + 0.13);
    tone.connect(gain).connect(this.master);
    tone.start(t);
    tone.stop(t + 0.14);
    this.disposeAfter(tone, [gain]);
  }

  powerRelay(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;

    // Relay engagement: a short low body plus a decaying hum.
    const hum = ctx.createOscillator();
    hum.type = 'sawtooth';
    hum.frequency.value = 48;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 220;
    const humGain = ctx.createGain();
    humGain.gain.setValueAtTime(0.0001, t);
    humGain.gain.linearRampToValueAtTime(0.05, t + 0.09);
    humGain.gain.exponentialRampToValueAtTime(0.0005, t + 0.75);
    hum.connect(humFilter).connect(humGain).connect(this.master);
    hum.start(t);
    hum.stop(t + 0.8);
    this.disposeAfter(hum, [humFilter, humGain]);
  }

  lidOpen(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;

    this.buttonDown('power');

    const servo = ctx.createOscillator();
    servo.type = 'sawtooth';
    servo.frequency.setValueAtTime(180, t);
    servo.frequency.linearRampToValueAtTime(300, t + 0.42);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.03, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.5);
    servo.connect(filter).connect(gain).connect(this.master);
    servo.start(t);
    servo.stop(t + 0.55);
    this.disposeAfter(servo, [filter, gain]);

    const air = ctx.createBufferSource();
    air.buffer = this.noiseBuffer(ctx);
    air.loop = false;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 1500;
    airFilter.Q.value = 0.8;
    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.0001, t + 0.2);
    airGain.gain.linearRampToValueAtTime(0.018, t + 0.32);
    airGain.gain.exponentialRampToValueAtTime(0.0004, t + 0.68);
    air.connect(airFilter).connect(airGain).connect(this.master);
    air.start(t + 0.2);
    air.stop(t + 0.7);
    this.disposeAfter(air, [airFilter, airGain]);
  }

  lidClose(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;

    this.buttonDown('make');

    const thunk = ctx.createOscillator();
    thunk.type = 'sine';
    thunk.frequency.setValueAtTime(150, t + 0.44);
    thunk.frequency.exponentialRampToValueAtTime(72, t + 0.56);
    const thunkGain = ctx.createGain();
    thunkGain.gain.setValueAtTime(0.0001, t + 0.44);
    thunkGain.gain.linearRampToValueAtTime(0.075, t + 0.455);
    thunkGain.gain.exponentialRampToValueAtTime(0.0006, t + 0.62);
    thunk.connect(thunkGain).connect(this.master);
    thunk.start(t + 0.44);
    thunk.stop(t + 0.64);
    this.disposeAfter(thunk, [thunkGain]);
  }

  jarLift(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const tone = ctx.createOscillator();
    tone.type = 'triangle';
    tone.frequency.setValueAtTime(940, t);
    tone.frequency.exponentialRampToValueAtTime(620, t + 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0006, t + 0.12);
    tone.connect(gain).connect(this.master);
    tone.start(t);
    tone.stop(t + 0.13);
    this.disposeAfter(tone, [gain]);
  }

  /** Bean grains released from the tipped jar. */
  beanPour(duration = 0.8): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const start = ctx.currentTime;
    const ticks = Math.round(duration * 34);

    const bed = ctx.createBufferSource();
    bed.buffer = this.noiseBuffer(ctx);
    bed.loop = true;
    const bedFilter = ctx.createBiquadFilter();
    bedFilter.type = 'bandpass';
    bedFilter.frequency.value = 2400;
    bedFilter.Q.value = 0.7;
    const bedGain = ctx.createGain();
    bedGain.gain.setValueAtTime(0.0001, start);
    bedGain.gain.linearRampToValueAtTime(0.02, start + 0.08);
    bedGain.gain.setValueAtTime(0.02, start + duration * 0.7);
    bedGain.gain.exponentialRampToValueAtTime(0.0005, start + duration);
    bed.connect(bedFilter).connect(bedGain).connect(this.master);
    bed.start(start, Math.random());
    bed.stop(start + duration + 0.05);
    this.disposeAfter(bed, [bedFilter, bedGain]);

    for (let i = 0; i < ticks; i += 1) {
      const when = start + 0.04 + Math.random() * duration * 0.9;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      const frequency = 520 + Math.random() * 620;
      osc.frequency.setValueAtTime(frequency, when);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.7, when + 0.05);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0008, when);
      gain.gain.linearRampToValueAtTime(0.018 + Math.random() * 0.012, when + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0004, when + 0.06);
      osc.connect(gain).connect(this.master);
      osc.start(when);
      osc.stop(when + 0.07);
      this.disposeAfter(osc, [gain]);
    }
  }

  beanSettle(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const start = ctx.currentTime;
    for (let i = 0; i < 7; i += 1) {
      const when = start + i * 0.035 + Math.random() * 0.02;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 480 + Math.random() * 500;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0006, when);
      gain.gain.linearRampToValueAtTime(0.012, when + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0003, when + 0.07);
      osc.connect(gain).connect(this.master);
      osc.start(when);
      osc.stop(when + 0.08);
      this.disposeAfter(osc, [gain]);
    }
  }

  /** Ceramic on ceramic: brief, damped, and pitchy rather than white noise. */
  cupScrape(intensity = 1): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(ctx);
    source.loop = false;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1700 + Math.random() * 500;
    filter.Q.value = 1.6;
    const gain = ctx.createGain();
    const level = 0.012 + Math.min(0.02, intensity * 0.012);
    gain.gain.setValueAtTime(level, t);
    gain.gain.exponentialRampToValueAtTime(0.0004, t + 0.1);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t, Math.random());
    source.stop(t + 0.11);
    this.disposeAfter(source, [filter, gain]);
  }

  cupSettle(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1480, t);
    osc.frequency.exponentialRampToValueAtTime(980, t + 0.06);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.0005, t + 0.16);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.17);
    this.disposeAfter(osc, [gain]);
  }

  drip(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const frequency = 900 + Math.random() * 700;
    osc.frequency.setValueAtTime(frequency, t);
    osc.frequency.exponentialRampToValueAtTime(frequency * 0.45, t + 0.07);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, t);
    gain.gain.exponentialRampToValueAtTime(0.0004, t + 0.09);
    osc.connect(gain).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.1);
    this.disposeAfter(osc, [gain]);
  }

  readyChime(): void {
    const ctx = this.active;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    [880, 1320].forEach((frequency, index) => {
      const start = t + index * 0.09;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(0.042 / (index + 1), start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0003, start + 0.55);
      osc.connect(gain).connect(master);
      osc.start(start);
      osc.stop(start + 0.6);
      this.disposeAfter(osc, [gain]);
    });
  }

  steamHiss(duration = 1.4): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.012, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.0003, t + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t, Math.random());
    source.stop(t + duration + 0.05);
    this.disposeAfter(source, [filter, gain]);
  }

  resetSweep(): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    const t = ctx.currentTime;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(320, t + 0.7);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.022, t + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0003, t + 0.8);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t, Math.random());
    source.stop(t + 0.85);
    this.disposeAfter(source, [filter, gain]);
  }

  // -------------------------------------------------------------------- loops

  private startLoop(name: LoopName, build: (ctx: AudioContext, gain: GainNode) => Loop['stop']): void {
    const ctx = this.active;
    if (!ctx || !this.master) return;
    if (this.loops.has(name)) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.18);
    gain.connect(this.master);

    const stop = build(ctx, gain);
    this.loops.set(name, { gain, stop });
  }

  private stopLoop(name: LoopName, fade = 0.18): void {
    const loop = this.loops.get(name);
    if (!loop) return;
    const ctx = this.ctx;
    this.loops.delete(name);
    if (!ctx) return;
    const now = ctx.currentTime;
    loop.gain.gain.cancelScheduledValues(now);
    loop.gain.gain.setValueAtTime(Math.max(loop.gain.gain.value, 0.0001), now);
    loop.gain.gain.exponentialRampToValueAtTime(0.0001, now + fade);
    loop.stop(fade);
    window.setTimeout(() => loop.gain.disconnect(), (fade + 0.1) * 1000);
  }

  grindStart(): void {
    this.startLoop('grind', (ctx, bus) => {
      const t = ctx.currentTime;

      const motor = ctx.createOscillator();
      motor.type = 'sawtooth';
      motor.frequency.value = 128;
      const wobble = ctx.createOscillator();
      wobble.frequency.value = 5.4;
      const wobbleGain = ctx.createGain();
      wobbleGain.gain.value = 6;
      wobble.connect(wobbleGain).connect(motor.frequency);

      const motorFilter = ctx.createBiquadFilter();
      motorFilter.type = 'lowpass';
      motorFilter.frequency.value = 480;
      const motorGain = ctx.createGain();
      motorGain.gain.value = 0.055;
      motor.connect(motorFilter).connect(motorGain).connect(bus);

      const crunch = ctx.createBufferSource();
      crunch.buffer = this.noiseBuffer(ctx);
      crunch.loop = true;
      const crunchFilter = ctx.createBiquadFilter();
      crunchFilter.type = 'bandpass';
      crunchFilter.frequency.value = 850;
      crunchFilter.Q.value = 0.65;
      const flutter = ctx.createOscillator();
      flutter.type = 'square';
      flutter.frequency.value = 21;
      const flutterGain = ctx.createGain();
      flutterGain.gain.value = 0.04;
      const crunchGain = ctx.createGain();
      crunchGain.gain.value = 0.075;
      flutter.connect(flutterGain).connect(crunchGain.gain);
      crunch.connect(crunchFilter).connect(crunchGain).connect(bus);

      motor.start(t);
      wobble.start(t);
      crunch.start(t, Math.random());
      flutter.start(t);

      return (fade: number) => {
        const end = ctx.currentTime + fade;
        motor.stop(end);
        wobble.stop(end);
        crunch.stop(end);
        flutter.stop(end);
      };
    });
  }

  grindStop(): void {
    this.stopLoop('grind', 0.16);
  }

  pumpStart(): void {
    this.startLoop('pump', (ctx, bus) => {
      const t = ctx.currentTime;

      const hum = ctx.createOscillator();
      hum.type = 'sine';
      hum.frequency.value = 63;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.07;
      hum.connect(humGain).connect(bus);

      // A vibration pump pulses rather than humming evenly.
      const pulse = ctx.createOscillator();
      pulse.type = 'triangle';
      pulse.frequency.value = 138;
      const pulseLfo = ctx.createOscillator();
      pulseLfo.type = 'square';
      pulseLfo.frequency.value = 10.5;
      const pulseLfoGain = ctx.createGain();
      pulseLfoGain.gain.value = 0.012;
      const pulseGain = ctx.createGain();
      pulseGain.gain.value = 0.03;
      pulseLfo.connect(pulseLfoGain).connect(pulseGain.gain);
      pulse.connect(pulseGain).connect(bus);

      const grit = ctx.createBufferSource();
      grit.buffer = this.noiseBuffer(ctx);
      grit.loop = true;
      const gritFilter = ctx.createBiquadFilter();
      gritFilter.type = 'bandpass';
      gritFilter.frequency.value = 320;
      const gritGain = ctx.createGain();
      gritGain.gain.value = 0.028;
      grit.connect(gritFilter).connect(gritGain).connect(bus);

      hum.start(t);
      pulse.start(t);
      pulseLfo.start(t);
      grit.start(t, Math.random());

      return (fade: number) => {
        const end = ctx.currentTime + fade;
        hum.stop(end);
        pulse.stop(end);
        pulseLfo.stop(end);
        grit.stop(end);
      };
    });
  }

  pumpStop(): void {
    this.stopLoop('pump', 0.22);
  }

  pourStart(): void {
    this.startLoop('pour', (ctx, bus) => {
      const t = ctx.currentTime;

      const stream = ctx.createBufferSource();
      stream.buffer = this.noiseBuffer(ctx);
      stream.loop = true;
      const streamFilter = ctx.createBiquadFilter();
      streamFilter.type = 'lowpass';
      streamFilter.frequency.value = 1500;
      const streamFlutter = ctx.createOscillator();
      streamFlutter.frequency.value = 6.5;
      const streamFlutterGain = ctx.createGain();
      streamFlutterGain.gain.value = 0.01;
      const streamGain = ctx.createGain();
      streamGain.gain.value = 0.05;
      streamFlutter.connect(streamFlutterGain).connect(streamGain.gain);
      stream.connect(streamFilter).connect(streamGain).connect(bus);

      // The splashier layer only exists where the stream meets the surface.
      const splash = ctx.createBufferSource();
      splash.buffer = this.noiseBuffer(ctx);
      splash.loop = true;
      const splashFilter = ctx.createBiquadFilter();
      splashFilter.type = 'bandpass';
      splashFilter.frequency.value = 3100;
      splashFilter.Q.value = 0.5;
      const splashFlutter = ctx.createOscillator();
      splashFlutter.type = 'sawtooth';
      splashFlutter.frequency.value = 12;
      const splashFlutterGain = ctx.createGain();
      splashFlutterGain.gain.value = 0.008;
      const splashGain = ctx.createGain();
      splashGain.gain.value = 0.014;
      splashFlutter.connect(splashFlutterGain).connect(splashGain.gain);
      splash.connect(splashFilter).connect(splashGain).connect(bus);

      stream.start(t, Math.random());
      streamFlutter.start(t);
      splash.start(t, Math.random());
      splashFlutter.start(t);

      return (fade: number) => {
        const end = ctx.currentTime + fade;
        stream.stop(end);
        streamFlutter.stop(end);
        splash.stop(end);
        splashFlutter.stop(end);
      };
    });
  }

  pourStop(): void {
    this.stopLoop('pour', 0.3);
  }

  stopAll(): void {
    for (const name of Array.from(this.loops.keys())) this.stopLoop(name, 0.12);
  }

  dispose(): void {
    this.stopAll();
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
      this.master = null;
    }
    this.noiseCache = null;
  }
}

export const audio = new AudioEngine();
