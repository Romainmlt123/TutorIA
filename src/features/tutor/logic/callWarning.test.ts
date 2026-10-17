import { callWarning } from './callWarning';

describe('callWarning', () => {
  it('ne dit rien tant qu’il reste plus de deux minutes', () => {
    expect(callWarning(0, null)).toBeNull();
    expect(callWarning(60, 400)).toBeNull();
  });

  it('annonce la pause quand elle arrive avant la fin de l’appel', () => {
    expect(callWarning(0, 90)).toBe('pause');
    expect(callWarning(300, 400)).toBe('pause');
  });

  it('annonce la fin de l’appel à 8 minutes sans pause proche', () => {
    expect(callWarning(480, null)).toBe('end');
    expect(callWarning(500, 3600)).toBe('end');
  });

  it('se tait quand la limite est passée (l’appel se termine)', () => {
    expect(callWarning(100, 90)).toBeNull();
    expect(callWarning(600, null)).toBeNull();
  });
});
