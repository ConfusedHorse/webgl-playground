import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, tap } from 'rxjs';
import { drawLizard } from './drawing';
import { FPS } from './model';
import { LizardStore } from './store';

@Component({
  standalone: true,
  providers: [LizardStore],
  selector: 'app-lizard',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class LizardComponent {

  readonly #lizardStore = inject(LizardStore);
  protected readonly _canvas = viewChild.required<ElementRef, ElementRef<HTMLCanvasElement>>('canvas', { read: ElementRef });

  constructor() {
    const lizardBusiness$ = interval(1000 / FPS).pipe(
      tap(_ => drawLizard(this.#lizardStore)),
      takeUntilDestroyed(),
    );

    effect(() => {
      this.#lizardStore.initialize(this._canvas().nativeElement);
      lizardBusiness$.subscribe();
    });
  }

}