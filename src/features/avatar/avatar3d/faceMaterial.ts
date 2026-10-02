import * as THREE from 'three';

import { avatarArt } from '@/theme/avatarArt';

import type { FaceParams } from '../logic/face';

/*
 * Matière de la tête de l'avatar, façon Mii : la peau éclairée normalement (Lambert), et le visage
 * dessiné par-dessus par le shader, en formes vectorielles (yeux, sourcils, nez, bouche, joues,
 * taches de rousseur) nettes à toutes les tailles, sans aucune texture.
 *
 * Repère du visage : la tête ramenée à une sphère de rayon 1 autour de son centre, à partir de la
 * position de repos des sommets (avant le squelette) ; x vers la gauche du personnage, y vers le
 * haut, z vers l'avant. Le visage n'est dessiné que sur l'avant de la tête.
 */

export type FaceUniforms = {
  uFaceCenter: { value: THREE.Vector3 };
  uFaceRadius: { value: THREE.Vector3 };
  uEyeStyle: { value: number };
  uBrowStyle: { value: number };
  uMouthStyle: { value: number };
  uNoseStyle: { value: number };
  uEyeSpacing: { value: number };
  uEyeHeight: { value: number };
  uCheeks: { value: number };
  uFreckles: { value: number };
  uEyeColor: { value: THREE.Color };
  uBrowColor: { value: THREE.Color };
  uMouth: { value: THREE.Color };
  uTongue: { value: THREE.Color };
  uTeeth: { value: THREE.Color };
  uSclera: { value: THREE.Color };
  uHighlight: { value: THREE.Color };
  uLine: { value: THREE.Color };
  uBlush: { value: THREE.Color };
};

const VERTEX_HEAD = /* glsl */ `
  uniform vec3 uFaceCenter;
  uniform vec3 uFaceRadius;
  varying vec3 vFace;
`;

const FRAGMENT_HEAD = /* glsl */ `
  uniform float uEyeStyle;
  uniform float uBrowStyle;
  uniform float uMouthStyle;
  uniform float uNoseStyle;
  uniform float uEyeSpacing;
  uniform float uEyeHeight;
  uniform float uCheeks;
  uniform float uFreckles;
  uniform vec3 uEyeColor;
  uniform vec3 uBrowColor;
  uniform vec3 uMouth;
  uniform vec3 uTongue;
  uniform vec3 uTeeth;
  uniform vec3 uSclera;
  uniform vec3 uHighlight;
  uniform vec3 uLine;
  uniform vec3 uBlush;
  varying vec3 vFace;

  // Couverture d'une forme à partir de sa distance signée (négative dedans), bord adouci d'un pixel.
  float cover(float d) {
    float w = fwidth(d) * 0.8 + 1e-4;
    return 1.0 - smoothstep(-w, w, d);
  }

  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float sdEllipse(vec2 p, vec2 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    return k0 * (k0 - 1.0) / max(k1, 1e-5);
  }

  // Arc du cercle (centre c, rayon r) limité à |x - c.x| < w, côté bas (side = -1) ou haut (side = 1).
  float sdArc(vec2 p, vec2 c, float r, float w, float side) {
    vec2 q = p - c;
    float ey = side * sqrt(max(r * r - w * w, 0.0));
    if (abs(q.x) < w && q.y * side > 0.0) return abs(length(q) - r);
    return min(length(q - vec2(-w, ey)), length(q - vec2(w, ey)));
  }

  vec3 drawEye(vec3 col, vec2 q) {
    if (uEyeStyle < 0.5) {
      // rond : un ovale plein et son reflet
      col = mix(col, mix(uLine, uEyeColor, 0.35), cover(sdEllipse(q, vec2(0.09, 0.125))));
      col = mix(col, uHighlight, cover(length(q - vec2(0.028, 0.048)) - 0.03));
    } else if (uEyeStyle < 1.5) {
      // grand : blanc cerné, grand iris, pupille, reflet
      float white = sdEllipse(q, vec2(0.115, 0.14));
      col = mix(col, uLine, cover(white - 0.014));
      col = mix(col, uSclera, cover(white));
      vec2 c = q - vec2(0.0, -0.014);
      col = mix(col, uEyeColor, cover(max(length(c) - 0.085, white)));
      col = mix(col, uLine, cover(max(length(c) - 0.042, white)));
      col = mix(col, uHighlight, cover(length(q - vec2(0.03, 0.035)) - 0.026));
    } else if (uEyeStyle < 2.5) {
      // amande : œil en amande, iris, cil du dessus
      vec2 a = vec2(q.x / 0.68, q.y);
      float white = max(length(a - vec2(0.0, -0.085)) - 0.16, length(a - vec2(0.0, 0.085)) - 0.16);
      col = mix(col, uSclera, cover(white));
      col = mix(col, uEyeColor, cover(max(length(q) - 0.07, white)));
      col = mix(col, uLine, cover(max(length(q) - 0.035, white)));
      col = mix(col, uHighlight, cover(length(q - vec2(0.022, 0.025)) - 0.018));
      col = mix(col, uLine, cover(sdArc(a, vec2(0.0, -0.085), 0.16, 0.13, 1.0) - 0.014));
    } else if (uEyeStyle < 3.5) {
      // rieur : un arc fermé, comme quand on rit
      col = mix(col, uLine, cover(sdArc(q, vec2(0.0, -0.035), 0.085, 0.08, 1.0) - 0.02));
    } else if (uEyeStyle < 4.5) {
      // endormi : paupière à demi baissée
      float white = sdEllipse(q, vec2(0.11, 0.115));
      float open = max(white, q.y - 0.005);
      vec2 c = q - vec2(0.0, -0.035);
      col = mix(col, uSclera, cover(open));
      col = mix(col, uEyeColor, cover(max(length(c) - 0.07, open)));
      col = mix(col, uLine, cover(max(length(c) - 0.035, open)));
      col = mix(col, uLine, cover(max(abs(q.y - 0.005) - 0.013, white - 0.012)));
    } else {
      // petit : un point et son reflet
      col = mix(col, mix(uLine, uEyeColor, 0.35), cover(length(q) - 0.052));
      col = mix(col, uHighlight, cover(length(q - vec2(0.016, 0.018)) - 0.015));
    }
    return col;
  }

  // q : +x vers l'extérieur du visage, -x vers le nez.
  vec3 drawBrow(vec3 col, vec2 q) {
    float d;
    if (uBrowStyle < 0.5) return col;
    // Avec les yeux endormis, les sourcils montent un peu et les sourcils décidés se redressent :
    // paupières basses et sourcils froncés donnaient un air grognon.
    bool sleepy = uEyeStyle > 3.5 && uEyeStyle < 4.5;
    if (sleepy) q.y -= 0.035;
    if (uBrowStyle < 1.5) d = sdArc(q, vec2(0.0, -0.26), 0.27, 0.085, 1.0) - 0.013;
    else if (uBrowStyle < 2.5) d = sdSegment(q, vec2(-0.08, -0.004), vec2(0.08, 0.008)) - 0.026;
    else if (uBrowStyle < 3.5) d = sdArc(q, vec2(0.0, -0.1), 0.125, 0.095, 1.0) - 0.018;
    else if (sleepy) d = sdSegment(q, vec2(-0.075, -0.004), vec2(0.08, 0.014)) - 0.021;
    else d = sdSegment(q, vec2(-0.075, -0.03), vec2(0.08, 0.026)) - 0.021;
    return mix(col, uBrowColor, cover(d));
  }

  vec3 drawNose(vec3 col, vec2 q, vec3 skin) {
    if (uNoseStyle < 0.5) return col;
    if (uNoseStyle < 1.5) return mix(col, skin * 0.74, cover(sdEllipse(q, vec2(0.024, 0.018))));
    if (uNoseStyle < 2.5) {
      return mix(col, skin * 0.72, cover(sdArc(q, vec2(0.0, 0.025), 0.05, 0.042, -1.0) - 0.011));
    }
    return mix(col, skin * 0.86, cover(sdEllipse(q, vec2(0.06, 0.048))));
  }

  vec3 drawMouth(vec3 col, vec2 q) {
    if (uMouthStyle < 0.5) {
      // sourire
      col = mix(col, uLine, cover(sdArc(q, vec2(0.0, 0.08), 0.15, 0.11, -1.0) - 0.017));
    } else if (uMouthStyle < 1.5 || (uMouthStyle > 3.5 && uMouthStyle < 4.5)) {
      // rire (avec la langue) ou dents (rangée du haut)
      float d = max(length(q - vec2(0.0, 0.035)) - 0.13, q.y - 0.035);
      col = mix(col, uMouth, cover(d));
      if (uMouthStyle < 1.5) col = mix(col, uTongue, cover(max(length(q - vec2(0.0, -0.09)) - 0.065, d)));
      else col = mix(col, uTeeth, cover(max(-q.y, d)));
    } else if (uMouthStyle < 2.5) {
      // petit « o »
      col = mix(col, uMouth, cover(sdEllipse(q, vec2(0.04, 0.052))));
    } else if (uMouthStyle < 3.5) {
      // sourire en coin
      col = mix(col, uLine, cover(sdArc(q, vec2(0.04, 0.07), 0.12, 0.085, -1.0) - 0.016));
    } else {
      // neutre
      col = mix(col, uLine, cover(sdSegment(q, vec2(-0.07, 0.0), vec2(0.07, 0.0)) - 0.014));
    }
    return col;
  }

  vec3 drawFace(vec3 skin) {
    vec3 p = normalize(vFace);
    float front = smoothstep(0.2, 0.4, p.z);
    if (front <= 0.0) return skin;
    vec2 f = p.xy;
    vec3 col = skin;
    vec2 cheek = vec2(abs(f.x) - 0.56, f.y + 0.22);
    col = mix(col, uBlush, uCheeks * 0.5 * (1.0 - smoothstep(0.0, 0.06, sdEllipse(cheek, vec2(0.11, 0.07)))));
    if (uFreckles > 0.5) {
      float dots = 1.0;
      dots = min(dots, length(cheek - vec2(-0.1, 0.03)) - 0.016);
      dots = min(dots, length(cheek - vec2(-0.03, 0.06)) - 0.014);
      dots = min(dots, length(cheek - vec2(-0.06, -0.02)) - 0.015);
      dots = min(dots, length(cheek - vec2(0.02, 0.0)) - 0.013);
      dots = min(dots, length(cheek - vec2(-0.13, -0.03)) - 0.012);
      col = mix(col, skin * 0.66, cover(dots));
    }
    float side = f.x >= 0.0 ? 1.0 : -1.0;
    vec2 eye = vec2(f.x - side * uEyeSpacing, f.y - uEyeHeight);
    col = drawEye(col, eye);
    col = drawBrow(col, vec2(eye.x * side, eye.y - 0.23));
    col = drawNose(col, f - vec2(0.0, -0.13), skin);
    col = drawMouth(col, f - vec2(0.0, -0.37));
    return mix(skin, col, front);
  }
`;

function color(hex: string): { value: THREE.Color } {
  return { value: new THREE.Color(hex) };
}

/** Matière de la tête, et ses réglages (à mettre à jour avec `setFace`). */
export function faceMaterial(): { material: THREE.MeshLambertMaterial; uniforms: FaceUniforms } {
  const uniforms: FaceUniforms = {
    uFaceCenter: { value: new THREE.Vector3() },
    uFaceRadius: { value: new THREE.Vector3(1, 1, 1) },
    uEyeStyle: { value: 0 },
    uBrowStyle: { value: 0 },
    uMouthStyle: { value: 0 },
    uNoseStyle: { value: 0 },
    uEyeSpacing: { value: 0.34 },
    uEyeHeight: { value: 0.03 },
    uCheeks: { value: 1 },
    uFreckles: { value: 0 },
    uEyeColor: color(avatarArt.eyes[0]),
    uBrowColor: color(avatarArt.hairs[0]),
    uMouth: color(avatarArt.mouth),
    uTongue: color(avatarArt.tongue),
    uTeeth: color(avatarArt.teeth),
    uSclera: color(avatarArt.sclera),
    uHighlight: color(avatarArt.highlight),
    uLine: color(avatarArt.line),
    uBlush: color(avatarArt.blush),
  };
  const material = new THREE.MeshLambertMaterial();
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${VERTEX_HEAD}`)
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\n  vFace = (position - uFaceCenter) / uFaceRadius;',
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${FRAGMENT_HEAD}`)
      .replace(
        '#include <color_fragment>',
        '#include <color_fragment>\n  diffuseColor.rgb = drawFace(diffuseColor.rgb);',
      );
  };
  material.customProgramCacheKey = () => 'avatar-face';
  return { material, uniforms };
}

/** Rayons de la tête de la figurine (tools/avatar-3d/avatar.py), et demi-largeur avec les oreilles. */
const HEAD = { width: 0.205, withEars: 0.223 };

/**
 * Repère du visage lu dans la tête elle-même : sa boîte englobante dans l'espace de ses sommets
 * (qui peuvent être quantifiés) donne le centre et les rayons ; en largeur, les oreilles dépassent.
 */
export function fitFace(uniforms: FaceUniforms, head: THREE.BufferGeometry) {
  head.computeBoundingBox();
  const box = head.boundingBox!;
  const center = box.getCenter(new THREE.Vector3());
  const half = box.getSize(new THREE.Vector3()).multiplyScalar(0.5);
  uniforms.uFaceCenter.value.copy(center);
  uniforms.uFaceRadius.value.set((half.x * HEAD.width) / HEAD.withEars, half.y, half.z);
}

export function setFace(uniforms: FaceUniforms, face: FaceParams, eyes: string, brows: string) {
  uniforms.uEyeStyle.value = face.eyeStyle;
  uniforms.uBrowStyle.value = face.browStyle;
  uniforms.uMouthStyle.value = face.mouthStyle;
  uniforms.uNoseStyle.value = face.noseStyle;
  uniforms.uEyeSpacing.value = face.eyeSpacing;
  uniforms.uEyeHeight.value = face.eyeHeight;
  uniforms.uCheeks.value = face.cheeks;
  uniforms.uFreckles.value = face.freckles;
  uniforms.uEyeColor.value.set(eyes);
  uniforms.uBrowColor.value.set(brows);
}
