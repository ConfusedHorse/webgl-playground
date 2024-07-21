import * as THREE from 'three';

export type Dimension = Pick<DOMRectReadOnly, 'width' | 'height'>;

export interface RendererState {
  initialized: boolean;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  dimension: Dimension;
  camera: THREE.OrthographicCamera;

  resizeObserver: ResizeObserver;
  mousePosition: THREE.Vector2;
}

export const INITIAL_STATE: RendererState = {
  initialized: false,

  renderer: null!,
  scene: null!,
  dimension: null!,
  camera: null!,

  resizeObserver: null!,
  mousePosition: null!,
};
