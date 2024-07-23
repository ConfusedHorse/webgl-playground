import { effect, untracked } from '@angular/core';
import { patchState, signalStoreFeature, withHooks, withMethods, withState } from '@ngrx/signals';
import { CircleGeometry, Line, LineBasicMaterial, Vector2 } from 'three';
import { withRenderer } from '../renderer/store.feature';
import { constrainAngle, getPosition, getVectorAngle, INITIAL_STATE, Joint, PI } from './model';

export function withChain() {
  return signalStoreFeature(
    withState(INITIAL_STATE),
    withRenderer(),

    withMethods(store => ({
      setRadii(radii: ReadonlyArray<number>): void {
        patchState(store, () => ({ radii }));
      }
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
          const { mousePosition, joints: previous, jointDistance: linkSize, scene, camera, renderer, radii } = store;

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
            const constrainedAngle = constrainAngle(precedingJoint.angle, angle);
            const position = getPosition(precedingJoint.position, constrainedAngle, linkSize());

            joints.push({ position, angle: constrainedAngle });
          }

          scene().clear(); // debug
          joints.forEach((joint, i) => { // debug
            if (!i) {
              return;
            }

            const geometry = new CircleGeometry(radii()[i - 1], 16, joint.angle);
            const material = new LineBasicMaterial({ color: 0x005580 });
            const circle = new Line(geometry, material);
            circle.position.x = joint.position.x;
            circle.position.y = joint.position.y;
            scene().add(circle);
          });
          renderer().render(scene(), camera());

          patchState(store, () => ({ joints }));
        }, { allowSignalWrites: true });
      },
    }),
  );
};