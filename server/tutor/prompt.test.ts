/**
 * @jest-environment node
 */
import { student } from '@/data/mock/student';

import { buildTutorInstructions } from './prompt';
import { promptContextOf } from './topic';
import { levelById } from '@/features/explorer/content';
import { startPlay } from '@/features/explorer/logic/levelPlay';

import { levelInstructions } from './level';

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

  it('écrit les formules en LaTeX à l’écrit, jamais à l’oral', () => {
    expect(text).toContain('$\\frac{3}{4}$');
    expect(voice).not.toContain('LaTeX');
  });

  it('enseigne une leçon comme un grand professeur, avec utilité et exemple résolu', () => {
    const lesson = buildTutorInstructions({
      ...promptContextOf({ subjectId: 'maths', chapterId: 'maths-equations' }, 'text'),
      lesson: true,
    });
    expect(lesson).toMatch(/Henri-IV/);
    expect(lesson).toMatch(/Pourquoi c'est utile/);
    expect(lesson).toMatch(/exemple résolu pas à pas/);
    expect(lesson).not.toMatch(/Trois phrases au maximum/);
  });

  it('adapte la forme au vocal', () => {
    expect(voice).toMatch(/voix haute/);
    expect(voice).not.toMatch(/astérisques/);
  });
});

describe('consignes d’un niveau d’Explorer', () => {
  const place = (slug: string) => levelById(`maths-equations.${slug}`)!;
  const block = (slug: string) =>
    levelInstructions(place(slug), startPlay(place(slug).level.id), 'text');

  it('change l’attitude du tuteur selon le type de niveau', () => {
    expect(block('isoler-x')).toContain('Ton rôle : tu enseignes');
    expect(block('resoudre-ax-b-c')).toContain('indices gradués');
    expect(block('bilan')).toMatch(/Aucune aide : pas d'indice/);
  });

  it('donne au tuteur le programme du niveau et, hors leçon, les exercices corrigés', () => {
    expect(block('isoler-x')).toContain('Résoudre une équation du premier degré');
    expect(block('isoler-x')).not.toContain('Corrigé :');
    expect(block('resoudre-ax-b-c')).toContain('Corrigé :');
    expect(block('bilan')).toContain('ne montre jamais le corrigé');
  });

  it('donne la notion, les objectifs et l’avancement, sans donnée personnelle', () => {
    const text = block('bilan');
    expect(text).toContain('« Bilan des équations », Ville des Équations (Nombres et calculs)');
    expect(text).toContain('- Je résous une équation avec l’inconnue des deux côtés.');
    expect(text).toContain('Avancement : 0 sur 8');
    expect(text).not.toMatch(/Léa|prénom/);
  });

  it('s’ajoute au prompt système', () => {
    const instructions = buildTutorInstructions({
      mode: 'text',
      grade: '4e',
      subject: 'Mathématiques',
      chapter: 'Ville des Équations',
      level: block('isoler-x'),
    });
    expect(instructions.endsWith(block('isoler-x'))).toBe(true);
  });
});
