import { Component, effect, inject } from '@angular/core';
import * as THREE from 'three';
import { ThreeCanvasComponent } from '../components/three-canvas/component';
import { LizardStore } from './store';

@Component({
  standalone: true,
  imports: [ThreeCanvasComponent],
  providers: [LizardStore],
  selector: 'app-lizard',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class LizardComponent {

  #lizardStore = inject(LizardStore);

  _initialize(renderer: THREE.WebGLRenderer): void {
    this.#lizardStore.initialize(renderer);
    this.#lizardStore.updateDimensions(renderer.domElement);
  }

  _sizeChange(size: Pick<DOMRectReadOnly, 'width' | 'height'>): void {
    this.#lizardStore.updateDimensions(size);
  }

  constructor() {
    effect(() => {
      const { renderer, scene, camera, circle } = this.#lizardStore;
      scene().clear();
      scene().add(circle());
      renderer().render(scene(), camera());
    });
  }

}