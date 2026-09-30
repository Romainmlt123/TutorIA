import { maths4e2020 } from '@/features/explorer/content/maths-4e-2020';

import referentiel from './maths-4e-2020/referentiel.json';
import { MATHS_4E_BANK } from './maths-4e-2020/bank';
import { capacitesOfLevel, exercisesOfLevel } from './maths4e';

/*
 * Garde-fous entre le référentiel de Romain et l'île des Maths de l'app : un chapitre ajouté,
 * renuméroté ou déplacé dans le référentiel doit faire échouer ces tests, jamais passer en silence.
 */

const cities = maths4e2020.regions.flatMap((region) =>
  region.cities.map((city) => ({ region, city })),
);
const levels = cities.flatMap(({ city }) => city.levels.map((level) => ({ city, level })));
const byRef = new Map(referentiel.chapitres.map((c) => [c.id, c]));
const exercises = new Map(referentiel.exercices.map((e) => [e.id, e]));

/** Le référentiel écrit le même domaine avec ou sans « , fonctions » : on compare sans. */
const domain = (name: string) => name.replace(/, fonctions$/, '');
const REGION_OF_DOMAIN: Record<string, string> = {
  'Nombres et calculs': 'maths-nombres',
  'Organisation et gestion de données': 'maths-donnees',
  'Espace et géométrie': 'maths-espace',
  'Algorithmique et programmation': 'maths-algo',
};

describe('île des Maths tirée du référentiel de 4e', () => {
  it('reprend chaque chapitre une fois, dans la région de son domaine', () => {
    const refs = cities.map(({ city }) => city.ref);
    expect([...refs].sort()).toEqual([...byRef.keys()].sort());
    for (const { region, city } of cities) {
      expect(region.id).toBe(REGION_OF_DOMAIN[domain(byRef.get(city.ref!)!.domaine)]);
    }
  });

  it('range les villes d’une région dans l’ordre du référentiel', () => {
    for (const region of maths4e2020.regions) {
      const orders = region.cities.map((city) => byRef.get(city.ref!)!.ordre);
      expect(orders).toEqual([...orders].sort((a, b) => a - b));
    }
  });

  it('reprend les prérequis de 4e comme villes à valider avant', () => {
    const cityOfRef = new Map(cities.map(({ city }) => [city.ref, city.id]));
    for (const { city } of cities) {
      const expected = byRef
        .get(city.ref!)!
        .prerequis.filter((p) => cityOfRef.has(p))
        .map((p) => cityOfRef.get(p));
      expect(city.requires ?? []).toEqual(expected);
    }
  });

  it('bâtit 5 à 9 niveaux par ville, finis par un Bilan', () => {
    for (const { city } of cities) {
      expect(city.levels.length).toBeGreaterThanOrEqual(5);
      expect(city.levels.length).toBeLessThanOrEqual(9);
      expect(city.levels.at(-1)).toMatchObject({ type: 'evaluation', id: `${city.id}.bilan` });
    }
  });

  it('couvre chaque capacité d’un chapitre par au moins un niveau', () => {
    for (const { city } of cities) {
      const covered = new Set(
        city.levels
          .filter((level) => level.type !== 'evaluation')
          .flatMap((level) => MATHS_4E_BANK[level.id]?.capacites ?? []),
      );
      expect(covered.size).toBe(byRef.get(city.ref!)!.capacites.length);
    }
  });

  it('donne à chaque niveau une entrée de banque, avec des exercices de son chapitre', () => {
    expect(Object.keys(MATHS_4E_BANK).sort()).toEqual(levels.map(({ level }) => level.id).sort());
    for (const { city, level } of levels) {
      const entry = MATHS_4E_BANK[level.id]!;
      expect(entry.ref).toBe(city.ref);
      for (const id of entry.exercises) expect(exercises.get(id)?.chapitre).toBe(city.ref);
      if (level.type === 'exercices' || level.type === 'evaluation') {
        expect(exercisesOfLevel(level.id).length).toBeGreaterThanOrEqual(2);
      }
      expect(capacitesOfLevel(level.id).length).toBeGreaterThan(0);
    }
  });

  it('n’utilise jamais un exercice deux fois, ni un brouillon', () => {
    const used = Object.values(MATHS_4E_BANK).flatMap((entry) => entry.exercises);
    expect(new Set(used).size).toBe(used.length);
    for (const id of used) expect(exercises.get(id)?.statut_validation).not.toBe('brouillon');
  });

  it('n’envoie à l’app aucun énoncé ni corrigé', () => {
    const client = JSON.stringify(maths4e2020);
    // Clés JSON des exercices (et non les mots, « corrige » est un verbe) et leurs identifiants.
    for (const key of ['"enonce":', '"corrige":', '"reponse_finale":', 'EX-M4-']) {
      expect(client).not.toContain(key);
    }
    for (const exercise of referentiel.exercices) expect(client).not.toContain(exercise.enonce);
  });

  it('rend toutes les villes jouables (contenu à faire relire avant publication)', () => {
    expect(cities.every(({ city }) => city.playable)).toBe(true);
  });

  it('garde des identifiants de niveau stables (ils sont enregistrés en base)', () => {
    expect(levels.map(({ level }) => level.id)).toMatchSnapshot();
  });
});
