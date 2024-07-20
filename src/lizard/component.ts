import { Component, effect, inject } from '@angular/core';
import { ThreeCanvasComponent } from '../components/three-canvas/component';
import { RENDERER_FEATURE } from '../components/three-canvas/model';
import { LizardStore } from './store';

@Component({
  standalone: true,
  imports: [ThreeCanvasComponent],
  selector: 'app-lizard',
  templateUrl: './component.html',
  styleUrls: ['./component.scss'],

  providers: [
    LizardStore,
    { provide: RENDERER_FEATURE, useExisting: LizardStore }
  ],
})
export class LizardComponent {

  #lizardStore = inject(LizardStore);

  constructor() {
    effect(() => {
      const { renderer, scene, camera, circle } = this.#lizardStore;
      scene().clear();
      scene().add(circle());
      renderer().render(scene(), camera());
    });
  }

}