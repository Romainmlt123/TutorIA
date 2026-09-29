import type { Flashcard } from '@/data/types';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[\s.!?]+/g, ' ')
    .trim()
    .toLowerCase();

/** Question d'entraînement du mode hors ligne, tirée des flashcards du chapitre. */
export function practiceQuestion(card: Flashcard): string {
  const options = card.options.map((option, i) => `${LETTERS[i]}. ${option}`).join('\n');
  return `${card.question}\n${options}`;
}

/** Vérifie une réponse (lettre ou texte de l'option) et renvoie un retour bienveillant. */
export function checkPracticeAnswer(
  card: Flashcard,
  answer: string,
): { right: boolean; text: string } {
  const value = normalize(answer);
  const letterIndex = LETTERS.findIndex((l) => value === l.toLowerCase());
  const picked =
    letterIndex >= 0
      ? letterIndex
      : card.options.findIndex((option) => normalize(option) === value);
  const right = picked === card.answerIndex;
  const solution = card.options[card.answerIndex];
  return {
    right,
    text: right
      ? `Bien joué ! ${card.explanation}`
      : `Pas tout à fait : c’était ${solution}. ${card.explanation}`,
  };
}
