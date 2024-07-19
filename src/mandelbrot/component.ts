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

  _doSomething(renderer: THREE.WebGLRenderer): void {
    const { width, height } = renderer.domElement

    const camera = new THREE.OrthographicCamera(0, width, 0, height, 0, 1000);
    const scene = new THREE.Scene();

    const geometry = new THREE.BoxGeometry(width, height, 1);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
    });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.x = .5 * width;
    cube.position.y = .5 * height;

    scene.add(cube);

    renderer.render(scene, camera);
  }

}