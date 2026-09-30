/*
 * Banque d'exercices des niveaux de l'île des Maths de 4e (côté serveur seulement) : pour chaque
 * niveau, son chapitre du référentiel, les capacités travaillées (indices dans
 * chapitres[].capacites) et les exercices corrigés proposés par le tuteur. Le Bilan d'une ville
 * a sa propre réserve d'exercices, jamais utilisés par les niveaux d'exercices.
 * Répartition écrite d'après le référentiel (énoncés relus un par un), à tenir à la main.
 */

type BankEntry = { ref: string; capacites: readonly number[]; exercises: readonly string[] };

export const MATHS_4E_BANK: Readonly<Record<string, BankEntry>> = {
  'maths-algorithmique.premiers-scripts': { ref: 'M4-C15', capacites: [0], exercises: [] },
  'maths-algorithmique.tracer-avec-le-lutin': {
    ref: 'M4-C15',
    capacites: [0],
    exercises: ['EX-M4-C15-001', 'EX-M4-C15-002', 'EX-M4-C15-003', 'EX-M4-C15-004'],
  },
  'maths-algorithmique.variables-conditions-evenements': {
    ref: 'M4-C15',
    capacites: [1],
    exercises: [],
  },
  'maths-algorithmique.variables-et-conditions': {
    ref: 'M4-C15',
    capacites: [1],
    exercises: ['EX-M4-C15-005', 'EX-M4-C15-006'],
  },
  'maths-algorithmique.blocs-et-projets': { ref: 'M4-C15', capacites: [2, 3], exercises: [] },
  'maths-algorithmique.frises-et-simulations': {
    ref: 'M4-C15',
    capacites: [1, 2, 3],
    exercises: ['EX-M4-C15-009', 'EX-M4-C15-010'],
  },
  'maths-algorithmique.bilan': {
    ref: 'M4-C15',
    capacites: [0, 1, 2, 3],
    exercises: ['EX-M4-C15-007', 'EX-M4-C15-008'],
  },
  'maths-relatifs.additionner-et-soustraire': { ref: 'M4-C01', capacites: [0], exercises: [] },
  'maths-relatifs.sommes-et-differences': {
    ref: 'M4-C01',
    capacites: [0, 1],
    exercises: ['EX-M4-C01-002', 'EX-M4-C01-007'],
  },
  'maths-relatifs.multiplier-des-relatifs': { ref: 'M4-C01', capacites: [1], exercises: [] },
  'maths-relatifs.calculer-des-produits': {
    ref: 'M4-C01',
    capacites: [1],
    exercises: ['EX-M4-C01-003', 'EX-M4-C01-005'],
  },
  'maths-relatifs.diviser-des-relatifs': { ref: 'M4-C01', capacites: [2], exercises: [] },
  'maths-relatifs.produits-et-quotients': {
    ref: 'M4-C01',
    capacites: [1, 2],
    exercises: ['EX-M4-C01-001', 'EX-M4-C01-004', 'EX-M4-C01-008'],
  },
  'maths-relatifs.bilan': {
    ref: 'M4-C01',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C01-006', 'EX-M4-C01-009', 'EX-M4-C01-010'],
  },
  'maths-fractions.diviseurs-et-nombres-premiers': {
    ref: 'M4-C02',
    capacites: [0, 1],
    exercises: [],
  },
  'maths-fractions.facteurs-premiers': {
    ref: 'M4-C02',
    capacites: [0, 1],
    exercises: ['EX-M4-C02-003', 'EX-M4-C02-008'],
  },
  'maths-fractions.fractions-egales': { ref: 'M4-C02', capacites: [2, 3], exercises: [] },
  'maths-fractions.simplifier-des-fractions': {
    ref: 'M4-C02',
    capacites: [1, 2, 3],
    exercises: ['EX-M4-C02-004', 'EX-M4-C02-005', 'EX-M4-C02-002'],
  },
  'maths-fractions.comparer-et-additionner': { ref: 'M4-C02', capacites: [4, 5], exercises: [] },
  'maths-fractions.ranger-et-calculer': {
    ref: 'M4-C02',
    capacites: [4, 5],
    exercises: ['EX-M4-C02-006', 'EX-M4-C02-001', 'EX-M4-C02-007'],
  },
  'maths-fractions.bilan': {
    ref: 'M4-C02',
    capacites: [0, 1, 2, 3, 4, 5],
    exercises: ['EX-M4-C02-009', 'EX-M4-C02-010'],
  },
  'maths-fractions-produits.multiplier-des-fractions': {
    ref: 'M4-C03',
    capacites: [0, 1],
    exercises: [],
  },
  'maths-fractions-produits.produits-de-fractions': {
    ref: 'M4-C03',
    capacites: [0, 1],
    exercises: ['EX-M4-C03-002', 'EX-M4-C03-003', 'EX-M4-C03-007'],
  },
  'maths-fractions-produits.inverse-et-division': {
    ref: 'M4-C03',
    capacites: [2, 3],
    exercises: [],
  },
  'maths-fractions-produits.diviser-par-une-fraction': {
    ref: 'M4-C03',
    capacites: [2, 3],
    exercises: ['EX-M4-C03-004', 'EX-M4-C03-005', 'EX-M4-C03-008'],
  },
  'maths-fractions-produits.bilan': {
    ref: 'M4-C03',
    capacites: [0, 1, 2, 3],
    exercises: ['EX-M4-C03-001', 'EX-M4-C03-006', 'EX-M4-C03-009', 'EX-M4-C03-010'],
  },
  'maths-puissances.puissances-de-10': { ref: 'M4-C04', capacites: [0, 1], exercises: [] },
  'maths-puissances.grands-et-petits-nombres': {
    ref: 'M4-C04',
    capacites: [0, 1],
    exercises: ['EX-M4-C04-002', 'EX-M4-C04-003'],
  },
  'maths-puissances.notation-scientifique': { ref: 'M4-C04', capacites: [2], exercises: [] },
  'maths-puissances.ecrire-et-ranger': {
    ref: 'M4-C04',
    capacites: [2],
    exercises: ['EX-M4-C04-001', 'EX-M4-C04-005', 'EX-M4-C04-006', 'EX-M4-C04-007'],
  },
  'maths-puissances.puissances-d-un-nombre': { ref: 'M4-C04', capacites: [3], exercises: [] },
  'maths-puissances.calculer-des-puissances': {
    ref: 'M4-C04',
    capacites: [3],
    exercises: ['EX-M4-C04-004', 'EX-M4-C04-010'],
  },
  'maths-puissances.bilan': {
    ref: 'M4-C04',
    capacites: [0, 1, 2, 3],
    exercises: ['EX-M4-C04-008', 'EX-M4-C04-009'],
  },
  'maths-calcul-litteral.reduire-une-expression': { ref: 'M4-C05', capacites: [0], exercises: [] },
  'maths-calcul-litteral.reduire-et-calculer': {
    ref: 'M4-C05',
    capacites: [0],
    exercises: ['EX-M4-C05-002', 'EX-M4-C05-003'],
  },
  'maths-calcul-litteral.developper': { ref: 'M4-C05', capacites: [1], exercises: [] },
  'maths-calcul-litteral.developper-et-reduire': {
    ref: 'M4-C05',
    capacites: [1],
    exercises: ['EX-M4-C05-004', 'EX-M4-C05-005'],
  },
  'maths-calcul-litteral.factoriser': { ref: 'M4-C05', capacites: [2], exercises: [] },
  'maths-calcul-litteral.trouver-le-facteur-commun': {
    ref: 'M4-C05',
    capacites: [1, 2],
    exercises: ['EX-M4-C05-006', 'EX-M4-C05-001'],
  },
  'maths-calcul-litteral.expressions-egales': { ref: 'M4-C05', capacites: [3], exercises: [] },
  'maths-calcul-litteral.programmes-de-calcul': {
    ref: 'M4-C05',
    capacites: [3],
    exercises: ['EX-M4-C05-007', 'EX-M4-C05-008'],
  },
  'maths-calcul-litteral.bilan': {
    ref: 'M4-C05',
    capacites: [0, 1, 2, 3],
    exercises: ['EX-M4-C05-009', 'EX-M4-C05-010'],
  },
  'maths-equations.qu-est-ce-qu-une-equation': { ref: 'M4-C06', capacites: [0], exercises: [] },
  'maths-equations.tester-une-solution': {
    ref: 'M4-C06',
    capacites: [0, 1],
    exercises: ['EX-M4-C06-002', 'EX-M4-C06-003'],
  },
  'maths-equations.isoler-x': { ref: 'M4-C06', capacites: [1], exercises: [] },
  'maths-equations.resoudre-ax-b-c': {
    ref: 'M4-C06',
    capacites: [1, 2],
    exercises: ['EX-M4-C06-004', 'EX-M4-C06-005'],
  },
  'maths-equations.inconnue-deux-cotes': { ref: 'M4-C06', capacites: [1], exercises: [] },
  'maths-equations.resoudre-deux-cotes': {
    ref: 'M4-C06',
    capacites: [1],
    exercises: ['EX-M4-C06-001', 'EX-M4-C06-006'],
  },
  'maths-equations.mise-en-equation': {
    ref: 'M4-C06',
    capacites: [2],
    exercises: ['EX-M4-C06-007', 'EX-M4-C06-008'],
  },
  'maths-equations.bilan': {
    ref: 'M4-C06',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C06-009', 'EX-M4-C06-010'],
  },
  'maths-proportionnalite.graphiques-et-proportionnalite': {
    ref: 'M4-C07',
    capacites: [0, 1],
    exercises: [],
  },
  'maths-proportionnalite.formules-et-proportionnalite': {
    ref: 'M4-C07',
    capacites: [0, 1],
    exercises: ['EX-M4-C07-002', 'EX-M4-C07-007', 'EX-M4-C07-005'],
  },
  'maths-proportionnalite.quatrieme-proportionnelle': {
    ref: 'M4-C07',
    capacites: [2],
    exercises: [],
  },
  'maths-proportionnalite.calculer-quatrieme-proportionnelle': {
    ref: 'M4-C07',
    capacites: [2],
    exercises: ['EX-M4-C07-003', 'EX-M4-C07-004'],
  },
  'maths-proportionnalite.vitesses-debits-et-conversions': {
    ref: 'M4-C07',
    capacites: [3],
    exercises: [],
  },
  'maths-proportionnalite.calculer-et-convertir': {
    ref: 'M4-C07',
    capacites: [3],
    exercises: ['EX-M4-C07-001', 'EX-M4-C07-006', 'EX-M4-C07-009'],
  },
  'maths-proportionnalite.bilan': {
    ref: 'M4-C07',
    capacites: [0, 1, 2, 3],
    exercises: ['EX-M4-C07-008', 'EX-M4-C07-010'],
  },
  'maths-statistiques.representer-des-donnees': { ref: 'M4-C08', capacites: [0], exercises: [] },
  'maths-statistiques.frequences-et-diagrammes': {
    ref: 'M4-C08',
    capacites: [0],
    exercises: ['EX-M4-C08-004', 'EX-M4-C08-006'],
  },
  'maths-statistiques.la-moyenne': { ref: 'M4-C08', capacites: [1], exercises: [] },
  'maths-statistiques.calculer-une-moyenne': {
    ref: 'M4-C08',
    capacites: [1],
    exercises: ['EX-M4-C08-003', 'EX-M4-C08-010'],
  },
  'maths-statistiques.la-mediane': { ref: 'M4-C08', capacites: [2], exercises: [] },
  'maths-statistiques.determiner-une-mediane': {
    ref: 'M4-C08',
    capacites: [2],
    exercises: ['EX-M4-C08-001', 'EX-M4-C08-005', 'EX-M4-C08-008'],
  },
  'maths-statistiques.bilan': {
    ref: 'M4-C08',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C08-002', 'EX-M4-C08-007', 'EX-M4-C08-009'],
  },
  'maths-probabilites.modeliser-une-experience-aleatoire': {
    ref: 'M4-C09',
    capacites: [0],
    exercises: [],
  },
  'maths-probabilites.decrire-une-experience-aleatoire': {
    ref: 'M4-C09',
    capacites: [0],
    exercises: ['EX-M4-C09-003', 'EX-M4-C09-006'],
  },
  'maths-probabilites.calculer-une-probabilite': { ref: 'M4-C09', capacites: [1], exercises: [] },
  'maths-probabilites.tirages-des-et-cartes': {
    ref: 'M4-C09',
    capacites: [1],
    exercises: ['EX-M4-C09-004', 'EX-M4-C09-007', 'EX-M4-C09-002'],
  },
  'maths-probabilites.l-evenement-contraire': { ref: 'M4-C09', capacites: [2], exercises: [] },
  'maths-probabilites.utiliser-l-evenement-contraire': {
    ref: 'M4-C09',
    capacites: [2],
    exercises: ['EX-M4-C09-005', 'EX-M4-C09-008'],
  },
  'maths-probabilites.bilan': {
    ref: 'M4-C09',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C09-001', 'EX-M4-C09-009', 'EX-M4-C09-010'],
  },
  'maths-transformations.symetrie-et-translation': {
    ref: 'M4-C10',
    capacites: [0, 1],
    exercises: [],
  },
  'maths-transformations.transformer-une-figure': {
    ref: 'M4-C10',
    capacites: [0, 1],
    exercises: ['EX-M4-C10-002', 'EX-M4-C10-003', 'EX-M4-C10-004'],
  },
  'maths-transformations.frises-et-pavages': { ref: 'M4-C10', capacites: [1], exercises: [] },
  'maths-transformations.frises-et-parallelogrammes': {
    ref: 'M4-C10',
    capacites: [1],
    exercises: ['EX-M4-C10-008', 'EX-M4-C10-006'],
  },
  'maths-transformations.agrandir-et-reduire': { ref: 'M4-C10', capacites: [2], exercises: [] },
  'maths-transformations.calculer-avec-un-rapport': {
    ref: 'M4-C10',
    capacites: [2],
    exercises: ['EX-M4-C10-005', 'EX-M4-C10-007', 'EX-M4-C10-001'],
  },
  'maths-transformations.bilan': {
    ref: 'M4-C10',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C10-009', 'EX-M4-C10-010'],
  },
  'maths-triangles-quadrilateres.triangles-egaux': { ref: 'M4-C11', capacites: [0], exercises: [] },
  'maths-triangles-quadrilateres.prouver-triangles-egaux': {
    ref: 'M4-C11',
    capacites: [0],
    exercises: ['EX-M4-C11-010', 'EX-M4-C11-008'],
  },
  'maths-triangles-quadrilateres.du-parallelogramme-au-carre': {
    ref: 'M4-C11',
    capacites: [1, 2],
    exercises: [],
  },
  'maths-triangles-quadrilateres.justifier-avec-les-quadrilateres': {
    ref: 'M4-C11',
    capacites: [1, 2],
    exercises: ['EX-M4-C11-004', 'EX-M4-C11-009'],
  },
  'maths-triangles-quadrilateres.bilan': {
    ref: 'M4-C11',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C11-001', 'EX-M4-C11-003'],
  },
  'maths-thales.theoreme-de-thales': { ref: 'M4-C12', capacites: [0], exercises: [] },
  'maths-thales.calculer-une-longueur': {
    ref: 'M4-C12',
    capacites: [0],
    exercises: ['EX-M4-C12-001', 'EX-M4-C12-002', 'EX-M4-C12-003', 'EX-M4-C12-004'],
  },
  'maths-thales.reciproque-de-thales': { ref: 'M4-C12', capacites: [1], exercises: [] },
  'maths-thales.paralleles-ou-pas': {
    ref: 'M4-C12',
    capacites: [1],
    exercises: ['EX-M4-C12-006', 'EX-M4-C12-009'],
  },
  'maths-thales.bilan': {
    ref: 'M4-C12',
    capacites: [0, 1],
    exercises: ['EX-M4-C12-005', 'EX-M4-C12-007', 'EX-M4-C12-008', 'EX-M4-C12-010'],
  },
  'maths-pythagore.theoreme-de-pythagore': { ref: 'M4-C13', capacites: [0], exercises: [] },
  'maths-pythagore.calculer-un-cote': {
    ref: 'M4-C13',
    capacites: [0],
    exercises: ['EX-M4-C13-004', 'EX-M4-C13-005'],
  },
  'maths-pythagore.la-racine-carree': { ref: 'M4-C13', capacites: [1], exercises: [] },
  'maths-pythagore.racines-carrees-entrainement': {
    ref: 'M4-C13',
    capacites: [1],
    exercises: ['EX-M4-C13-003', 'EX-M4-C13-006'],
  },
  'maths-pythagore.reciproque-de-pythagore': { ref: 'M4-C13', capacites: [2], exercises: [] },
  'maths-pythagore.rectangle-ou-pas': {
    ref: 'M4-C13',
    capacites: [0, 2],
    exercises: ['EX-M4-C13-007', 'EX-M4-C13-001'],
  },
  'maths-pythagore.le-cosinus': { ref: 'M4-C13', capacites: [3], exercises: [] },
  'maths-pythagore.calculer-avec-le-cosinus': {
    ref: 'M4-C13',
    capacites: [3],
    exercises: ['EX-M4-C13-002', 'EX-M4-C13-008'],
  },
  'maths-pythagore.bilan': {
    ref: 'M4-C13',
    capacites: [0, 1, 2, 3],
    exercises: ['EX-M4-C13-009', 'EX-M4-C13-010'],
  },
  'maths-espace-solides.pave-droit-et-pyramide': {
    ref: 'M4-C14',
    capacites: [0, 1],
    exercises: [],
  },
  'maths-espace-solides.reperer-et-decrire': {
    ref: 'M4-C14',
    capacites: [0, 1],
    exercises: ['EX-M4-C14-002', 'EX-M4-C14-003'],
  },
  'maths-espace-solides.volume-de-la-pyramide': { ref: 'M4-C14', capacites: [1], exercises: [] },
  'maths-espace-solides.calculer-volume-pyramide': {
    ref: 'M4-C14',
    capacites: [1],
    exercises: ['EX-M4-C14-004', 'EX-M4-C14-001', 'EX-M4-C14-008'],
  },
  'maths-espace-solides.le-cone-de-revolution': { ref: 'M4-C14', capacites: [2], exercises: [] },
  'maths-espace-solides.calculer-avec-le-cone': {
    ref: 'M4-C14',
    capacites: [2],
    exercises: ['EX-M4-C14-005', 'EX-M4-C14-006', 'EX-M4-C14-007'],
  },
  'maths-espace-solides.bilan': {
    ref: 'M4-C14',
    capacites: [0, 1, 2],
    exercises: ['EX-M4-C14-009', 'EX-M4-C14-010'],
  },
};
