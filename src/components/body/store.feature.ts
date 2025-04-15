import { computed, effect, untracked } from '@angular/core';
import { patchState, signalStoreFeature, withComputed, withFeature, withHooks, withMethods, withState } from '@ngrx/signals';
import { Material, ShaderMaterial, Vector2 } from 'three';
import { fragmentShader } from '../../lizard/shader/fragment';
import { vertexShader } from '../../lizard/shader/vertex';
import { withRenderer } from '../renderer/store.feature';
import { constrainAngle, getPosition, getVectorAngle, INITIAL_STATE, Joint, PI } from './model';

export function withBody() {
  return signalStoreFeature(
    withState(INITIAL_STATE),
    withFeature(withRenderer),

    withComputed(({ joints, radii, factor }) => ({
      dots: computed<Vector2[]>(() => {
        if (!joints()) {
          return [];
        }

        const [_, ...segments] = joints();

        const distances = radii().map(radius => radius * factor());
        const { position: nosePosition, angle: noseAngle } = joints()[1];
        const nose = [PI * .75, PI, PI * 1.25].map(offset =>
          getPosition(nosePosition, noseAngle + offset, distances[0])
        );
        const right = segments.map(({ position, angle }, i) =>
          getPosition(position, angle - PI * .5, distances[i])
        );
        const left = segments.map(({ position, angle }, i) =>
          getPosition(position, angle + PI * .5, distances[i])
        ).reverse();

        return [...nose, ...right, ...left];
      }),
    })),
    withComputed(({ jointDistance, factor }) => ({
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
      setFactor(factor: number): void {
        patchState(store, () => ({ factor }));
      },
      setRadii(radii: ReadonlyArray<number>): void {
        patchState(store, () => ({ radii }));
      },
      setJointDistance(jointDistance: number): void {
        patchState(store, () => ({ jointDistance }));
      },
      setAngleConstraint(angleConstraint: number): void {
        patchState(store, () => ({ angleConstraint }));
      },
    })),

    withHooks({
      onInit(store) {
        // initialize joints
        effect(() => {
          const { radii, linkSize } = store;

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
        });

        // update joints
        effect(() => {
          const { mousePosition, joints: previous, linkSize, angleConstraint } = store;

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

            const distanceScalar = index === 1 ? 2 : 1;
            const angle = getVectorAngle(previousJoint.position, precedingJoint.position);
            const constrainedAngle = constrainAngle(precedingJoint.angle, angle, angleConstraint());
            const position = getPosition(precedingJoint.position, constrainedAngle, distanceScalar * linkSize());

            joints.push({ position, angle: constrainedAngle });
          }

          patchState(store, () => ({ joints }));
        });
      },
    }),
  );
};