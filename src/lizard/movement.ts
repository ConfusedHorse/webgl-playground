import { Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { auditTime, distinctUntilChanged, fromEvent, interval, map, merge, of, shareReplay, startWith, switchMap, timer, withLatestFrom } from 'rxjs';
import { Vector2 } from 'three';
import { constrainTarget, getCenter } from './helpers';
import { FPS, MOVEMENT_DELAY } from './model';
import { LizardStore } from './store';

export function targetBehavior(store: InstanceType<typeof LizardStore>): Signal<Vector2> {
  const clock$ = interval(1000 / FPS).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  const mouseMove$ = fromEvent<MouseEvent>(window, 'mousemove').pipe(
    auditTime(1),
    map(({ x, y }) => new Vector2(x, y)),
    map(({ x, y }) => {
      const { x: offsetX, y: offsetY, height } = store.renderer().domElement.getBoundingClientRect();
      return new Vector2(x - offsetX, height - y + offsetY);
    }),
    shareReplay({ refCount: true, bufferSize: 1 })
  );

  const recentlyMoved$ = mouseMove$.pipe(
    switchMap(() => merge(of(true), timer(MOVEMENT_DELAY).pipe(map(() => false)))),
    startWith(false),
    distinctUntilChanged(),
  );

  const autoTarget$ = clock$.pipe(
    map(value => value % 360),
    map(angle => angle * Math.PI / 180),
    map(rad => {
      const { width, height } = store.dimension();
      const center = getCenter({ width, height });
      const direction = new Vector2(Math.cos(rad), Math.sin(rad));
      const distance = Math.min(width, height) * 0.5 * 0.75;
      return center.clone().add(direction.multiplyScalar(distance));
    }),
    startWith(new Vector2())
  );

  const mouseTarget$ = clock$.pipe(
    withLatestFrom(mouseMove$),
    map(([_, target]) => target)
  );

  const target$ = recentlyMoved$.pipe(
    switchMap(recentlyMoved => recentlyMoved ? mouseTarget$ : autoTarget$),
    map(target => {
      const { width, height } = store.dimension() ?? { width: 0, height: 0 };
      const constraint = Math.max(height, width) * .01 * .75;
      return constrainTarget(store.target(), target, constraint);
    }),
  );

  return toSignal(target$, { requireSync: true });
}