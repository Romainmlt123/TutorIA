/*
 * Terrain d'une région, cuit dans Blender (tools/explorer-3d/region_map.py) : la région de l'île
 * agrandie `scale` fois, avec ses repères et la rive de l'eau peinte dedans. Une région sans terrain
 * garde la maquette simple (disques de terre unis et décors du kit).
 */
export type Terrain = { asset: string; scale: number };

export const TERRAIN_MODELS: Readonly<Record<string, Terrain>> = {
  'maths-nombres': {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- asset Metro (identifiant en natif, URL sur le web)
    asset: require('../../../../assets/explorer/models/region-maths-nombres.glb'),
    scale: 6,
  },
};
