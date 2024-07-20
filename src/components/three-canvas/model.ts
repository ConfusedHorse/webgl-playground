import { InjectionToken } from '@angular/core';
import * as THREE from 'three';
import { withRenderer } from './store.feature';

export type Dimension = Pick<DOMRectReadOnly, 'width' | 'height'>;

export type RendererFeature = ReturnType<ReturnType<typeof withRenderer>>['methods'];
export const RENDERER_FEATURE = new InjectionToken<RendererFeature>('inject renderer feature store');

export interface RendererState {
  initialized: boolean;

  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  dimension: Dimension;
  camera: THREE.OrthographicCamera;

  mousePosition: THREE.Vector2;
}

export const INITIAL_STATE: RendererState = {
  initialized: false,

  renderer: null!,
  scene: null!,
  dimension: null!,
  camera: null!,

  mousePosition: null!,
};
