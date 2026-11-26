/**
 * Agrandissement du terrain de chaque région cuite (`EXPLORER_REGION_SCALE` du plan et du rendu de
 * tools/explorer-3d/region_map.py) : la carte 3D (terrains.ts) et la carte pré-rendue (l'eau du π et
 * ses reflets, RegionMapWorld) le lisent ici. Sans modèle 3D (ni three.js), il reste quand la région
 * n'a plus que ses tuiles : elles en ont besoin.
 */
export const TERRAIN_SCALES: Readonly<Partial<Record<string, number>>> = {
  'maths-nombres': 6,
};
