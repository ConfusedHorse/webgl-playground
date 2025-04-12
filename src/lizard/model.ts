import { Box3, BufferAttribute, BufferGeometry, CatmullRomCurve3, CircleGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, Scene, ShaderMaterial, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';

export const LIZARD_FACTOR = 1;
export const LIZARD_RADII = [52, 58, 40, 60, 68, 71, 65, 50, 28, 15, 11, 9, 7, 7, 1];

export interface LizardState {
}

export const INITIAL_STATE: LizardState = {
};

function _setUV(geometry: BufferGeometry): void {
  const position = geometry.attributes['position'] as BufferAttribute;
  const box3 = new Box3().setFromBufferAttribute(position);
  const size = new Vector3();
  box3.getSize(size);

  const uv = [];
  const v2 = new Vector2();
  for (let i = 0; i < position.count; i++) {
    v2.fromBufferAttribute(position, i);
    v2.sub(box3.min).divide(size);
    uv.push(v2.x, v2.y);
  }

  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
}

export function drawBody(scene: Scene, dots: Vector2[]): void {
  if (dots.length < 3) return;

  const shape = createCatmullRomShape(dots);
  const geometry = new ShapeGeometry(shape);
  _setUV(geometry);

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
  });

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
}

export function drawOutlines(scene: Scene, dots: Vector2[]): void {
  const smoothPoints = createCatmullRom2DPath(dots, true, .5, 100);

  for (let i = 0; i < smoothPoints.length - 1; i++) {
    const start = smoothPoints[i];
    const end = smoothPoints[i + 1];

    const geometry = new BufferGeometry().setFromPoints([start, end]);
    const material = new LineBasicMaterial({ color: 0xFFFFFF });
    const line = new Line(geometry, material);

    scene.add(line);
  }
}

function createCatmullRomShape(points: Vector2[]): Shape {
  const shape = new Shape();

  const curvePoints = createCatmullRom2DPath(points, true, .5, 100);

  if (curvePoints.length === 0) return shape;

  shape.moveTo(curvePoints[0].x, curvePoints[0].y);
  for (let i = 1; i < curvePoints.length; i++) {
    shape.lineTo(curvePoints[i].x, curvePoints[i].y);
  }

  shape.lineTo(curvePoints[0].x, curvePoints[0].y);

  return shape;
}

function createCatmullRom2DPath(points: Vector2[], closed = false, tension = .5, divisions = 100): Vector2[] {
  if (points.length < 2) return [];

  const points3D = points.map(p => new Vector3(p.x, p.y, 0));
  const curve = new CatmullRomCurve3(points3D, closed, 'catmullrom', tension);
  const curvePoints3D = curve.getPoints(divisions);

  return curvePoints3D.map(p => new Vector2(p.x, p.y));
}

export function drawEyes(scene: Scene, eyes: [Vector2, Vector2, number]): void {
  const [left, right, radius] = eyes;
  [left, right].forEach(position => {
    const eyeGeometry = new CircleGeometry(radius);
    const pupilGeometry = new CircleGeometry(radius * .5);
    const eyeMaterial = new MeshBasicMaterial({ color: 0xFFFFFF });
    const pupilMaterial = new MeshBasicMaterial({ color: 0x000000 });
    const eye = new Mesh(eyeGeometry, eyeMaterial);
    const pupil = new Mesh(pupilGeometry, pupilMaterial);

    eye.position.x = position.x;
    eye.position.y = position.y;
    pupil.position.x = position.x;
    pupil.position.y = position.y;

    scene.add(eye, pupil);
  });
}