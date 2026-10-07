import { city } from './build';
import type { Island } from './types';

/*
 * Îles d'exemple (une ville jouable chacune, reprise de la maquette X1), en attendant leur contenu complet.
 * Sources : programmes du cycle 4 (BO n° 31 du 30/07/2020) et repères annuels de progression (Eduscol).
 */
const CYCLE4 = 'Programme du cycle 4 (BO n° 31 du 30/07/2020)';

export const francais4e2020: Island = {
  subjectId: 'francais',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'fr-langue',
      name: 'Étude de la langue',
      cities: [
        city({
          id: 'fr-discours-rapporte',
          name: 'Ville du Discours rapporté',
          monument: 'imprimerie-guillemets',
          source: `${CYCLE4} · Français · les formes du discours rapporté`,
          playable: true,
          levels: [
            {
              slug: 'discours-rapporte',
              type: 'lecon',
              title: 'Le discours rapporté',
              objectives: [
                'Je reconnais le discours direct et le discours indirect.',
                'Je repère les verbes de parole et la ponctuation.',
              ],
            },
            {
              slug: 'direct-indirect',
              type: 'exercices',
              title: 'Passer du direct à l’indirect',
              objectives: ['Je transforme un discours direct en discours indirect.'],
            },
            {
              slug: 'concordance',
              type: 'lecon',
              title: 'La concordance des temps',
              objectives: ['J’adapte les temps et les pronoms au discours indirect.'],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan du discours rapporté',
              steps: 6,
              objectives: [
                'Je reconnais les formes du discours rapporté.',
                'Je transforme un discours sans erreur de temps ni de pronom.',
              ],
            },
          ],
        }),
      ],
    },
  ],
};

export const histoireGeo4e2020: Island = {
  subjectId: 'histoire-geo',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'hg-xviiie',
      name: 'Le XVIIIe siècle',
      cities: [
        city({
          id: 'hg-lumieres',
          name: 'Ville des Lumières',
          monument: 'salon-encyclopedie',
          source: `${CYCLE4} · Histoire 4e · Thème 1, l’Europe des Lumières`,
          playable: true,
          levels: [
            {
              slug: 'idees-lumieres',
              type: 'lecon',
              title: 'Les idées des Lumières',
              objectives: [
                'Je cite des philosophes des Lumières et leurs idées.',
                'J’explique ce que critiquent les Lumières.',
              ],
            },
            {
              slug: 'lumieres',
              type: 'exercices',
              title: 'Les Lumières',
              objectives: ['J’associe un philosophe, une œuvre et une idée.'],
            },
            {
              slug: 'diffusion',
              type: 'lecon',
              title: 'La diffusion des idées',
              objectives: ['J’explique comment les idées circulent : salons, cafés, Encyclopédie.'],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan des Lumières',
              steps: 6,
              objectives: ['Je présente les idées des Lumières et leur diffusion.'],
            },
          ],
        }),
      ],
    },
  ],
};

export const physiqueChimie4e2020: Island = {
  subjectId: 'physique-chimie',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'pc-matiere',
      name: 'Organisation de la matière',
      cities: [
        city({
          id: 'pc-etats-matiere',
          name: 'Ville des États de la matière',
          monument: 'dome-laboratoire',
          source: `${CYCLE4} · Physique-chimie · organisation et transformations de la matière`,
          playable: true,
          levels: [
            {
              slug: 'etats',
              type: 'lecon',
              title: 'La matière et ses états',
              objectives: [
                'Je décris les états solide, liquide et gazeux.',
                'Je nomme les changements d’état.',
              ],
            },
            {
              slug: 'changements',
              type: 'exercices',
              title: 'Les changements d’état',
              objectives: ['J’identifie un changement d’état à partir d’une situation.'],
            },
            {
              slug: 'masse-volumique',
              type: 'lecon',
              title: 'La masse volumique',
              objectives: ['Je calcule une masse volumique et je l’utilise.'],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan de la matière',
              steps: 6,
              objectives: ['Je décris les états de la matière et j’utilise la masse volumique.'],
            },
          ],
        }),
      ],
    },
  ],
};

export const svt4e2020: Island = {
  subjectId: 'svt',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'svt-corps',
      name: 'Le corps humain et la santé',
      cities: [
        city({
          id: 'svt-reproduction',
          name: 'Ville de la Reproduction',
          monument: 'serre-cellules',
          source: `${CYCLE4} · SVT · le corps humain et la santé`,
          playable: true,
          levels: [
            {
              slug: 'reproduction',
              type: 'lecon',
              title: 'La reproduction',
              objectives: [
                'Je décris le rôle des appareils reproducteurs.',
                'J’explique la fécondation.',
              ],
            },
            {
              slug: 'puberte',
              type: 'exercices',
              title: 'La puberté',
              objectives: ['J’associe les transformations de la puberté à leurs causes.'],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan de la reproduction',
              steps: 6,
              objectives: ['J’explique les étapes de la reproduction humaine.'],
            },
          ],
        }),
      ],
    },
  ],
};

export const anglais4e2020: Island = {
  subjectId: 'anglais',
  grade: '4e',
  programme: 'fr-2020',
  regions: [
    {
      id: 'en-grammaire',
      name: 'Grammaire',
      cities: [
        city({
          id: 'en-preterit',
          name: 'Ville du Prétérit',
          monument: 'gare-horloge',
          source: `${CYCLE4} · Langues vivantes · raconter des faits passés`,
          playable: true,
          levels: [
            {
              slug: 'preterit',
              type: 'lecon',
              title: 'Le prétérit simple',
              objectives: [
                'Je forme le prétérit des verbes réguliers.',
                'Je connais les verbes irréguliers les plus courants.',
              ],
            },
            {
              slug: 'preterit-exercices',
              type: 'exercices',
              title: 'Le prétérit',
              objectives: ['Je conjugue des verbes au prétérit, à toutes les formes.'],
            },
            {
              slug: 'raconter',
              type: 'lecon',
              title: 'Raconter une journée passée',
              objectives: ['J’utilise le prétérit et des marqueurs de temps.'],
            },
            {
              slug: 'bilan',
              type: 'evaluation',
              title: 'Bilan du prétérit',
              steps: 6,
              objectives: ['Je raconte des faits passés au prétérit.'],
            },
          ],
        }),
      ],
    },
  ],
};
