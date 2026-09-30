import * as THREE from 'three';

import { explorerArt } from '@/theme/explorerArt';

import { MASK_EXTENT, MASK_SIZE, PLATEAU_REGIONS, regionMask } from '../logic/regions';

/*
 * Teinte des régions sur l'herbe (X2a) : le matériau de l'île, cuit dans Blender, est complété par
 * un masque des régions vu de dessus (logic/regions.ts). Sans nouvelle cuisson, le shader y ajoute
 * une teinte légère par région, des frontières en pointillés, une brume sur les régions pas encore
 * visitées, et la désaturation des autres régions quand l'une est choisie.
 */

export type RegionTintUniforms = {
  uMix: { value: number };
  uHasFocus: { value: number };
  uFocusMask: { value: THREE.Vector3 };
  uMist: { value: THREE.Vector3 };
  uLocal: { value: THREE.Matrix4 };
  uRegionMask: { value: THREE.DataTexture };
  uColors: { value: THREE.Color[] };
  uMistColor: { value: THREE.Color };
  uBorderColor: { value: THREE.Color };
};

function maskTexture(): THREE.DataTexture {
  const texture = new THREE.DataTexture(regionMask(), MASK_SIZE, MASK_SIZE, THREE.RGBAFormat);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

const VERTEX_HEADER = /* glsl */ `
  uniform mat4 uLocal;
  varying vec3 vRegionPos;
`;

const FRAGMENT_HEADER = /* glsl */ `
  uniform float uMix;
  uniform float uHasFocus;
  uniform vec3 uFocusMask;
  uniform vec3 uMist;
  uniform sampler2D uRegionMask;
  uniform vec3 uColors[3];
  uniform vec3 uMistColor;
  uniform vec3 uBorderColor;
  varying vec3 vRegionPos;
`;

const FRAGMENT_TINT = /* glsl */ `
  #include <map_fragment>
  {
    vec2 maskUv = (vRegionPos.xz + ${MASK_EXTENT.toFixed(1)} * 0.5) / ${MASK_EXTENT.toFixed(1)};
    vec4 region = texture2D(uRegionMask, maskUv);
    float inside = max(region.r, max(region.g, region.b));
    // Plateau et objets du décor seulement : ni la falaise ni la motte.
    float above = step(-0.04, vRegionPos.y);
    vec3 tint = uColors[0] * region.r + uColors[1] * region.g + uColors[2] * region.b;
    vec3 rgb = diffuseColor.rgb;
    float grey = dot(rgb, vec3(0.299, 0.587, 0.114));
    // Désaturation des régions non choisies.
    float chosen = dot(region.rgb, uFocusMask);
    float faded = uHasFocus * (1.0 - chosen) * inside;
    rgb = mix(rgb, vec3(grey), 0.65 * faded * uMix * above);
    rgb = mix(rgb, tint, 0.2 * inside * uMix * above * (1.0 - 0.6 * faded));
    // Brume sur les régions pas encore visitées.
    float mist = dot(region.rgb, uMist);
    rgb = mix(rgb, uMistColor, 0.3 * mist * uMix * above);
    // Frontières en pointillés, sur le sol seulement.
    float ground = step(abs(vRegionPos.y), 0.06);
    float dots = step(0.5, fract((vRegionPos.x + vRegionPos.z) * 7.0));
    rgb = mix(rgb, uBorderColor, 0.9 * region.a * dots * ground * uMix);
    diffuseColor.rgb = rgb;
  }
`;

/**
 * Ajoute la teinte des régions au matériau de l'île. `local` est la matrice du maillage dans le
 * modèle : les positions quantifiées du fichier sont remises en mètres du plateau avant de lire le
 * masque. Retourne les uniformes à animer (voir setRegionLook).
 */
export function applyRegionTint(
  material: THREE.MeshBasicMaterial,
  local: THREE.Matrix4,
): RegionTintUniforms {
  const uniforms: RegionTintUniforms = {
    uMix: { value: 0 },
    uHasFocus: { value: 0 },
    uFocusMask: { value: new THREE.Vector3() },
    uMist: { value: new THREE.Vector3() },
    uLocal: { value: local },
    uRegionMask: { value: maskTexture() },
    uColors: {
      value: PLATEAU_REGIONS.map(
        (id) => new THREE.Color(explorerArt.regions[id as keyof typeof explorerArt.regions]),
      ),
    },
    uMistColor: { value: new THREE.Color(explorerArt.mist) },
    uBorderColor: { value: new THREE.Color(explorerArt.regionBorder) },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_HEADER}`)
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n  vRegionPos = (uLocal * vec4(position, 1.0)).xyz;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_HEADER}`)
      .replace('#include <map_fragment>', FRAGMENT_TINT);
  };
  material.customProgramCacheKey = () => 'region-tint';
  material.needsUpdate = true;
  return uniforms;
}

/** Ce que la vue demande au shader : intensité, région choisie, régions sous la brume. */
export type RegionLook = {
  mix: number;
  focus: string | null;
  mist: readonly string[];
};

const channel = (regionId: string | null) =>
  new THREE.Vector3().fromArray(PLATEAU_REGIONS.map((id) => (id === regionId ? 1 : 0)));

export function setRegionLook(uniforms: RegionTintUniforms, look: RegionLook): void {
  uniforms.uMix.value = look.mix;
  uniforms.uHasFocus.value = look.focus && PLATEAU_REGIONS.includes(look.focus) ? 1 : 0;
  uniforms.uFocusMask.value.copy(channel(look.focus));
  uniforms.uMist.value.fromArray(PLATEAU_REGIONS.map((id) => (look.mist.includes(id) ? 1 : 0)));
}

export function disposeRegionTint(uniforms: RegionTintUniforms): void {
  uniforms.uRegionMask.value.dispose();
}
