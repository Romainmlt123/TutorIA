import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

/*
 * Chaîne d'effets HD-2D, écrite à la main pour rester compatible avec expo-gl (WebGL, textures
 * 8 bits) : scène rendue dans une texture, halo lumineux (bloom) à demi-résolution, flou de
 * maquette en haut et en bas de l'écran (tilt-shift), puis composition sur un ciel en dégradé,
 * vignettage et étalonnage (ombres froides, lumières chaudes).
 */

const ART = explorerArt;

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
  varying vec2 vUv;
  void main() {
    vec4 c = texture2D(uInput, vUv);
    float l = dot(c.rgb, vec3(0.299, 0.587, 0.114));
    gl_FragColor = vec4(c.rgb * smoothstep(0.48, 0.8, l) * c.a, 1.0);
  }`;

const finalFragment = /* glsl */ `
  uniform sampler2D uScene;
  uniform sampler2D uBloom;
  uniform vec3 uSkyTop;
  uniform vec3 uSkyMiddle;
  uniform vec3 uSkyBottom;
  uniform vec3 uShadowTint;
  uniform vec3 uLightTint;
  varying vec2 vUv;
  void main() {
    vec4 scene = texture2D(uScene, vUv);
    vec3 sky = vUv.y > 0.45
      ? mix(uSkyMiddle, uSkyTop, smoothstep(0.45, 1.0, vUv.y))
      : mix(uSkyBottom, uSkyMiddle, smoothstep(0.0, 0.45, vUv.y));
    vec3 color = mix(sky, scene.rgb / max(scene.a, 0.001), scene.a);
    color += texture2D(uBloom, vUv).rgb * 1.1;
    // Étalonnage lumineux et vif : saturation renforcée, ombres légèrement froides, lumières dorées.
    float l = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(l), color, 1.14);
    color = mix(color, color * uShadowTint, (1.0 - smoothstep(0.0, 0.4, l)) * 0.22);
    color = mix(color, color * uLightTint, smoothstep(0.5, 1.0, l) * 0.18);
    color *= 1.06;
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
};

type Props = {
  /** Hauteur (0 = bas, 1 = haut) de la bande nette, et sa demi-largeur. */
  focus?: number;
  band?: number;
};

export function Hd2dPost({ focus = 0.5, band = 0.42 }: Props) {
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
        uFocus: { value: focus },
        uBand: { value: band },
      },
      vertexShader: quadVertex,
      fragmentShader: blurFragment,
      depthTest: false,
      depthWrite: false,
    });
    const bright = new THREE.ShaderMaterial({
      uniforms: { uInput: { value: null } },
      vertexShader: quadVertex,
      fragmentShader: brightFragment,
      depthTest: false,
      depthWrite: false,
    });
    const final = new THREE.ShaderMaterial({
      uniforms: {
        uScene: { value: null },
        uBloom: { value: null },
        uSkyTop: { value: new THREE.Color(ART.sky.top) },
        uSkyMiddle: { value: new THREE.Color(ART.sky.middle) },
        uSkyBottom: { value: new THREE.Color(ART.sky.horizon) },
        uShadowTint: { value: new THREE.Color(ART.grade.shadows) },
        uLightTint: { value: new THREE.Color(ART.grade.highlights) },
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
    passesRef.current = { buffer, full, half, blur, bright, final, quad, quadScene, quadCamera };
    // La taille du canevas recrée les textures intermédiaires ; les anciennes sont libérées.
    return () => {
      [...full, ...half].forEach((t) => t.dispose());
      blur.dispose();
      bright.dispose();
      final.dispose();
      passesRef.current = null;
    };
  }, [gl, size.width, size.height, focus, band]);

  useFrame(() => {
    const passes = passesRef.current;
    if (!passes) return;
    const { full, half, blur, bright, final, quad, quadScene, quadCamera, buffer } = passes;
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
