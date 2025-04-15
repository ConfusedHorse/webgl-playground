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
        auditTime(1),
        map(({ x, y }) => new Vector2(x, y)),
        map(({ x, y }) => {
          const { x: offsetX, y: offsetY, height } = renderer().domElement.getBoundingClientRect();
          return new Vector2(x - offsetX, height - y + offsetY)
        }),
        startWith(new Vector2()),
      ), { requireSync: true }),
    })),

    withMethods(store => ({
      updateDimensions(dimension: Dimension): void {
        const { width, height } = dimension;
        const camera = new OrthographicCamera(0, width, height, 0, 0, 1);

        patchState(store, ({ renderer }) => {
          renderer?.setSize(width, height);
          return { dimension, camera };
        });
      },
    })),
    withMethods(store => ({
      initialize(canvas: HTMLCanvasElement): void {
        const renderer = new WebGLRenderer({ canvas, antialias: true });
        const resizeObserver = new ResizeObserver(entries => store.updateDimensions(entries[0].contentRect));
        resizeObserver.observe(renderer.domElement.parentElement as Element);

        patchState(store, () => ({
          renderer,
          scene: new Scene(),
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