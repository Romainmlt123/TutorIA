import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import type { MapNode, RegionMap } from '../logic/regionMap';

/*
 * Bande de terre d'une région (X2b), en maquette grise : la terre flottante qui suit le chemin, le
 * chemin lui-même (orange jusqu'au niveau du pion, gris ensuite), un point par niveau (vert pour
 * une leçon, bleu pour des exercices, rouge et plus grand pour une évaluation, gris s'il est
 * fermé), le pion et un village générique à la place du monument de chaque ville. Repère : x le
 * long de la bande, z vers la caméra, y en haut, en mètres ; le chemin est à y = 0.
 */

const ART = explorerArt.map;
/** Demi-largeur de la terre autour du chemin, et son épaisseur. */
const HALF_WIDTH = 0.95;
const DEPTH = 0.5;
const PATH_WIDTH = 0.24;
const CAP_STEPS = 8;

/** Chemin lissé qui passe par tous les points, prolongé d'un pas avant et après. */
function centerline(nodes: readonly MapNode[]): THREE.CatmullRomCurve3 {
  const first = nodes[0]!;
  const last = nodes[nodes.length - 1]!;
  const points = [
    new THREE.Vector3(first.x - 0.5, 0, first.z),
    ...nodes.map((n) => new THREE.Vector3(n.x, 0, n.z)),
    new THREE.Vector3(last.x + 0.5, 0, last.z),
  ];
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

/** Terre : le chemin épaissi de chaque côté, aux bouts arrondis, extrudée vers le bas. */
function landGeometry(curve: THREE.CatmullRomCurve3): THREE.BufferGeometry {
  const samples = curve.getSpacedPoints(Math.ceil(curve.getLength() * 6));
  const shape = new THREE.Shape();
  // Dans le plan de la forme, y = -z : rotateX(-π/2) la couche ensuite à plat.
  const edge = (p: THREE.Vector3, side: 1 | -1) => [p.x, -(p.z + side * HALF_WIDTH)] as const;
  const [sx, sy] = edge(samples[0]!, -1);
  shape.moveTo(sx, sy);
  for (const p of samples) shape.lineTo(...edge(p, -1));
  const end = samples[samples.length - 1]!;
  for (let k = 1; k <= CAP_STEPS; k++) {
    const a = -Math.PI / 2 + (k / CAP_STEPS) * Math.PI;
    shape.lineTo(end.x + Math.cos(a) * HALF_WIDTH, -(end.z + Math.sin(a) * HALF_WIDTH));
  }
  for (const p of [...samples].reverse()) shape.lineTo(...edge(p, 1));
  const start = samples[0]!;
  for (let k = 1; k < CAP_STEPS; k++) {
    const a = Math.PI / 2 + (k / CAP_STEPS) * Math.PI;
    shape.lineTo(start.x + Math.cos(a) * HALF_WIDTH, -(start.z + Math.sin(a) * HALF_WIDTH));
  }
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: DEPTH, bevelEnabled: false });
  geometry.rotateX(-Math.PI / 2);
  geometry.translate(0, -DEPTH, 0);
  return geometry;
}

/** Ruban du chemin, coloré en orange jusqu'au pion et en gris après (couleurs par sommet). */
function pathGeometry(curve: THREE.CatmullRomCurve3, pawnX: number): THREE.BufferGeometry {
  const samples = curve.getSpacedPoints(Math.ceil(curve.getLength() * 12));
  const done = new THREE.Color(ART.pathDone);
  const todo = new THREE.Color(ART.pathTodo);
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  samples.forEach((p, i) => {
    const previous = samples[Math.max(i - 1, 0)]!;
    const next = samples[Math.min(i + 1, samples.length - 1)]!;
    const tangent = new THREE.Vector3().subVectors(next, previous).normalize();
    const across = new THREE.Vector3(-tangent.z, 0, tangent.x).multiplyScalar(PATH_WIDTH / 2);
    const color = p.x <= pawnX ? done : todo;
    positions.push(p.x + across.x, 0.03, p.z + across.z, p.x - across.x, 0.03, p.z - across.z);
    colors.push(color.r, color.g, color.b, color.r, color.g, color.b);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}

function nodeColor(node: MapNode): THREE.Color {
  return new THREE.Color(node.state === 'locked' ? ART.node.locked : ART.node[node.type]);
}

/** Un disque par niveau (instancié), sur un disque plus large et sombre qui fait le contour. */
function nodeMeshes(nodes: readonly MapNode[]): THREE.InstancedMesh[] {
  const geometry = new THREE.CylinderGeometry(1, 1, 0.1, 28);
  const face = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial(), nodes.length);
  const rim = new THREE.InstancedMesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: ART.nodeRim }),
    nodes.length,
  );
  const matrix = new THREE.Matrix4();
  nodes.forEach((node, i) => {
    matrix.compose(
      new THREE.Vector3(node.x, 0.07, node.z),
      new THREE.Quaternion(),
      new THREE.Vector3(node.radius, 1, node.radius),
    );
    face.setMatrixAt(i, matrix);
    face.setColorAt(i, nodeColor(node));
    matrix.compose(
      new THREE.Vector3(node.x, 0.04, node.z),
      new THREE.Quaternion(),
      new THREE.Vector3(node.radius + 0.05, 1, node.radius + 0.05),
    );
    rim.setMatrixAt(i, matrix);
  });
  face.instanceMatrix.needsUpdate = true;
  if (face.instanceColor) face.instanceColor.needsUpdate = true;
  rim.instanceMatrix.needsUpdate = true;
  return [rim, face];
}

/** Village générique, à la place du monument de la ville : trois maisons à toit pointu. */
function village(x: number, z: number, roof: string): THREE.Group {
  const group = new THREE.Group();
  const wall = new THREE.MeshBasicMaterial({ color: ART.village.wall });
  const roofMaterial = new THREE.MeshBasicMaterial({ color: roof });
  const houses: [number, number, number, number][] = [
    [-0.32, 0.12, 0.42, 0.5],
    [0.08, -0.05, 0.5, 0.64],
    [0.42, 0.14, 0.36, 0.42],
  ];
  for (const [dx, dz, width, height] of houses) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, width), wall);
    body.position.set(dx, height / 2, dz);
    const top = new THREE.Mesh(
      new THREE.ConeGeometry(width * 0.78, height * 0.55, 4),
      roofMaterial,
    );
    top.position.set(dx, height + height * 0.27, dz);
    top.rotation.y = Math.PI / 4;
    group.add(body, top);
  }
  group.position.set(x, 0, z);
  return group;
}

function pawn(): THREE.Group {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({ color: ART.pawn });
  const body = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 20), material);
  body.position.y = 0.17;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 14), material);
  head.position.y = 0.42;
  group.add(body, head);
  return group;
}

type Built = {
  root: THREE.Group;
  pawn: THREE.Group;
  pawnBase: THREE.Vector3;
  geometries: THREE.BufferGeometry[];
  materials: THREE.Material[];
};

function buildStrip(map: RegionMap, regionColor: string): Built {
  const root = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const track = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const curve = centerline(map.nodes);
  const pawnNode = map.nodes[map.pawnIndex]!;
  const land = [
    new THREE.MeshBasicMaterial({ color: ART.land }),
    new THREE.MeshBasicMaterial({ color: ART.cliff }),
  ];
  materials.push(...land);
  root.add(new THREE.Mesh(track(landGeometry(curve)), land));
  const pathMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
  materials.push(pathMaterial);
  root.add(new THREE.Mesh(track(pathGeometry(curve, pawnNode.x)), pathMaterial));
  for (const mesh of nodeMeshes(map.nodes)) {
    geometries.push(mesh.geometry);
    materials.push(mesh.material as THREE.Material);
    root.add(mesh);
  }
  for (const city of map.cities) root.add(village(city.monumentX, -0.72, regionColor));
  const marker = pawn();
  const base = new THREE.Vector3(pawnNode.x, 0.12, pawnNode.z);
  marker.position.copy(base);
  root.add(marker);
  root.traverse((object) => {
    if (object instanceof THREE.Mesh && !geometries.includes(object.geometry)) {
      geometries.push(object.geometry);
      if (!materials.includes(object.material as THREE.Material)) {
        materials.push(object.material as THREE.Material);
      }
    }
  });
  return { root, pawn: marker, pawnBase: base, geometries, materials };
}

/** Le pion saute doucement sur son point (figé si les animations sont réduites). */
function tickPawn(built: Built, t: number, animated: boolean) {
  const hop = animated ? Math.abs(Math.sin(t * 2.4)) * 0.12 : 0;
  built.pawn.position.set(built.pawnBase.x, built.pawnBase.y + hop, built.pawnBase.z);
}

type Props = { map: RegionMap; regionColor: string; animated: boolean };

export function RegionStrip({ map, regionColor, animated }: Props) {
  const built = useMemo(() => buildStrip(map, regionColor), [map, regionColor]);
  useEffect(
    () => () => {
      built.geometries.forEach((g) => g.dispose());
      built.materials.forEach((m) => m.dispose());
    },
    [built],
  );
  useFrame(({ clock }) => tickPawn(built, clock.elapsedTime, animated));
  return <primitive object={built.root} />;
}
