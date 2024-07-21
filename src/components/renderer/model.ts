import { OrthographicCamera, Scene, Vector2, WebGLRenderer } from 'three';

export type Dimension = Pick<DOMRectReadOnly, 'width' | 'height'>;

export interface RendererState {
  initialized: boolean;

  renderer: WebGLRenderer;
  scene: Scene;
  dimension: Dimension;
  camera: OrthographicCamera;

  resizeObserver: ResizeObserver;
  mousePosition: Vector2;
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
