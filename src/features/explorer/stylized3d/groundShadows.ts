import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

/*
 * Ombres douces posées au sol sous les décors et les monuments de la carte d'une région : le terrain
 * est cuit sans eux, ces taches les ancrent dans l'herbe. Une seule pièce instanciée, un dégradé
 * radial calculé par le shader (sans texture), décalé à l'opposé du soleil cuit (lib/bake.py).
 */

export type ShadowSpot = { x: number; z: number; radius: number; height: number };

/** Direction horizontale où tombent les ombres, par mètre de hauteur de l'objet. */
const SUN = new THREE.Vector3(-0.67, 0.656, 0.348).normalize();
const FALL = { x: (-SUN.x / SUN.y) * 0.35, z: (-SUN.z / SUN.y) * 0.35 };

export function groundShadows(spots: readonly ShadowSpot[]): THREE.InstancedMesh {
  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(explorerArt.map.groundShadow) } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 local = vec4(position, 1.0);
        #ifdef USE_INSTANCING
          local = instanceMatrix * local;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * local;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying vec2 vUv;
      void main() {
        float d = length(vUv * 2.0 - 1.0);
        gl_FragColor = vec4(uColor, (1.0 - smoothstep(0.25, 1.0, d)) * 0.42);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, Math.max(spots.length, 1));
  mesh.count = spots.length;
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  spots.forEach((spot, i) => {
    const size = spot.radius * 2.6;
    matrix.compose(
      new THREE.Vector3(spot.x + FALL.x * spot.height, 0.04, spot.z + FALL.z * spot.height),
      quaternion,
      new THREE.Vector3(size * 1.15, 1, size),
    );
    mesh.setMatrixAt(i, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.renderOrder = 1;
  mesh.frustumCulled = false;
  return mesh;
}
