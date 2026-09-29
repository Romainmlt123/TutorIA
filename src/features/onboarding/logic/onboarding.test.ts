import {
  EMPTY_ANSWERS,
  buildStudyPlan,
  nextStep,
  preferredMoment,
  skipStep,
  stepNumber,
  toggleValue,
} from './onboarding';

describe('onboarding progress', () => {
  it('numbers the four steps and ends on the ready screen', () => {
    expect(stepNumber('classe')).toBe(1);
    expect(stepNumber('style')).toBe(4);
    expect(nextStep('classe')).toBe('matieres');
    expect(nextStep('style')).toBe('pret');
  });

  it('saves nothing for a skipped step and keeps the other answers', () => {
    const answers = {
      ...EMPTY_ANSWERS,
      grade: '4e' as const,
      goals: ['understand' as const],
      dailyMinutes: 20 as const,
    };
    const skipped = skipStep(answers, 'objectifs');
    expect(skipped.goals).toEqual([]);
    expect(skipped.dailyMinutes).toBeNull();
    expect(skipped.grade).toBe('4e');
  });

  it('skips every step down to empty answers', () => {
    const answers = {
      grade: '6e' as const,
      selfAssessment: { maths: 'ok' as const },
      goals: ['get_ahead' as const],
      dailyMinutes: 10 as const,
      modes: ['quiz' as const],
      moments: ['morning' as const],
      reminder: true,
    };
    const all = (['classe', 'matieres', 'objectifs', 'style'] as const).reduce(skipStep, answers);
    expect(all).toEqual(EMPTY_ANSWERS);
  });

  it('toggles a multiple choice', () => {
    expect(toggleValue(['written'], 'voice')).toEqual(['written', 'voice']);
    expect(toggleValue(['written', 'voice'], 'written')).toEqual(['voice']);
  });
});

describe('buildStudyPlan', () => {
  it('starts with the least comfortable subject', () => {
    expect(
      buildStudyPlan({ maths: 'meh', 'physique-chimie': 'struggling', francais: 'confident' }),
    ).toEqual([
      { subjectId: 'physique-chimie', level: 'struggling' },
      { subjectId: 'maths', level: 'meh' },
    ]);
  });

  it('breaks ties with the teaching order', () => {
    expect(buildStudyPlan({ svt: 'meh', anglais: 'meh', maths: 'ok' })).toEqual([
      { subjectId: 'anglais', level: 'meh' },
      { subjectId: 'svt', level: 'meh' },
    ]);
  });

  it('puts the subjects without an answer last', () => {
    expect(buildStudyPlan({ 'histoire-geo': 'confident' }, 6).map((s) => s.subjectId)).toEqual([
      'histoire-geo',
      'maths',
      'francais',
      'anglais',
      'physique-chimie',
      'svt',
    ]);
  });

  it('follows the teaching order when the step was skipped', () => {
    expect(buildStudyPlan({})).toEqual([
      { subjectId: 'maths', level: null },
      { subjectId: 'francais', level: null },
    ]);
  });
});

describe('preferredMoment', () => {
  it('keeps the first moment of the school day', () => {
    expect(preferredMoment(['weekend', 'after_school'])).toBe('after_school');
    expect(preferredMoment([])).toBeNull();
  });
});
