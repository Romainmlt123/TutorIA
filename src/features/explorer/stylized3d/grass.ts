import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { SCENE_TIME } from './time';

/*
 * Brins d'herbe (modèle Blender, maillage « brins ») : sombres au pied, plus clairs et un peu secs
 * à la pointe, courbés par un vent doux qui passe en vagues sur l'île. La coordonnée v de la
 * texture donne la hauteur le long du brin : seul le haut bouge.
 */
const BLADES = explorerArt.grassBlades;

export function grassMaterial(): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: SCENE_TIME,
      uBase: { value: new THREE.Color(BLADES.base) },
      uTip: { value: new THREE.Color(BLADES.tip) },
      uDry: { value: new THREE.Color(BLADES.dry) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      varying float vHeight;
      varying float vVariety;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        float bend = uv.y * uv.y;
        // Rafale lente qui traverse l'île, et frémissement propre à chaque touffe.
        float gust = sin(uTime * 1.3 + world.x * 0.9 + world.z * 0.6) * 0.5 + 0.5;
        float flutter = sin(uTime * 4.2 + world.x * 17.0 + world.z * 13.0);
        world.xz += vec2(0.8, 0.35) * bend * (gust * 0.035 + flutter * 0.006);
        vHeight = uv.y;
        vVariety = fract(sin(dot(floor(world.xz * 12.0), vec2(12.9898, 78.233))) * 43758.5453);
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uBase;
      uniform vec3 uTip;
      uniform vec3 uDry;
      varying float vHeight;
      varying float vVariety;
      void main() {
        vec3 tip = mix(uTip, uDry, step(0.7, vVariety));
        vec3 color = mix(uBase, tip, pow(vHeight, 0.8)) * (0.9 + vVariety * 0.2);
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.DoubleSide,
  });
}
