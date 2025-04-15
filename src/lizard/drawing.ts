import { getState } from '@ngrx/signals';
import { BufferGeometry, CircleGeometry, Line, LineBasicMaterial, Material, Mesh, MeshBasicMaterial, Scene, ShapeGeometry, Vector2 } from 'three';
import { constrainAngle, createCatmullRom2DPath, createCatmullRomShape, getPosition, getVectorAngle } from './helpers';
import { EYES_INDEX, Joint, PI } from './model';
import { LizardStore } from './store';

export function drawLizard(lizardStore: InstanceType<typeof LizardStore>): void {
  const {
    joints: previousJoints,
    configuration: { angleConstraint, form, factor },
    scene,
    renderer,
    camera,
  } = getState(lizardStore);
  const linkSize = lizardStore.linkSize();
  const material = lizardStore.material();
  const target = lizardStore.target();

  scene.clear();

  const joints = previousJoints.length
    ? _generateJoints(target, previousJoints, linkSize, angleConstraint)
    : _initializeJoints(form, linkSize);

  if (previousJoints.length && previousJoints[0].position.distanceTo(joints[0].position) === 0) {
    return;
  }

  const dots = _generateBodyDots(joints, form, factor);
  const eyes = _generateEyes(joints, form, factor);

  _drawBody(scene, dots, material);
  _drawOutlines(scene, dots);
  _drawEyes(scene, eyes);

  requestAnimationFrame(() => renderer.render(scene, camera));

  lizardStore.patchJoints(joints);
}

function _initializeJoints(radii: number[], distance: number): Joint[] {
  if (!radii.length) {
    return [];
  }

  const joints: Array<Joint> = [{ position: new Vector2(), angle: 0 }];
  for (let index = 1; index <= radii.length; index++) {
    const precedingJoint = joints[index - 1];
    const position = new Vector2().copy(precedingJoint.position).add(new Vector2(0, distance));
    joints.push({ position, angle: 0 });
  }

  return joints;
}

function _generateJoints(mousePosition: Vector2, previousJoints: Joint[], distance: number, angleConstraint: number): Joint[] {
  if (!previousJoints) {
    return [];
  }

  const direction = getVectorAngle(previousJoints[0].position, mousePosition);
  const constrainedDirection = constrainAngle(previousJoints[0].angle, direction, PI / 32);
  const joints: Array<Joint> = [{ position: mousePosition, angle: constrainedDirection }];

  for (let index = 1; index < previousJoints.length; index++) {
    const previousJoint = previousJoints[index];
    const precedingJoint = joints[index - 1];

    const distanceScalar = index === 1 ? 2 : 1;
    const angle = getVectorAngle(previousJoint.position, precedingJoint.position);
    const constrainedAngle = constrainAngle(precedingJoint.angle, angle, angleConstraint);
    const position = getPosition(precedingJoint.position, constrainedAngle, distanceScalar * distance);

    joints.push({ position, angle: constrainedAngle });
  }

  return joints;
}

function _generateBodyDots(joints: Joint[], radii: number[], factor: number): Vector2[] {
  if (!joints) {
    return [];
  }

  const [_, ...segments] = joints;

  const distances = radii.map(radius => radius * factor);
  const { position: nosePosition, angle: noseAngle } = joints[1];
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

function _drawBody(scene: Scene, dots: Vector2[], material: Material): void {
  if (dots.length < 3) {
    return;
  };

  const shape = createCatmullRomShape(dots);
  const geometry = new ShapeGeometry(shape);

  const mesh = new Mesh(geometry, material);
  scene.add(mesh);
}

function _drawOutlines(scene: Scene, dots: Vector2[]): void {
  const smoothPoints = createCatmullRom2DPath(dots, true);

  for (let i = 0; i < smoothPoints.length - 1; i++) {
    const start = smoothPoints[i];
    const end = smoothPoints[i + 1];

    const geometry = new BufferGeometry().setFromPoints([start, end]);
    const material = new LineBasicMaterial({ color: 0xFFFFFF });
    const line = new Line(geometry, material);

    scene.add(line);
  }
}

function _generateEyes(joints: Joint[], radii: number[], factor: number): [Vector2, Vector2, number] {
  const { position, angle } = joints[EYES_INDEX + 1];
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