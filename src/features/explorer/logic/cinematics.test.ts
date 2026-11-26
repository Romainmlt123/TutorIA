import {
  CLOUD_PHASE_MS,
  DIVE_COVER_MS,
  DIVE_COVER_START_MS,
  DIVE_MS,
  OVERVIEW_MIN_FACTOR,
  READY_CAP_MS,
} from './cinematics';

describe('durées des cinématiques', () => {
  it('commence à couvrir de nuages avant la fin de la plongée', () => {
    expect(DIVE_COVER_START_MS).toBeGreaterThan(0);
    expect(DIVE_COVER_START_MS + DIVE_COVER_MS).toBe(DIVE_MS);
  });

  it('laisse aux nuages le temps de s’ouvrir plus longtemps que l’attente maximale de la carte', () => {
    expect(CLOUD_PHASE_MS).toBeGreaterThan(READY_CAP_MS);
  });

  it('ne dézoome jamais en dessous du facteur minimal', () => {
    expect(OVERVIEW_MIN_FACTOR).toBeGreaterThan(0);
    expect(OVERVIEW_MIN_FACTOR).toBeLessThanOrEqual(1);
  });
});
