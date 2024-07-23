import { Vector2 } from 'three';

const LINK_DISTANCE = 50;

export const PI = Math.PI;
export const TWO_PI = PI * 2;

export const DEFAULT_ANGLE_CONSTRAINT_RAD = PI / 8;

export interface Joint {
  position: Vector2;
  angle: number;
}

export interface LizardState {
  radii: ReadonlyArray<number>;
  jointDistance: number;
  angleConstraint: number;

  joints: ReadonlyArray<Joint>;
}

export const INITIAL_STATE: LizardState = {
  radii: [],
  jointDistance: LINK_DISTANCE,
  angleConstraint: DEFAULT_ANGLE_CONSTRAINT_RAD,

  joints: null!,
};

export function getVectorAngle(v1: Vector2, v2: Vector2): number {
  const vectorAngle = PI + Math.atan2(v2.y - v1.y, v2.x - v1.x);
  return vectorAngle % TWO_PI;
}

export function getPosition(origin: Vector2, angle: number, distance: number): Vector2 {
  return new Vector2(origin.x + distance * Math.cos(angle), origin.y + distance * Math.sin(angle));
}

export function constrainAngle(anchor: number, angle: number, constraint: number = DEFAULT_ANGLE_CONSTRAINT_RAD): number {
  const angleDifference = Math.atan2(Math.sin(anchor - angle), Math.cos(anchor - angle));
  return Math.abs(angleDifference) > constraint ? anchor - Math.sign(angleDifference) * constraint : angle;
}