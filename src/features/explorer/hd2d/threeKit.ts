import * as THREE from 'three';

import type { PixelCanvas } from './pixels';
import { PIXELS_PER_UNIT, type Sprite } from './sprites';

/*
 * Passage du pixel art à three.js : textures au filtrage net (un texel = un gros pixel à l'écran),
 * et sprites « billboard » éclairés par la scène, qui projettent leur ombre comme dans Octopath.
 */

export function toTexture(canvas: PixelCanvas, repeat = false): THREE.DataTexture {
  // La toile se lit de haut en bas ; une DataTexture commence en bas : on retourne les lignes.
  const flipped = new Uint8Array(canvas.data.length);
  const row = canvas.width * 4;
  for (let y = 0; y < canvas.height; y++) {
    flipped.set(canvas.data.subarray(y * row, (y + 1) * row), (canvas.height - 1 - y) * row);
  }
  const texture = new THREE.DataTexture(flipped, canvas.width, canvas.height, THREE.RGBAFormat);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
  texture.needsUpdate = true;
  return texture;
}

/**
 * Sprite posé au sol : un plan à la taille du dessin (32 pixels = 1 unité), tourné vers la caméra
 * autour de la verticale, découpé au pixel près (alphaTest) et projetant une ombre découpée.
 */
export function spriteMesh(sprite: Sprite, scale = 1, lit = true): THREE.Mesh {
  const { canvas, baseline } = sprite;
  const w = (canvas.width / PIXELS_PER_UNIT) * scale;
  const h = (canvas.height / PIXELS_PER_UNIT) * scale;
  const geometry = new THREE.PlaneGeometry(w, h);
  geometry.translate(0, h / 2 - (baseline / PIXELS_PER_UNIT) * scale, 0);
  const map = toTexture(canvas);
  // Les nuages (lit = false) gardent leurs couleurs : pas d'ombre ni de teinte de la lumière.
  const material = lit
    ? new THREE.MeshLambertMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide })
    : new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide, fog: false });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
    map,
    alphaTest: 0.5,
  });
  return mesh;
}
