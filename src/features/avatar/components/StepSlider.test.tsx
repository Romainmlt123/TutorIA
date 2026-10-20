import { trackValue } from './StepSlider';

describe('valeur du curseur sur la piste', () => {
  it('ignore une coordonnée absente ou non finie', () => {
    expect(trackValue(undefined, 100)).toBeNull();
    expect(trackValue(Number.NaN, 100)).toBeNull();
  });

  it('ignore une piste de largeur nulle', () => {
    expect(trackValue(0, 0)).toBeNull();
  });

  it('convertit les extrémités et le milieu en valeurs crantées', () => {
    expect(trackValue(0, 100)).toBe(0);
    expect(trackValue(50, 100)).toBe(0.5);
    expect(trackValue(100, 100)).toBe(1);
  });
});
