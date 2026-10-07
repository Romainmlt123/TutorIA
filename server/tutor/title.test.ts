/**
 * @jest-environment node
 */
import { cleanTitle, fallbackTitle, nameOf } from './title';

const client = (text: string, flagged = false) =>
  ({
    responses: { create: jest.fn(async () => ({ output_text: text })) },
    moderations: {
      create: jest.fn(async () => ({ results: [{ flagged, categories: {} }] })),
    },
  }) as never;

describe('titre d’une discussion', () => {
  it('nettoie le titre proposé par le modèle', () => {
    expect(cleanTitle('« Pythagore : l’hypoténuse ».\n')).toBe('Pythagore : l’hypoténuse');
    expect(cleanTitle('x'.repeat(80))).toHaveLength(60);
  });

  it('reprend le début de la question en repli', () => {
    expect(fallbackTitle('Comment on calcule une hypoténuse ?')).toBe(
      'Comment on calcule une hypoténuse ?',
    );
    expect(
      fallbackTitle('Je ne comprends pas du tout comment on fait pour résoudre cette équation'),
    ).toBe('Je ne comprends pas du tout comment on…');
  });

  it('garde le titre du modèle et sa matière, ou se replie sur la question', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const answer = (title: string, subject: string) => JSON.stringify({ title, subject });
    expect(
      await nameOf(
        client(answer('Pythagore : l’hypoténuse', 'maths')),
        'm',
        'Pythagore ?',
        'r',
        's',
      ),
    ).toEqual({ title: 'Pythagore : l’hypoténuse', subjectId: 'maths' });
    expect(
      await nameOf(client(answer('Bien s’organiser', 'aucune')), 'm', 'Organisation ?', 'r', 's'),
    ).toEqual({ title: 'Bien s’organiser' });
    expect(
      await nameOf(client(answer('titre douteux', 'maths'), true), 'm', 'Pythagore ?', 'r', 's'),
    ).toEqual({ title: 'Pythagore ?', subjectId: 'maths' });
    expect(await nameOf(client(answer('x', 'cuisine')), 'm', 'Pythagore ?', 'r', 's')).toEqual({
      title: 'Pythagore ?',
    });
    expect(await nameOf(client('pas du JSON'), 'm', 'Pythagore ?', 'r', 's')).toEqual({
      title: 'Pythagore ?',
    });
  });
});
