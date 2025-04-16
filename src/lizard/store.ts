
import { computed, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withFeature, withHooks, withMethods, withState } from '@ngrx/signals';
import { ShaderMaterial } from 'three';
import { withRenderer } from '../components/renderer/store.feature';
import { INITIAL_STATE, Limb, Vertabra } from './model';
import { targetBehavior } from './movement';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withFeature(withRenderer),

  withComputed(({ configuration: { factor, vertebraeDistance: jointDistance } }) => ({
    linkSize: computed(() => jointDistance() * factor()),
  })),
  withComputed(({ dimension }) => ({
    material: computed(() => new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_canvasWidth: { value: dimension().width },
        u_canvasHeight: { value: dimension().height },
        u_opacity: { value: .25 },
      },
      transparent: true,
    })),
  })),

  withMethods(store => ({
    patchSpine(spine: Vertabra[]): void {
      patchState(store, () => ({ spine }));
    },
    patchLimbs(limbs: Limb[]): void {
      patchState(store, () => ({ limbs }));
    },
  })),

  withHooks({
    onInit(store) {
      const behavior = targetBehavior(store);
      effect(() => patchState(store, { target: behavior() }));
    },
  }),
);
