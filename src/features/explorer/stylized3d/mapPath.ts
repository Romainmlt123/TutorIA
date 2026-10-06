import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import type { PathSample } from '../logic/mapLayout';

/*
 * Chemin des niveaux sur la carte d'une région (X2b) : des planches posées en travers, comme sur un
 * plateau de jeu, avec l'herbe visible entre elles. Tout est dessiné par le shader (fil du bois,
 * arêtes, longueur un peu inégale), sans texture : il s'affiche pareil sur le web et dans Expo Go.
 * Bois miel jusqu'au pion, bois grisé ensuite.
 */

const PLANKS = explorerArt.map.planks;
const WIDTH = 0.4;
/** Hauteur du ruban, juste au-dessus des bosses du terrain cuit (±0,04 m). */
const HEIGHT = 0.05;
/** Écart d'une planche à la suivante, le long du chemin (mètres). */
const PITCH = 0.15;

export function pathGeometry(path: readonly PathSample[], pawnIndex: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const across: number[] = [];
  const along: number[] = [];
  const done: number[] = [];
  const indices: number[] = [];
  let distance = 0;
  path.forEach((p, i) => {
    const previous = path[Math.max(i - 1, 0)]!;
    const next = path[Math.min(i + 1, path.length - 1)]!;
    if (i > 0) distance += Math.hypot(p.x - previous.x, p.z - previous.z);
    const length = Math.hypot(next.x - previous.x, next.z - previous.z) || 1;
    const nx = (-(next.z - previous.z) / length) * (WIDTH / 2);
    const nz = ((next.x - previous.x) / length) * (WIDTH / 2);
    positions.push(p.x + nx, HEIGHT, p.z + nz, p.x - nx, HEIGHT, p.z - nz);
    across.push(1, -1);
    along.push(distance, distance);
    const reached = p.u <= pawnIndex ? 1 : 0;
    done.push(reached, reached);
    if (i > 0) {
      const a = (i - 1) * 2;
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aAcross', new THREE.Float32BufferAttribute(across, 1));
  geometry.setAttribute('aAlong', new THREE.Float32BufferAttribute(along, 1));
  geometry.setAttribute('aDone', new THREE.Float32BufferAttribute(done, 1));
  geometry.setIndex(indices);
  return geometry;
}

export function pathMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDone: { value: new THREE.Color(PLANKS.done) },
      uTodo: { value: new THREE.Color(PLANKS.todo) },
      uGrain: { value: new THREE.Color(PLANKS.grain) },
      uPitch: { value: PITCH },
    },
    vertexShader: /* glsl */ `
      attribute float aAcross;
      attribute float aAlong;
      attribute float aDone;
      varying float vAcross;
      varying float vAlong;
      varying float vDone;
      void main() {
        vAcross = aAcross;
        vAlong = aAlong;
        vDone = aDone;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uDone;
      uniform vec3 uTodo;
      uniform vec3 uGrain;
      uniform float uPitch;
      varying float vAcross;
      varying float vAlong;
      varying float vDone;

      float hash1(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash1(i), hash1(i + vec2(1.0, 0.0)), u.x),
                   mix(hash1(i + vec2(0.0, 1.0)), hash1(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        float k = vAlong / uPitch;
        float plank = floor(k);
        float f = fract(k);
        float edge = abs(vAcross);
        // Chaque planche a sa longueur ; un jour entre deux planches laisse voir l'herbe.
        float reach = 0.86 + hash1(vec2(plank, 2.0)) * 0.12;
        float alpha = (1.0 - smoothstep(0.78, 0.86, f)) * (1.0 - smoothstep(reach - 0.06, reach, edge));
        vec3 wood = mix(uTodo, uDone, vDone) * (0.86 + 0.26 * hash1(vec2(plank, 9.0)));
        float grain = noise(vec2(vAcross * 3.0 + plank * 7.3, f * 18.0));
        wood = mix(wood, uGrain, smoothstep(0.55, 0.9, grain) * 0.35);
        // Arêtes plus sombres, face un peu bombée.
        wood *= 1.0 - 0.25 * smoothstep(0.55, 0.78, f) - 0.12 * smoothstep(0.12, 0.0, f);
        gl_FragColor = vec4(wood, alpha);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
}
