import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import type { MapNode } from '../logic/regionMap';
import { SCENE_TIME } from './time';

/*
 * Points de niveau de la carte d'une région (X2b), façon cases de jeu : un disque à la couleur du
 * type (leçon, exercices, évaluation), cerclé d'un rebord doré en relief, et un halo jaune au sol
 * autour des niveaux ouverts ; celui du pion pulse doucement. Un niveau fermé est gris, sans halo.
 * Deux pièces instanciées (points et halos), éclairées par le shader comme le soleil cuit.
 */

const ART = explorerArt.map;
/** Hauteur du disque et position de son centre : le dessus est à 0,09 m, sous les pieds de l'avatar. */
const HEIGHT = 0.07;
const Y = 0.055;
/** Part du rayon occupée par le disque coloré ; le reste est le rebord doré. */
const INNER = 0.78;
const SUN = new THREE.Vector3(-0.67, 0.656, 0.348).normalize();

const color = (hex: string) => ({ value: new THREE.Color(hex) });

function nodeMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uInner: { value: INNER },
      uHalf: { value: HEIGHT / 2 },
      uSun: { value: SUN },
      uRimLight: color(ART.nodeRim.light),
      uRimFace: color(ART.nodeRim.face),
      uRimDark: color(ART.nodeRim.dark),
      uLockLight: color(ART.nodeRimLocked.light),
      uLockFace: color(ART.nodeRimLocked.face),
      uLockDark: color(ART.nodeRimLocked.dark),
    },
    vertexShader: /* glsl */ `
      attribute vec3 aTint;
      attribute float aLocked;
      varying vec3 vTint;
      varying float vLocked;
      varying vec3 vLocal;
      varying vec3 vNormal;
      void main() {
        vTint = aTint;
        vLocked = aLocked;
        vLocal = position;
        vNormal = normal;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uInner;
      uniform float uHalf;
      uniform vec3 uSun;
      uniform vec3 uRimLight; uniform vec3 uRimFace; uniform vec3 uRimDark;
      uniform vec3 uLockLight; uniform vec3 uLockFace; uniform vec3 uLockDark;
      varying vec3 vTint;
      varying float vLocked;
      varying vec3 vLocal;
      varying vec3 vNormal;
      void main() {
        float r = length(vLocal.xz);
        vec3 light = mix(uRimLight, uLockLight, vLocked);
        vec3 face = mix(uRimFace, uLockFace, vLocked);
        vec3 dark = mix(uRimDark, uLockDark, vLocked);
        vec3 color;
        if (vNormal.y > 0.5) {
          if (r < uInner) {
            // Disque coloré, un peu plus clair au centre, et son arête intérieure dans l'ombre.
            color = vTint * (1.08 - 0.16 * r / uInner);
            color *= 1.0 - 0.3 * smoothstep(uInner - 0.08, uInner, r);
          } else {
            // Rebord doré bombé : brillant côté soleil, plus sombre de l'autre.
            float t = (r - uInner) / (1.0 - uInner);
            float bulge = sin(t * 3.14159);
            vec2 toward = normalize(vLocal.xz + 1e-5);
            float facing = dot(toward, normalize(vec2(uSun.x, uSun.z))) * 0.5 + 0.5;
            color = mix(dark, face, bulge);
            color = mix(color, light, bulge * bulge * facing);
          }
        } else {
          // Tranche du rebord, plus sombre vers le bas.
          float h = (vLocal.y + uHalf) / (2.0 * uHalf);
          color = mix(dark * 0.8, face, h);
        }
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

function glowMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { uGlow: color(ART.nodeRim.glow), uTime: SCENE_TIME },
    vertexShader: /* glsl */ `
      attribute float aPulse;
      varying vec2 vUv;
      varying float vPulse;
      void main() {
        vUv = uv;
        vPulse = aPulse;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * instanceMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uGlow;
      uniform float uTime;
      varying vec2 vUv;
      varying float vPulse;
      void main() {
        // Anneau de lumière autour du point (rayon 1 = bord du point) qui s'éteint vers l'extérieur.
        float d = length(vUv * 2.0 - 1.0) * 1.7;
        float ring = smoothstep(0.85, 1.0, d) * (1.0 - smoothstep(1.0, 1.7, d));
        float beat = 1.0 + vPulse * 0.6 * (0.5 + 0.5 * sin(uTime * 3.2));
        gl_FragColor = vec4(uGlow, ring * 0.55 * beat);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/** Les points de niveau et leurs halos (pour les niveaux ouverts), `pawnIndex` désignant celui qui pulse. */
export function levelNodes(nodes: readonly MapNode[], pawnIndex: number): THREE.InstancedMesh[] {
  const geometry = new THREE.CylinderGeometry(1, 1, HEIGHT, 40, 1);
  const tint: number[] = [];
  const locked: number[] = [];
  for (const node of nodes) {
    const c = new THREE.Color(node.state === 'locked' ? ART.node.locked : ART.node[node.type]);
    tint.push(c.r, c.g, c.b);
    locked.push(node.state === 'locked' ? 1 : 0);
  }
  geometry.setAttribute('aTint', new THREE.InstancedBufferAttribute(new Float32Array(tint), 3));
  geometry.setAttribute('aLocked', new THREE.InstancedBufferAttribute(new Float32Array(locked), 1));
  const points = new THREE.InstancedMesh(geometry, nodeMaterial(), nodes.length);

  const open = nodes.map((node, i) => ({ node, i })).filter(({ node }) => node.state !== 'locked');
  const plane = new THREE.PlaneGeometry(1, 1);
  plane.rotateX(-Math.PI / 2);
  plane.setAttribute(
    'aPulse',
    new THREE.InstancedBufferAttribute(
      new Float32Array(open.map(({ i }) => (i === pawnIndex ? 1 : 0))),
      1,
    ),
  );
  const glows = new THREE.InstancedMesh(plane, glowMaterial(), Math.max(open.length, 1));
  glows.count = open.length;

  const matrix = new THREE.Matrix4();
  const still = new THREE.Quaternion();
  nodes.forEach((node, i) => {
    matrix.compose(
      new THREE.Vector3(node.x, Y, node.z),
      still,
      new THREE.Vector3(node.radius, 1, node.radius),
    );
    points.setMatrixAt(i, matrix);
  });
  open.forEach(({ node }, k) => {
    const size = node.radius * 2 * 1.7;
    matrix.compose(
      new THREE.Vector3(node.x, 0.035, node.z),
      still,
      new THREE.Vector3(size, 1, size),
    );
    glows.setMatrixAt(k, matrix);
  });
  points.instanceMatrix.needsUpdate = true;
  glows.instanceMatrix.needsUpdate = true;
  points.frustumCulled = false;
  glows.frustumCulled = false;
  glows.renderOrder = 1;
  return [glows, points];
}
