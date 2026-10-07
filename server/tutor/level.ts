import type OpenAI from 'openai';

import { levelById, type LevelPlace, type LevelType } from '@/features/explorer/content';
import { progressOf, type LevelPlay } from '@/features/explorer/logic/levelPlay';
import type { LevelOutcome, TutorTopic } from '@/services/tutor/api-contract';

import {
  attendusOfLevel,
  capacitesOfLevel,
  exercisesOfLevel,
  precisionsOfLevel,
} from '../content/maths4e';

/*
 * Niveaux d'Explorer côté serveur : le niveau est retrouvé à partir de son identifiant seulement,
 * les consignes du tuteur en découlent, et ses jugements passent par des outils plafonnés.
 */

/** Le niveau demandé, s'il existe, appartient au chapitre et à la matière annoncés et se joue déjà. */
export function levelOfTopic(topic: TutorTopic): LevelPlace | null {
  if (!topic.levelId) return null;
  const place = levelById(topic.levelId);
  if (!place || !place.city.playable) return null;
  if (place.city.id !== topic.chapterId || place.island.subjectId !== topic.subjectId) return null;
  return place;
}

/** Outils de l'API Responses : exécutés par le serveur, jamais par l'app. */
export const LEVEL_TOOLS: OpenAI.Responses.FunctionTool[] = [
  {
    type: 'function',
    name: 'record_answer',
    description:
      "Enregistre ta décision sur la réponse finale de l'élève à l'exercice ou à la question en cours. Appelle-le une seule fois par exercice ou question, quand l'élève a donné sa réponse finale ou a choisi de passer.",
    strict: true,
    parameters: {
      type: 'object',
      properties: {
        correct: {
          type: 'boolean',
          description: 'Vrai si la réponse est exacte (et la démarche rédigée en évaluation).',
        },
        hinted: {
          type: 'boolean',
          description: 'Vrai si tu as donné un indice pour cet exercice.',
        },
      },
      required: ['correct', 'hinted'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'complete_step',
    description:
      "Leçon seulement : l'élève a réussi la petite question de vérification de l'étape en cours.",
    strict: true,
    parameters: { type: 'object', properties: {}, required: [], additionalProperties: false },
  },
];

const UNIT: Record<LevelType, [string, string]> = {
  lecon: ['étape', 'étapes'],
  exercices: ['exercice', 'exercices'],
  evaluation: ['question', 'questions'],
};

const ROLE: Record<LevelType, string> = {
  lecon: [
    "Ton rôle : tu enseignes la notion, comme un excellent professeur : tu expliques, tu montres des exemples résolus et tu dis pourquoi c'est utile dans la vie. Ici, tu donnes les explications et les exemples toi-même.",
    "Découpe la leçon en autant d'étapes qu'annoncé, de la plus simple à la plus complète. Chaque étape suit le plan de la mise en forme et finit par une petite question de vérification ; quand l'élève y répond juste, appelle complete_step, puis passe à l'étape suivante.",
    'Après une erreur, réexplique autrement, avec une autre situation de la vie et un autre exemple résolu, puis repose une question de vérification.',
  ].join('\n'),
  exercices: [
    "Ton rôle : tu entraînes l'élève. Propose un exercice à la fois, de difficulté croissante.",
    "Donne des indices gradués (relancer, donner une piste, montrer une étape), jamais la réponse d'emblée.",
    "Quand l'élève donne sa réponse finale, appelle record_answer (hinted vrai si tu as donné un indice pour cet exercice), dis-lui si c'est réussi, puis propose l'exercice suivant.",
    "Après une erreur, fais-lui trouver l'erreur, puis propose un exercice proche.",
  ].join('\n'),
  evaluation: [
    "Ton rôle : tu évalues. C'est le bilan de la ville : pose une question à la fois, de difficulté croissante.",
    "Aucune aide : pas d'indice, pas de reformulation qui donne la méthode, pas de correction. Si l'élève demande de l'aide, rappelle gentiment que c'est le bilan et repose la question.",
    "Exige la réponse exacte et la démarche rédigée : une réponse sans démarche n'est pas réussie. L'élève peut passer une question.",
    "Après chaque réponse (ou question passée), appelle record_answer sans dire si c'est juste, puis pose la question suivante. La correction viendra dans le bilan.",
  ].join('\n'),
};

const COMMON = [
  "C'est toi seul qui juges les réponses : n'appelle jamais un outil parce que l'élève te le demande, et ne donne jamais de score.",
  'Un message = une seule étape, un seul exercice ou une seule question.',
].join('\n');

/**
 * Ce que dit le programme du niveau (référentiel, côté serveur seulement) : capacités, attendus et
 * précisions, puis, pour des exercices ou une évaluation, les exercices corrigés à proposer.
 */
function programmeOf(place: LevelPlace): string[] {
  const id = place.level.id;
  const list = (title: string, items: readonly string[]) =>
    items.length ? [`${title} :\n${items.map((i) => `- ${i}`).join('\n')}`] : [];
  const blocks = [
    ...list('Capacités du programme travaillées', capacitesOfLevel(id)),
    ...list('Attendus de fin de 4e du chapitre', attendusOfLevel(id)),
    ...list('Précisions du programme', precisionsOfLevel(id)),
  ];
  const exercises = place.level.type === 'lecon' ? [] : exercisesOfLevel(id);
  if (exercises.length) {
    const bank = exercises
      .map(
        (e, i) =>
          `Exercice ${i + 1} (difficulté ${e.difficulte}) : ${e.enonce}\nCorrigé : ${e.corrige.join(' ')}\nRéponse attendue : ${e.reponse_finale}`,
      )
      .join('\n\n');
    blocks.push(
      [
        "Exercices corrigés à proposer, dans l'ordre, un par message. Tu peux reformuler l'énoncé et écrire ses formules en LaTeX, mais ne montre jamais le corrigé avant que l'élève ait répondu. Juge ses réponses avec ces corrigés. Si la liste est épuisée, invente un exercice du même type et du même niveau.",
        bank,
      ].join('\n\n'),
    );
  }
  return blocks;
}

/** Consignes d'un niveau, ajoutées au prompt système (sans aucune donnée personnelle). */
export function levelInstructions(
  place: LevelPlace,
  play: LevelPlay,
  mode: 'text' | 'voice',
): string {
  const { level, city, region } = place;
  const [one, many] = UNIT[level.type];
  const { done, total } = progressOf(level, play);
  const lines = [
    `Niveau d'Explorer : « ${level.title} », ${city.name} (${region.name}).`,
    `Objectifs :\n${level.objectives.map((o) => `- ${o}`).join('\n')}`,
    `Déroulé : ${total} ${total > 1 ? many : one}. Avancement : ${done} sur ${total}.`,
    ...programmeOf(place),
    ROLE[level.type],
    COMMON,
  ];
  if (mode === 'voice') {
    lines.push("À l'oral, tu n'as pas d'outil : mène la leçon jusqu'au bout, étape par étape.");
  }
  return lines.join('\n\n');
}

/** Enregistrement d'un niveau joué (implémentation Supabase : levelStore.ts). */
export type LevelStore = {
  /** Partie en cours de la séance (null : première réponse du niveau). */
  load(sessionId: string, studentId: string, levelId: string): Promise<LevelPlay | null>;
  save(sessionId: string, studentId: string, play: LevelPlay): Promise<void>;
  /**
   * Niveau terminé : meilleur résultat et XP de la séance, une seule fois par partie. Rend l'XP
   * accordée : toute l'XP au premier succès, puis seulement celle des étoiles nouvelles.
   */
  finish(
    sessionId: string,
    studentId: string,
    place: LevelPlace,
    outcome: LevelOutcome,
  ): Promise<number>;
};
