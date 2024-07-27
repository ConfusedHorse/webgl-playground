
import { effect } from '@angular/core';
import { signalStore, withHooks, withState } from '@ngrx/signals';
import { BackSide, CircleGeometry, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Shape, ShapeGeometry } from 'three';
import { withBody } from '../components/body/store.feature';
import { INITIAL_STATE } from './model';

export const LizardStore = signalStore(
  withState(INITIAL_STATE),
  withBody(),

  withHooks({
    onInit(store) {
      effect(() => {
        const { dots, scene, camera, renderer, radii } = store;

        if (!dots().length) {
          return;
        }

        scene().clear();

        const shape = new Shape(dots());
        const geometry = new ShapeGeometry(shape);
        geometry.computeVertexNormals();
        const material = new MeshBasicMaterial({ color: 0x0055FF, side: BackSide });
        const mesh = new Mesh(geometry, material);
        scene().add(mesh);

        dots().forEach(dot => { // debug
          const geometry = new CircleGeometry(1);
          const material = new LineBasicMaterial({ color: 0xFF0000 });
          const circle = new Line(geometry, material);
          circle.position.x = dot.x;
          circle.position.y = dot.y;
          scene().add(circle);
        });

        renderer().render(scene(), camera());
      });
    },
  }),
);