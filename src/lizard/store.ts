
import { computed, effect } from '@angular/core';
import { signalStore, withComputed, withHooks, withState } from '@ngrx/signals';
import { Vector2 } from 'three';
import { getPosition, PI } from '../components/body/model';
import { withBody } from '../components/body/store.feature';
import { drawBody, drawEyes, drawOutlines, INITIAL_STATE } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withBody(),

  withComputed(({ joints, radii, factor }) => ({
    eyes: computed<[Vector2, Vector2, number]>(() => {
      const { position, angle } = joints()[1];
      const distance = .5 * factor() * radii()[1];
      const radius = .2 * factor() * radii()[1]
      const left = getPosition(position, angle - PI * .5, distance);
      const right = getPosition(position, angle + PI * .5, distance);

      return [left, right, radius];
    }),
  })),

  withHooks({
    onInit(store) {
      effect(() => {
        const { scene, camera, renderer, dots, eyes, material } = store;

        if (!dots().length) {
          return;
        }

        scene().clear();

        drawBody(scene(), dots(), material());
        drawOutlines(scene(), dots());

        drawEyes(scene(), eyes());

        renderer().render(scene(), camera());
      });
    },
  }),
);