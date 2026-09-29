import { city, outlineCity } from './build';
import type { Island } from './types';

/*
 * Île des Maths, 4e, programme 2020 (en vigueur en 4e jusqu'en 2026-2027).
 * Découpage tiré des repères annuels de progression du cycle 4 (Eduscol, BO n° 22 du 29/05/2019) :
 * https://eduscol.education.gouv.fr/sites/default/files/document/26-maths-c4-reperes-eduscol1114756pdf-74694.pdf
 * Hors 4e (donc absents) : double distributivité, rotations et homothéties, sinus et tangente.
 * Seule la ville des Équations est entièrement écrite ; les autres sont esquissées (« Bientôt »).
 */
const REPERES = 'Repères annuels de progression, cycle 4, mathématiques (Eduscol, 2019)';
const source = (theme: string, notion: string) => `${REPERES} · ${theme} · ${notion}`;

const NOMBRES = 'Nombres et calculs';
const DONNEES = 'Organisation et gestion de données, fonctions';
const GRANDEURS = 'Grandeurs et mesures';
const ESPACE = 'Espace et géométrie';
const ALGO = 'Algorithmique et programmation';

export const maths4e2020: Island = {
  subjectId: 'maths',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'maths-nombres',
      name: NOMBRES,
      cities: [
        outlineCity({
          id: 'maths-relatifs',
          name: 'Ville des Relatifs',
          monument: 'balance-signes',
          source: source(NOMBRES, 'produit et quotient de nombres relatifs'),
          lessons: ['Multiplier des relatifs', 'Diviser des relatifs'],
          bilan: 'Bilan des relatifs',
        }),
        outlineCity({
          id: 'maths-fractions',
          name: 'Ville des Fractions',
          monument: 'tartes-fractions',
          source: source(NOMBRES, 'multiplication, division et inverse des fractions'),
          lessons: [
            'Multiplier des fractions',
            "L'inverse d'un nombre",
            'Diviser par une fraction',
          ],
          bilan: 'Bilan des fractions',
        }),
        outlineCity({
          id: 'maths-puissances',
          name: 'Ville des Puissances',
          monument: 'tour-puissances',
          source: source(NOMBRES, 'puissances de 10, notation scientifique, puissances'),
          lessons: ['Les puissances de 10', 'La notation scientifique', "Puissances d'un nombre"],
          bilan: 'Bilan des puissances',
        }),
        outlineCity({
          id: 'maths-premiers-racines',
          name: 'Ville des Nombres premiers',
          monument: 'jardin-carres',
          source: source(NOMBRES, 'nombres premiers inférieurs à 100, racine carrée'),
          lessons: ['Les nombres premiers', 'Simplifier une fraction', 'La racine carrée'],
          bilan: 'Bilan des nombres premiers',
        }),
        outlineCity({
          id: 'maths-calcul-litteral',
          name: 'Ville du Calcul littéral',
          monument: 'atelier-lettres',
          source: source(NOMBRES, 'simple distributivité : développer, factoriser, réduire'),
          lessons: ['Développer', 'Factoriser', 'Réduire une expression'],
          bilan: 'Bilan du calcul littéral',
        }),
        city({
          id: 'maths-equations',
          name: 'Ville des Équations',
          monument: 'balance-equations',
          source: source(NOMBRES, 'résolution d’équations du premier degré'),
          playable: true,
          levels: [
            {
              slug: 'qu-est-ce-qu-une-equation',
              type: 'lecon',
              title: 'Qu’est-ce qu’une équation ?',
              steps: 3,
              objectives: [
                'Je sais ce que sont une inconnue et une solution.',
                'Je reconnais une équation parmi d’autres écritures.',
                'Je traduis une phrase simple par une équation.',
              ],
            },
            {
              slug: 'tester-une-solution',
              type: 'exercices',
              title: 'Tester une solution',
              objectives: [
                'Je remplace l’inconnue par un nombre et je calcule chaque membre.',
                'Je conclus si le nombre est solution ou non.',
              ],
            },
            {
              slug: 'isoler-x',
              type: 'lecon',
              title: 'Isoler x',
              objectives: [
                'Je sais isoler x dans une équation du type ax + b = c.',
                'Je fais la même opération des deux côtés du signe =.',
                'Je vérifie ma solution en la remplaçant dans l’équation.',
              ],
            },
            {
              slug: 'resoudre-ax-b-c',
              type: 'exercices',
              title: 'Résoudre ax + b = c',
              objectives: ['Je résous une équation du type ax + b = c.', 'Je vérifie ma solution.'],
            },
            {
              slug: 'inconnue-deux-cotes',
              type: 'lecon',
              title: 'L’inconnue des deux côtés',
              objectives: [
                'Je regroupe les termes en x d’un même côté.',
                'Je résous une équation du type ax + b = cx + d.',
              ],
            },
            {
              slug: 'resoudre-deux-cotes',
              type: 'exercices',
              title: 'Résoudre avec l’inconnue des deux côtés',
              objectives: [
                'Je résous une équation du type ax + b = cx + d.',
                'Je vérifie ma solution.',
              ],
            },
            {
              slug: 'mise-en-equation',
              type: 'exercices',
              title: 'Mettre un problème en équation',
              steps: 4,
              objectives: [
                'Je choisis l’inconnue et je l’écris clairement.',
                'Je traduis l’énoncé par une équation, puis je la résous.',
                'Je réponds à la question posée par une phrase.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan des équations',
              objectives: [
                'Je résous une équation du type ax + b = c.',
                'Je résous une équation avec l’inconnue des deux côtés.',
                'Je mets un problème en équation et je rédige ma démarche.',
              ],
            },
          ],
        }),
      ],
    },
    {
      id: 'maths-donnees',
      name: 'Données et fonctions',
      cities: [
        outlineCity({
          id: 'maths-proportionnalite',
          name: 'Ville de la Proportionnalité',
          monument: 'moulin-engrenages',
          source: source(DONNEES, 'quatrième proportionnelle, représentation graphique'),
          lessons: [
            'Reconnaître la proportionnalité',
            'Quatrième proportionnelle',
            'Proportionnalité et graphique',
            'Pourcentages',
          ],
          bilan: 'Bilan de la proportionnalité',
        }),
        outlineCity({
          id: 'maths-statistiques',
          name: 'Ville des Statistiques',
          monument: 'tours-barres',
          source: source(DONNEES, 'moyenne, médiane, fréquences'),
          lessons: ['La moyenne', 'La médiane', 'Lire et construire un graphique'],
          bilan: 'Bilan des statistiques',
        }),
        outlineCity({
          id: 'maths-probabilites',
          name: 'Ville des Probabilités',
          monument: 'des-roue',
          source: source(DONNEES, 'probabilités, événement contraire'),
          lessons: ['Calculer une probabilité', 'L’événement contraire'],
          bilan: 'Bilan des probabilités',
        }),
        outlineCity({
          id: 'maths-grandeurs-dependance',
          name: 'Ville des Graphiques',
          monument: 'observatoire-courbes',
          source: source(DONNEES, 'dépendance entre grandeurs : tableaux, formules, graphiques'),
          lessons: ['Lire un tableau et une formule', 'Lire un graphique'],
          bilan: 'Bilan des graphiques',
        }),
      ],
    },
    {
      id: 'maths-grandeurs',
      name: GRANDEURS,
      cities: [
        outlineCity({
          id: 'maths-vitesse',
          name: 'Ville de la Vitesse',
          monument: 'piste-horloge',
          source: source(GRANDEURS, 'grandeurs produits et quotients, vitesse'),
          lessons: ['La vitesse moyenne', 'Convertir des unités'],
          bilan: 'Bilan de la vitesse',
        }),
        outlineCity({
          id: 'maths-volumes',
          name: 'Ville des Volumes',
          monument: 'pyramide-cone',
          source: source(GRANDEURS, 'volume de la pyramide et du cône'),
          lessons: ['Volume de la pyramide', 'Volume du cône'],
          bilan: 'Bilan des volumes',
        }),
        outlineCity({
          id: 'maths-agrandissement',
          name: 'Ville des Maquettes',
          monument: 'loupe-maquettes',
          source: source(GRANDEURS, 'agrandissement et réduction : longueurs, aires, volumes'),
          lessons: ['Agrandir et réduire', 'Effet sur les aires et les volumes'],
          bilan: 'Bilan des maquettes',
        }),
      ],
    },
    {
      id: 'maths-espace',
      name: ESPACE,
      cities: [
        outlineCity({
          id: 'maths-pythagore',
          name: 'Ville de Pythagore',
          monument: 'temple-triangle',
          source: source(ESPACE, 'théorème de Pythagore et sa réciproque'),
          lessons: ['Le théorème de Pythagore', 'Calculer une longueur', 'La réciproque'],
          bilan: 'Bilan de Pythagore',
        }),
        outlineCity({
          id: 'maths-thales',
          name: 'Ville de Thalès',
          monument: 'phare-rayons',
          source: source(ESPACE, 'théorème de Thalès, configuration des triangles emboîtés'),
          lessons: ['Le théorème de Thalès', 'Calculer une longueur', 'La réciproque'],
          bilan: 'Bilan de Thalès',
        }),
        outlineCity({
          id: 'maths-cosinus',
          name: 'Ville du Cosinus',
          monument: 'tour-rapporteur',
          source: source(ESPACE, 'cosinus d’un angle aigu dans un triangle rectangle'),
          lessons: ['Le cosinus d’un angle', 'Calculer une longueur ou un angle'],
          bilan: 'Bilan du cosinus',
        }),
        outlineCity({
          id: 'maths-translations',
          name: 'Ville des Translations',
          monument: 'pont-frise',
          source: source(ESPACE, 'translations, frises et pavages'),
          lessons: ['La translation', 'Frises et pavages'],
          bilan: 'Bilan des translations',
        }),
        outlineCity({
          id: 'maths-triangles-egaux',
          name: 'Ville des Preuves',
          monument: 'tribunal-preuves',
          source: source(ESPACE, 'cas d’égalité des triangles, démonstration'),
          lessons: ['Triangles égaux', 'Rédiger une démonstration'],
          bilan: 'Bilan des preuves',
        }),
        outlineCity({
          id: 'maths-espace-solides',
          name: 'Ville des Solides',
          monument: 'cristaux-solides',
          source: source(ESPACE, 'repérage dans un pavé droit, pyramides et cônes'),
          lessons: ['Se repérer dans un pavé droit', 'Pyramides et cônes'],
          bilan: 'Bilan des solides',
        }),
      ],
    },
    {
      id: 'maths-algo',
      name: ALGO,
      cities: [
        outlineCity({
          id: 'maths-boucles',
          name: 'Ville des Boucles',
          monument: 'usine-blocs',
          source: source(ALGO, 'boucles et instructions conditionnelles'),
          lessons: ['Répéter une action', 'Si… alors… sinon'],
          bilan: 'Bilan des boucles',
        }),
        outlineCity({
          id: 'maths-variables',
          name: 'Ville des Variables',
          monument: 'tableau-bord',
          source: source(ALGO, 'variables et programmes déclenchés par des événements'),
          lessons: ['Les variables', 'Les événements'],
          bilan: 'Bilan des variables',
        }),
        outlineCity({
          id: 'maths-programmes-calcul',
          name: 'Ville des Programmes',
          monument: 'robot-calcul',
          source: source(ALGO, 'programmes de calcul et simulations'),
          lessons: ['Programme de calcul', 'Simuler une expérience'],
          bilan: 'Bilan des programmes',
        }),
      ],
    },
  ],
};
