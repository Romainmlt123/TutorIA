import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import type { PathSample } from '../logic/mapLayout';

/*
 * Chemin des niveaux sur la carte d'une région (X2b) : un ruban de pavés dessiné entièrement par le
 * shader (pierres irrégulières, joints, bordure plus sombre, bord adouci dans l'herbe), sans texture :
 * il s'affiche pareil sur le web et dans Expo Go. Pierre chaude jusqu'au pion, pierre claire ensuite.
 */

const PAVING = explorerArt.map.paving;
const WIDTH = 0.34;
/** Hauteur du ruban, juste au-dessus des bosses du terrain cuit (±0,04 m). */
const HEIGHT = 0.05;

export function pathGeometry(path: readonly PathSample[], pawnIndex: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const across: number[] = [];
  const done: number[] = [];
  const indices: number[] = [];
  path.forEach((p, i) => {
    const previous = path[Math.max(i - 1, 0)]!;
    const next = path[Math.min(i + 1, path.length - 1)]!;
    const length = Math.hypot(next.x - previous.x, next.z - previous.z) || 1;
    const nx = (-(next.z - previous.z) / length) * (WIDTH / 2);
    const nz = ((next.x - previous.x) / length) * (WIDTH / 2);
    positions.push(p.x + nx, HEIGHT, p.z + nz, p.x - nx, HEIGHT, p.z - nz);
    across.push(1, -1);
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
  geometry.setAttribute('aDone', new THREE.Float32BufferAttribute(done, 1));
  geometry.setIndex(indices);
  return geometry;
}

export function pathMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uDone: { value: new THREE.Color(PAVING.done) },
      uTodo: { value: new THREE.Color(PAVING.todo) },
      uJoint: { value: new THREE.Color(PAVING.joint) },
      uEdge: { value: new THREE.Color(PAVING.edge) },
    },
    vertexShader: /* glsl */ `
      attribute float aAcross;
      attribute float aDone;
      varying vec2 vPlane;
      varying float vAcross;
      varying float vDone;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vPlane = world.xz;
        vAcross = aAcross;
        vDone = aDone;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uDone;
      uniform vec3 uTodo;
      uniform vec3 uJoint;
      uniform vec3 uEdge;
      varying vec2 vPlane;
      varying float vAcross;
      varying float vDone;

      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
      }

      void main() {
        // Pavés : cellules de Voronoï d'environ 11 cm ; le joint suit l'écart entre les deux plus proches.
        vec2 p = vPlane * 9.0;
        vec2 cell = floor(p);
        float f1 = 8.0;
        float f2 = 8.0;
        vec2 id = cell;
        for (int y = -1; y <= 1; y++) {
          for (int x = -1; x <= 1; x++) {
            vec2 c = cell + vec2(float(x), float(y));
            float d = length(c + 0.15 + hash2(c) * 0.7 - p);
            if (d < f1) { f2 = f1; f1 = d; id = c; }
            else if (d < f2) { f2 = d; }
          }
        }
        float shade = 0.84 + hash2(id + 7.0).x * 0.3;
        vec3 stone = mix(uTodo, uDone, vDone) * shade;
        // Pierre un peu plus claire en son centre, comme usée par les pas.
        stone *= 1.0 + 0.08 * smoothstep(0.35, 0.0, f1);
        vec3 color = mix(uJoint, stone, smoothstep(0.03, 0.11, f2 - f1));
        // Bordure : une rangée plus sombre de chaque côté, puis le bord qui se fond dans l'herbe.
        float edge = abs(vAcross);
        color = mix(color, uEdge, smoothstep(0.72, 0.86, edge) * 0.75);
        float alpha = 1.0 - smoothstep(0.9, 1.0, edge);
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
  });
}
