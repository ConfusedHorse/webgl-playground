import { BackSide, Box3, BufferAttribute, BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial, Mesh, Scene, ShaderMaterial, Shape, ShapeGeometry, Vector2, Vector3 } from 'three';
import { fragmentShader } from './shader/fragment';
import { vertexShader } from './shader/vertex';

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
  const shape = new Shape(dots);
  const geometry = new ShapeGeometry(shape);
  _setUV(geometry);

  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: BackSide,
    transparent: true,
  });
  const mesh = new Mesh(geometry, material);

  scene.add(mesh);
}

export function drawOutlines(scene: Scene, dots: Vector2[]): void {
  for (let index = 0; index < dots.length; index++) {
    const start = dots[index];
    const end = dots[index + 1] ?? dots[0];

    const geometry = new BufferGeometry().setFromPoints([start, end]);
    const material = new LineBasicMaterial({ color: 0xFFFFFF });
    const line = new Line(geometry, material);

    scene.add(line);
  }
}