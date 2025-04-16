import { getState } from '@ngrx/signals';
import { BufferGeometry, CircleGeometry, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, Scene, ShaderMaterial, ShapeGeometry, Vector2 } from 'three';
import { constrainAngle, createCatmullRom2DPath, createCatmullRomShape, getPosition, getVectorAngle } from './helpers';
import { EYES_INDEX, Limb, PI, Vertabra } from './model';
import { LizardStore } from './store';

export function drawLizard(lizardStore: InstanceType<typeof LizardStore>): void {
  const {
    spine: previousVertabrae,
    limbs: previousLimbs,
    configuration: { angleConstraint, form, factor, limbAttachments },
    scene,
    renderer,
    camera,
  } = getState(lizardStore);
  const linkSize = lizardStore.linkSize();
  const material = lizardStore.material();
  const target = lizardStore.target();

  scene.clear();

  const spine = previousVertabrae.length
    ? _generateSpine(target, previousVertabrae, linkSize, angleConstraint)
    : _initializeSpine(form, linkSize);

  if (previousVertabrae.length && previousVertabrae[0].position.distanceTo(spine[0].position) === 0) {
    return;
  }

  const dots = _generateBodyDots(spine, form, factor);
  const eyes = _generateEyes(spine, form, factor);

  _drawBody(scene, dots, material, 2);
  _drawOutlines(scene, dots, 2);
  _drawEyes(scene, eyes, 3);

  const limbs = _generateLimbs(spine, form, factor, limbAttachments, previousLimbs);
  _drawLimbs(scene, limbs, material);

  renderer.render(scene, camera);

  lizardStore.patchSpine(spine);
  lizardStore.patchLimbs(limbs);
}

function _initializeSpine(radii: number[], distance: number): Vertabra[] {
  if (!radii.length) {
    return [];
  }

  const vertabrae: Array<Vertabra> = [{ position: new Vector2(), angle: 0 }];
  for (let index = 1; index <= radii.length; index++) {
    const precedingJoint = vertabrae[index - 1];
    const position = new Vector2().copy(precedingJoint.position).add(new Vector2(0, distance));
    vertabrae.push({ position, angle: 0 });
  }

  return vertabrae;
}

function _generateSpine(mousePosition: Vector2, previousVertabrae: Vertabra[], distance: number, angleConstraint: number): Vertabra[] {
  if (!previousVertabrae) {
    return [];
  }

  const direction = getVectorAngle(previousVertabrae[0].position, mousePosition);
  const constrainedDirection = constrainAngle(previousVertabrae[0].angle, direction, PI / 32);
  const spine: Array<Vertabra> = [{ position: mousePosition, angle: constrainedDirection }];

  for (let index = 1; index < previousVertabrae.length; index++) {
    const previousJoint = previousVertabrae[index];
    const precedingJoint = spine[index - 1];

    const distanceScalar = index === 1 ? 2 : 1;
    const angle = getVectorAngle(previousJoint.position, precedingJoint.position);
    const constrainedAngle = constrainAngle(precedingJoint.angle, angle, angleConstraint);
    const position = getPosition(precedingJoint.position, constrainedAngle, distanceScalar * distance);

    spine.push({ position, angle: constrainedAngle });
  }

  return spine;
}

function _generateBodyDots(spine: Vertabra[], radii: number[], factor: number): Vector2[] {
  if (!spine) {
    return [];
  }

  const [_, ...segments] = spine;

  const distances = radii.map(radius => radius * factor);
  const { position: nosePosition, angle: noseAngle } = spine[1];
  const nose = [PI * .75, PI, PI * 1.25].map(offset =>
    getPosition(nosePosition, noseAngle + offset, distances[0])
  );
  const right = segments.map(({ position, angle }, i) =>
    getPosition(position, angle - PI * .5, distances[i])
  );
  const left = segments.map(({ position, angle }, i) =>
    getPosition(position, angle + PI * .5, distances[i])
  ).reverse();

  return [...nose, ...right, ...left];
}

function _drawBody(scene: Scene, dots: Vector2[], material: Material, renderOrder = 1, tension = .5, divisions = 100): void {
  if (dots.length < 3) {
    return;
  };

  const shape = createCatmullRomShape(dots, tension, divisions);
  const geometry = new ShapeGeometry(shape);

  const mesh = new Mesh(geometry, material);
  mesh.renderOrder = renderOrder;
  scene.add(mesh);
}

function _drawOutlines(scene: Scene, dots: Vector2[], renderOrder = 1, tension = .5, divisions = 100): void {
  const smoothPoints = createCatmullRom2DPath(dots, true, tension, divisions);

  for (let i = 0; i < smoothPoints.length - 1; i++) {
    const start = smoothPoints[i];
    const end = smoothPoints[i + 1];

    const geometry = new BufferGeometry().setFromPoints([start, end]);
    const material = new LineBasicMaterial({ color: 0xFFFFFF });

    const line = new Line(geometry, material);
    line.renderOrder = renderOrder;
    scene.add(line);
  }
}

function _generateEyes(spine: Vertabra[], radii: number[], factor: number): [Vector2, Vector2, number] {
  const { position, angle } = spine[EYES_INDEX + 1];
  const distance = .75 * factor * radii[EYES_INDEX];
  const radius = .2 * factor * radii[EYES_INDEX];
  const left = getPosition(position, angle - PI * .5, distance);
  const right = getPosition(position, angle + PI * .5, distance);

  return [left, right, radius];
}

function _drawEyes(scene: Scene, eyes: [Vector2, Vector2, number], renderOrder = 1): void {
  const [left, right, radius] = eyes;

  [left, right].forEach(position => {
    const eyeGeometry = new CircleGeometry(radius);
    const eyeMaterial = new MeshBasicMaterial({ color: 0xFFFFFF });
    const eye = new Mesh(eyeGeometry, eyeMaterial);

    eye.position.x = position.x;
    eye.position.y = position.y;
    eye.renderOrder = renderOrder;
    scene.add(eye);
  });
}

function _generateLimbs(vertabrae: Vertabra[], form: number[], factor: number, limbAttachments: [number, number], previousLimbs: Limb[]): Limb[] {
  const length = (form[limbAttachments[0]] + form[limbAttachments[1]]) * .5 * factor;
  const sockets = Array.from(limbAttachments).map(limbAttachment => {
    const { position, angle } = vertabrae[limbAttachment + 1];

    const offset = form[limbAttachment] * factor;
    const left = getPosition(position, angle - PI * .5, offset * .75);
    const right = getPosition(position, angle + PI * .5, offset * .75);

    return [
      [angle - PI * .5, length, left] as const, // left
      [angle + PI * .5, length, right] as const, // right
    ];
  }).flat(); // [fl, fr, bl, br]

  return sockets.map((socket, index) => _generateLimb(...socket, index, previousLimbs[index]?.at(-1)));
}

function _generateLimb(angle: number, length: number, shoulder: Vector2, index: number, previousFoot?: Vector2): Limb {
  length *= .75;

  const adjustAngle = index < 2 ? .25 : .33;
  const invert = index % 2 ? 1 : -1;
  const foot = !previousFoot || previousFoot.distanceTo(shoulder) >= 2 * length ? getPosition(shoulder, angle + PI * invert * adjustAngle, length * 2) : previousFoot;
  const elbow = _generateElbow(shoulder, foot, length, [0, 3].includes(index));

  return [shoulder, elbow, foot];
}

function _generateElbow(shoulder: Vector2, foot: Vector2, length: number, invert: boolean): Vector2 {
  const distance = shoulder.distanceTo(foot);

  const center = shoulder.clone().add(foot).multiplyScalar(.5);
  if (distance > 2 * length || distance === 0) {
    return center;
  }

  const halfChordLength = Math.sqrt(length * length - distance * distance * .25);
  const direction = foot.clone().sub(shoulder).normalize();
  const perpendicular = new Vector2(-direction.y, direction.x);
  const offset = perpendicular.multiplyScalar(invert ? halfChordLength : -halfChordLength);

  return center.add(offset);
}

function _drawLimbs(scene: Scene, limbs: Limb[], material: ShaderMaterial): void {
  limbs.forEach(limb => _drawLimb(scene, limb, material));
}

function _drawLimb(scene: Scene, [shoulderPosition, elbowPosition, footPosition]: Limb, material: ShaderMaterial): void {
  const shoulderAngle = getVectorAngle(shoulderPosition, elbowPosition);
  const elbowAngle = getVectorAngle(shoulderPosition, footPosition);
  const footAngle = getVectorAngle(elbowPosition, footPosition);

  const dots = _generateBodyDots([
    { angle: 0, position: new Vector2() },
    { angle: footAngle, position: footPosition },
    { angle: elbowAngle, position: elbowPosition },
    { angle: shoulderAngle, position: shoulderPosition },
  ], [10, 10, 10], 1)

  _drawOutlines(scene, dots, 1, .5, 20);
  _drawBody(scene, dots, material, 1, .5, 20);
}

// FIXME REMOVE LATER - FOR DEBUGGING ONLY
// function _testDots(scene: Scene, vertices: Vector2[]): void {
//   vertices.forEach((vector) => {
//     const dotGeometry = new CircleGeometry(10);
//     const dotMaterial = new MeshBasicMaterial({ color: 0x00FF00 });
//     const dot = new Mesh(dotGeometry, dotMaterial);

//     dot.position.x = vector.x;
//     dot.position.y = vector.y;

//     scene.add(dot);
//   });
// }
