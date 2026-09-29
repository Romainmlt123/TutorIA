import type OpenAI from 'openai';

import { levelById, type LevelPlace, type LevelType } from '@/features/explorer/content';
import { progressOf, type LevelPlay } from '@/features/explorer/logic/levelPlay';
import type { LevelOutcome, TutorTopic } from '@/services/tutor/api-contract';

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
    'Ton rôle : tu enseignes la notion, avec une aide maximale (exemples, reformulations, analogies).',
    "Découpe la leçon en petites étapes. À la fin de chaque étape, pose une petite question de vérification ; quand l'élève y répond juste, appelle complete_step, puis passe à l'étape suivante.",
    'Après une erreur, réexplique autrement, avec un autre exemple, puis repose une question de vérification.',
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
    ROLE[level.type],
    COMMON,
  ];
  if (mode === 'voice') {
    lines.push("À l'oral, tu n'as pas d'outil : mène la leçon jusqu'au bout, étape par étape.");
  }
  return lines.join('\n\n');
}

/**
 * Enregistrement d'un niveau joué. Implémentation Supabase : tables level_progress et level_answers
 * (migration de l'étape « branchement Supabase »). En attendant, les niveaux ne se jouent qu'en simulé.
 */
export type LevelStore = {
  /** Déroulé en cours de la séance (null : première réponse du niveau). */
  load(sessionId: string, studentId: string, levelId: string): Promise<LevelPlay | null>;
  save(sessionId: string, studentId: string, play: LevelPlay): Promise<void>;
  /** Niveau terminé : meilleur score, étoiles, XP de la séance, maîtrise du chapitre. */
  finish(
    sessionId: string,
    studentId: string,
    place: LevelPlace,
    outcome: LevelOutcome,
  ): Promise<void>;
};

export class LevelStoreUnavailableError extends Error {}

export const unavailableLevelStore: LevelStore = {
  load: () => Promise.reject(new LevelStoreUnavailableError('level store not configured')),
  save: () => Promise.reject(new LevelStoreUnavailableError('level store not configured')),
  finish: () => Promise.reject(new LevelStoreUnavailableError('level store not configured')),
};
