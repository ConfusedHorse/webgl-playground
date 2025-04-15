
import { computed, effect } from '@angular/core';
import { patchState, signalStore, withComputed, withFeature, withHooks, withMethods, withState } from '@ngrx/signals';
import { ShaderMaterial } from 'three';
import { withRenderer } from '../components/renderer/store.feature';
import { INITIAL_STATE, Joint } from './model';
import { targetBehavior } from './movement';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withFeature(withRenderer),

  // withComputed(() => ({
  //   autowalkAngle: toSignal(interval(FPS / 1000).pipe(
  //     map(value => value * .25),
  //     map(value => value % 360),
  //     map(angle => angle * Math.PI / 180),
  //     tap(asd => console.log(asd)),
  //     startWith(0),
  //   ), { requireSync: true }),
  // })),
  // withComputed(({ dimension, autowalkAngle }) => ({
  //   autowalkPosition: computed(() => {
  //     const { width, height } = dimension();
  //     const center = getCenter({ width, height });
  //     const direction = new Vector2(Math.cos(autowalkAngle()), Math.sin(autowalkAngle()));
  //     const distance = Math.min(width, height) * .5 * .75;
  //     return center.clone().add(direction.multiplyScalar(distance));
  //   }),
  // })),
  // withComputed(() => ({
  //   mouseRecentlyMoved: toSignal(fromEvent<MouseEvent>(window, 'mousemove').pipe(
  //     switchMap(() => merge(
  //       of(true),
  //       timer(MOVEMENT_DELAY).pipe(map(() => false)),
  //     )),
  //     startWith(false),
  //   ), { requireSync: true }),
  // })),
  // withComputed(({ dimension }) => {

  //   const autoTarget$ = interval(FPS / 1000).pipe(
  //     map(value => value * .25),
  //     map(value => value % 360),
  //     map(angle => angle * Math.PI / 180),
  //     startWith(0),
  //     map(rad => {
  //       const { width, height } = dimension();
  //       const center = getCenter({ width, height });
  //       const direction = new Vector2(Math.cos(rad), Math.sin(rad));
  //       const distance = Math.min(width, height) * .5 * .75;
  //       return center.clone().add(direction.multiplyScalar(distance));
  //     })
  //   );

  //   return { target: toSignal(autoTarget$) };
  // }),
  withComputed(({ configuration: { factor, jointDistance } }) => ({
    linkSize: computed(() => jointDistance() * factor()),
  })),
  withComputed(({ dimension }) => ({
    material: computed(() => new ShaderMaterial({
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

  withHooks({
    onInit(store) {
      const behavior = targetBehavior(store);
      effect(() => patchState(store, { target: behavior() }));
    },
  }),
);
