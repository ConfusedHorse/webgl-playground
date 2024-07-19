import { Component } from '@angular/core';
import * as THREE from 'three';
import { ThreeCanvasComponent } from '../components/three-canvas/component';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';

@Component({
  standalone: true,
  imports: [
    ThreeCanvasComponent,
  ],
  selector: 'app-mandelbrot',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class MandelbrotComponent {

  #renderer?: THREE.WebGLRenderer;
  #scene?: THREE.Scene;

  _setupScene(renderer: THREE.WebGLRenderer): void {
    this.#renderer = renderer;
    const { width, height } = renderer.domElement;

    this.#scene = new THREE.Scene();
    this._updateScene({ width, height });
  }

  _updateScene({ width, height }: Pick<DOMRectReadOnly, 'width' | 'height'>): void {
    if (!this.#renderer || !this.#scene) {
      return;
    }

    const camera = new THREE.OrthographicCamera(0, width, 0, height, 0, 1000);
    this.#renderer.setSize(width, height);

    this.#drawCube(width, height);

    this.#renderer.render(this.#scene, camera);
  }

  #drawCube(width: number, height: number) {
    if (!this.#renderer || !this.#scene) {
      return;
    }

    this.#scene.clear();
    const geometry = new THREE.BoxGeometry(width, height, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.x = .5 * width;
    cube.position.y = .5 * height;

    this.#scene.add(cube);
  }

}