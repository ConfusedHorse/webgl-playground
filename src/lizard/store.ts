
import { computed } from '@angular/core';
import { signalStore, withComputed } from '@ngrx/signals';
import * as THREE from 'three';
import { withRenderer } from '../components/three-canvas/store.feature';

export const LizardStore = signalStore(
  withRenderer(),

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
);