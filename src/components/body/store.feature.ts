import { computed, effect, untracked } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Vector2 } from 'three';
import { withRenderer } from '../renderer/store.feature';
import { constrainAngle, getPosition, getVectorAngle, INITIAL_STATE, Joint, PI } from './model';

export function withBody() {
  return signalStoreFeature(
    withState(INITIAL_STATE),
    withRenderer(),

    withComputed(({ joints, radii }) => ({
      dots: computed<Vector2[]>(() => {
        if (!joints()) {
          return [];
        }

        const dots: Vector2[] = [];
        joints().forEach(({ position, angle }, i) => {
          if (!i) {
            return;
          }
          const left = getPosition(position, angle + PI / 2, radii()[i - 1] / 2);
          const right = getPosition(position, angle - PI / 2, radii()[i - 1] / 2);

          dots.push(left, right);
        });
        return dots;
        // return joints().map(({ position }) => position);
      }),
    })),

    withMethods(store => ({
      setRadii(radii: ReadonlyArray<number>): void {
        patchState(store, () => ({ radii }));
      },
      setAngleConstraint(angleConstraint: number): void {
        patchState(store, () => ({ angleConstraint }));
      },
    })),

    withHooks({
      onInit(store) {
        // initialize joints
        effect(() => {
          const { radii, jointDistance: linkSize } = store;

          if (!radii().length) {
            return;
          }

          const joints: Array<Joint> = [{ position: new Vector2(), angle: 0 }];
          for (let index = 1; index <= radii().length; index++) {
            const precedingJoint = joints[index - 1];
            const position = new Vector2().copy(precedingJoint.position).add(new Vector2(0, linkSize()));
            joints.push({ position, angle: 0 });
          }

          patchState(store, () => ({ joints }));
        }, { allowSignalWrites: true });

        // update joints
        effect(() => {
          const { mousePosition, joints: previous, jointDistance: linkSize, angleConstraint } = store;

          const previousJoints = untracked(previous);
          const currentMousePosition = mousePosition();
          if (!previousJoints) {
            return;
          }

          const direction = getVectorAngle(previousJoints[0].position, currentMousePosition);
          const constrainedDirection = constrainAngle(previousJoints[0].angle, direction, PI / 32);
          const joints: Array<Joint> = [{ position: currentMousePosition, angle: constrainedDirection }];

          for (let index = 1; index < previousJoints.length; index++) {
            const previousJoint = previousJoints[index];
            const precedingJoint = joints[index - 1];

            const angle = getVectorAngle(previousJoint.position, precedingJoint.position);
            const constrainedAngle = constrainAngle(precedingJoint.angle, angle, angleConstraint());
            const position = getPosition(precedingJoint.position, constrainedAngle, linkSize());

            joints.push({ position, angle: constrainedAngle });
          }

          patchState(store, () => ({ joints }));
        }, { allowSignalWrites: true });
      },
    }),
  );
};