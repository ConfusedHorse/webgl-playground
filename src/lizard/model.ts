import { Vector2 } from 'three';

export const FPS = 60;
export const FACTOR = .75;
export const MOVEMENT_DELAY = 3000;

export const PI = Math.PI;
export const TWO_PI = PI * 2;

export const RADII = [52, 58, 30, 60, 68, 71, 65, 50, 28, 15, 11, 9, 9, 7, 7, 5, 5, /*10, 20, 10,*/ 1];
export const JOINT_DISTANCE = 50;
export const EYES_INDEX = 0;
export const LIMB_INDECES: [number, number] = [3, 7];
export const VERTABRAE_DISTANCE = 50;
export const ANGLE_CONSTRAINT_RAD = PI / 12;

interface LizardConfiguration {
  factor: number;
  form: number[];
  limbAttachment: [number, number]; // [front, back]
  vertebraeDistance: number;
  angleConstraint: number;
}

export interface LizardState {
  configuration: LizardConfiguration;
  spine: Vertabra[];
  limbs: Limb[];
  target: Vector2;
}

export const INITIAL_STATE: LizardState = {
  configuration: {
    factor: FACTOR,
    form: RADII,
    vertebraeDistance: VERTABRAE_DISTANCE,
    limbAttachment: LIMB_INDECES,
    angleConstraint: ANGLE_CONSTRAINT_RAD,
  },
  spine: [],
  target: new Vector2(),
  limbs: [],
};

export interface Vertabra {
  position: Vector2;
  angle: number;
}

export type Limb = Vector2[];