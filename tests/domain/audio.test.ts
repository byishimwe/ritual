import { describe, expect, it } from 'vitest';
import { AudioEngine } from '../../src/audio/audioEngine';

class FakeParam {
  value = 0;

  setValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  linearRampToValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  exponentialRampToValueAtTime(value: number) {
    this.value = value;
    return this;
  }

  cancelScheduledValues() {
    return this;
  }
}

class FakeNode {
  connections: FakeNode[] = [];
  disconnected = false;

  connect<T extends FakeNode>(target: T): T {
    this.connections.push(target);
    return target;
  }

  disconnect(): void {
    this.disconnected = true;
  }
}

class FakeSource extends FakeNode {
  onended: (() => void) | null = null;
  started = 0;
  stopped = 0;
  startCount = 0;

  start(): void {
    this.started += 1;
  }

  stop(): void {
    this.stopped += 1;
  }
}

class FakeOscillator extends FakeSource {
  type = 'sine';
  frequency = new FakeParam();
}

class FakeBufferSource extends FakeSource {
  buffer: unknown = null;
  loop = false;
}

class FakeContext {
  state: AudioContextState = 'running';
  currentTime = 1;
  sampleRate = 8000;
  destination = new FakeNode();
  sources: FakeSource[] = [];

  createGain() {
    const node = new FakeNode() as FakeNode & { gain: FakeParam };
    node.gain = new FakeParam();
    return node;
  }

  createOscillator() {
    const source = new FakeOscillator();
    this.sources.push(source);
    return source;
  }

  createBufferSource() {
    const source = new FakeBufferSource();
    this.sources.push(source);
    return source;
  }

  createBiquadFilter() {
    const node = new FakeNode() as FakeNode & {
      type: string;
      frequency: FakeParam;
      Q: FakeParam;
    };
    node.type = 'lowpass';
    node.frequency = new FakeParam();
    node.Q = new FakeParam();
    return node;
  }

  createDynamicsCompressor() {
    const node = new FakeNode() as FakeNode & {
      threshold: FakeParam;
      knee: FakeParam;
      ratio: FakeParam;
      attack: FakeParam;
      release: FakeParam;
    };
    node.threshold = new FakeParam();
    node.knee = new FakeParam();
    node.ratio = new FakeParam();
    node.attack = new FakeParam();
    node.release = new FakeParam();
    return node;
  }

  createBuffer(_channels: number, length: number, sampleRate: number) {
    return {
      sampleRate,
      length,
      getChannelData: () => new Float32Array(length),
    };
  }

  suspend() {
    this.state = 'suspended';
    return Promise.resolve();
  }

  resume() {
    this.state = 'running';
    return Promise.resolve();
  }

  close() {
    this.state = 'closed';
    return Promise.resolve();
  }
}

function setup() {
  const context = new FakeContext();
  const audio = new AudioEngine(() => context as unknown as AudioContext);
  audio.unlock();
  return { audio, context };
}

describe('audio session ownership', () => {
  it('registers each one-shot and unregisters it when it ends naturally', () => {
    const { audio, context } = setup();
    audio.buttonDown('make');
    expect(audio.activeOneShotCount).toBe(2);
    expect(context.sources).toHaveLength(2);

    context.sources[0].onended?.();
    expect(audio.activeOneShotCount).toBe(1);
    context.sources[1].onended?.();
    expect(audio.activeOneShotCount).toBe(0);
  });

  it('stopAll silences loops and every scheduled or playing one-shot', () => {
    const { audio, context } = setup();
    audio.buttonDown('power');
    audio.grindStart();
    expect(audio.activeLoopCount).toBe(1);
    expect(audio.activeOneShotCount).toBe(2);

    audio.stopAll();
    expect(audio.activeLoopCount).toBe(0);
    expect(audio.activeOneShotCount).toBe(0);
    expect(context.sources.every((source) => source.stopped > 0)).toBe(true);
  });

  it('cancels future bean-grain starts queued for a long pour', () => {
    const { audio, context } = setup();
    audio.beanPour(0.8);
    expect(audio.activeOneShotCount).toBeGreaterThan(10);
    const queued = [...context.sources];

    audio.stopAll();
    expect(audio.activeOneShotCount).toBe(0);
    expect(queued.every((source) => source.stopped > 0)).toBe(true);
  });

  it('restores exactly one loop for the active stage after a short hide', () => {
    const { audio } = setup();
    audio.grindStart();
    expect(audio.activeLoopCount).toBe(1);

    audio.suspend();
    expect(audio.activeLoopCount).toBe(0);
    audio.resume('GRINDING');
    expect(audio.activeLoopCount).toBe(1);
    audio.resume('GRINDING');
    expect(audio.activeLoopCount).toBe(1);

    audio.resume('BREWING');
    expect(audio.activeLoopCount).toBe(1);
    audio.resume('POURING');
    expect(audio.activeLoopCount).toBe(1);
    audio.resume('COMPLETE');
    expect(audio.activeLoopCount).toBe(0);
  });

  it('does not resume stale session audio after a completion cue', () => {
    const { audio } = setup();
    audio.readyChime();
    expect(audio.activeOneShotCount).toBe(2);
    audio.suspend();
    expect(audio.activeOneShotCount).toBe(0);
    audio.resume('READY_TO_POUR');
    expect(audio.activeOneShotCount).toBe(0);
    expect(audio.activeLoopCount).toBe(0);
  });
});
