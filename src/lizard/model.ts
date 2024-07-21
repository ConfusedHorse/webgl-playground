import { Vector2 } from 'three';

export interface LizardState {
  radii: ReadonlyArray<number>;
  joints: ReadonlyArray<Vector2>;
  linkSize: number;
}

export const INITIAL_STATE: LizardState = {
  radii: [],
  joints: null!,
  linkSize: 50,
};
