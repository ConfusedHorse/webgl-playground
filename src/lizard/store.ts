
import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withFeature, withMethods, withState } from '@ngrx/signals';
import { Material, ShaderMaterial } from 'three';
import { withRenderer } from '../components/renderer/store.feature';
import { INITIAL_STATE, Joint } from './model';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withFeature(withRenderer),

  withComputed(({ configuration: { factor, jointDistance } }) => ({
    linkSize: computed<number>(() => jointDistance() * factor()),
  })),
  withComputed(({ dimension }) => ({
    material: computed<Material>(() => new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        u_canvasWidth: { value: dimension().width },
        u_canvasHeight: { value: dimension().height },
        u_opacity: { value: .25 }
      },
      transparent: true,
    })),
  })),

  withMethods(store => ({
    patchJoints(joints: Joint[]): void {
      patchState(store, () => ({ joints }));
    },
  })),
);