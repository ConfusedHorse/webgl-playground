import { Component, computed, ElementRef, inject, OnInit, output, viewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  standalone: true,
  selector: 'app-three-canvas',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class ThreeCanvasComponent implements OnInit {

  #renderer?: THREE.WebGLRenderer;

  protected readonly _canvas = viewChild.required('canvas', { read: ElementRef });

  readonly #canvasElement = computed<HTMLCanvasElement>(() => this._canvas().nativeElement);
  readonly #element = inject(ElementRef).nativeElement as HTMLElement;
  // readonly #size = new Subject<DOMRectReadOnly>();

  // readonly #observer = new ResizeObserver(entries => this.#size.next(entries[0].contentRect));

  public readonly rendererChange = output<THREE.WebGLRenderer>();

  ngOnInit(): void {
    // this.#observer.observe(this.#element);

    this.#renderer = this.#createRenderer();
    this.rendererChange.emit(this.#renderer);
  }

  #createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ canvas: this.#canvasElement() });
    const { width, height } = this.#element.getBoundingClientRect();
    renderer.setSize(width, height);

    return renderer;
  }


}