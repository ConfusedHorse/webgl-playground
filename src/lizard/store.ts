
import { effect } from '@angular/core';
import { signalStore, withHooks, withState } from '@ngrx/signals';
import { CircleGeometry, Line, LineBasicMaterial } from 'three';
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

        scene().clear(); // debug

        // const shape = new Shape(dots());
        // const geometry = new ShapeGeometry(shape);
        // const material = new MeshBasicMaterial({ color: 0xff0000, side: DoubleSide });
        // const mesh = new Mesh(geometry, material);
        // scene().add(mesh);

        dots().forEach(dot => {
          const geometry = new CircleGeometry(1);
          const material = new LineBasicMaterial({ color: 0xFF0000 });
          const circle = new Line(geometry, material);
          circle.position.x = dot.x;
          circle.position.y = dot.y;
          scene().add(circle);
        })

        renderer().render(scene(), camera());

















        // const uvs = test.reduce((accumulator, { x, y }) => accumulator.concat([x, y]), [] as number[]);

        // const uvs = new Float32Array([
        //   0.0, 0.0,
        //   1.0, 0.0,
        //   1.0, 1.0,
        //   0.0, 1.0,
        // ]);

        // geometry.computeVertexNormals();
        // geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2));

        // Create a mesh with a material
        // const material = new ShaderMaterial({ vertexShader, fragmentShader, side: BackSide });


        // const vertices: number[] = [];
        // joints().forEach((joint, i) => { // debug
        //   if (!i) {
        //     return;
        //   }

        //   vertices.push(...joint.position, 0);
        // });

        // const geometry = new BufferGeometry();
        // geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices), 3));
        // // geometry.setIndex(new BufferAttribute(indices, 1));
        // geometry.computeVertexNormals();
        // const material = new MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide });


        // const mesh = new Mesh(geometry, material);
        // // circle.position.x = joint.position.x;
        // // circle.position.y = joint.position.y;
        // scene().add(mesh);
      });
    }
  }),
);