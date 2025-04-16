import { getState } from '@ngrx/signals';
import { BufferGeometry, CircleGeometry, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, Scene, ShapeGeometry, Vector2 } from 'three';
import { constrainAngle, createCatmullRom2DPath, createCatmullRomShape, getPosition, getVectorAngle } from './helpers';
import { EYES_INDEX, Limb, PI, Vertabra } from './model';
import { LizardStore } from './store';

export function drawLizard(lizardStore: InstanceType<typeof LizardStore>): void {
  const {
    spine: previousVertabrae,
    limbs: previousLimbs,
    configuration: { angleConstraint, form, factor, limbAttachment: limbAttachments },
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

  _drawBody(scene, dots, material);
  _drawOutlines(scene, dots);
  _drawEyes(scene, eyes);

  const limbs = _generateLimbs(spine, form, factor, limbAttachments, previousLimbs);
  limbs.forEach(limb => {
    _drawOutlines(scene, limb, .5, 20);
    _drawBody(scene, limb, material, .5, 20);
  });
  // _testDots(scene, limbs.flat());

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

function _drawBody(scene: Scene, dots: Vector2[], material: Material, tension = .5, divisions = 100): void {
  if (dots.length < 3) {
    return;
  };

  const shape = createCatmullRomShape(dots, tension, divisions);
  const geometry = new ShapeGeometry(shape);

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
}

function _drawOutlines(scene: Scene, dots: Vector2[], tension = .5, divisions = 100): void {
  const smoothPoints = createCatmullRom2DPath(dots, true, tension, divisions);

  for (let i = 0; i < smoothPoints.length - 1; i++) {
    const start = smoothPoints[i];
    const end = smoothPoints[i + 1];

    const geometry = new BufferGeometry().setFromPoints([start, end]);
    const material = new LineBasicMaterial({ color: 0xFFFFFF });
    const line = new Line(geometry, material);

    scene.add(line);
  }
}

function _generateEyes(spine: Vertabra[], radii: number[], factor: number): [Vector2, Vector2, number] {
  const { position, angle } = spine[EYES_INDEX + 1];
  const distance = .5 * factor * radii[EYES_INDEX];
  const radius = .2 * factor * radii[EYES_INDEX];
  const left = getPosition(position, angle - PI * .5, distance);
  const right = getPosition(position, angle + PI * .5, distance);

  return [left, right, radius];
}

function _drawEyes(scene: Scene, eyes: [Vector2, Vector2, number]): void {
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

function _generateLimbs(vertabrae: Vertabra[], form: number[], factor: number, limbAttachments: [number, number], previousLimbs: Limb[]): Limb[] {
  const sockets = Array.from(limbAttachments).map(limbAttachment => {
    const { position, angle } = vertabrae[limbAttachment + 1];

    const length = form[limbAttachment] * factor;
    const left = getPosition(position, angle - PI * .5, length);
    const right = getPosition(position, angle + PI * .5, length);

    return [
      [angle - PI * .5, length, left] as const, // left
      [angle + PI * .5, length, right] as const, // right
    ];
  }).flat();

  return sockets.map((socket, index) => _generateLimb(...socket, index, previousLimbs[index]?.at(-1)));
}

function _generateLimb(angle: number, length: number, shoulder: Vector2, index: number, previousFoot?: Vector2): Limb {
  const adjustAngle = index % 2 ? 1 : -1;
  const foot = !previousFoot || previousFoot.distanceTo(shoulder) >= 2 * length ? getPosition(shoulder, angle + PI * .25 * adjustAngle, length) : previousFoot;
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

// FIXME REMOVE - ONLY FOR DEBUGGING
function _testDots(scene: Scene, vertices: Vector2[]): void {
  vertices.forEach((vector) => {
    const dotGeometry = new CircleGeometry(10);
    const dotMaterial = new MeshBasicMaterial({ color: 0x00FF00 });
    const dot = new Mesh(dotGeometry, dotMaterial);

    dot.position.x = vector.x;
    dot.position.y = vector.y;

    scene.add(dot);
  });
}
