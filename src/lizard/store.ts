
import { computed, effect } from '@angular/core';
import { signalStore, withComputed, withHooks, withState } from '@ngrx/signals';
import { Vector2 } from 'three';
import { withBody } from '../components/body/store.feature';
import { drawBody, drawOutlines, INITIAL_STATE } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withBody(),

  withComputed(({ dots }) => ({
    eyes: computed<Vector2[]>(() => {
      // TODO return coordinates 90 degrees to dots[0] halfway to its radius

      return [];
    }),
  })),

  withHooks({
    onInit(store) {
      effect(() => {
        const { dots, scene, camera, renderer } = store;

        if (!dots().length) {
          return;
        }

        scene().clear();

        drawBody(scene(), dots())
        drawOutlines(scene(), dots());

        renderer().render(scene(), camera());
      });
    },
  }),
);