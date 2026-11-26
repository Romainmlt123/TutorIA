import { presentOnce } from './presentOnce';

/** Contexte d'expo-gl simulé, et un rendu qui termine l'image comme celui de R3F en natif. */
function fakeContext() {
  const endFrameEXP = jest.fn();
  const context: { endFrameEXP?: () => void } = { endFrameEXP };
  const render = () => context.endFrameEXP?.();
  return { context, endFrameEXP, render };
}

describe('image dessinée en plusieurs passes', () => {
  it('ne présente que la passe rendue après `present()`', () => {
    const { context, endFrameEXP, render } = fakeContext();
    presentOnce(context, (present) => {
      render();
      render();
      present();
      render();
    });
    expect(endFrameEXP).toHaveBeenCalledTimes(1);
    expect(context.endFrameEXP).toBe(endFrameEXP);
  });

  it('rétablit la fin d’image même si une passe échoue', () => {
    const { context, endFrameEXP, render } = fakeContext();
    expect(() =>
      presentOnce(context, () => {
        render();
        throw new Error('passe en panne');
      }),
    ).toThrow('passe en panne');
    expect(context.endFrameEXP).toBe(endFrameEXP);
    render();
    expect(endFrameEXP).toHaveBeenCalledTimes(1);
  });

  it('dessine sans rien changer sur le web, où le contexte ne termine pas les images', () => {
    const context: { endFrameEXP?: () => void } = {};
    const draw = jest.fn((present: () => void) => present());
    presentOnce(context, draw);
    expect(draw).toHaveBeenCalledTimes(1);
    expect(context.endFrameEXP).toBeUndefined();
  });
});
