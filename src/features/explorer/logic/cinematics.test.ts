import {
  CINEMA_FRAME_MS,
  CLOUD_PHASE_MS,
  DIVE_COVER_START_MS,
  DIVE_MS,
  INTRO_MS,
  ISLAND_FLIGHT_MS,
  OVERVIEW_HOLD_MS,
  READY_CAP_MS,
  RETURN_COVER_MS,
  RETURN_FLIGHT_MS,
  RETURN_OVERVIEW_MS,
  cinematicAt,
  finalCinematicState,
} from './cinematics';

describe('chronologie des cinématiques', () => {
  it('fait voler l’île vers les régions sans couverture complète', () => {
    expect(cinematicAt('island-to-regions', 800)).toMatchObject({
      phase: 'flight',
      camera: 0.5,
      drift: 0.5,
      clouds: 0,
    });
    expect(cinematicAt('regions-to-island', ISLAND_FLIGHT_MS + CINEMA_FRAME_MS).phase).toBe('done');
  });

  it('plonge, couvre, attend les tuiles, ouvre, garde la vue puis zoome', () => {
    expect(cinematicAt('regions-to-region', DIVE_COVER_START_MS).phase).toBe('cover');
    expect(cinematicAt('regions-to-region', DIVE_MS).sceneChanged).toBe(true);
    expect(cinematicAt('regions-to-region', DIVE_MS + READY_CAP_MS / 2, READY_CAP_MS).phase).toBe(
      'waiting',
    );
    expect(cinematicAt('regions-to-region', DIVE_MS + READY_CAP_MS, READY_CAP_MS)).toMatchObject({
      phase: 'open',
      clouds: 1,
    });
    expect(
      cinematicAt(
        'regions-to-region',
        DIVE_MS + READY_CAP_MS + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS,
        READY_CAP_MS,
      ),
    ).toMatchObject({ phase: 'zoom', mapZoom: 0 });
    expect(
      cinematicAt(
        'regions-to-region',
        DIVE_MS + READY_CAP_MS + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS + INTRO_MS / 2,
        READY_CAP_MS,
      ).mapZoom,
    ).toBeCloseTo(0.5);
    expect(
      cinematicAt('regions-to-region', DIVE_MS + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS + INTRO_MS),
    ).toMatchObject({ phase: 'ending', mapZoom: 1 });
    expect(
      cinematicAt(
        'regions-to-region',
        DIVE_MS + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS + INTRO_MS + CINEMA_FRAME_MS,
      ).phase,
    ).toBe('done');
    expect(
      cinematicAt(
        'regions-to-region',
        DIVE_MS + READY_CAP_MS + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS + INTRO_MS,
        READY_CAP_MS,
      ),
    ).toMatchObject({ phase: 'ending', mapZoom: 1 });
  });

  it('termine le zoom vers l’avatar à 7 400 ms quand les tuiles sont prêtes', () => {
    const zoomStartsAt = DIVE_MS + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS;
    expect(cinematicAt('regions-to-region', zoomStartsAt + INTRO_MS / 2)).toMatchObject({
      phase: 'zoom',
      mapZoom: 0.5,
    });
    expect(cinematicAt('regions-to-region', zoomStartsAt + INTRO_MS)).toMatchObject({
      phase: 'ending',
      mapZoom: 1,
    });
  });

  it('dézoome, couvre, puis recule pendant l’ouverture sur le retour', () => {
    expect(cinematicAt('region-to-regions', RETURN_OVERVIEW_MS / 2)).toMatchObject({
      phase: 'dezoom',
      mapZoom: 0.5,
    });
    expect(
      cinematicAt('region-to-regions', RETURN_OVERVIEW_MS + RETURN_COVER_MS / 2),
    ).toMatchObject({ phase: 'cover', clouds: 0.5 });
    const openingMidpoint = cinematicAt(
      'region-to-regions',
      RETURN_OVERVIEW_MS + RETURN_COVER_MS + CLOUD_PHASE_MS / 2,
    );
    expect(openingMidpoint).toMatchObject({ phase: 'open', clouds: 1.5 });
    expect(openingMidpoint.camera).toBeCloseTo(CLOUD_PHASE_MS / 2 / RETURN_FLIGHT_MS);
    expect(
      cinematicAt('region-to-regions', RETURN_OVERVIEW_MS + RETURN_COVER_MS + RETURN_FLIGHT_MS)
        .phase,
    ).toBe('ending');
  });

  it('donne un état déterministe lorsque la cinématique est passée', () => {
    expect(finalCinematicState()).toEqual({
      phase: 'done',
      camera: 1,
      clouds: 0,
      drift: 0,
      mapZoom: 1,
      sceneChanged: true,
    });
  });
});
