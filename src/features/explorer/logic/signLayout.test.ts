import { placeSign, placeSigns, type SignInput } from './signLayout';

const screen = { width: 390, height: 844 };
const sign = { width: 92, height: 52 };
const centre = { x: 195, y: 380 };
const bounds = { top: 150, bottom: 480 };
const options = { sign, screen, centre, bounds };

/** Trois régions comme sur l'île (plateau d'environ 270 px de large, vu à 55°). */
const INPUTS: SignInput[] = [
  { id: 'nombres', anchor: { x: 130, y: 400 }, edge: { x: 80, y: 440 } },
  { id: 'donnees', anchor: { x: 290, y: 400 }, edge: { x: 320, y: 440 } },
  { id: 'espace', anchor: { x: 230, y: 320 }, edge: { x: 250, y: 280 } },
];

describe('placement des panneaux de région', () => {
  it('pose chaque panneau au-delà du bord de l’île, du côté de sa région', () => {
    const espace = placeSign(INPUTS[2]!, options);
    expect(espace.top + sign.height).toBeLessThan(INPUTS[2]!.edge.y);
    const nombres = placeSign(INPUTS[0]!, options);
    expect(nombres.left + sign.width / 2).toBeLessThan(centre.x);
    const donnees = placeSign(INPUTS[1]!, options);
    expect(donnees.left + sign.width / 2).toBeGreaterThan(centre.x);
  });

  it('garde chaque panneau entièrement à l’écran et dans la zone permise', () => {
    const far: SignInput = { id: 'loin', anchor: { x: 5, y: 900 }, edge: { x: -40, y: 1200 } };
    const placement = placeSign(far, options);
    expect(placement.left).toBeGreaterThanOrEqual(8);
    expect(placement.left + sign.width).toBeLessThanOrEqual(screen.width - 8);
    expect(placement.top).toBeGreaterThanOrEqual(bounds.top);
    expect(placement.top + sign.height).toBeLessThanOrEqual(bounds.bottom);
  });

  it('accroche le trait au point du panneau le plus proche de la région', () => {
    const placement = placeSign(INPUTS[0]!, options);
    const { attach } = placement;
    expect(attach.x).toBeGreaterThanOrEqual(placement.left);
    expect(attach.x).toBeLessThanOrEqual(placement.left + sign.width);
    expect(attach.y).toBeGreaterThanOrEqual(placement.top);
    expect(attach.y).toBeLessThanOrEqual(placement.top + sign.height);
  });

  it('écarte les panneaux qui se recouvrent', () => {
    const crowded: SignInput[] = [
      { id: 'a', anchor: { x: 100, y: 400 }, edge: { x: 100, y: 440 } },
      { id: 'b', anchor: { x: 110, y: 400 }, edge: { x: 110, y: 440 } },
      { id: 'c', anchor: { x: 120, y: 400 }, edge: { x: 120, y: 440 } },
    ];
    const placements = [...placeSigns(crowded, options).values()];
    for (let i = 0; i < placements.length; i++) {
      for (let j = i + 1; j < placements.length; j++) {
        const a = placements[i]!;
        const b = placements[j]!;
        const overlaps =
          Math.abs(a.left - b.left) < sign.width && Math.abs(a.top - b.top) < sign.height;
        expect(overlaps).toBe(false);
      }
    }
    for (const p of placements) expect(p.top + sign.height).toBeLessThanOrEqual(bounds.bottom);
  });
});
