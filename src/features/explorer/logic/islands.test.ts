import { demoLevelRecords } from '@/data/mock/explorer';

import { ISLANDS } from '../content';
import { islandSlides, stepIndex } from './islands';

describe('carrousel des îles (X1)', () => {
  it('montre les Maths en 3D et les autres matières « Bientôt »', () => {
    const slides = islandSlides(ISLANDS, []);
    expect(slides.map((s) => s.subjectId)).toEqual([
      'maths',
      'francais',
      'histoire-geo',
      'physique-chimie',
      'svt',
      'anglais',
    ]);
    expect(slides.filter((s) => s.available).map((s) => s.subjectId)).toEqual(['maths']);
  });

  it('propose de commencer une île encore vierge', () => {
    const maths = islandSlides(ISLANDS, [])[0]!;
    expect(maths.started).toBe(false);
    expect(maths.citiesDone).toBe(0);
    expect(maths.progress).toBe(0);
    expect(maths.next?.title).toBe('Additionner et soustraire des relatifs');
  });

  it('reprend là où Léa s’est arrêtée, avec ses étoiles', () => {
    const maths = islandSlides(ISLANDS, demoLevelRecords)[0]!;
    expect(maths.started).toBe(true);
    expect(maths.stars).toBe(5);
    expect(maths.next).toEqual({ type: 'lecon', title: 'Isoler x' });
  });

  it('fait tourner le carrousel en boucle', () => {
    expect(stepIndex(0, -1, 6)).toBe(5);
    expect(stepIndex(5, 1, 6)).toBe(0);
    expect(stepIndex(2, 1, 6)).toBe(3);
  });
});
