import { levelOf } from './xpLevel';

describe('niveau de l’élève', () => {
  it('passe un niveau tous les 500 XP', () => {
    expect(levelOf(3340)).toEqual({ level: 7, xp: 340, xpForNextLevel: 500 });
    expect(levelOf(0)).toEqual({ level: 1, xp: 0, xpForNextLevel: 500 });
    expect(levelOf(500)).toEqual({ level: 2, xp: 0, xpForNextLevel: 500 });
  });
});
