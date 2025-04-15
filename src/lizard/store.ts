
import { computed, effect } from '@angular/core';
import { signalStore, withComputed, withFeature, withHooks, withState } from '@ngrx/signals';
import { CircleGeometry, Mesh, MeshBasicMaterial, Vector2 } from 'three';
import { getPosition, PI } from '../components/body/model';
import { withBody } from '../components/body/store.feature';
import { drawBody, drawEyes, drawOutlines, INITIAL_STATE, Leg, LIZARD_EYES_INDEX, LIZARD_LEGS_INDECES } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withFeature(withBody),

  withComputed(({ joints, radii, factor }) => ({
    eyes: computed<[Vector2, Vector2, number]>(() => {
      const { position, angle } = joints()[LIZARD_EYES_INDEX + 1];
      const distance = .5 * factor() * radii()[LIZARD_EYES_INDEX];
      const radius = .2 * factor() * radii()[LIZARD_EYES_INDEX];
      const left = getPosition(position, angle - PI * .5, distance);
      const right = getPosition(position, angle + PI * .5, distance);

      return [left, right, radius];
    }),
  })),
  withComputed(({ joints, radii, factor }) => ({
    legs: computed<Leg[]>(() => {
      const legs: Leg[] = [];
      LIZARD_LEGS_INDECES.forEach(index => {
        const { position, angle } = joints()[index + 1];
        const distance = factor() * radii()[index];
        // const radius = .2 * factor() * radii()[index];
        const left = getPosition(position, angle - PI * .5, distance);
        const right = getPosition(position, angle + PI * .5, distance);
        const left2 = getPosition(left, angle - PI, distance);
        const right2 = getPosition(right, angle + PI, distance);

        // FIXME this approach doesn't work
        // > read previous state
        // if (distance too far or not present, calculate new)
        // if within bounds just update leg joints

        // TODO move joints by reading running index?
        // TODO create dots instead of joint
        legs.push({ index, dots: [left, left2] });
        legs.push({ index, dots: [right, right2] });
      })

      return legs;
    }),
  })),

  withHooks({
    onInit(store) {
      effect(() => {
        const { scene, camera, renderer, dots, eyes, material, legs } = store;

        if (!dots().length) {
          return;
        }

        scene().clear();

        drawBody(scene(), dots(), material());
        drawOutlines(scene(), dots());

        legs().forEach(leg => {
          leg.dots.forEach(dot => {
            const dotGeometry = new CircleGeometry(10);
            const dotMaterial = new MeshBasicMaterial({ color: 0xFFFFFF });
            const dotMesh = new Mesh(dotGeometry, dotMaterial);

            dotMesh.position.x = dot.x;
            dotMesh.position.y = dot.y;

            scene().add(dotMesh);
          })

        })

        drawEyes(scene(), eyes());

        renderer().render(scene(), camera());
      });
    },
  }),
);