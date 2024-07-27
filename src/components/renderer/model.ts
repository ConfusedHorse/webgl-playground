import { OrthographicCamera, Scene, WebGLRenderer } from 'three';

export type Dimension = Pick<DOMRectReadOnly, 'width' | 'height'>;

export interface RendererState {
  renderer: WebGLRenderer;
  scene: Scene;
  dimension: Dimension;
  camera: OrthographicCamera;

  resizeObserver: ResizeObserver;
}

export const INITIAL_STATE: RendererState = {
  renderer: null!,
  scene: null!,
  dimension: null!,
  camera: null!,

  resizeObserver: null!,
};