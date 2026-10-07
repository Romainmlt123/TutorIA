import type { LevelOutcome } from '@/services/tutor/api-contract';

import type { Level } from '../content';
import { levelResult, type RecordedAnswer } from './progression';

/*
 * Déroulé d'un niveau joué avec le tuteur (fonction pure, partagée par le serveur et le tuteur simulé).
 * Le modèle signale ses jugements par des appels d'outils ; ce module les plafonne et décide seul
 * de la progression et de la fin du niveau.
 */

export type LevelPlay = {
  levelId: string;
  answers: readonly RecordedAnswer[];
  /** Étapes de leçon réussies. */
  stepsDone: number;
  finished: boolean;
};

/** Jugement du tuteur, reçu par un appel d'outil. */
export type LevelCall =
  { name: 'record_answer'; correct: boolean; hinted: boolean } | { name: 'complete_step' };

export type LevelTurn = {
  play: LevelPlay;
  /** Vrai si la barre de progression a avancé pendant ce tour. */
  progressed: boolean;
  /** Présent quand le niveau vient de se terminer. */
  outcome?: LevelOutcome;
};

export function startPlay(levelId: string): LevelPlay {
  return { levelId, answers: [], stepsDone: 0, finished: false };
}

/** Avancement affiché : étapes pour une leçon, réponses pour des exercices ou une évaluation. */
export function progressOf(level: Level, play: LevelPlay): { done: number; total: number } {
  const done = level.type === 'lecon' ? play.stepsDone : play.answers.length;
  return { done: Math.min(done, level.steps), total: level.steps };
}

function outcomeOf(level: Level, play: LevelPlay): LevelOutcome {
  const result = levelResult(level, level.type === 'lecon' ? [] : play.answers);
  const correct =
    level.type === 'lecon' ? play.stepsDone : play.answers.filter((a) => a.correct).length;
  return { levelId: level.id, ...result, correct, total: level.steps };
}

/**
 * Applique les appels d'outils d'un tour. Au plus un appel de chaque sorte par tour (un message du
 * tuteur = une étape) : l'élève ne peut pas faire valider plusieurs réponses d'un coup. Une leçon
 * n'enregistre pas de réponse ; en évaluation, aucune réponse n'est « aidée » (le tuteur n'aide pas).
 */
export function applyCalls(level: Level, play: LevelPlay, calls: readonly LevelCall[]): LevelTurn {
  if (play.finished) return { play, progressed: false };
  let next = play;
  const answer = calls.find((c) => c.name === 'record_answer');
  const step = calls.find((c) => c.name === 'complete_step');

  if (level.type === 'lecon') {
    if (step && next.stepsDone < level.steps) {
      next = { ...next, stepsDone: next.stepsDone + 1 };
    }
  } else if (answer?.name === 'record_answer' && next.answers.length < level.steps) {
    const recorded: RecordedAnswer = {
      correct: answer.correct,
      hinted: level.type === 'evaluation' ? false : answer.hinted,
    };
    next = { ...next, answers: [...next.answers, recorded] };
  }

  const progressed = next !== play;
  const { done, total } = progressOf(level, next);
  if (done < total) return { play: next, progressed };
  const finished = { ...next, finished: true };
  return { play: finished, progressed, outcome: outcomeOf(level, finished) };
}

/** Lit les arguments d'un appel d'outil du modèle ; tout appel mal formé est ignoré. */
export function parseLevelCall(name: string, rawArguments: string): LevelCall | null {
  if (name === 'complete_step') return { name };
  if (name !== 'record_answer') return null;
  try {
    const args = JSON.parse(rawArguments) as { correct?: unknown; hinted?: unknown };
    if (typeof args.correct !== 'boolean') return null;
    return { name, correct: args.correct, hinted: args.hinted === true };
  } catch {
    return null;
  }
}
