import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { type GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { ISLET } from '../logic/regions';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- asset Metro (identifiant en natif, URL sur le web)
const ISLET_GLB: string = require('../../../../assets/explorer/models/islet-algo.glb');

/** L'îlot sort des nuages : il monte de 1,6 m (à l'échelle de l'île) pendant le zoom. */
const RISE = 1.6;

function buildIslet(gltf: GLTF): THREE.Group {
  let source: THREE.Mesh | null = null;
  gltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh && !source) source = object;
  });
  if (!source) throw new Error('islet-algo.glb : îlot absent');
  const original: THREE.Mesh = source;
  const baked = (original.material as THREE.MeshStandardMaterial).map;
  // Comme l'île : le modèle en cache reste intact, la scène en crée sa propre copie.
  const mesh = new THREE.Mesh(original.geometry, new THREE.MeshBasicMaterial({ map: baked }));
  mesh.position.copy(original.position);
  mesh.quaternion.copy(original.quaternion);
  mesh.scale.copy(original.scale);
  const group = new THREE.Group();
  group.add(mesh);
  group.scale.setScalar(ISLET.scale);
  group.visible = false;
  return group;
}

/** Une image : l'îlot monte vers sa place (ou redescend) et flotte un peu au repos. */
function tickIslet(
  group: THREE.Group,
  shown: { value: number },
  mix: number,
  delta: number,
  t: number,
  animated: boolean,
) {
  shown.value = animated ? shown.value + (mix - shown.value) * (1 - Math.exp(-delta * 4)) : mix;
  const rise = (1 - shown.value) * RISE;
  const bob = animated ? Math.sin(t * 1.3 + 1) * 0.06 * (1 - mix) : 0;
  group.position.set(ISLET.position[0], ISLET.position[1] - rise + bob, ISLET.position[2]);
  group.visible = shown.value > 0.02;
}

type Props = {
  /** Intensité de la vue des régions, de 0 (carrousel : îlot caché) à 1 (îlot sorti des nuages). */
  mix: number;
  animated: boolean;
};

/** Îlot flottant de l'Algorithmique, à côté de l'île des Maths, visible dans la vue des régions. */
export function IsletAlgo({ mix, animated }: Props) {
  const gltf = useLoader(GLTFLoader, ISLET_GLB);
  const group = useMemo(() => buildIslet(gltf), [gltf]);
  const shown = useRef({ value: 0 });
  useEffect(
    () => () => {
      const mesh = group.children[0] as THREE.Mesh;
      (mesh.material as THREE.Material).dispose();
    },
    [group],
  );
  useFrame(({ clock }, delta) =>
    tickIslet(group, shown.current, mix, delta, clock.elapsedTime, animated),
  );
  return <primitive object={group} />;
}
