import { chapterById, chapterTitle } from './curriculum';

describe('catalogue des chapitres', () => {
  it('reconnaît un chapitre du tuteur', () => {
    expect(chapterById('maths-equations')).toMatchObject({ subjectId: 'maths' });
  });

  it('reconnaît une ville d’Explorer, avec le titre du chapitre du référentiel', () => {
    expect(chapterById('maths-relatifs')).toEqual({
      id: 'maths-relatifs',
      subjectId: 'maths',
      title: 'Nombres relatifs',
    });
    expect(chapterTitle('maths-relatifs')).toBe('Nombres relatifs');
  });

  it('ignore un identifiant inconnu', () => {
    expect(chapterById('maths-lune')).toBeUndefined();
    expect(chapterTitle('maths-lune')).toBe('');
  });
});
