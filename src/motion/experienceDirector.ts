import gsap from 'gsap';
import { audio } from '../audio/audioEngine';
import { BEAN_PROP, INDICATOR, LID, MODEL_SCALE } from '../config/asset';
import { BEAN_MOTION, MOTION, SPATIAL } from '../config/experience';
import type { ExperienceEvent } from '../domain/events';
import { dispatchCommand, engine } from '../state/experienceStore';
import type { ButtonKind, Services } from '../scene/services';

export interface Director {
  dispose(): void;
  pressButton(kind: ButtonKind): void;
  releaseButton(kind: ButtonKind): void;
  rejectButton(kind: ButtonKind): void;
}

type Tween = gsap.core.Tween | gsap.core.Timeline;

/**
 * Authored motion, sound and indicator response.
 *
 * The director is a *subscriber*. It reacts to facts the engine has already
 * decided and never invents progress of its own: there is not a single timer
 * here that advances the coffee process. The two delayed callbacks it owns
 * (hinge settling and transfer completion) report physical animation results
 * back as commands, and both are guarded by the session generation so stale
 * work can never touch a later session.
 */
export function createDirector(services: Services): Director {
  const tweens = new Set<Tween>();
  let lidTween: gsap.core.Tween | null = null;
  let indicatorTween: gsap.core.Tween | null = null;
  let disposed = false;

  const track = <T extends Tween>(tween: T): T => {
    tweens.add(tween);
    // Compose with the tween's own completion handler instead of replacing it:
    // the transfer timeline reports COMPLETE_BEAN_TRANSFER from its onComplete.
    const completed = tween.eventCallback('onComplete');
    tween.eventCallback('onComplete', () => {
      tweens.delete(tween);
      completed?.();
    });
    return tween;
  };

  const generation = () => engine.getState().session.generation;

  const guarded = (gen: number, action: () => void) => () => {
    if (disposed) return;
    if (engine.getState().session.generation !== gen) return;
    action();
  };

  const setIndicator = (value: number, duration = 0.5) => {
    const material = services.rig.indicatorMaterial;
    if (!material) return;
    indicatorTween?.kill();
    indicatorTween = gsap.to(material, {
      emissiveIntensity: value,
      duration,
      ease: 'sine.inOut',
      overwrite: true,
    });
  };

  const showPile = () => {
    const pile = services.rig.pile;
    if (pile) pile.visible = true;
  };

  const hidePile = () => {
    const pile = services.rig.pile;
    if (pile) pile.visible = false;
  };

  const animateLid = (open: boolean) => {
    const lid = services.rig.lid;
    if (!lid) {
      dispatchCommand({ type: 'HOPPER_MOTION_COMPLETE' });
      return;
    }
    const gen = generation();
    lidTween?.kill();
    lidTween = gsap.to(lid.rotation, {
      x: open ? LID.openAngle : 0,
      duration: open ? MOTION.hopperOpen : MOTION.hopperClose,
      ease: 'power2.inOut',
      overwrite: true,
      onComplete: guarded(gen, () => {
        dispatchCommand({ type: 'HOPPER_MOTION_COMPLETE' });
        if (open) audio.steamHiss(0.4);
      }),
    });
  };

  const runBeanTransfer = () => {
    const jar = services.rig.jar;
    const gen = generation();
    if (!jar) {
      gsap.delayedCall(MOTION.beanTransfer, guarded(gen, () => {
        showPile();
        dispatchCommand({ type: 'COMPLETE_BEAN_TRANSFER' });
      }));
      return;
    }

    audio.beanPour(0.8);

    const timeline = track(gsap.timeline({
      onComplete: guarded(gen, () => {
        dispatchCommand({ type: 'COMPLETE_BEAN_TRANSFER' });
        audio.beanSettle();
      }),
    }));

    timeline.to(
      jar.position,
      { x: BEAN_PROP.transfer.x, y: BEAN_PROP.transfer.y, z: BEAN_PROP.transfer.z, duration: 0.45, ease: 'power2.inOut' },
      0,
    );
    timeline.to(jar.rotation, { x: BEAN_MOTION.pourTilt, duration: 0.35, ease: 'power2.inOut' }, 0.28);
    timeline.call(
      () => {
        services.rig.triggerBeanFall?.();
      },
      undefined,
      0.6,
    );
    timeline.call(showPile, undefined, 1.08);
    timeline.to(jar.rotation, { x: 0, duration: 0.3, ease: 'power2.inOut' }, 0.98);
    timeline.to(
      jar.position,
      { x: BEAN_PROP.rest.x, y: 0, z: BEAN_PROP.rest.z, duration: 0.5, ease: 'power2.in' },
      1.08,
    );
  };

  const handleEvent = (event: ExperienceEvent) => {
    if (disposed) return;
    switch (event.type) {
      case 'HOPPER_OPENING':
        audio.lidOpen();
        animateLid(true);
        break;
      case 'HOPPER_CLOSING':
        audio.lidClose();
        animateLid(false);
        break;
      case 'BEAN_DRAG_STARTED':
        audio.jarLift();
        break;
      case 'BEAN_TRANSFER_STARTED':
        runBeanTransfer();
        break;
      case 'BEAN_DRAG_CANCELLED':
        audio.cupSettle();
        break;
      case 'BEANS_LOADED':
        showPile();
        break;
      case 'MACHINE_POWERED_ON':
        audio.powerRelay();
        setIndicator(INDICATOR.standby, 0.6);
        break;
      case 'MACHINE_POWERED_OFF':
        // The button press itself is voiced by the input layer; only the
        // indicator has to change here.
        setIndicator(INDICATOR.off, 0.4);
        break;
      case 'GRINDING_STARTED':
        audio.grindStart();
        setIndicator(INDICATOR.busy, 0.3);
        break;
      case 'GRINDING_FINISHED':
        audio.grindStop();
        break;
      case 'TRANSITION_STARTED':
        // The pause is meant to be heard as much as seen: one small mechanism.
        audio.buttonUp('make');
        break;
      case 'BREWING_STARTED':
        audio.pumpStart();
        setIndicator(INDICATOR.busy * 0.8, 0.3);
        break;
      case 'BREWING_FINISHED':
        audio.pumpStop();
        break;
      case 'COFFEE_READY':
        audio.readyChime();
        setIndicator(INDICATOR.ready, 0.45);
        break;
      case 'POUR_STARTED':
        audio.pourStart();
        setIndicator(INDICATOR.busy, 0.3);
        break;
      case 'POUR_STOPPED':
        audio.pourStop();
        audio.drip();
        break;
      case 'BATCH_EXHAUSTED':
        audio.pourStop();
        audio.drip();
        break;
      case 'CYCLE_COMPLETED':
        audio.steamHiss(1.6);
        setIndicator(INDICATOR.fault, 0.6);
        break;
      case 'CUP_DRAG_ENDED':
        audio.cupSettle();
        break;
      case 'RESET_STARTED':
        handleReset();
        break;
      case 'RESET_COMPLETED':
        hidePile();
        break;
      default:
        break;
    }
  };

  const handleReset = () => {
    const gen = generation();
    for (const tween of tweens) tween.kill();
    tweens.clear();
    lidTween = null;
    indicatorTween?.kill();
    indicatorTween = null;

    audio.stopAll();
    audio.resetSweep();

    const button = services.rig.buttons;
    if (button) {
      for (const kind of ['power', 'make', 'pour'] as ButtonKind[]) {
        gsap.to(button[kind].position, { z: 0, duration: 0.2, ease: 'power2.out', overwrite: true });
      }
    }

    const lid = services.rig.lid;
    if (lid) {
      lidTween = gsap.to(lid.rotation, {
        x: 0,
        duration: MOTION.reset * 0.5,
        ease: 'power2.inOut',
        overwrite: true,
      });
    }

    setIndicator(INDICATOR.off, MOTION.reset * 0.4);

    const jar = services.rig.jar;
    if (jar) {
      gsap.to(jar.rotation, { x: 0, duration: MOTION.reset * 0.4, ease: 'power2.out', overwrite: true });
    }

    // The logical reset is already atomic; this only bounds the visual one.
    gsap.delayedCall(MOTION.reset, guarded(gen, () => {
      dispatchCommand({ type: 'FINISH_RESET' });
      hidePile();
      setIndicator(INDICATOR.off, 0.2);
    }));
  };

  const unsubscribe = engine.subscribe(handleEvent);

  const api: Director = {
    dispose() {
      disposed = true;
      unsubscribe();
      for (const tween of tweens) tween.kill();
      tweens.clear();
      lidTween?.kill();
      indicatorTween?.kill();
      audio.stopAll();
      if (services.motion === api) services.motion = null;
    },

    pressButton(kind) {
      const button = services.rig.buttons?.[kind];
      audio.buttonDown(kind);
      if (!button) return;
      gsap.to(button.position, {
        z: -SPATIAL.buttonTravel / MODEL_SCALE,
        duration: MOTION.buttonPressIn,
        ease: 'power2.out',
        overwrite: true,
      });
    },

    releaseButton(kind) {
      const button = services.rig.buttons?.[kind];
      audio.buttonUp(kind);
      if (!button) return;
      gsap.to(button.position, {
        z: 0,
        duration: MOTION.buttonPressOut,
        ease: 'back.out(1.6)',
        overwrite: true,
      });
    },

    rejectButton(kind) {
      const button = services.rig.buttons?.[kind];
      audio.reject();
      if (!button) return;
      gsap
        .timeline()
        .to(button.position, { z: -SPATIAL.buttonTravel / MODEL_SCALE, duration: 0.07, ease: 'power2.out' })
        .to(button.position, { z: 0, duration: 0.16, ease: 'power2.out' });
    },
  };

  return api;
}
