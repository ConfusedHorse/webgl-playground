import { toSignal } from '@angular/core/rxjs-interop';
import { patchState, signalStoreFeature, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { auditTime, fromEvent, map, startWith } from 'rxjs';
import { OrthographicCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { Dimension, INITIAL_STATE } from './model';

export function withRenderer() {
  return signalStoreFeature(
    withState(INITIAL_STATE),

    withComputed(({ renderer }) => ({
      mousePosition: toSignal(fromEvent<MouseEvent>(window, 'mousemove').pipe(
        auditTime(10),
        map(({ x, y }) => new Vector2(x, y)),
        map((mousePosition) => {
          const { x, y } = renderer().domElement.getBoundingClientRect();
          const offset = new Vector2(x, y);
          return mousePosition.sub(offset);
        }),
        startWith(new Vector2()),
      ), { requireSync: true }),
    })),

    withMethods(store => ({
      updateDimensions(dimension: Dimension): void {
        const { width, height } = dimension;
        const camera = new OrthographicCamera(0, width, 0, height, 0, 1);

        patchState(store, ({ renderer }) => {
          renderer?.setSize(width, height);
          return { dimension, camera };
        });
      },
    })),
    withMethods(store => ({
      initialize(canvas: HTMLCanvasElement): void {
        const renderer = new WebGLRenderer({ canvas });
        const resizeObserver = new ResizeObserver(entries => store.updateDimensions(entries[0].contentRect));
        resizeObserver.observe(renderer.domElement.parentElement as Element);

        patchState(store, () => ({
          renderer,
          scene: new Scene(),
          initialized: true,
          resizeObserver,
        }));

        store.updateDimensions(renderer.domElement);
      },
    })),

    withHooks({
      onDestroy({ renderer, resizeObserver }) {
        resizeObserver().unobserve(renderer().domElement.parentElement as Element);
      },
    }),
  );
};