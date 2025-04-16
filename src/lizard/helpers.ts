import { CatmullRomCurve3, Shape, Vector2, Vector3 } from 'three';
import { Dimension } from '../components/renderer/model';
import { ANGLE_CONSTRAINT_RAD, PI, RADII, TWO_PI } from './model';

export function createCatmullRomShape(points: Vector2[], tension = .5, divisions = 100): Shape {
  const shape = new Shape();
  const curvePoints = createCatmullRom2DPath(points, true, tension, divisions);

  if (curvePoints.length === 0) {
    return shape;
  };

  shape.moveTo(curvePoints[0].x, curvePoints[0].y);
  for (let i = 1; i < curvePoints.length; i++) {
    shape.lineTo(curvePoints[i].x, curvePoints[i].y);
  }
  shape.lineTo(curvePoints[0].x, curvePoints[0].y);

  return shape;
}

export function createCatmullRom2DPath(points: Vector2[], closed = false, tension = .5, divisions = 10 * RADII.length): Vector2[] {
  if (points.length < 2) {
    return [];
  };

  const points3D = points.map(p => new Vector3(p.x, p.y, 0));
  const curve = new CatmullRomCurve3(points3D, closed, 'catmullrom', tension);
  const curvePoints3D = curve.getPoints(divisions);

  return curvePoints3D.map(p => new Vector2(p.x, p.y));
}

export function getVectorAngle(v1: Vector2, v2: Vector2): number {
  const vectorAngle = PI + Math.atan2(v2.y - v1.y, v2.x - v1.x);
  return vectorAngle % TWO_PI;
}

export function getPosition(origin: Vector2, angle: number, distance: number): Vector2 {
  return new Vector2(origin.x + distance * Math.cos(angle), origin.y + distance * Math.sin(angle));
}

export function constrainAngle(anchor: number, angle: number, constraint: number = ANGLE_CONSTRAINT_RAD): number {
  const angleDifference = Math.atan2(Math.sin(anchor - angle), Math.cos(anchor - angle));
  return Math.abs(angleDifference) > constraint ? anchor - Math.sign(angleDifference) * constraint : angle;
}

export function constrainTarget(from: Vector2, to: Vector2, maxDistance: number): Vector2 {
  const direction = to.clone().sub(from);
  const distance = direction.length();

  if (distance <= maxDistance) {
    return to.clone();
  }

  direction.normalize().multiplyScalar(maxDistance);
  return from.clone().add(direction);
}

export function getCenter(dimension: Dimension): Vector2 {
  const { width, height } = dimension;
  return new Vector2(width * .5, height * .5);
}