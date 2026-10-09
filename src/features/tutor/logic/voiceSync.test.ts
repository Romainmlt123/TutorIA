import {
  boardProgress,
  captionPieces,
  captionTail,
  measuredSpeechRate,
  namedTone,
  spokenLength,
} from './voiceSync';

describe('la voix et le visuel avancent ensemble', () => {
  it('trouve la dernière couleur nommée, accordée ou non', () => {
    expect(namedTone('Regarde la droite rouge, puis la bleue.')).toBe('bleu');
    expect(namedTone('Les droites vertes se croisent')).toBe('vert');
    expect(namedTone('la courbe violette')).toBe('violet');
    expect(namedTone('On retire 5 des deux côtés')).toBeNull();
  });

  it('écrit le tableau ligne à ligne pendant que le tuteur parle, tout à la fin', () => {
    expect(boardProgress(4, 0, false)).toBe(1);
    expect(boardProgress(4, 3300, false)).toBe(3);
    expect(boardProgress(4, 60_000, false)).toBe(4);
    expect(boardProgress(4, 0, true)).toBe(4);
  });

  it('met les nombres en gras et les couleurs en pastille', () => {
    expect(captionPieces('la droite rouge, c’est y = 3x + 5.')).toEqual([
      { kind: 'text', text: 'la droite ' },
      { kind: 'color', text: 'rouge', tone: 'rouge' },
      { kind: 'text', text: ', c’est y ' },
      { kind: 'number', text: '= 3x + 5.' },
    ]);
  });

  it('garde la fin d’une longue phrase visible', () => {
    expect(captionTail('Bravo ! Ensuite, on divise par 3 des deux côtés.', 30)).toBe(
      '… divise par 3 des deux côtés.',
    );
    expect(captionTail('Court.', 30)).toBe('Court.');
  });

  it('allume les mots du tuteur au rythme de sa voix, sur des mots entiers', () => {
    const text = 'On retire 5 des deux côtés.';
    expect(spokenLength(text, 0, 15)).toBe(2);
    expect(spokenLength(text, 500, 15)).toBe(9);
    expect(spokenLength(text, 10_000, 15)).toBe(text.length);
  });

  it('recale le débit de la voix sur une réponse entendue en entier', () => {
    expect(measuredSpeechRate(120, 10_000)).toBe(12);
    expect(measuredSpeechRate(500, 5_000)).toBe(25);
    expect(measuredSpeechRate(10, 5_000)).toBeNull();
  });
});
