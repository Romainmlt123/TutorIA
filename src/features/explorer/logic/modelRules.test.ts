import { isIdentityIndex, MODEL_RULES, nodeRule, ruleKey, type ModelRule } from './modelRules';

const flat = { attributes: ['POSITION'] } as const;
const baked = { attributes: ['POSITION', 'TEXCOORD_0'] } as const;
const any = { attributes: ['POSITION', 'NORMAL'] } as const;

const model: ModelRule = {
  file: 'assets/test.glb',
  maxBytes: 1,
  nodes: { ile: baked, 'chiffre*': any, 'chiffre_*': flat, 'ile*': any },
};

describe('règles des modèles 3D', () => {
  it('prend la règle du nom exact, puis celle du motif le plus précis', () => {
    expect(nodeRule(model, 'ile')).toBe(baked);
    expect(nodeRule(model, 'chiffre_7')).toBe(flat);
    expect(nodeRule(model, 'chiffres')).toBe(any);
    expect(nodeRule(model, 'ilot')).toBeUndefined();
    expect(nodeRule(model, 'ile-2')).toBe(any);
  });

  it('dit quelle entrée de la liste vaut pour un nœud, même si deux entrées partagent une règle', () => {
    const kit: ModelRule = { ...model, nodes: { fleurs: baked, barriere: baked, 'fleurs*': any } };
    expect(ruleKey(kit, 'fleurs')).toBe('fleurs');
    expect(ruleKey(kit, 'barriere')).toBe('barriere');
    expect(ruleKey(kit, 'fleurs-b')).toBe('fleurs*');
    expect(ruleKey(kit, 'rocher')).toBeUndefined();
  });

  it('ne donne aucune règle à un nœud inconnu', () => {
    expect(nodeRule(model, 'brins')).toBeUndefined();
    expect(nodeRule(model, 'constructor')).toBeUndefined();
  });

  it('ne reconnaît que les indices triviaux qui couvrent tous les sommets', () => {
    expect(isIdentityIndex([0, 1, 2, 3, 4, 5], 6)).toBe(true);
    expect(isIdentityIndex(new Uint32Array([0, 1, 2]), 3)).toBe(true);
    expect(isIdentityIndex([0, 2, 1], 3)).toBe(false);
    expect(isIdentityIndex([0, 1, 2], 4)).toBe(false);
  });

  it('décrit chaque modèle une seule fois, avec un plafond de poids', () => {
    const files = MODEL_RULES.map((rule) => rule.file);
    expect(new Set(files).size).toBe(files.length);
    for (const rule of MODEL_RULES) expect(rule.maxBytes).toBeGreaterThan(0);
  });
});
