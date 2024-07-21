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

  protected readonly _canvas = viewChild.required<ElementRef, ElementRef<HTMLCanvasElement>>('canvas', { read: ElementRef });

  constructor() {
    effect(() => this.#lizardStore.initialize(this._canvas().nativeElement), { allowSignalWrites: true });

    effect(() => {
      const { renderer, scene, camera, circle } = this.#lizardStore;

      scene().clear();
      scene().add(circle());
      renderer().render(scene(), camera());
    });
  }

}