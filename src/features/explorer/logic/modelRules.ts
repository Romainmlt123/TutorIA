/*
 * Ce que l'app lit dans chaque modèle 3D (GLB), nœud par nœud : la liste blanche des attributs de
 * sommets. `npm run explorer:clean` (scripts/clean-glb.ts) retire tout le reste après la
 * quantification, et assets.test.ts vérifie les fichiers versionnés (attributs, extensions, images,
 * poids). Une règle change avec le code qui lit le modèle : un matériau éclairé a besoin de NORMAL,
 * une texture de TEXCOORD_0.
 * Ce fichier est aussi exécuté par Node seul, sans Metro ni Babel : il n'importe rien.
 */

export type Attribute = 'POSITION' | 'NORMAL' | 'TEXCOORD_0' | 'JOINTS_0' | 'WEIGHTS_0';

export type NodeRule = {
  /** Attributs gardés ; les autres sont retirés. */
  attributes: readonly Attribute[];
  /** Indices triviaux (0, 1, 2…) retirés : le maillage se dessine dans l'ordre de ses sommets. */
  dropIndices?: true;
};

export type ModelRule = {
  /** Chemin depuis la racine du dépôt. */
  file: string;
  /**
   * Plafond du poids du fichier, en octets : le poids après nettoyage (16 octobre 2026), plus 2 à
   * 4 %. Un modèle recuit plus lourd fait échouer assets.test.ts : alléger, ou relever le plafond
   * en connaissance de cause.
   */
  maxBytes: number;
  /** Règle par nom de nœud. « chiffre_* » vaut pour les noms qui commencent par « chiffre_ », « * » pour tous. */
  nodes: Readonly<Record<string, NodeRule>>;
};

/** Dossiers des modèles : chaque GLB qui s'y trouve doit avoir sa règle. */
export const MODEL_FOLDERS = ['assets/explorer/models', 'assets/avatar'] as const;

/** Pièce cuite, affichée par un MeshBasicMaterial avec sa texture : sans lumière, donc sans normale. */
const BAKED: NodeRule = { attributes: ['POSITION', 'TEXCOORD_0'] };

/**
 * Brins d'herbe : grass.ts ne lit que la position et la hauteur le long du brin (v de l'UV). Un
 * triangle par brin, sans sommet partagé : les indices ne font que répéter l'ordre des sommets.
 */
const BLADES: NodeRule = { attributes: ['POSITION', 'TEXCOORD_0'], dropIndices: true };

/** Chiffres de la cascade : un MeshBasicMaterial d'une seule couleur, ni texture ni lumière. */
const PLAIN: NodeRule = { attributes: ['POSITION'] };

/**
 * Pièces de l'avatar : éclairées (MeshLambertMaterial, sans texture) et animées par le squelette.
 * Le visage est dessiné d'après la position (faceMaterial.ts), pas d'après l'UV.
 */
const FIGURINE: NodeRule = { attributes: ['POSITION', 'NORMAL', 'JOINTS_0', 'WEIGHTS_0'] };

export const MODEL_RULES: readonly ModelRule[] = [
  {
    // MathsIsland3D.tsx (la teinte des régions lit la position). Budget : 1 500 000 octets
    // (docs/explorer-creer-une-ile.md, § 4).
    file: 'assets/explorer/models/island-maths-3d.glb',
    maxBytes: 1_500_000,
    nodes: { ile: BAKED, brins: BLADES, 'chiffre_*': PLAIN },
  },
  {
    // IsletAlgo.tsx
    file: 'assets/explorer/models/islet-algo.glb',
    maxBytes: 560_000,
    nodes: { ilot: BAKED },
  },
  {
    // RegionWorld.tsx : les brins sont relus sur le processeur (bladesGeometry), jamais affichés tels quels.
    file: 'assets/explorer/models/region-maths-nombres.glb',
    maxBytes: 3_470_000,
    nodes: { region: BAKED, reperes: BAKED, brins: BLADES },
  },
  {
    // stripKit.ts : une pièce par sorte de décor.
    file: 'assets/explorer/models/strip-kit.glb',
    maxBytes: 420_000,
    nodes: {
      'rocher-a': BAKED,
      'rocher-b': BAKED,
      cailloux: BAKED,
      fleurs: BAKED,
      'fleurs-b': BAKED,
      barriere: BAKED,
    },
  },
  {
    // RegionWorld.tsx : un monument par ville, nommé comme dans le contenu.
    file: 'assets/explorer/models/strip-nombres.glb',
    maxBytes: 3_550_000,
    nodes: { '*': BAKED },
  },
  {
    // Avatar3D.tsx : toute la garde-robe dans un seul fichier.
    file: 'assets/avatar/avatar.glb',
    maxBytes: 1_590_000,
    nodes: { '*': FIGURINE },
  },
];

/** Entrée de la liste qui vaut pour un nœud : son nom exact, sinon le motif le plus précis. */
export function ruleKey(model: ModelRule, name: string): string | undefined {
  if (Object.hasOwn(model.nodes, name)) return name;
  return Object.keys(model.nodes)
    .filter((key) => key.endsWith('*') && name.startsWith(key.slice(0, -1)))
    .sort((a, b) => b.length - a.length)[0];
}

/** Règle d'un nœud, ou undefined s'il n'en a pas. */
export function nodeRule(model: ModelRule, name: string): NodeRule | undefined {
  const key = ruleKey(model, name);
  return key === undefined ? undefined : model.nodes[key];
}

/** Vrai si les indices valent 0, 1, 2… jusqu'au dernier sommet : les retirer ne change rien au dessin. */
export function isIdentityIndex(indices: ArrayLike<number>, vertexCount: number): boolean {
  if (indices.length !== vertexCount) return false;
  for (let i = 0; i < indices.length; i++) if (indices[i] !== i) return false;
  return true;
}
