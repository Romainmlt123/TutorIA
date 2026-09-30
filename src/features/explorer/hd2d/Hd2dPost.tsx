import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { explorerArt, type PostLook } from '@/theme/explorerArt';

/*
 * Chaîne d'effets HD-2D, écrite à la main pour rester compatible avec expo-gl (WebGL, textures
 * 8 bits) : scène rendue dans une texture, halo lumineux (bloom) à demi-résolution, flou de
 * maquette en haut et en bas de l'écran (tilt-shift), puis composition sur un ciel en dégradé,
 * vignettage et étalonnage (ombres froides, lumières chaudes).
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

const finalFragment = /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uBloom;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyMiddle;
  uniform vec3 uSkyBottom;
  uniform vec3 uShadowTint;
  uniform vec3 uLightTint;
  uniform vec4 uGrade;
  varying vec2 vUv;
  void main() {
    vec4 scene = texture2D(uScene, vUv);
    vec3 sky = vUv.y > 0.45
      ? mix(uSkyMiddle, uSkyTop, smoothstep(0.45, 1.0, vUv.y))
      : mix(uSkyBottom, uSkyMiddle, smoothstep(0.0, 0.45, vUv.y));
    vec3 color = mix(sky, scene.rgb / max(scene.a, 0.001), scene.a);
    color += texture2D(uBloom, vUv).rgb * 1.1;
    // Étalonnage (uGrade : saturation, teinte des ombres, teinte des lumières, exposition) :
    // ombres légèrement froides, lumières dorées.
    float l = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(l), color, uGrade.x);
    color = mix(color, color * uShadowTint, (1.0 - smoothstep(0.0, 0.4, l)) * uGrade.y);
    color = mix(color, color * uLightTint, smoothstep(0.5, 1.0, l) * uGrade.z);
    color *= uGrade.w;
    float vignette = smoothstep(1.2, 0.4, length((vUv - 0.5) * vec2(1.0, 1.25)));
    color *= mix(0.9, 1.0, vignette);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }`;

type Passes = {
  buffer: THREE.Vector2;
  full: readonly [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  half: readonly [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  blur: THREE.ShaderMaterial;
  bright: THREE.ShaderMaterial;
  final: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  quadScene: THREE.Scene;
  quadCamera: THREE.OrthographicCamera;
  /** Dernier préréglage appliqué : les couleurs ne sont réécrites que s'il change. */
  appliedLook: PostLook | null;
};

type Props = {
  /** Hauteur (0 = bas, 1 = haut) de la bande nette, et sa demi-largeur. */
  focus?: number;
  band?: number;
  /** Halo, étalonnage et ciel (explorerArt.post). */
  look?: PostLook;
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
  final.uniforms.uGrade!.value.set(look.saturation, look.shadowTint, look.lightTint, look.exposure);
}

export function Hd2dPost({ focus = 0.5, band = 0.42, look = explorerArt.post.hd2d }: Props) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  // Textures et matériaux des passes, gardés dans une ref : modifiés à chaque image, hors du rendu React.
  const passesRef = useRef<Passes | null>(null);
  useEffect(() => {
    const buffer = gl.getDrawingBufferSize(new THREE.Vector2());
    const target = (w: number, h: number) =>
      new THREE.WebGLRenderTarget(Math.max(1, Math.floor(w)), Math.max(1, Math.floor(h)), {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        type: THREE.UnsignedByteType,
      });
    const full = [target(buffer.x, buffer.y), target(buffer.x, buffer.y)] as const;
    const half = [target(buffer.x / 2, buffer.y / 2), target(buffer.x / 2, buffer.y / 2)] as const;
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
        uBloom: { value: null },
        uSkyTop: { value: new THREE.Color() },
        uSkyMiddle: { value: new THREE.Color() },
        uSkyBottom: { value: new THREE.Color() },
        uShadowTint: { value: new THREE.Color(explorerArt.grade.shadows) },
        uLightTint: { value: new THREE.Color(explorerArt.grade.highlights) },
        uGrade: { value: new THREE.Vector4() },
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
    passesRef.current = {
      buffer,
      full,
      half,
      blur,
      bright,
      final,
      quad,
      quadScene,
      quadCamera,
      appliedLook: null,
    };
    // La taille du canevas recrée les textures intermédiaires ; les anciennes sont libérées.
    return () => {
      [...full, ...half].forEach((t) => t.dispose());
      blur.dispose();
      bright.dispose();
      final.dispose();
      passesRef.current = null;
    };
  }, [gl, size.width, size.height]);

  useFrame(() => {
    const passes = passesRef.current;
    if (!passes) return;
    const { full, half, blur, bright, final, quad, quadScene, quadCamera, buffer } = passes;
    const animatedFocus = scene.userData.focus as number | undefined;
    applyParams(passes, animatedFocus ?? focus, band, look);
    // En natif, `gl.render` termine l'image (endFrameEXP d'expo-gl) : on la neutralise pendant
    // les passes intermédiaires, et seule la dernière passe présente l'image.
    const context = gl.getContext() as WebGLRenderingContext & { endFrameEXP?: () => void };
    const endFrame = context.endFrameEXP;
    if (endFrame) context.endFrameEXP = () => undefined;
    const draw = (s: THREE.Scene, c: THREE.Camera) => gl.render(s, c);
    const pass = (
      material: THREE.ShaderMaterial,
      output: THREE.WebGLRenderTarget | null,
      last = false,
    ) => {
      quad.material = material;
      gl.setRenderTarget(output);
      if (last && endFrame) context.endFrameEXP = endFrame;
      gl.render(quadScene, quadCamera);
    };

    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(full[0]);
    gl.clear();
    draw(scene, camera);

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
    blur.uniforms.uTilt!.value = 1;
    blur.uniforms.uInput!.value = full[0].texture;
    blur.uniforms.uDirection!.value.set(1.6 / buffer.x, 0);
    pass(blur, full[1]);
    blur.uniforms.uInput!.value = full[1].texture;
    blur.uniforms.uDirection!.value.set(0, 1.6 / buffer.y);
    pass(blur, full[0]);

    final.uniforms.uScene!.value = full[0].texture;
    final.uniforms.uBloom!.value = half[0].texture;
    pass(final, null, true);
  }, 1);

  return null;
}
