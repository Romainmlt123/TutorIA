/**
 * @jest-environment node
 */
import { validateChat } from './limits';

const chat = (chapterId: string) => ({
  topic: { subjectId: 'maths', chapterId },
  history: [],
  message: 'Explique-moi',
});

describe('validation d’une discussion', () => {
  it('accepte un chapitre d’Explorer, repris par « Reprendre » après un niveau', () => {
    expect(validateChat(chat('maths-relatifs')).ok).toBe(true);
  });

  it('refuse un chapitre inconnu ou d’une autre matière', () => {
    expect(validateChat(chat('maths-lune'))).toEqual({ ok: false, code: 'bad_request' });
    expect(validateChat({ ...chat('fr-subordonnees') })).toEqual({
      ok: false,
      code: 'bad_request',
    });
  });
});
