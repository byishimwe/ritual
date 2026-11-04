import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { AssetContractError, buildRitualModel } from '../assets/ritualModel';
import { ASSET } from '../config/asset';
import { BeanSupply } from './BeanSupply';
import { CoffeeCup } from './CoffeeCup';
import { CoffeeMachine } from './CoffeeMachine';
import { LiquidStream } from './LiquidStream';
import { SpillPuddles } from './SpillPuddles';
import { SteamEffect } from './SteamEffect';
import { useRigSlot, useServices } from './services';

useGLTF.preload(ASSET.url);

/**
 * Scene composition.
 *
 * Three independently movable actors — machine, bean supply, cup — plus the
 * liquid. Each owns its own objects; none of them is parented to another, so
 * the cup and jar keep their world position while the machine vibrates.
 */
export function RitualScene() {
  const { scene } = useGLTF(ASSET.url);
  const model = useMemo(() => {
    try {
      return buildRitualModel(scene);
    } catch (error) {
      // The canvas owns a separate React root, so a thrown contract error is
      // also reported to the application shell. That guarantees a visible
      // recoverable failure card instead of an interactive-looking scene
      // with missing controls.
      if (error instanceof AssetContractError && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<string>('ritual:asset-failure', { detail: error.message }),
        );
      }
      throw error;
    }
  }, [scene]);
  const services = useServices();

  useRigSlot('pile', model.beanPile);

  useEffect(() => {
    if (!model.report.ok) {
      console.error('[Ritual] asset contract violation', model.report);
    } else if (model.report.notes.length > 0) {
      console.warn('[Ritual] asset calibration notes', model.report.notes);
    }

    if (import.meta.env.MODE === 'e2e') {
      const host = window as unknown as { __ritual?: Record<string, unknown> };
      const api = (host.__ritual = host.__ritual ?? {});
      api.model = model;
      api.assetReport = model.report;
      api.services = services;
      return () => {
        delete api.model;
        delete api.assetReport;
        delete api.services;
      };
    }
  }, [model, services]);

  return (
    <>
      <CoffeeMachine model={model} />
      <CoffeeCup model={model} />
      <BeanSupply model={model} />
      <LiquidStream />
      <SpillPuddles />
      <SteamEffect reducedMotion={services.reducedMotion} />
    </>
  );
}
