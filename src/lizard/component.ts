import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { LIZARD_RADII } from './model';
import { LizardStore } from './store';

@Component({
  standalone: true,
  providers: [LizardStore],
  selector: 'app-lizard',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],
})
export class LizardComponent {

  #lizardStore = inject(LizardStore);

  protected readonly _canvas = viewChild.required<ElementRef, ElementRef<HTMLCanvasElement>>('canvas', { read: ElementRef });

  constructor() {
    effect(() => {
      const { initialize, setRadii, setAngleConstraint } = this.#lizardStore;
      initialize(this._canvas().nativeElement);
      setRadii(LIZARD_RADII);
      setAngleConstraint(Math.PI / 12);
    }, { allowSignalWrites: true });
  }

}