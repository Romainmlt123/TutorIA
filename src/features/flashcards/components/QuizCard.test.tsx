import { fireEvent, render, screen } from '@testing-library/react-native';

import type { Flashcard } from '@/data/types';

import { createSession, feedback, optionState, sessionReducer } from '../logic/session';
import { QuizCard } from './QuizCard';

const card: Flashcard = {
  id: 'maths-equations-02',
  chapterId: 'maths-equations',
  question: 'Que vaut x si 5x = −35 ?',
  options: ['x = −7', 'x = 7', 'x = −30', 'x = −40'],
  answerIndex: 0,
  explanation: 'On divise les deux membres par 5 : −35 ÷ 5 = −7.',
};

function renderCard(picked: 0 | 1 | 2 | 3 | null, onPick = jest.fn()) {
  let state = createSession([card]);
  if (picked !== null) state = sessionReducer(state, { type: 'pick', option: picked });
  return render(
    <QuizCard
      card={card}
      subjectId="maths"
      answered={picked !== null}
      optionState={(o) => optionState(state, o)}
      feedback={feedback(state)}
      onPick={onPick}
    />,
  );
}

describe('QuizCard', () => {
  it('propose 4 réponses et transmet le choix', async () => {
    const onPick = jest.fn();
    await renderCard(null, onPick);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    fireEvent.press(screen.getByRole('button', { name: 'Réponse B : x = 7' }));
    expect(onPick).toHaveBeenCalledWith(1);
  });

  it('après une mauvaise réponse, explique la bonne avec bienveillance et bloque la grille', async () => {
    await renderCard(1);
    expect(
      screen.getByText(
        'Pas tout à fait : c’était x = −7. On divise les deux membres par 5 : −35 ÷ 5 = −7. On la revoit demain.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Réponse A : x = −7' })).toBeDisabled();
  });
});
