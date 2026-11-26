import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as THREE from 'three';

import { isContextDead } from '@/lib/three/contextProbe';
import { presentOnce } from '@/lib/three/presentOnce';
import { explorerArt, type PostLook } from '@/theme/explorerArt';

import { gradeChunk, gradeUniforms, setGrade } from './grade';

const NATIVE = Platform.OS !== 'web';

/**
 * Suréchantillonnage : la scène est rendue deux fois plus grande dans chaque sens, puis réduite.
 * Au centre d'un pixel de l'écran, le filtre bilinéaire lit alors la moyenne exacte de ses 2×2
 * échantillons, sans passe de flou.
 */
const SSAA = 2;

const quadVertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

/**
 * Réduction de la scène, étalonnage, puis sortie prémultipliée par l'alpha. La scène est rendue sur
 * un fond transparent (0, 0, 0, 0) : la moyenne des échantillons est déjà prémultipliée. La couleur
 * est encodée (sRGB) avant d'être remultipliée : un bord à demi couvert ne s'éclaircit pas.
 */
const resolveFragment = /* glsl */ `
  uniform sampler2D uScene;
  varying vec2 vUv;
  ${gradeChunk}
  void main() {
    vec4 scene = texture2D(uScene, vUv);
    gl_FragColor = vec4(grade(scene.rgb / max(scene.a, 0.001)), 1.0);
    #include <colorspace_fragment>
    gl_FragColor = vec4(gl_FragColor.rgb * scene.a, scene.a);
  }`;

type Resolve = {
  target: THREE.WebGLRenderTarget;
  material: THREE.ShaderMaterial;
  quad: THREE.Mesh;
  quadScene: THREE.Scene;
  quadCamera: THREE.OrthographicCamera;
};

function createResolve(gl: THREE.WebGLRenderer, look: PostLook): Resolve {
  const buffer = gl.getDrawingBufferSize(new THREE.Vector2());
  const target = new THREE.WebGLRenderTarget(
    Math.max(1, buffer.x * SSAA),
    Math.max(1, buffer.y * SSAA),
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      type: THREE.UnsignedByteType,
      generateMipmaps: false,
      depthBuffer: true,
    },
  );
  const uniforms = { uScene: { value: target.texture }, ...gradeUniforms() };
  setGrade(uniforms, look);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: quadVertex,
    fragmentShader: resolveFragment,
    depthTest: false,
    depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const quadScene = new THREE.Scene();
  quadScene.add(quad);
  return { target, material, quad, quadScene, quadCamera: new THREE.OrthographicCamera() };
}

function disposeResolve(resolve: Resolve) {
  resolve.target.dispose();
  resolve.material.dispose();
  resolve.quad.geometry.dispose();
}

type Props = {
  /** Étalonnage appliqué (explorerArt.post) : par défaut, celui cuit dans les tuiles de la carte. */
  look?: PostLook;
  /** Première image où la scène a dessiné quelque chose (modèle chargé), une fois par montage. */
  onShown?: () => void;
};

/**
 * Anticrénelage d'une petite scène transparente posée sur l'interface (l'avatar sur la carte
 * pré-rendue) : rendue dans une texture deux fois plus grande, puis réduite à l'écran avec
 * l'étalonnage des tuiles, en couleurs prémultipliées (React Native compose la vue 3D ainsi) :
 * aucun liseré sombre ou clair autour de la figurine. À placer dans le Canvas ; il prend la main
 * sur le rendu (priorité 1), comme Hd2dPost.
 */
export function SsaaResolve({ look = explorerArt.post.natural, onShown }: Props) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const dpr = useThree((s) => s.viewport.dpr);
  const resolveRef = useRef<Resolve | null>(null);
  const shown = useRef(false);

  useEffect(() => {
    const resolve = createResolve(gl, look);
    resolveRef.current = resolve;
    // La taille de la vue recrée la texture ; l'ancienne est libérée.
    return () => {
      disposeResolve(resolve);
      resolveRef.current = null;
    };
  }, [gl, look, size.width, size.height, dpr]);

  useFrame(() => {
    // Natif : un contexte détruit par Android (vue retirée de la fenêtre) ne dessine rien.
    if (NATIVE && isContextDead(gl.getContext())) return;
    const resolve = resolveRef.current;
    if (!resolve) return;
    let drew = false;
    presentOnce(gl.getContext(), (present) => {
      gl.setClearColor(0x000000, 0);
      gl.setRenderTarget(resolve.target);
      gl.clear();
      gl.render(scene, camera);
      drew = gl.info.render.calls > 0;
      gl.setRenderTarget(null);
      present();
      gl.render(resolve.quadScene, resolve.quadCamera);
    });
    if (drew && !shown.current) {
      shown.current = true;
      onShown?.();
    }
  }, 1);

  return null;
}
