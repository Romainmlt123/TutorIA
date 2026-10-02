import {
  beginTurn,
  createTurn,
  dragTurn,
  FACE_HEIGHT,
  faceFront,
  previewShot,
  TURN_PER_PX,
} from './preview';

describe('cadrage de l’aperçu', () => {
  it('vise le visage à sa hauteur, qui suit la taille de la figurine', () => {
    const aim = previewShot('face', 1).aim[1];
    expect(aim).toBeLessThan(FACE_HEIGHT);
    expect(aim).toBeGreaterThan(FACE_HEIGHT - 0.1);
    expect(previewShot('face', 1.1).aim[1]).toBeCloseTo(aim * 1.1);
  });

  it('cadre la figurine en pied sans suivre sa taille, pour la voir grandir', () => {
    expect(previewShot('body', 0.9)).toEqual(previewShot('body', 1.1));
  });

  it('se rapproche pour le visage', () => {
    expect(previewShot('face', 1).from[2]).toBeLessThan(previewShot('body', 1).from[2]);
  });
});

describe('rotation au doigt', () => {
  it('part de la rotation du début du geste, et revient de face', () => {
    const turn = createTurn();
    beginTurn(turn);
    dragTurn(turn, 100);
    expect(turn.current).toBeCloseTo(100 * TURN_PER_PX);
    beginTurn(turn);
    dragTurn(turn, -50);
    expect(turn.current).toBeCloseTo(50 * TURN_PER_PX);
    faceFront(turn);
    expect(turn.current).toBe(0);
  });
});
