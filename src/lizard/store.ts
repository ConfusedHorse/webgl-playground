
import { computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { auditTime, fromEvent, map, startWith } from 'rxjs';
import * as THREE from 'three';
import { Dimension, INITIAL_STATE } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),

  withComputed(({ renderer }) => ({
    mousePosition: toSignal(fromEvent<MouseEvent>(window, 'mousemove').pipe(
      auditTime(10),
      map(({ x, y }) => new THREE.Vector2(x, y)),
      map((mousePosition) => {
        const { x, y } = renderer().domElement.getBoundingClientRect();
        const offset = new THREE.Vector2(x, y);
        return mousePosition.sub(offset);
      }),
      startWith(new THREE.Vector2()),
    ), { requireSync: true }),
  })),
  withComputed(({ mousePosition }) => ({
    circle: computed(() => {
      const geometry = new THREE.CircleGeometry(50, 32);
      const material = new THREE.LineBasicMaterial({ color: 'blue' });
      const circle = new THREE.Line(geometry, material);

      circle.position.x = mousePosition()?.x;
      circle.position.y = mousePosition()?.y;

      return circle;
    }),
  })),

  withMethods(store => ({
    initialize(renderer: THREE.WebGLRenderer): void {
      patchState(store, () => ({
        renderer,
        scene: new THREE.Scene(),
        initialized: true,
      }));
    },
    updateDimensions(dimension: Dimension): void {
      const { width, height } = dimension;
      const camera = new THREE.OrthographicCamera(0, width, 0, height, 0, 1);

      patchState(store, ({ renderer }) => {
        renderer?.setSize(width, height);

        return { dimension, camera };
      });
    },
  })),
);