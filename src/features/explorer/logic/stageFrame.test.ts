import { AIM_BELOW_CENTER, DEFAULT_FRAME, frameFor, ISLAND_HEIGHT, MAX_FILL } from './stageFrame';

describe('cadrage de l’île du carrousel', () => {
  it('tient toute la largeur permise quand la zone est haute', () => {
    const frame = frameFor({ top: 200, height: 600 }, { width: 400, height: 900 });
    expect(frame.fill).toBeCloseTo(MAX_FILL);
  });

  it('rapetisse l’île quand la zone est basse (petit écran, grand texte)', () => {
    const frame = frameFor({ top: 180, height: 210 }, { width: 400, height: 700 });
    expect(frame.fill * 400 * ISLAND_HEIGHT).toBeCloseTo(210);
  });

  it('centre l’île dans la zone, sous la pastille et au-dessus des points', () => {
    const zone = { top: 200, height: 500 };
    const frame = frameFor(zone, { width: 400, height: 1000 });
    const width = frame.fill * 400;
    const visualCenter = frame.aimY * 1000 - AIM_BELOW_CENTER * width;
    expect(visualCenter).toBeCloseTo(zone.top + zone.height / 2);
  });

  it('garde le cadrage de départ tant que la zone n’est pas mesurée', () => {
    expect(frameFor({ top: 0, height: 0 }, { width: 400, height: 900 })).toEqual(DEFAULT_FRAME);
  });
});
