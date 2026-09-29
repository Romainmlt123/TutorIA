/**
 * @jest-environment node
 */
import { student } from '@/data/mock/student';

import { buildTutorInstructions } from './prompt';
import { promptContextOf } from './topic';

describe('prompt système du tuteur', () => {
  const text = buildTutorInstructions(
    promptContextOf({ subjectId: 'maths', chapterId: 'maths-equations' }, 'text'),
  );
  const voice = buildTutorInstructions(
    promptContextOf({ subjectId: 'maths', chapterId: 'maths-equations' }, 'voice'),
  );

  it('reprend la voix de la marque et guide sans donner la réponse', () => {
    expect(text).toMatch(/tutoies/);
    expect(text).toMatch(/Phrases courtes/);
    expect(text).toMatch(/question qui relance/);
    expect(text).toMatch(/ne la donne pas/);
    expect(text).toMatch(/ne dis jamais « faux »/);
    expect(text).toMatch(/Ne fais jamais le calcul/);
  });

  it('précise le contexte sans donnée personnelle', () => {
    expect(text).toContain('Matière : Maths. Chapitre : Équations du 1er degré.');
    expect(text).toContain('en 4e');
    expect(text).not.toContain(student.firstName);
  });

  it('adapte la forme au vocal', () => {
    expect(voice).toMatch(/voix haute/);
    expect(voice).not.toMatch(/astérisques/);
  });
});
