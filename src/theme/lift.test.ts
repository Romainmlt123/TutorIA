import { liftShadow } from './lift';

describe('liftShadow', () => {
  it('teinte l’ombre de la couleur de la carte, contact bleu nuit côté élève', () => {
    expect(liftShadow('orange')).toBe(
      '0 18px 32px -10px rgba(208,136,37, 0.65), 0 4px 12px rgba(3,39,110, 0.16)',
    );
  });

  it('passe au violet pour une carte blanche de l’espace Parents', () => {
    expect(liftShadow('white', true)).toBe(
      '0 18px 32px -10px rgba(59,13,162, 0.3), 0 4px 12px rgba(59,13,162, 0.16)',
    );
  });
});
