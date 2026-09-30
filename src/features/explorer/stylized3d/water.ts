import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { SCENE_TIME } from './time';
import layout from './water.json';

/*
 * Eau de l'île des Maths, animée en temps réel : un bassin en forme de π, la rivière qui en sort
 * et la cascade qui déborde de la falaise. Le tracé vient de water.json, que le script Blender lit
 * aussi pour peindre la rive (herbe humide, vase) : le bord transparent de l'eau tombe pile dessus.
 * Repère : x vers la droite, z vers la caméra, y vers le haut ; le plateau est à y = 0.
 */

const WATER = explorerArt.water3d;
/** Direction du soleil cuit dans le modèle (tools/explorer-3d/lib/bake.py), repère de l'app. */
const SUN = new THREE.Vector3(-0.67, 0.656, 0.348).normalize();
/** Hauteur de l'eau, juste au-dessus des bosses du plateau (±0,015, lib/geo.py). */
const SURFACE = 0.022;
const RIVER_SAMPLES = 12;

export function piOutline(): THREE.Vector2[] {
  const { origin, shape } = layout.pi;
  return shape.map(
    ([x, y]) => new THREE.Vector2(origin.x + x! * origin.sx, origin.z - y! * origin.sz),
  );
}

export function riverCurve(): THREE.CatmullRomCurve3 {
  // Même courbe que le script Blender (geo.catmull_rom) : Catmull-Rom uniforme, tension 0,5.
  const points = layout.river.points.map(([x, z]) => new THREE.Vector3(x, SURFACE, z));
  return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.5);
}

/** Courbe de la cascade : l'eau déborde du bout de la rivière, épouse le bord puis tombe. */
export function fallCurve(): THREE.CatmullRomCurve3 {
  const end = riverCurve().getPoint(1);
  const out = new THREE.Vector3(end.x, 0, end.z).normalize();
  const points = layout.fall.map(([d, y]) => end.clone().setY(y!).addScaledVector(out, d!));
  return new THREE.CatmullRomCurve3(points);
}

/**
 * Ruban le long d'une courbe, avec des coordonnées de texture : u en travers (0 à 1), v le long
 * de la courbe (0 au départ, 1 à l'arrivée). `side` donne la direction du travers en chaque point,
 * `width` la largeur selon v.
 */
function ribbon(
  points: readonly THREE.Vector3[],
  width: (v: number) => number,
  side: (tangent: THREE.Vector3) => THREE.Vector3,
): THREE.BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  points.forEach((p, i) => {
    const next = points[Math.min(i + 1, points.length - 1)]!;
    const previous = points[Math.max(i - 1, 0)]!;
    const v = i / (points.length - 1);
    const across = side(new THREE.Vector3().subVectors(next, previous).normalize()).multiplyScalar(
      width(v) / 2,
    );
    positions.push(p.x + across.x, p.y + across.y, p.z + across.z);
    positions.push(p.x - across.x, p.y - across.y, p.z - across.z);
    uvs.push(0, v, 1, v);
    if (i > 0) {
      const a = (i - 1) * 2;
      // Faces tournées vers le haut (bord gauche, bord droit, point suivant).
      indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Eau calme et réaliste : plus claire et verte près des berges (faible fond), plus profonde au
 * milieu, reflet du ciel selon l'angle de vue, éclats du soleil sur les vaguelettes et fin liseré
 * d'écume au bord. Le bord est calculé au pixel près par une distance signée à l'union du π et de
 * la rivière : pas d'écume à leur jonction.
 */
function flatWaterMaterial(pi: readonly THREE.Vector2[], river: readonly THREE.Vector3[]) {
  return new THREE.ShaderMaterial({
    defines: { PI_COUNT: pi.length, RIVER_COUNT: river.length },
    uniforms: {
      uTime: SCENE_TIME,
      uPi: { value: pi.map((p) => p.clone()) },
      uRiver: { value: river.map((p) => new THREE.Vector2(p.x, p.z)) },
      uHalfWidth: { value: layout.river.width / 2 },
      uSun: { value: SUN },
      uDeep: { value: new THREE.Color(WATER.deep) },
      uShallow: { value: new THREE.Color(WATER.shallow) },
      uSky: { value: new THREE.Color(WATER.sky) },
      uFoam: { value: new THREE.Color(WATER.foam) },
      uGlow: { value: new THREE.Color(WATER.glow) },
    },
    transparent: true,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vWorld = world.xyz;
        gl_Position = projectionMatrix * viewMatrix * world;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uPi[PI_COUNT];
      uniform vec2 uRiver[RIVER_COUNT];
      uniform float uHalfWidth;
      uniform vec3 uSun;
      uniform vec3 uDeep;
      uniform vec3 uShallow;
      uniform vec3 uSky;
      uniform vec3 uFoam;
      uniform vec3 uGlow;
      varying vec3 vWorld;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      // Reflets de lumière qui dansent au fond de l'eau (caustiques, d'après Dave Hoskins). Motif
      // périodique : une période par unité de uv ; le décalage de -250 garde les lignes fines.
      float caustics(vec2 uv, float t) {
        vec2 p = mod(uv * 6.2831853, 6.2831853) - 250.0;
        vec2 i = p;
        float c = 1.0;
        for (int n = 0; n < 4; n++) {
          float s = t * (1.0 - 3.5 / float(n + 1));
          i = p + vec2(cos(s - i.x) + sin(s + i.y), sin(s - i.y) + cos(s + i.x));
          c += 1.0 / length(vec2(p.x / (sin(i.x + s) / 0.005), p.y / (cos(i.y + s) / 0.005)));
        }
        c = 1.17 - pow(c / 4.0, 1.4);
        return clamp(pow(abs(c), 8.0), 0.0, 1.0);
      }

      // Distance signée au polygone du π (négative à l'intérieur), d'après Inigo Quilez.
      void piEdge(vec2 p, vec2 a, vec2 b, inout float d, inout float s) {
        vec2 e = b - a, w = p - a;
        vec2 q = w - e * clamp(dot(w, e) / dot(e, e), 0.0, 1.0);
        d = min(d, dot(q, q));
        bvec3 c = bvec3(p.y >= a.y, p.y < b.y, e.x * w.y > e.y * w.x);
        if (all(c) || all(not(c))) s = -s;
      }

      float piDistance(vec2 p) {
        float d = dot(p - uPi[0], p - uPi[0]);
        float s = 1.0;
        for (int i = 0; i < PI_COUNT - 1; i++) piEdge(p, uPi[i], uPi[i + 1], d, s);
        piEdge(p, uPi[PI_COUNT - 1], uPi[0], d, s);
        return s * sqrt(d);
      }

      // Repère de la rivière : distance à son axe, abscisse le long du courant (0 à la source,
      // 1 à la cascade) et direction du courant.
      vec4 riverFrame(vec2 p) {
        float best = 1e3;
        float along = 0.0;
        vec2 flow = vec2(0.0, 1.0);
        for (int i = 0; i < RIVER_COUNT - 1; i++) {
          vec2 a = uRiver[i], b = uRiver[i + 1];
          vec2 pa = p - a, ba = b - a;
          float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
          float d = length(pa - ba * h);
          if (d < best) {
            best = d;
            along = (float(i) + h) / float(RIVER_COUNT - 1);
            flow = normalize(ba);
          }
        }
        return vec4(best, along, flow);
      }

      // Pente des vaguelettes : trois trains d'ondes qui avancent dans le sens du courant.
      vec2 ripples(vec2 p, float t) {
        vec2 slope = vec2(0.0);
        vec2 d1 = normalize(vec2(0.45, 0.9)), d2 = normalize(vec2(-0.8, 0.6)), d3 = normalize(vec2(0.95, -0.3));
        slope += d1 * cos(dot(p, d1) * 23.0 - t * 2.6) * 0.5;
        slope += d2 * cos(dot(p, d2) * 37.0 - t * 3.4) * 0.3;
        slope += d3 * cos(dot(p, d3) * 53.0 - t * 4.1) * 0.2;
        return slope;
      }

      void main() {
        vec2 plane = vWorld.xz;
        vec4 river = riverFrame(plane);
        float riverInside = uHalfWidth - river.x;
        float inside = max(-piDistance(plane), riverInside);
        vec2 slope = ripples(plane, uTime);
        vec3 normal = normalize(vec3(-slope.x * 0.09, 1.0, -slope.y * 0.09));
        vec3 view = normalize(cameraPosition - vWorld);
        // Couleur de l'eau selon sa profondeur (le fond remonte vers les berges), puis reflet du ciel.
        vec3 color = mix(uShallow, uDeep, smoothstep(0.0, 0.16, inside));
        float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 4.0);
        color = mix(color, uSky, 0.03 + fresnel * 0.3);
        // Reflets de lumière au fond, plus vifs là où l'eau est peu profonde.
        float light = caustics(plane * 0.55, uTime * 0.5);
        color += uGlow * light * mix(0.24, 0.12, smoothstep(0.0, 0.16, inside));
        // Courant : traînées d'écume étirées le long de la rivière, qui descendent vers la cascade.
        float across = river.x / uHalfWidth;
        float streaks = noise(vec2(river.y * 26.0 - uTime * 1.7, across * 3.5 + river.z * 2.0));
        streaks *= noise(vec2(river.y * 9.0 - uTime * 1.1, across * 1.6 + 4.0));
        float current = smoothstep(0.02, 0.1, riverInside) * smoothstep(0.02, 0.12, river.y);
        color = mix(color, uFoam, smoothstep(0.32, 0.6, streaks) * current * 0.55);
        // Éclats du soleil : reflet très serré, qui scintille sur les crêtes des vaguelettes.
        float sparkle = pow(max(dot(reflect(-uSun, normal), view), 0.0), 180.0);
        color += vec3(1.0, 0.97, 0.9) * sparkle * 1.4;
        // Bord transparent : l'eau se fond dans la rive peinte (herbe humide, vase).
        float wobble = 0.006 * sin(uTime * 1.8 + plane.x * 13.0 + plane.y * 9.0);
        gl_FragColor = vec4(color, smoothstep(0.0, 0.07, inside + wobble));
        #include <colorspace_fragment>
      }`,
  });
}

/** Cascade : rideau d'eau translucide, filets blancs qui descendent, eau qui se change en bruine. */
function fallMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: SCENE_TIME,
      uMid: { value: new THREE.Color(WATER.shallow) },
      uLight: { value: new THREE.Color(WATER.sky) },
      uFoam: { value: new THREE.Color(WATER.foam) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uMid;
      uniform vec3 uLight;
      uniform vec3 uFoam;
      varying vec2 vUv;
      float hash(float n) { return fract(sin(n) * 43758.5453); }
      void main() {
        // Filets fins et nombreux, à des vitesses différentes : l'eau accélère en tombant.
        float lane = floor(vUv.x * 26.0);
        float speed = 1.1 + hash(lane) * 0.9;
        float fall = pow(vUv.y, 0.8) * 4.0;
        float streak = fract(fall - uTime * speed + hash(lane + 3.0));
        float thread = smoothstep(0.35, 0.0, abs(fract(vUv.x * 26.0) - 0.5)) * 0.5 + 0.5;
        vec3 color = mix(uMid, uLight, 0.45 + smoothstep(0.6, 0.95, streak) * 0.4 * thread);
        color = mix(color, uFoam, smoothstep(0.06, 0.0, vUv.y) * 0.5 + smoothstep(0.55, 1.0, vUv.y) * 0.5);
        float edges = smoothstep(0.0, 0.18, vUv.x) * smoothstep(1.0, 0.82, vUv.x);
        float alpha = edges * (1.0 - smoothstep(0.3, 0.95, vUv.y)) * (0.55 + 0.35 * thread);
        gl_FragColor = vec4(color, alpha);
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function waterMeshes(): THREE.Group {
  const group = new THREE.Group();
  const pi = piOutline();
  const river = riverCurve();
  const flat = flatWaterMaterial(pi, river.getPoints(RIVER_SAMPLES - 1));

  // Le π et la rivière se chevauchent au pied droit du π : un seul matériau, pas de couture visible.
  const piGeometry = new THREE.ShapeGeometry(
    new THREE.Shape(pi.map((p) => new THREE.Vector2(p.x, -p.y))),
  );
  piGeometry.rotateX(-Math.PI / 2);
  const piMesh = new THREE.Mesh(piGeometry, flat);
  piMesh.position.y = SURFACE;
  piMesh.renderOrder = 2;
  const riverMesh = new THREE.Mesh(
    ribbon(
      river.getPoints(40),
      () => layout.river.width + 0.02,
      (t) => new THREE.Vector3(-t.z, 0, t.x),
    ),
    flat,
  );
  // Un peu plus haute que le π et dessinée avant lui : là où ils se chevauchent, le π est caché
  // par le test de profondeur, et l'eau transparente n'est pas comptée deux fois.
  riverMesh.position.y = 0.004;
  riverMesh.renderOrder = 1;

  const fall = fallCurve();
  const end = river.getPoint(1);
  const across = new THREE.Vector3(end.x, 0, end.z).normalize().cross(UP).normalize();
  const fallMesh = new THREE.Mesh(
    // La cascade s'évase en tombant, comme un rideau d'eau.
    ribbon(
      fall.getPoints(40),
      (v) => layout.river.width * (1 + v * 1.1),
      () => across.clone(),
    ),
    fallMaterial(),
  );
  fallMesh.renderOrder = 3;
  group.add(piMesh, riverMesh, fallMesh);
  return group;
}
