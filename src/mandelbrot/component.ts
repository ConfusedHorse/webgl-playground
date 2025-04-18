import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { BackSide, BoxGeometry, Mesh, ShaderMaterial } from 'three';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';
import { MandelbrotStore } from './store';

@Component({
  standalone: true,
  providers: [MandelbrotStore],
  selector: 'app-mandelbrot',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class MandelbrotComponent {

  #mandelbrotStore = inject(MandelbrotStore);

  protected readonly _canvas = viewChild.required<ElementRef, ElementRef<HTMLCanvasElement>>('canvas', { read: ElementRef });

  constructor() {
    effect(() => this.#mandelbrotStore.initialize(this._canvas().nativeElement));

    effect(() => {
      const { renderer, scene, camera, dimension } = this.#mandelbrotStore;
      const { width, height } = dimension();

      const geometry = new BoxGeometry(width, height, 1);
      const material = new ShaderMaterial({ vertexShader, fragmentShader, side: BackSide });
      const cube = new Mesh(geometry, material);

      cube.position.x = .5 * width;
      cube.position.y = .5 * height;

      scene().clear();
      scene().add(cube);
      renderer().render(scene(), camera());
    });
  }

}