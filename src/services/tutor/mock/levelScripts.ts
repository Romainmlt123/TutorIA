import type { LevelPlace } from '@/features/explorer/content';
import { progressOf, type LevelCall, type LevelPlay } from '@/features/explorer/logic/levelPlay';

/*
 * Tuteur simulé des niveaux d'Explorer : il joue les trois comportements (enseigner, entraîner,
 * évaluer) et émet les mêmes jugements que le vrai tuteur. Aucune aide en évaluation.
 */

export type MockLevelState = { play: LevelPlay; hintGiven: boolean };

export type MockLevelTurn = { reply: string; calls: LevelCall[]; hintGiven: boolean };

const ASKS_HELP = /aide|indice|comprends pas|je sais pas|j'sais pas|bloqu|explique/i;
const SKIPS = /je passe|passer|aucune idée|sais pas/i;

/** Question simulée n° `index` du niveau (équations pour la ville des Équations). */
function question(place: LevelPlace, index: number): string {
  if (place.city.id === 'maths-equations') {
    const a = index + 2;
    const b = index * 3 + 1;
    const c = a * (index + 4) + b;
    return `Résous ${a}x + ${b} = ${c}.`;
  }
  return `Question ${index + 1} : explique avec tes mots « ${place.level.title} ».`;
}

/** Question suivante, ou annonce du bilan après la dernière. */
function nextQuestion(place: LevelPlace, done: number): string {
  return done + 1 < place.level.steps
    ? question(place, done + 1)
    : 'C’était la dernière : on regarde ton bilan !';
}

function lessonTurn(place: LevelPlace, state: MockLevelState, message: string): MockLevelTurn {
  const { done, total } = progressOf(place.level, state.play);
  if (ASKS_HELP.test(message)) {
    return {
      reply:
        'Je t’explique autrement, avec une image : une équation, c’est une balance en équilibre. Ce que tu fais d’un côté, tu le fais de l’autre. Tu vois l’idée ?',
      calls: [],
      hintGiven: state.hintGiven,
    };
  }
  const next =
    done + 1 < total ? ` Étape suivante : on continue avec « ${place.level.title} ». Prêt ?` : '';
  return {
    reply: `Propre ! Étape ${done + 1} réussie.${next || ' Tu as fini la leçon, bravo !'}`,
    calls: [{ name: 'complete_step' }],
    hintGiven: false,
  };
}

function exerciseTurn(place: LevelPlace, state: MockLevelState, message: string): MockLevelTurn {
  const { done } = progressOf(place.level, state.play);
  if (ASKS_HELP.test(message) && !SKIPS.test(message)) {
    return {
      reply:
        'Petit indice : commence par enlever le nombre qui est ajouté à x, des deux côtés. Tu essaies ?',
      calls: [],
      hintGiven: true,
    };
  }
  const correct = /\d/.test(message) && !SKIPS.test(message);
  const reply = correct
    ? `Bien joué ! ${nextQuestion(place, done)}`
    : `Presque ! Regardons où ça bloque, puis on continue. ${nextQuestion(place, done)}`;
  return {
    reply,
    calls: [{ name: 'record_answer', correct, hinted: state.hintGiven }],
    hintGiven: false,
  };
}

function evaluationTurn(place: LevelPlace, state: MockLevelState, message: string): MockLevelTurn {
  const { done } = progressOf(place.level, state.play);
  if (ASKS_HELP.test(message) && !SKIPS.test(message)) {
    return {
      reply: `C’est le bilan de la ville : cette fois, je ne peux pas t’aider. Montre ce que tu sais faire ! ${question(place, done)}`,
      calls: [],
      hintGiven: false,
    };
  }
  // Une réponse compte si elle est chiffrée et rédigée (au moins une étape écrite avec « = »).
  const correct = /\d/.test(message) && /=/.test(message) && !SKIPS.test(message);
  return {
    reply: `C’est noté. ${nextQuestion(place, done)}`,
    calls: [{ name: 'record_answer', correct, hinted: false }],
    hintGiven: false,
  };
}

export function mockLevelTurn(
  place: LevelPlace,
  state: MockLevelState,
  message: string,
): MockLevelTurn {
  switch (place.level.type) {
    case 'lecon':
      return lessonTurn(place, state, message);
    case 'exercices':
      return exerciseTurn(place, state, message);
    case 'evaluation':
      return evaluationTurn(place, state, message);
  }
}
