import * as THREE from 'three';

export interface LizardState {
  circle: THREE.Mesh;
}

export const INITIAL_STATE: LizardState = {
  circle: null!,
};
