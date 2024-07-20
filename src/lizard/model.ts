import * as THREE from 'three';

export type Dimension = Pick<DOMRectReadOnly, 'width' | 'height'>;

export interface LizardState {
  initialized: boolean;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  dimension: Dimension;
  camera: THREE.OrthographicCamera;

  mousePosition: THREE.Vector2;

  circle: THREE.Mesh;
}

export const INITIAL_STATE: LizardState = {
  initialized: false,

  renderer: null!,
  scene: null!,
  dimension: null!,
  camera: null!,

  mousePosition: null!,
  circle: null!,
};
