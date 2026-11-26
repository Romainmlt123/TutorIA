import * as THREE from 'three';

import { explorerArt, type PostLook } from '@/theme/explorerArt';

/*
 * Étalonnage des scènes d'Explorer, sur des couleurs linéaires : saturation, ombres légèrement
 * froides, lumières dorées, exposition. La passe finale de Hd2dPost (l'île) et la vue de l'avatar
 * sur la carte pré-rendue l'appliquent ; Blender cuit le même dans les tuiles (mapExport).
 */

/** Fonction GLSL `grade(color)`, et ses uniformes (`gradeUniforms`). */
export const gradeChunk = /* glsl */ `
  uniform vec3 uShadowTint;
  uniform vec3 uLightTint;
  uniform vec4 uGrade;
  // uGrade : saturation, teinte des ombres, teinte des lumières, exposition.
  vec3 grade(vec3 color) {
    float l = dot(color, vec3(0.299, 0.587, 0.114));
    color = mix(vec3(l), color, uGrade.x);
    color = mix(color, color * uShadowTint, (1.0 - smoothstep(0.0, 0.4, l)) * uGrade.y);
    color = mix(color, color * uLightTint, smoothstep(0.5, 1.0, l) * uGrade.z);
    return color * uGrade.w;
  }`;

export type GradeUniforms = {
  uShadowTint: { value: THREE.Color };
  uLightTint: { value: THREE.Color };
  uGrade: { value: THREE.Vector4 };
};

/** Uniformes de `gradeChunk`, aux couleurs du thème ; les réglages viennent de `setGrade`. */
export function gradeUniforms(): GradeUniforms {
  return {
    uShadowTint: { value: new THREE.Color(explorerArt.grade.shadows) },
    uLightTint: { value: new THREE.Color(explorerArt.grade.highlights) },
    uGrade: { value: new THREE.Vector4() },
  };
}

/** Réglages d'un préréglage (explorerArt.post) dans les uniformes. */
export function setGrade(uniforms: Pick<GradeUniforms, 'uGrade'>, look: PostLook): void {
  uniforms.uGrade.value.set(look.saturation, look.shadowTint, look.lightTint, look.exposure);
}
