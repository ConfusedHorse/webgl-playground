import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
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

  // #radii = [50];
  #radii = [50, 50, 50, 50, 50, 50, 50, 50, 50];

  protected readonly _canvas = viewChild.required<ElementRef, ElementRef<HTMLCanvasElement>>('canvas', { read: ElementRef });

  constructor() {
    effect(() => {
      const { initialize, setRadii } = this.#lizardStore;
      initialize(this._canvas().nativeElement);
      setRadii(this.#radii);
    }, { allowSignalWrites: true });
  }

}