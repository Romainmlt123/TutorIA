import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as THREE from 'three';

import { isContextDead } from '@/lib/three/contextProbe';
import { presentOnce } from '@/lib/three/presentOnce';
import { explorerArt, type PostLook } from '@/theme/explorerArt';

import { gradeChunk, gradeUniforms, setGrade } from './grade';
import { passSizes, type PassSize } from './postSize';

const NATIVE = Platform.OS !== 'web';

/*
 * Chaîne d'effets HD-2D, écrite à la main pour rester compatible avec expo-gl (WebGL, textures
 * 8 bits) : scène rendue dans une texture à 2 pixels par dp au plus, halo lumineux (bloom) à
 * demi-résolution, flou de maquette en haut et en bas de l'écran (tilt-shift, facultatif), puis
 * une passe finale à la taille de l'écran : anticrénelage (FXAA) de la scène, composition sur un
 * ciel en dégradé, vignettage et étalonnage (ombres froides, lumières chaudes).
 */

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/** Flou gaussien à 9 échantillons dans une direction ; `uTilt` module son rayon selon la hauteur. */
const blurFragment = /* glsl */ `
  uniform sampler2D uInput;
  uniform vec2 uDirection;
  uniform float uTilt;
  uniform float uFocus;
  uniform float uBand;
  varying vec2 vUv;
  void main() {
    float radius = 1.0;
    if (uTilt > 0.5) radius = smoothstep(uBand * 0.55, uBand * 1.25, abs(vUv.y - uFocus)) * 1.25;
    vec2 step = uDirection * radius;
    vec4 sum = texture2D(uInput, vUv) * 0.227;
    sum += texture2D(uInput, vUv + step * 1.38) * 0.316;
    sum += texture2D(uInput, vUv - step * 1.38) * 0.316;
    sum += texture2D(uInput, vUv + step * 3.23) * 0.07;
    sum += texture2D(uInput, vUv - step * 3.23) * 0.07;
    gl_FragColor = sum;
  }`;

/** Garde les zones lumineuses (eau, cristaux, reflets) pour le halo. */
const brightFragment = /* glsl */ `
  uniform sampler2D uInput;
  uniform vec2 uThreshold;
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uInput, vUv);
    float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(c.rgb * smoothstep(uThreshold.x, uThreshold.y, l) * c.a, 1.0);
  }`;

/**
 * Anticrénelage FXAA, d'après le livre blanc de FXAA 3.11 (Timothy Lottes, NVIDIA), dans la
 * version de three.js (`FXAAShader` : Jasper Flick, Dave Hoskins ; licence MIT). Il lit la texture
 * de la scène (texels de taille `uTexel`), couleurs prémultipliées par l'alpha : un pixel mélangé
 * au bord de l'île garde un alpha juste pour la composition sur le ciel. Réglage prudent, pour ne
 * pas adoucir la texture cuite : seuils de contraste par défaut de FXAA 3.11 (un bord doit se voir
 * nettement), et mélange des détails plus fins qu'un pixel presque éteint (0,25 au lieu de 0,75) :
 * les bords sont aussi lisses, la texture reste plus piquée.
 */
const fxaaChunk = /* glsl */ `
  #define FXAA_CONTRAST 0.0833
  #define FXAA_RELATIVE 0.166
  #define FXAA_SUBPIXEL 0.25
  #define FXAA_STEPS 6
  const vec3 LUMA = vec3(0.299, 0.587, 0.114);

  // La texture de la scène est linéaire : la racine carrée rapproche la luminance de celle de l'œil.
  float fxaaLuma(vec2 uv) { return sqrt(dot(texture2D(uScene, uv).rgb, LUMA)); }

  vec4 fxaa(vec2 uv) {
    vec4 center = texture2D(uScene, uv);
    float m = sqrt(dot(center.rgb, LUMA));
    float n = fxaaLuma(uv + vec2(0.0, uTexel.y));
    float e = fxaaLuma(uv + vec2(uTexel.x, 0.0));
    float s = fxaaLuma(uv - vec2(0.0, uTexel.y));
    float w = fxaaLuma(uv - vec2(uTexel.x, 0.0));
    float highest = max(max(max(n, e), max(s, w)), m);
    float lowest = min(min(min(n, e), min(s, w)), m);
    float contrast = highest - lowest;
    if (contrast < max(FXAA_CONTRAST, FXAA_RELATIVE * highest)) return center;
    float ne = fxaaLuma(uv + uTexel);
    float nw = fxaaLuma(uv + vec2(-uTexel.x, uTexel.y));
    float se = fxaaLuma(uv + vec2(uTexel.x, -uTexel.y));
    float sw = fxaaLuma(uv - uTexel);

    // Détail plus fin qu'un pixel : adouci à proportion de son écart avec ses voisins.
    float average = (2.0 * (n + e + s + w) + ne + nw + se + sw) / 12.0;
    float subpixel = smoothstep(0.0, 1.0, clamp(abs(average - m) / contrast, 0.0, 1.0));
    float pixelBlend = subpixel * subpixel * FXAA_SUBPIXEL;

    // Bord horizontal (le mélange se fait en y) ou vertical (en x), et de quel côté.
    float horizontal =
      abs(n + s - 2.0 * m) * 2.0 + abs(ne + se - 2.0 * e) + abs(nw + sw - 2.0 * w);
    float vertical =
      abs(e + w - 2.0 * m) * 2.0 + abs(ne + nw - 2.0 * n) + abs(se + sw - 2.0 * s);
    bool isHorizontal = horizontal >= vertical;
    float positive = isHorizontal ? n : e;
    float negative = isHorizontal ? s : w;
    float pixelStep = isHorizontal ? uTexel.y : uTexel.x;
    float opposite = positive;
    float gradient = abs(positive - m);
    if (gradient < abs(negative - m)) {
      pixelStep = -pixelStep;
      opposite = negative;
      gradient = abs(negative - m);
    }

    // Longueur du bord : on le suit des deux côtés jusqu'à ce que son contraste change.
    vec2 edgeUv = uv;
    vec2 along = isHorizontal ? vec2(uTexel.x, 0.0) : vec2(0.0, uTexel.y);
    if (isHorizontal) edgeUv.y += pixelStep * 0.5;
    else edgeUv.x += pixelStep * 0.5;
    float edgeLuma = (m + opposite) * 0.5;
    float threshold = gradient * 0.25;
    vec2 puv = edgeUv + along;
    vec2 nuv = edgeUv - along;
    float pDelta = fxaaLuma(puv) - edgeLuma;
    float nDelta = fxaaLuma(nuv) - edgeLuma;
    bool pEnd = abs(pDelta) >= threshold;
    bool nEnd = abs(nDelta) >= threshold;
    for (int i = 1; i < FXAA_STEPS; i++) {
      if (pEnd && nEnd) break;
      float stride = i == 1 ? 1.5 : (i < 5 ? 2.0 : 4.0);
      if (!pEnd) {
        puv += along * stride;
        pDelta = fxaaLuma(puv) - edgeLuma;
        pEnd = abs(pDelta) >= threshold;
      }
      if (!nEnd) {
        nuv -= along * stride;
        nDelta = fxaaLuma(nuv) - edgeLuma;
        nEnd = abs(nDelta) >= threshold;
      }
    }
    if (!pEnd) puv += along * 8.0;
    if (!nEnd) nuv -= along * 8.0;
    float pDistance = isHorizontal ? puv.x - uv.x : puv.y - uv.y;
    float nDistance = isHorizontal ? uv.x - nuv.x : uv.y - nuv.y;
    bool pCloser = pDistance <= nDistance;
    float shortest = pCloser ? pDistance : nDistance;
    bool deltaSign = (pCloser ? pDelta : nDelta) >= 0.0;
    float edgeBlend = deltaSign == (m - edgeLuma >= 0.0)
      ? 0.0
      : 0.5 - shortest / (pDistance + nDistance);

    float blend = max(pixelBlend, edgeBlend);
    if (isHorizontal) uv.y += pixelStep * blend;
    else uv.x += pixelStep * blend;
    return texture2D(uScene, uv);
  }`;

const finalFragment = /* glsl */ `
  uniform sampler2D uScene;
  uniform vec2 uTexel;
  uniform sampler2D uBloom;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyMiddle;
  uniform vec3 uSkyBottom;
  varying vec2 vUv;
  ${fxaaChunk}
  ${gradeChunk}
  void main() {
    vec4 scene = fxaa(vUv);
    vec3 sky = vUv.y > 0.45
      ? mix(uSkyMiddle, uSkyTop, smoothstep(0.45, 1.0, vUv.y))
      : mix(uSkyBottom, uSkyMiddle, smoothstep(0.0, 0.45, vUv.y));
    vec3 color = mix(sky, scene.rgb / max(scene.a, 0.001), scene.a);
    color += texture2D(uBloom, vUv).rgb * 1.1;
    // Étalonnage : ombres légèrement froides, lumières dorées.
    color = grade(color);
    float vignette = smoothstep(1.2, 0.4, length((vUv - 0.5) * vec2(1.0, 1.25)));
    color *= mix(0.9, 1.0, vignette);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }`;

type Passes = {
  /**
   * Taille du tampon de dessin (pixels). Les rayons des flous en restent des fractions, comme avant
   * le plafond de densité : le halo et le flou de maquette gardent leur taille à l'écran.
   */
  buffer: THREE.Vector2;
  /** Scène, puis flou de maquette (la première seule a un tampon de profondeur). */
  full: readonly [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  half: readonly [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  blur: THREE.ShaderMaterial;
  bright: THREE.ShaderMaterial;
  final: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  quadScene: THREE.Scene;
  quadCamera: THREE.OrthographicCamera;
  /** Densité réelle de la scène (pixels par dp), pour le compteur de performance (PerfProbe). */
  renderRatio: number;
  /** Dernier préréglage appliqué : les couleurs ne sont réécrites que s'il change. */
  appliedLook: PostLook | null;
};

type Props = {
  /** Hauteur (0 = bas, 1 = haut) de la bande nette, et sa demi-largeur. */
  focus?: number;
  band?: number;
  /** Halo, étalonnage et ciel (explorerArt.post). */
  look?: PostLook;
  /** Flou de maquette en haut et en bas ; faux, ses deux passes ne sont pas calculées. */
  tiltShift?: boolean;
};

/**
 * Réglages appliqués à chaque image, sans recréer les textures des passes : hauteur et largeur de
 * la bande nette (la caméra de la scène peut les animer en écrivant `scene.userData.focus`),
 * puis halo, étalonnage et ciel du préréglage.
 */
function applyParams(passes: Passes, focus: number, band: number, look: PostLook) {
  const { blur, bright, final } = passes;
  blur.uniforms.uFocus!.value = focus;
  blur.uniforms.uBand!.value = band;
  if (passes.appliedLook === look) return;
  passes.appliedLook = look;
  bright.uniforms.uThreshold!.value.set(...look.bloom);
  final.uniforms.uSkyTop!.value.set(look.sky.top);
  final.uniforms.uSkyMiddle!.value.set(look.sky.middle);
  final.uniforms.uSkyBottom!.value.set(look.sky.horizon);
  setGrade({ uGrade: final.uniforms.uGrade! }, look);
}

/** Texture intermédiaire ; seule celle de la scène a besoin d'un tampon de profondeur. */
function renderTarget(size: PassSize, depthBuffer: boolean): THREE.WebGLRenderTarget {
  return new THREE.WebGLRenderTarget(size.width, size.height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    type: THREE.UnsignedByteType,
    depthBuffer,
  });
}

function createPasses(gl: THREE.WebGLRenderer): Passes {
  const buffer = gl.getDrawingBufferSize(new THREE.Vector2());
  const sizes = passSizes(buffer, gl.getPixelRatio());
  const full = [renderTarget(sizes.scene, true), renderTarget(sizes.scene, false)] as const;
  const half = [renderTarget(sizes.half, false), renderTarget(sizes.half, false)] as const;
  const blur = new THREE.ShaderMaterial({
    uniforms: {
      uInput: { value: null },
      uDirection: { value: new THREE.Vector2() },
      uTilt: { value: 0 },
      uFocus: { value: 0.5 },
      uBand: { value: 0.42 },
    },
    vertexShader: quadVertex,
    fragmentShader: blurFragment,
    depthTest: false,
    depthWrite: false,
  });
  const bright = new THREE.ShaderMaterial({
    uniforms: {
      uInput: { value: null },
      uThreshold: { value: new THREE.Vector2() },
    },
    vertexShader: quadVertex,
    fragmentShader: brightFragment,
    depthTest: false,
    depthWrite: false,
  });
  const final = new THREE.ShaderMaterial({
    uniforms: {
      uScene: { value: null },
      uTexel: { value: new THREE.Vector2(1 / sizes.scene.width, 1 / sizes.scene.height) },
      uBloom: { value: null },
      uSkyTop: { value: new THREE.Color() },
      uSkyMiddle: { value: new THREE.Color() },
      uSkyBottom: { value: new THREE.Color() },
      ...gradeUniforms(),
    },
    vertexShader: quadVertex,
    fragmentShader: finalFragment,
    depthTest: false,
    depthWrite: false,
  });
  const quadScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blur);
  quad.frustumCulled = false;
  quadScene.add(quad);
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    buffer,
    full,
    half,
    blur,
    bright,
    final,
    quad,
    quadScene,
    quadCamera,
    renderRatio: (gl.getPixelRatio() * sizes.scene.width) / Math.max(1, buffer.x),
    appliedLook: null,
  };
}

function disposePasses(passes: Passes) {
  [...passes.full, ...passes.half].forEach((t) => t.dispose());
  passes.blur.dispose();
  passes.bright.dispose();
  passes.final.dispose();
  passes.quad.geometry.dispose();
}

/** Toutes les passes d'une image ; seule la dernière (`present`) dessine à l'écran. */
function renderPasses(
  gl: THREE.WebGLRenderer,
  passes: Passes,
  view: { scene: THREE.Scene; camera: THREE.Camera },
  tiltShift: boolean,
  present: () => void,
) {
  const { full, half, blur, bright, final, quad, quadScene, quadCamera, buffer } = passes;
  const pass = (
    material: THREE.ShaderMaterial,
    output: THREE.WebGLRenderTarget | null,
    last = false,
  ) => {
    quad.material = material;
    gl.setRenderTarget(output);
    if (last) present();
    gl.render(quadScene, quadCamera);
  };

  gl.setClearColor(0x000000, 0);
  gl.setRenderTarget(full[0]);
  gl.clear();
  gl.render(view.scene, view.camera);

  // Halo : zones claires, à demi-résolution, floutées deux fois.
  bright.uniforms.uInput!.value = full[0].texture;
  pass(bright, half[0]);
  for (let i = 0; i < 2; i++) {
    blur.uniforms.uTilt!.value = 0;
    blur.uniforms.uInput!.value = half[0].texture;
    blur.uniforms.uDirection!.value.set((1 + i) / (buffer.x / 2), 0);
    pass(blur, half[1]);
    blur.uniforms.uInput!.value = half[1].texture;
    blur.uniforms.uDirection!.value.set(0, (1 + i) / (buffer.y / 2));
    pass(blur, half[0]);
  }

  // Flou de maquette : horizontal puis vertical, nul dans la bande nette.
  if (tiltShift) {
    blur.uniforms.uTilt!.value = 1;
    blur.uniforms.uInput!.value = full[0].texture;
    blur.uniforms.uDirection!.value.set(1.6 / buffer.x, 0);
    pass(blur, full[1]);
    blur.uniforms.uInput!.value = full[1].texture;
    blur.uniforms.uDirection!.value.set(0, 1.6 / buffer.y);
    pass(blur, full[0]);
  }

  // Passe finale à la taille de l'écran : la scène y est agrandie, après son anticrénelage.
  final.uniforms.uScene!.value = full[0].texture;
  final.uniforms.uBloom!.value = half[0].texture;
  pass(final, null, true);
}

export function Hd2dPost({
  focus = 0.5,
  band = 0.42,
  look = explorerArt.post.hd2d,
  tiltShift = true,
}: Props) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  // La densité du web suit le zoom du navigateur : le tampon de dessin change avec elle.
  const dpr = useThree((s) => s.viewport.dpr);

  // Textures et matériaux des passes, gardés dans une ref : modifiés à chaque image, hors du rendu React.
  const passesRef = useRef<Passes | null>(null);
  useEffect(() => {
    const passes = createPasses(gl);
    passesRef.current = passes;
    // La taille du canevas recrée les textures intermédiaires ; les anciennes sont libérées.
    return () => {
      disposePasses(passes);
      passesRef.current = null;
    };
  }, [gl, size.width, size.height, dpr]);

  useFrame((state) => {
    // Natif : si Android a détruit le contexte 3D (vue retirée de la fenêtre), l'image n'est pas
    // dessinée, chaque appel GL échouerait. R3F passe tout seul au nouveau contexte quand la vue en
    // reçoit un, et y reconstruit la scène. Cette passe dessine seule : R3F ne rend rien d'autre.
    if (NATIVE && isContextDead(gl.getContext())) return;
    const passes = passesRef.current;
    if (!passes) return;
    state.scene.userData.renderRatio = passes.renderRatio;
    const animatedFocus = scene.userData.focus as number | undefined;
    applyParams(passes, animatedFocus ?? focus, band, look);
    // En natif, `gl.render` termine l'image : seule la dernière passe la présente.
    presentOnce(gl.getContext(), (present) =>
      renderPasses(gl, passes, { scene, camera }, tiltShift, present),
    );
  }, 1);

  return null;
}
