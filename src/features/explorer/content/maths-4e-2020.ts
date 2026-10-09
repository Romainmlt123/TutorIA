import { city } from './build';
import type { Island } from './types';

/*
 * Île des Maths, 4e, programme 2020 (en vigueur en 4e jusqu'en 2026-2027), tirée du référentiel
 * de Romain (server/content/maths-4e-2020/referentiel.json, schéma 0.2, pilote v0.6).
 * Région = domaine, ville = chapitre (dans l'ordre du référentiel), niveaux bâtis sur les
 * capacités du chapitre. Les exercices et leurs corrigés restent côté serveur
 * (server/content/maths-4e-2020/bank.ts) : ce fichier n'en contient aucun.
 * Toutes les villes sont jouables pour éprouver l'île à l'échelle réelle, mais le contenu est généré
 * par IA et n'a pas été relu par un enseignant : à faire relire avant toute publication.
 * Fichier généré une fois depuis le référentiel, puis tenu à la main.
 */
const REFERENTIEL = 'Référentiel de mathématiques de 4e (programme 2020)';

export const maths4e2020: Island = {
  subjectId: 'maths',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'maths-nombres',
      name: 'Nombres et calculs',
      cities: [
        city({
          id: 'maths-relatifs',
          ref: 'M4-C01',
          name: 'Ville des Relatifs',
          monument: 'balance-signes',
          source: `${REFERENTIEL} · M4-C01 · Nombres relatifs`,
          playable: true,
          recall: 'Tu sais déjà additionner et soustraire des nombres relatifs.',
          levels: [
            {
              slug: 'additionner-et-soustraire',
              type: 'lecon',
              title: 'Additionner et soustraire des relatifs',
              objectives: [
                'Je sais additionner deux nombres relatifs.',
                'Je transforme une soustraction en addition de l’opposé.',
                'Je calcule une suite d’additions et de soustractions de relatifs.',
              ],
            },
            {
              slug: 'sommes-et-differences',
              type: 'exercices',
              title: 'Sommes et différences de relatifs',
              objectives: [
                'Je calcule des sommes et des différences de relatifs.',
                'Je résous un problème de températures avec des hausses et des baisses.',
              ],
            },
            {
              slug: 'multiplier-des-relatifs',
              type: 'lecon',
              title: 'Multiplier des relatifs',
              objectives: [
                'Je connais la règle des signes pour le produit de deux relatifs.',
                'Je trouve le signe d’un produit en comptant ses facteurs négatifs.',
                'Je calcule un produit de nombres décimaux relatifs.',
              ],
            },
            {
              slug: 'calculer-des-produits',
              type: 'exercices',
              title: 'Calculer des produits de relatifs',
              objectives: [
                'Je calcule des produits de relatifs sans erreur de signe.',
                'Je donne le signe d’un produit de plusieurs facteurs avant de le calculer.',
              ],
            },
            {
              slug: 'diviser-des-relatifs',
              type: 'lecon',
              title: 'Diviser des relatifs',
              objectives: [
                'Je sais que le quotient suit la même règle des signes que le produit.',
                'Je calcule le quotient de deux nombres relatifs.',
                'Je vérifie un quotient en le multipliant par le diviseur.',
              ],
            },
            {
              slug: 'produits-et-quotients',
              type: 'exercices',
              title: 'Produits et quotients de relatifs',
              objectives: [
                'Je calcule des quotients de relatifs sans erreur de signe.',
                'Je trouve le nombre manquant dans un produit ou un quotient.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les relatifs',
              objectives: [
                'Je calcule des sommes, des produits et des quotients de relatifs.',
                'J’enchaîne les calculs en respectant les priorités opératoires.',
                'Je justifie le signe d’un résultat.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-fractions',
          ref: 'M4-C02',
          name: 'Ville des Fractions',
          monument: 'tartes-fractions',
          source: `${REFERENTIEL} · M4-C02 · Nombres rationnels : addition, soustraction, comparaison`,
          playable: true,
          requires: ['maths-relatifs'],
          levels: [
            {
              slug: 'diviseurs-et-nombres-premiers',
              type: 'lecon',
              title: 'Diviseurs et nombres premiers',
              objectives: [
                'Je trouve les diviseurs et des multiples d’un nombre entier.',
                'Je reconnais les nombres premiers inférieurs à 100.',
                'Je décompose un entier en produit de facteurs premiers.',
              ],
            },
            {
              slug: 'facteurs-premiers',
              type: 'exercices',
              title: 'Décomposer en facteurs premiers',
              objectives: [
                'Je justifie qu’un nombre est premier ou non.',
                'Je décompose un nombre en produit de facteurs premiers.',
                'J’utilise les diviseurs communs pour résoudre un problème de partage.',
              ],
            },
            {
              slug: 'fractions-egales',
              type: 'lecon',
              title: 'Décimaux, rationnels et fractions égales',
              objectives: [
                'Je reconnais un nombre rationnel qui n’est pas décimal, comme 1/3.',
                'Je reconnais des fractions égales.',
                'Je simplifie une fraction grâce aux facteurs premiers.',
              ],
            },
            {
              slug: 'simplifier-des-fractions',
              type: 'exercices',
              title: 'Simplifier des fractions',
              objectives: [
                'Je donne l’écriture décimale d’une fraction quand elle existe.',
                'Je complète des fractions égales et je les simplifie.',
                'Je rends une fraction irréductible grâce aux décompositions.',
              ],
            },
            {
              slug: 'comparer-et-additionner',
              type: 'lecon',
              title: 'Comparer et additionner des fractions',
              objectives: [
                'Je mets deux fractions au même dénominateur.',
                'Je compare deux fractions, même négatives.',
                'J’additionne et je soustrais des fractions.',
              ],
            },
            {
              slug: 'ranger-et-calculer',
              type: 'exercices',
              title: 'Ranger et calculer avec des fractions',
              objectives: [
                'Je compare des fractions et des décimaux avec < ou >.',
                'Je calcule une somme ou une différence de fractions, puis je simplifie.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les fractions',
              objectives: [
                'Je décompose un nombre et je simplifie une fraction.',
                'Je compare, j’additionne et je soustrais des fractions.',
                'Je résous un problème avec des fractions.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-fractions-produits',
          ref: 'M4-C03',
          name: 'Ville des Produits de fractions',
          monument: 'moulin-fractions',
          source: `${REFERENTIEL} · M4-C03 · Nombres rationnels : multiplication et division`,
          playable: true,
          requires: ['maths-fractions'],
          levels: [
            {
              slug: 'multiplier-des-fractions',
              type: 'lecon',
              title: 'Multiplier des fractions',
              objectives: [
                'Je multiplie les numérateurs entre eux et les dénominateurs entre eux.',
                'Je simplifie avant de multiplier quand c’est possible.',
                'Je calcule une fraction d’un nombre, comme les 3/4 de 20.',
              ],
            },
            {
              slug: 'produits-de-fractions',
              type: 'exercices',
              title: 'Produits et fractions d’un nombre',
              objectives: [
                'Je calcule un produit de fractions et je simplifie le résultat.',
                'Je calcule une fraction d’une quantité dans un problème.',
              ],
            },
            {
              slug: 'inverse-et-division',
              type: 'lecon',
              title: 'L’inverse pour diviser',
              objectives: [
                'Je donne l’inverse d’un nombre non nul.',
                'Je sais que diviser par un nombre revient à multiplier par son inverse.',
                'Je divise un nombre ou une fraction par une fraction.',
              ],
            },
            {
              slug: 'diviser-par-une-fraction',
              type: 'exercices',
              title: 'Diviser par une fraction',
              objectives: [
                'Je trouve l’inverse d’un entier, d’une fraction ou d’un décimal.',
                'Je calcule un quotient de fractions et je simplifie le résultat.',
                'Je trouve combien de fois une fraction tient dans une autre.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : produits et quotients de fractions',
              objectives: [
                'Je multiplie et je divise des fractions, puis je simplifie.',
                'J’enchaîne les opérations sur les fractions en respectant les priorités.',
                'Je résous un problème avec des fractions d’une quantité.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-puissances',
          ref: 'M4-C04',
          name: 'Ville des Puissances',
          monument: 'tour-puissances',
          source: `${REFERENTIEL} · M4-C04 · Puissances`,
          playable: true,
          recall: 'Tu sais déjà que 100 = 10 × 10 et 1 000 = 10 × 10 × 10.',
          levels: [
            {
              slug: 'puissances-de-10',
              type: 'lecon',
              title: 'Les puissances de 10',
              objectives: [
                'J’écris 1 000 ou 1 000 000 sous la forme d’une puissance de 10.',
                'J’écris 0,1 ou 0,001 avec une puissance de 10 d’exposant négatif.',
                'Je donne l’écriture décimale d’une puissance de 10.',
              ],
            },
            {
              slug: 'grands-et-petits-nombres',
              type: 'exercices',
              title: 'Grands et petits nombres',
              objectives: [
                'Je passe d’une puissance de 10 à son écriture décimale, et inversement.',
                'J’écris un produit comme 100 × 1 000 sous la forme d’une puissance de 10.',
              ],
            },
            {
              slug: 'notation-scientifique',
              type: 'lecon',
              title: 'La notation scientifique',
              objectives: [
                'Je reconnais un nombre écrit en notation scientifique.',
                'J’écris un nombre décimal en notation scientifique.',
                'J’estime un ordre de grandeur grâce à la notation scientifique.',
              ],
            },
            {
              slug: 'ecrire-et-ranger',
              type: 'exercices',
              title: 'Écrire et ranger en notation scientifique',
              objectives: [
                'J’écris de très grands et de très petits nombres en notation scientifique.',
                'Je convertis une mesure avec les préfixes de nano à giga.',
                'Je range des nombres écrits avec des puissances de 10.',
              ],
            },
            {
              slug: 'puissances-d-un-nombre',
              type: 'lecon',
              title: 'Puissances d’un nombre',
              objectives: [
                'J’écris un produit de facteurs égaux sous la forme d’une puissance.',
                'Je lis une puissance : 2 puissance 5, c’est 2 × 2 × 2 × 2 × 2.',
                'Je calcule une puissance d’un nombre, avec ou sans calculatrice.',
              ],
            },
            {
              slug: 'calculer-des-puissances',
              type: 'exercices',
              title: 'Calculer avec des puissances',
              objectives: [
                'J’écris un produit de facteurs égaux à l’aide de puissances.',
                'Je calcule et je compare des puissances simples.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les puissances',
              objectives: [
                'Je passe d’une écriture décimale à la notation scientifique.',
                'Je calcule avec des puissances de 10 dans une situation réelle.',
                'J’estime et je compare des ordres de grandeur.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-calcul-litteral',
          ref: 'M4-C05',
          name: 'Ville du Calcul littéral',
          monument: 'atelier-lettres',
          source: `${REFERENTIEL} · M4-C05 · Calcul littéral`,
          playable: true,
          requires: ['maths-relatifs'],
          levels: [
            {
              slug: 'reduire-une-expression',
              type: 'lecon',
              title: 'Réduire une expression',
              objectives: [
                'Je reconnais si une expression est une somme ou un produit.',
                'Je supprime le signe × quand c’est possible, comme 3 × x = 3x.',
                'Je réduis une expression en regroupant les termes semblables.',
              ],
            },
            {
              slug: 'reduire-et-calculer',
              type: 'exercices',
              title: 'Réduire et calculer',
              objectives: [
                'Je réduis une expression comme 4x + 7 + 2x - 3.',
                'Je calcule une expression pour une valeur donnée de x.',
              ],
            },
            {
              slug: 'developper',
              type: 'lecon',
              title: 'Développer un produit',
              objectives: [
                'Je développe k(a + b) et k(a - b) avec la distributivité simple.',
                'Je fais attention aux signes quand le facteur est négatif.',
                'Je développe puis je réduis l’expression obtenue.',
              ],
            },
            {
              slug: 'developper-et-reduire',
              type: 'exercices',
              title: 'Développer et réduire',
              objectives: [
                'Je développe une expression comme -3(x - 2).',
                'Je développe puis je réduis une expression.',
              ],
            },
            {
              slug: 'factoriser',
              type: 'lecon',
              title: 'Factoriser une expression',
              objectives: [
                'Je repère un facteur commun à tous les termes.',
                'Je factorise une somme, comme 6x + 9 = 3(2x + 3).',
                'Je vérifie ma factorisation en développant.',
              ],
            },
            {
              slug: 'trouver-le-facteur-commun',
              type: 'exercices',
              title: 'Trouver le facteur commun',
              objectives: [
                'Je factorise une somme ou une différence.',
                'Je choisis le plus grand facteur commun, même quand c’est un x.',
              ],
            },
            {
              slug: 'expressions-egales',
              type: 'lecon',
              title: 'Des expressions toujours égales',
              objectives: [
                'Je sais qu’un exemple ne suffit pas à prouver une égalité.',
                'Je prouve que deux expressions sont égales en les développant et en les réduisant.',
                'J’utilise un contre-exemple pour montrer qu’une égalité est fausse.',
              ],
            },
            {
              slug: 'programmes-de-calcul',
              type: 'exercices',
              title: 'Comparer des programmes de calcul',
              objectives: [
                'Je traduis un programme de calcul par une expression littérale.',
                'Je démontre que deux programmes donnent toujours le même résultat.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : le calcul littéral',
              objectives: [
                'Je réduis, je développe et je factorise une expression.',
                'Je démontre que deux programmes de calcul sont équivalents.',
                'Je traduis un problème par une expression littérale et je la calcule pour une valeur donnée.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-equations',
          ref: 'M4-C06',
          name: 'Ville des Équations',
          monument: 'balance-equations',
          source: `${REFERENTIEL} · M4-C06 · Équations`,
          playable: true,
          requires: ['maths-calcul-litteral'],
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
        city({
          id: 'maths-proportionnalite',
          ref: 'M4-C07',
          name: 'Ville de la Proportionnalité',
          monument: 'moulin-engrenages',
          source: `${REFERENTIEL} · M4-C07 · Proportionnalité et grandeurs`,
          playable: true,
          requires: ['maths-fractions-produits'],
          levels: [
            {
              slug: 'graphiques-et-proportionnalite',
              type: 'lecon',
              title: 'Formules, graphiques et proportionnalité',
              objectives: [
                'Je traduis le lien entre deux grandeurs par un tableau, une formule ou un graphique, et je lis ce graphique.',
                'Je reconnais un tableau de proportionnalité et je donne son coefficient.',
                'Je reconnais sur un graphique une situation de proportionnalité : des points alignés avec l’origine.',
              ],
            },
            {
              slug: 'formules-et-proportionnalite',
              type: 'exercices',
              title: 'Formules et proportionnalité',
              objectives: [
                'Je calcule les quotients d’un tableau pour dire s’il est proportionnel.',
                'Je place des points dans un repère et je dis, en justifiant, si la situation est proportionnelle.',
                'J’utilise une formule qui relie deux grandeurs pour calculer l’une d’elles.',
              ],
            },
            {
              slug: 'quatrieme-proportionnelle',
              type: 'lecon',
              title: 'La quatrième proportionnelle',
              objectives: [
                'Je calcule une quatrième proportionnelle par passage à l’unité ou avec le coefficient.',
                'J’utilise les produits en croix pour calculer une valeur manquante.',
                'Je calcule avec une échelle ou un coefficient d’agrandissement.',
              ],
            },
            {
              slug: 'calculer-quatrieme-proportionnelle',
              type: 'exercices',
              title: 'Calculer une quatrième proportionnelle',
              objectives: [
                'Je calcule un prix ou une quantité dans une situation de proportionnalité.',
                'Je passe d’une distance sur la carte à la distance réelle avec l’échelle, et inversement.',
              ],
            },
            {
              slug: 'vitesses-debits-et-conversions',
              type: 'lecon',
              title: 'Vitesses, débits et conversions',
              objectives: [
                'Je calcule une distance, une durée ou une vitesse avec d = v × t.',
                'Je reconnais une grandeur quotient (km/h, L/min) et une grandeur produit (kWh).',
                'Je convertis une grandeur composée, par exemple des km/h en m/s.',
              ],
            },
            {
              slug: 'calculer-et-convertir',
              type: 'exercices',
              title: 'Calculer et convertir des grandeurs',
              objectives: [
                'Je calcule une distance ou une durée à vitesse constante.',
                'Je calcule un temps de remplissage à partir d’un débit.',
                'Je convertis une vitesse ou un débit dans une autre unité.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : la proportionnalité',
              objectives: [
                'Je calcule une grandeur à l’aide d’une formule qui la relie à une autre.',
                'Je reconnais la proportionnalité et je calcule une quatrième proportionnelle.',
                'Je calcule avec des grandeurs produits et quotients, comme des kWh ou des km/h, et je convertis leurs unités.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-statistiques',
          ref: 'M4-C08',
          name: 'Ville des Statistiques',
          monument: 'tours-barres',
          source: `${REFERENTIEL} · M4-C08 · Statistiques`,
          playable: true,
          recall: 'Tu sais lire un tableau ou un diagramme et calculer une moyenne simple.',
          levels: [
            {
              slug: 'representer-des-donnees',
              type: 'lecon',
              title: 'Représenter des données',
              objectives: [
                'Je calcule la fréquence d’une valeur, en fraction ou en pourcentage.',
                'Je calcule l’angle de chaque secteur d’un diagramme circulaire.',
                'Je construis un diagramme circulaire et je l’interprète.',
              ],
            },
            {
              slug: 'frequences-et-diagrammes',
              type: 'exercices',
              title: 'Fréquences et diagrammes circulaires',
              objectives: [
                'Je calcule la fréquence de chaque valeur en pourcentage.',
                'Je calcule les angles d’un diagramme circulaire et je vérifie que leur somme vaut 360°.',
              ],
            },
            {
              slug: 'la-moyenne',
              type: 'lecon',
              title: 'La moyenne',
              objectives: [
                'Je calcule la moyenne d’une série de valeurs.',
                'Je calcule une moyenne pondérée, par exemple avec des coefficients.',
                'Je vérifie que la moyenne est comprise entre la plus petite et la plus grande valeur.',
              ],
            },
            {
              slug: 'calculer-une-moyenne',
              type: 'exercices',
              title: 'Calculer une moyenne',
              objectives: [
                'Je calcule une moyenne simple.',
                'Je calcule une moyenne avec des coefficients, comme sur un bulletin.',
                'Je cherche la note à obtenir pour atteindre une moyenne donnée.',
              ],
            },
            {
              slug: 'la-mediane',
              type: 'lecon',
              title: 'La médiane',
              objectives: [
                'Je range la série, puis je détermine sa médiane, à partir d’une liste ou d’un tableau d’effectifs, que l’effectif soit pair ou impair.',
                'J’interprète la médiane : au moins la moitié des valeurs lui sont inférieures ou égales.',
                'Je compare moyenne et médiane et j’explique l’effet d’une valeur extrême.',
              ],
            },
            {
              slug: 'determiner-une-mediane',
              type: 'exercices',
              title: 'Déterminer une médiane',
              objectives: [
                'Je détermine la médiane d’une série, que le nombre de valeurs soit pair ou impair.',
                'J’interprète la médiane d’une série en une phrase.',
                'Je compare la moyenne et la médiane de deux séries.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les statistiques',
              objectives: [
                'Je calcule des fréquences et les angles d’un diagramme circulaire à partir des effectifs.',
                'Je calcule une moyenne pondérée et une médiane à partir d’un tableau d’effectifs.',
                'Je compare moyenne et médiane pour décrire une série.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-probabilites',
          ref: 'M4-C09',
          name: 'Ville des Probabilités',
          monument: 'des-roue',
          source: `${REFERENTIEL} · M4-C09 · Probabilités`,
          playable: true,
          recall: 'Tu sais reconnaître une expérience aléatoire et citer ses issues.',
          levels: [
            {
              slug: 'modeliser-une-experience-aleatoire',
              type: 'lecon',
              title: 'Modéliser une expérience aléatoire',
              objectives: [
                'Je liste toutes les issues d’une expérience aléatoire.',
                'Je reconnais un événement impossible et un événement certain.',
                'Je sais qu’une probabilité est un nombre entre 0 et 1, en fraction, en décimal ou en pourcentage.',
              ],
            },
            {
              slug: 'decrire-une-experience-aleatoire',
              type: 'exercices',
              title: 'Décrire une expérience aléatoire',
              objectives: [
                'Je donne les issues d’une expérience, un événement impossible et un événement certain.',
                'Je note une probabilité en fraction, en décimal et en pourcentage.',
                'Je justifie qu’un nombre ne peut pas être une probabilité.',
              ],
            },
            {
              slug: 'calculer-une-probabilite',
              type: 'lecon',
              title: 'Calculer une probabilité',
              objectives: [
                'Je reconnais une situation où toutes les issues ont la même probabilité.',
                'Je divise le nombre d’issues favorables par le nombre d’issues possibles quand elles sont équiprobables.',
                'Je calcule la probabilité d’un événement en additionnant celles de ses issues, dont le total vaut 1.',
              ],
            },
            {
              slug: 'tirages-des-et-cartes',
              type: 'exercices',
              title: 'Tirages, dés et cartes',
              objectives: [
                'Je calcule la probabilité de tirer une boule ou une carte au hasard.',
                'Je calcule la probabilité d’un événement formé de plusieurs issues.',
                'Je trouve une probabilité manquante quand les issues ne sont pas équiprobables.',
              ],
            },
            {
              slug: 'l-evenement-contraire',
              type: 'lecon',
              title: 'L’événement contraire',
              objectives: [
                'Je décris par une phrase l’événement contraire d’un événement.',
                'Je calcule la probabilité de l’événement contraire : 1 moins celle de l’événement.',
              ],
            },
            {
              slug: 'utiliser-l-evenement-contraire',
              type: 'exercices',
              title: 'Utiliser l’événement contraire',
              objectives: [
                'Je calcule la probabilité d’un événement contraire, en fraction, en décimal ou en pourcentage.',
                'Je me sers de l’événement contraire pour éviter de tout recompter.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les probabilités',
              objectives: [
                'Je modélise une expérience aléatoire, comme un tirage ou une cible.',
                'Je calcule la probabilité d’un événement, que les issues soient équiprobables ou non.',
                'Je me sers de l’événement contraire et de la somme des probabilités égale à 1.',
              ],
            },
          ],
        }),
      ],
    },
    {
      id: 'maths-espace',
      name: 'Espace et géométrie',
      cities: [
        city({
          id: 'maths-transformations',
          ref: 'M4-C10',
          name: 'Ville des Transformations',
          monument: 'palais-mosaiques',
          source: `${REFERENTIEL} · M4-C10 · Construction et transformation de figures`,
          playable: true,
          requires: ['maths-proportionnalite'],
          recall:
            'Tu sais déjà construire le symétrique d’une figure par symétrie axiale ou centrale.',
          levels: [
            {
              slug: 'symetrie-et-translation',
              type: 'lecon',
              title: 'Symétrie et translation',
              objectives: [
                'Je révise comment construire le symétrique d’une figure, vu en 5e.',
                'Je sais qu’une translation fait glisser une figure, sans la tourner ni la retourner.',
                'Je sais que ces transformations conservent les longueurs, les angles et les aires.',
              ],
            },
            {
              slug: 'transformer-une-figure',
              type: 'exercices',
              title: 'Transformer une figure',
              objectives: [
                'Je trouve l’image d’un point par une symétrie ou une translation dans un repère.',
                'Je donne les longueurs, les angles et l’aire de l’image sans les mesurer.',
                'Je sais que l’image d’une droite par une translation lui est parallèle.',
              ],
            },
            {
              slug: 'frises-et-pavages',
              type: 'lecon',
              title: 'Frises et pavages',
              objectives: [
                'Je repère la translation qui fait passer d’un motif à un autre dans une frise ou un pavage.',
                'Je décris une translation en disant de combien et dans quel sens on fait glisser la figure.',
                'Je sais que si une translation transforme A en B et C en D, alors ABDC est un parallélogramme (quand C n’est pas sur la droite (AB)).',
              ],
            },
            {
              slug: 'frises-et-parallelogrammes',
              type: 'exercices',
              title: 'Frises et parallélogrammes',
              objectives: [
                'Je trouve la translation qui transforme un motif d’une frise en un autre.',
                'Je prouve qu’un quadrilatère est un parallélogramme grâce à une translation.',
              ],
            },
            {
              slug: 'agrandir-et-reduire',
              type: 'lecon',
              title: 'Agrandir et réduire',
              objectives: [
                'Je sais qu’un agrandissement ou une réduction de rapport k multiplie toutes les longueurs par k.',
                'Je sais que les aires sont multipliées par k² et les volumes par k³.',
                'Je construis l’agrandissement ou la réduction d’une figure simple.',
              ],
            },
            {
              slug: 'calculer-avec-un-rapport',
              type: 'exercices',
              title: 'Calculer avec un rapport k',
              objectives: [
                'Je calcule des longueurs, des aires et des volumes avec un rapport k.',
                'Je me sers d’une échelle pour passer de l’objet réel à sa maquette.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les transformations',
              objectives: [
                'Je transforme une figure par symétrie ou par translation, et je dis ce qui est conservé.',
                'Je repère des translations dans une frise ou un pavage.',
                'Je calcule des longueurs, des aires et des volumes après un agrandissement ou une réduction.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-triangles-quadrilateres',
          ref: 'M4-C11',
          name: 'Ville des Triangles et Quadrilatères',
          monument: 'vitrail-losanges',
          source: `${REFERENTIEL} · M4-C11 · Triangles et quadrilatères`,
          playable: true,
          recall:
            'Tu sais déjà construire un triangle et utiliser les propriétés du parallélogramme.',
          levels: [
            {
              slug: 'triangles-egaux',
              type: 'lecon',
              title: 'Des triangles égaux',
              objectives: [
                'Je sais que deux triangles égaux ont leurs côtés et leurs angles égaux deux à deux.',
                'Je connais les trois cas d’égalité des triangles.',
                'Je choisis le bon cas d’égalité selon les mesures connues.',
              ],
            },
            {
              slug: 'prouver-triangles-egaux',
              type: 'exercices',
              title: 'Prouver que des triangles sont égaux',
              objectives: [
                'Je repère les côtés et les angles égaux deux à deux dans deux triangles.',
                'Je démontre que deux triangles sont égaux avec un cas d’égalité.',
                'Je déduis de deux triangles égaux des angles ou des longueurs égales.',
              ],
            },
            {
              slug: 'du-parallelogramme-au-carre',
              type: 'lecon',
              title: 'Du parallélogramme au carré',
              objectives: [
                'Je connais les propriétés du parallélogramme : côtés, angles et diagonales.',
                'Je reconnais un rectangle, un losange ou un carré grâce à ses diagonales ou à ses angles.',
                'Je cite la propriété qui justifie la nature d’un quadrilatère.',
              ],
            },
            {
              slug: 'justifier-avec-les-quadrilateres',
              type: 'exercices',
              title: 'Justifier avec les quadrilatères',
              objectives: [
                'Je déduis des longueurs et des angles d’un parallélogramme en justifiant.',
                'Je démontre qu’un quadrilatère est un parallélogramme grâce à ses diagonales.',
                'Je reconnais un losange, un rectangle ou un carré et je justifie avec ses propriétés.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : triangles et quadrilatères',
              objectives: [
                'Je prouve que deux triangles sont égaux avec un cas d’égalité.',
                'Je calcule et je justifie avec les propriétés du parallélogramme.',
                'Je reconnais un rectangle, un losange ou un carré, et je le justifie.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-thales',
          ref: 'M4-C12',
          name: 'Ville de Thalès',
          monument: 'phare-rayons',
          source: `${REFERENTIEL} · M4-C12 · Théorème de Thalès`,
          playable: true,
          requires: ['maths-proportionnalite', 'maths-transformations'],
          levels: [
            {
              slug: 'theoreme-de-thales',
              type: 'lecon',
              title: 'Le théorème de Thalès',
              objectives: [
                'Je reconnais la configuration de Thalès : deux triangles emboîtés avec deux côtés parallèles.',
                'Je sais écrire les trois rapports égaux dans le bon ordre.',
                'Je sais que les longueurs du petit triangle sont proportionnelles à celles du grand.',
              ],
            },
            {
              slug: 'calculer-une-longueur',
              type: 'exercices',
              title: 'Calculer une longueur avec Thalès',
              objectives: [
                'Je repère les longueurs connues et je choisis la bonne égalité de rapports.',
                'Je calcule une longueur manquante avec un produit en croix.',
                'Je rédige mon calcul en citant le théorème de Thalès.',
              ],
            },
            {
              slug: 'reciproque-de-thales',
              type: 'lecon',
              title: 'La réciproque de Thalès',
              objectives: [
                'Je sais quelles longueurs comparer pour utiliser la réciproque, avec M sur [AB] et N sur [AC].',
                'Je compare les rapports AM/AB et AN/AC pour savoir si deux droites sont parallèles.',
                'Je sais conclure : rapports égaux, droites parallèles ; rapports différents, droites non parallèles.',
              ],
            },
            {
              slug: 'paralleles-ou-pas',
              type: 'exercices',
              title: 'Parallèles ou pas ?',
              objectives: [
                'Je calcule et je compare deux rapports de longueurs.',
                'Je conclus : parallèles avec la réciproque, non parallèles quand les rapports sont différents.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : le théorème de Thalès',
              objectives: [
                'Je calcule une longueur avec le théorème de Thalès et je rédige ma démarche.',
                'Je montre que deux droites sont parallèles, ou non, avec les rapports de longueurs.',
                'Je résous un problème concret avec le théorème de Thalès.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-pythagore',
          ref: 'M4-C13',
          name: 'Ville de Pythagore',
          monument: 'temple-triangle',
          source: `${REFERENTIEL} · M4-C13 · Triangles rectangles`,
          playable: true,
          requires: ['maths-puissances', 'maths-proportionnalite'],
          levels: [
            {
              slug: 'theoreme-de-pythagore',
              type: 'lecon',
              title: 'Le théorème de Pythagore',
              objectives: [
                'Je repère l’hypoténuse : le côté opposé à l’angle droit, le plus long.',
                'Je sais écrire l’égalité de Pythagore dans un triangle rectangle.',
                'Je sais que ce théorème sert seulement dans un triangle rectangle.',
              ],
            },
            {
              slug: 'calculer-un-cote',
              type: 'exercices',
              title: 'Calculer un côté avec Pythagore',
              objectives: [
                'Je calcule la longueur de l’hypoténuse.',
                'Je calcule la longueur d’un côté de l’angle droit.',
                'Je rédige mon calcul en citant le théorème.',
              ],
            },
            {
              slug: 'la-racine-carree',
              type: 'lecon',
              title: 'La racine carrée',
              objectives: [
                'Je connais les carrés parfaits de 1 à 144.',
                'Je sais que √a est le nombre positif dont le carré vaut a.',
                'Je sais encadrer une racine carrée entre deux entiers consécutifs.',
              ],
            },
            {
              slug: 'racines-carrees-entrainement',
              type: 'exercices',
              title: 'S’entraîner avec les racines carrées',
              objectives: [
                'Je calcule √49 ou √144 de tête, grâce aux carrés parfaits.',
                'Je donne une valeur exacte, puis une valeur approchée à la calculatrice.',
                'Je place une racine carrée entre deux entiers, sans calculatrice.',
              ],
            },
            {
              slug: 'reciproque-de-pythagore',
              type: 'lecon',
              title: 'La réciproque de Pythagore',
              objectives: [
                'Je compare le carré du plus grand côté à la somme des carrés des deux autres.',
                'Je sais utiliser la réciproque pour prouver qu’un triangle est rectangle.',
                'Je sais conclure qu’un triangle n’est pas rectangle quand les deux résultats diffèrent.',
              ],
            },
            {
              slug: 'rectangle-ou-pas',
              type: 'exercices',
              title: 'Rectangle ou pas ?',
              objectives: [
                'Je calcule séparément le carré du plus grand côté et la somme des deux autres carrés.',
                'Je rédige ma conclusion : rectangle ou non, en justifiant.',
              ],
            },
            {
              slug: 'le-cosinus',
              type: 'lecon',
              title: 'Le cosinus d’un angle',
              objectives: [
                'Je repère, pour un angle aigu, le côté adjacent et l’hypoténuse.',
                'Je sais que, dans un triangle rectangle, cosinus = côté adjacent ÷ hypoténuse.',
                'Je passe d’un angle à son cosinus, et inversement, avec la calculatrice en mode degrés.',
              ],
            },
            {
              slug: 'calculer-avec-le-cosinus',
              type: 'exercices',
              title: 'Calculer avec le cosinus',
              objectives: [
                'Je calcule la mesure d’un angle aigu à partir de deux longueurs.',
                'Je calcule une longueur à partir d’un angle et d’une longueur.',
                'Je donne un arrondi au degré ou au dixième, comme demandé.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les triangles rectangles',
              objectives: [
                'Je calcule une longueur avec le théorème de Pythagore.',
                'Je prouve qu’un triangle est rectangle, ou non, avec la réciproque.',
                'Je calcule un angle ou une longueur avec le cosinus.',
              ],
            },
          ],
        }),
        city({
          id: 'maths-espace-solides',
          ref: 'M4-C14',
          name: 'Ville des Solides',
          monument: 'cristaux-solides',
          source: `${REFERENTIEL} · M4-C14 · Solides de l'espace`,
          playable: true,
          recall: 'Tu connais déjà les prismes droits et les cylindres.',
          levels: [
            {
              slug: 'pave-droit-et-pyramide',
              type: 'lecon',
              title: 'Le pavé droit et la pyramide',
              objectives: [
                'Je repère un point d’un pavé droit par son abscisse, son ordonnée et son altitude.',
                'Je décris une pyramide : son sommet, sa base, ses faces latérales et ses arêtes.',
                'Je relie une pyramide dessinée en perspective cavalière à son patron.',
              ],
            },
            {
              slug: 'reperer-et-decrire',
              type: 'exercices',
              title: 'Repérer et décrire un solide',
              objectives: [
                'Je donne les coordonnées des sommets d’un pavé droit.',
                'Je compte les faces, les arêtes et les sommets d’une pyramide.',
                'Je décris les figures qui forment le patron d’une pyramide.',
              ],
            },
            {
              slug: 'volume-de-la-pyramide',
              type: 'lecon',
              title: 'Le volume d’une pyramide',
              objectives: [
                'Je sais que le volume d’une pyramide vaut aire de la base × hauteur ÷ 3.',
                'Je calcule l’aire de la base avant de calculer le volume.',
                'Je donne le volume avec la bonne unité, en cm³ ou en m³.',
              ],
            },
            {
              slug: 'calculer-volume-pyramide',
              type: 'exercices',
              title: 'Calculer le volume d’une pyramide',
              objectives: [
                'Je calcule le volume d’une pyramide à base carrée ou rectangulaire.',
                'Je retrouve la hauteur d’une pyramide à partir de son volume.',
              ],
            },
            {
              slug: 'le-cone-de-revolution',
              type: 'lecon',
              title: 'Le cône de révolution',
              objectives: [
                'Je reconnais un cône de révolution : son sommet, sa base en forme de disque et sa hauteur.',
                'Je représente un cône de révolution en perspective cavalière et je le relie à son patron.',
                'Je sais que le volume d’un cône vaut aire de la base × hauteur ÷ 3.',
              ],
            },
            {
              slug: 'calculer-avec-le-cone',
              type: 'exercices',
              title: 'Calculer avec le cône',
              objectives: [
                'Je calcule le volume d’un cône de révolution.',
                'Je donne une valeur exacte avec π, puis une valeur approchée.',
                'Je compare le volume d’un cône à celui du cylindre de même base et de même hauteur.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les solides',
              objectives: [
                'Je me repère dans un pavé droit avec l’abscisse, l’ordonnée et l’altitude.',
                'Je relie une pyramide ou un cône à son patron.',
                'Je calcule le volume d’une pyramide ou d’un cône.',
              ],
            },
          ],
        }),
      ],
    },
    {
      id: 'maths-algo',
      name: 'Algorithmique et programmation',
      shortName: 'Algorithmique',
      kind: 'ilot',
      cities: [
        city({
          id: 'maths-algorithmique',
          ref: 'M4-C15',
          name: 'Ville des Algorithmes',
          monument: 'atelier-lutin',
          source: `${REFERENTIEL} · M4-C15 · Algorithmique et programmation (Scratch)`,
          playable: true,
          levels: [
            {
              slug: 'premiers-scripts',
              type: 'lecon',
              title: 'Mes premiers scripts',
              objectives: [
                'Je lis un script et je dis ce que fait le lutin.',
                'Je me sers de la boucle « répéter » pour ne pas recopier les mêmes blocs.',
                'Je trouve de combien le lutin doit tourner pour tracer un carré ou un triangle équilatéral.',
              ],
            },
            {
              slug: 'tracer-avec-le-lutin',
              type: 'exercices',
              title: 'Tracer avec le lutin',
              objectives: [
                'Je complète un script pour tracer une figure donnée.',
                'Je remets des blocs dans l’ordre et je trouve la position finale du lutin.',
                'Je repère l’erreur d’un script et je la corrige.',
              ],
            },
            {
              slug: 'variables-conditions-evenements',
              type: 'lecon',
              title: 'Variables, conditions et événements',
              objectives: [
                'Je crée une variable et je suis sa valeur à chaque étape d’un script.',
                'Je me sers de « si … alors … sinon » pour que le lutin choisisse quoi faire.',
                'Je déclenche une action avec un événement, comme une touche pressée ou un clic sur le lutin.',
              ],
            },
            {
              slug: 'variables-et-conditions',
              type: 'exercices',
              title: 'Variables et conditions',
              objectives: [
                'Je trouve la figure tracée avec un nombre saisi et je calcule son périmètre.',
                'Je trouve les valeurs pour lesquelles une condition est vraie.',
              ],
            },
            {
              slug: 'blocs-et-projets',
              type: 'lecon',
              title: 'Pour aller plus loin : blocs et projets',
              objectives: [
                'Je crée un bloc personnalisé et je le réutilise dans un script.',
                'Je place une boucle dans une autre pour répéter un motif.',
                'Je dis ce que fait chaque partie d’un script de simulation : boucle, tirage, compteurs.',
              ],
            },
            {
              slug: 'frises-et-simulations',
              type: 'exercices',
              title: 'Frises et simulations',
              objectives: [
                'Je décris la frise tracée en répétant un bloc personnalisé.',
                'Je lis les compteurs d’une simulation de tirages et je dis ce qu’ils comptent.',
              ],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan : les algorithmes',
              objectives: [
                'Je trouve la figure tracée par un script et je calcule son périmètre et son aire.',
                'Je complète les angles d’un script pour tracer un quadrilatère.',
                'Je calcule la valeur finale d’une variable modifiée dans une boucle.',
              ],
            },
          ],
        }),
      ],
    },
  ],
};
