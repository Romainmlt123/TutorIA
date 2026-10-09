/*
 * Monuments des villes, un modèle Blender par région (tools/explorer-3d/strip_monuments.py) : chaque
 * pièce porte le nom du monument de sa ville dans le contenu, et toutes les villes de la région y
 * sont. Une région sans modèle garde le village générique à la place de ses monuments.
 */
export const MONUMENT_MODELS: Readonly<Record<string, string>> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- asset Metro (identifiant en natif, URL sur le web)
  'maths-nombres': require('../../../../assets/explorer/models/strip-nombres.glb'),
};
