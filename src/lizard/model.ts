import { DeepSignal, Signal } from '@ngrx/signals/src/deep-signal';
import { Vector2 } from 'three';
import { LizardStore } from './store';

// export const FPS = 1;
export const FPS = 60;
export const PI = Math.PI;
export const TWO_PI = PI * 2;

export const MOVEMENT_DELAY = 3000;

export const FACTOR = 1;
export const RADII = [52, 58, 30, 60, 68, 71, 65, 50, 28, 15, 11, 9, 9, 7, 7, 5, 1];
export const JOINT_DISTANCE = 50;
export const EYES_INDEX = 0;
export const LEGS_INDECES: [number, number] = [3, 7];
export const LINK_DISTANCE = 50;
export const ANGLE_CONSTRAINT_RAD = PI / 12;

interface LizardConfiguration {
  factor: number;
  form: number[];
  legs: [number, number]; // [front, back]
  jointDistance: number;
  angleConstraint: number;
}

export interface LizardState {
  configuration: LizardConfiguration;
  joints: Joint[];
  target: Vector2;
}

export const INITIAL_STATE: LizardState = {
  configuration: {
    factor: FACTOR,
    form: RADII,
    legs: LEGS_INDECES,
    jointDistance: LINK_DISTANCE,
    angleConstraint: ANGLE_CONSTRAINT_RAD,
  },
  joints: [],
  target: new Vector2(),
};

type UnwrapSignal<T> =
  T extends Signal<infer U> ? UnwrapSignal<U> :
  T extends DeepSignal<infer U> ? UnwrapSignal<U> :
  T extends object ? { [K in keyof T]: UnwrapSignal<T[K]> } :
  T;

export type FullLizardState = UnwrapSignal<InstanceType<typeof LizardStore>>;

export interface Joint {
  position: Vector2;
  angle: number;
}

export interface Leg {
  index: number;
  dots: Vector2[];
}