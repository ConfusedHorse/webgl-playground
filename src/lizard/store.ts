
import { effect, untracked } from '@angular/core';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { CircleGeometry, Line, LineBasicMaterial, Vector2 } from 'three';
import { withRenderer } from '../components/renderer/store.feature';
import { INITIAL_STATE } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withRenderer(),

  withMethods(store => ({
    setRadii(radii: ReadonlyArray<number>): void {
      patchState(store, () => ({ radii }));
    }
  })),

  withHooks({
    onInit(store) {
      effect(() => { // initialize joints
        const { radii, linkSize } = store;

        if (!radii().length) {
          return;
        }

        const joints: Array<Vector2> = [new Vector2()];
        for (let index = 1; index < radii().length; index++) {
          const precedingJoint = joints[index - 1];
          const joint = new Vector2().copy(precedingJoint).add(new Vector2(0, linkSize()));
          joints.push(joint);
        }

        patchState(store, () => ({ joints }));
      }, { allowSignalWrites: true });
      effect(() => { // update joints
        const { mousePosition, joints: previous, linkSize, scene, camera, renderer } = store;

        const previousJoints = untracked(previous);
        const joints: Array<Vector2> = [mousePosition()];

        if (!previousJoints) {
          return;
        }

        for (let index = 1; index < previousJoints.length; index++) {
          const previousJoint = previousJoints[index];
          const precedingJoint = joints[index - 1];
          const difference = previousJoint.sub(precedingJoint).normalize().multiplyScalar(linkSize());
          const joint = new Vector2().copy(precedingJoint).add(difference);
          joints.push(joint);
        }

        scene().clear(); // debug
        joints.forEach(joint => { // debug
          const geometry = new CircleGeometry(50, 32);
          const material = new LineBasicMaterial({ color: 'blue' });
          const circle = new Line(geometry, material);
          circle.position.x = joint.x;
          circle.position.y = joint.y;
          scene().add(circle);
          renderer().render(scene(), camera());
        })

        console.log('joints B', JSON.stringify(joints));

        patchState(store, () => ({ joints }));
      }, { allowSignalWrites: true });
    }
  })
);