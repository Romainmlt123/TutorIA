import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { seeded } from '../hd2d/pixels';
import { SCENE_TIME } from './time';

/*
 * Nuages vaporeux : des bouffées face à la caméra, dont la forme vient d'un bruit fractal (bords
 * doux et irréguliers), éclairées par le haut et un peu bleutées dessous. Toutes les bouffées de la
 * scène tiennent dans un seul maillage (un seul appel de dessin) : le shader les oriente vers la
 * caméra et les fait dériver.
 */

/** Un nuage : sa position, sa taille, sa graine (forme) et sa vitesse de dérive vers la droite. */
export type CloudSpec = {
  x: number;
  y: number;
  z: number;
  scale: number;
  seed: number;
  drift: number;
};

type Props = {
  clouds: readonly CloudSpec[];
  /** Les nuages qui dérivent reviennent à gauche en sortant de cet intervalle de x. */
  wrap: readonly [number, number];
  animated?: boolean;
};

/** Bouffées d'un nuage : une grosse au centre, quatre plus petites de part et d'autre. */
function puffsOf(cloud: CloudSpec) {
  const rand = seeded(cloud.seed);
  return Array.from({ length: 5 }, (_, i) => {
    const size = (i === 0 ? 2.4 : 1.3 + rand() * 0.7) * cloud.scale;
    const side = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * (0.55 + rand() * 0.5);
    return {
      x: cloud.x + side * cloud.scale,
      y: cloud.y + ((rand() - 0.4) * 0.35 - Math.abs(side) * 0.2) * cloud.scale,
      z: cloud.z + (rand() - 0.5) * 0.4 * cloud.scale,
      size,
      drift: cloud.drift,
      seed: rand() * 50,
    };
  });
}

function cloudGeometry(clouds: readonly CloudSpec[]): THREE.BufferGeometry {
  // Du plus loin au plus proche : les bouffées transparentes se superposent dans le bon ordre.
  const puffs = clouds.flatMap(puffsOf).sort((a, b) => a.z - b.z);
  const corners = [
    [-0.5, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [-0.5, 0.5],
  ] as const;
  const center: number[] = [];
  const corner: number[] = [];
  const shape: number[] = [];
  const indices: number[] = [];
  puffs.forEach((puff, i) => {
    for (const [cx, cy] of corners) {
      center.push(puff.x, puff.y, puff.z);
      corner.push(cx, cy);
      shape.push(puff.size, puff.drift, puff.seed);
    }
    const a = i * 4;
    indices.push(a, a + 1, a + 2, a, a + 2, a + 3);
  });
  const geometry = new THREE.BufferGeometry();
  // three.js exige un attribut `position` : ici le centre de la bouffée, le coin vient de `corner`.
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(center, 3));
  geometry.setAttribute('corner', new THREE.Float32BufferAttribute(corner, 2));
  geometry.setAttribute('shape', new THREE.Float32BufferAttribute(shape, 3));
  geometry.setIndex(indices);
  return geometry;
}

function cloudMaterial(wrap: readonly [number, number]): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: SCENE_TIME,
      uWrap: { value: new THREE.Vector2(wrap[0], wrap[1]) },
      uTop: { value: new THREE.Color(explorerArt.cloud.top) },
      uBottom: { value: new THREE.Color(explorerArt.cloud.bottom) },
    },
    vertexShader: /* glsl */ `
      attribute vec2 corner;
      attribute vec3 shape;
      uniform float uTime;
      uniform vec2 uWrap;
      varying vec2 vUv;
      varying float vSeed;
      void main() {
        vec3 center = position;
        float span = uWrap.y - uWrap.x;
        center.x = uWrap.x + mod(center.x - uWrap.x + uTime * shape.y, span);
        vec4 view = modelViewMatrix * vec4(center, 1.0);
        view.xy += corner * shape.x;
        vUv = corner + 0.5;
        vSeed = shape.z;
        gl_Position = projectionMatrix * view;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uTop;
      uniform vec3 uBottom;
      varying vec2 vUv;
      varying float vSeed;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float sum = 0.0, amplitude = 0.5;
        for (int i = 0; i < 4; i++) { sum += noise(p) * amplitude; p *= 2.03; amplitude *= 0.5; }
        return sum;
      }
      void main() {
        vec2 c = (vUv - 0.5) * vec2(1.0, 1.35);
        float n = fbm(vUv * 3.2 + vSeed + uTime * 0.015);
        float density = smoothstep(0.5, 0.12, length(c) + (n - 0.5) * 0.42);
        if (density < 0.01) discard;
        float lit = smoothstep(0.15, 0.8, vUv.y + (n - 0.5) * 0.5);
        gl_FragColor = vec4(mix(uBottom, uTop, lit), density * 0.94);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: false,
  });
}

/** L'horloge des nuages avance même sans île (pendant son chargement, ou sur une île « Bientôt »). */
function tickClouds(t: number, animated: boolean) {
  if (animated) SCENE_TIME.value = t;
}

export function Clouds({ clouds, wrap, animated = true }: Props) {
  const mesh = useMemo(() => {
    const m = new THREE.Mesh(cloudGeometry(clouds), cloudMaterial(wrap));
    // Les sommets sont placés par le shader : la sphère englobante ne veut rien dire.
    m.frustumCulled = false;
    m.renderOrder = 5;
    return m;
  }, [clouds, wrap]);
  useEffect(
    () => () => {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    },
    [mesh],
  );
  useFrame(({ clock }) => tickClouds(clock.elapsedTime, animated));
  return <primitive object={mesh} />;
}
