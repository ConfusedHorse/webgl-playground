import { Component, computed, ElementRef, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import * as THREE from 'three';
import { RENDERER_FEATURE } from './model';

@Component({
  standalone: true,
  selector: 'app-three-canvas',
  templateUrl: './component.html',
  styleUrls: ['./component.scss']
})
export class ThreeCanvasComponent implements OnInit, OnDestroy {

  #rendererFeature = inject(RENDERER_FEATURE);

  protected readonly _canvas = viewChild.required('canvas', { read: ElementRef });

  readonly #canvasElement = computed<HTMLCanvasElement>(() => this._canvas().nativeElement);
  readonly #element = inject(ElementRef).nativeElement as HTMLElement;
  readonly #size = new Subject<DOMRectReadOnly>();
  readonly #observer = new ResizeObserver(entries => this.#size.next(entries[0].contentRect));

  constructor() {
    this.#size.pipe(
      takeUntilDestroyed(),
    ).subscribe(this.#rendererFeature.updateDimensions);
  }

  ngOnInit(): void {
    this.#observer.observe(this.#element);

    const renderer = this.#createRenderer();
    this.#rendererFeature.initialize(renderer);
    this.#rendererFeature.updateDimensions(renderer.domElement);
  }

  ngOnDestroy(): void {
    this.#observer.unobserve(this.#element);
  }

  #createRenderer(): THREE.WebGLRenderer {
    const renderer = new THREE.WebGLRenderer({ canvas: this.#canvasElement() });
    const { width, height } = this.#element.getBoundingClientRect();
    renderer.setSize(width, height);

    return renderer;
  }

  _sizeChange(size: Pick<DOMRectReadOnly, 'width' | 'height'>): void {
    this.#rendererFeature.updateDimensions(size);
  }
}