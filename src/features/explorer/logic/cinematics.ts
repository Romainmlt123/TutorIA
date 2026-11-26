export const CINEMA_FRAME_MS = 350;
export const ISLAND_FLIGHT_MS = 1600;
export const DIVE_MS = 2400;
export const DIVE_COVER_START_MS = 1000;
export const DIVE_COVER_MS = DIVE_MS - DIVE_COVER_START_MS;
export const RETURN_OVERVIEW_MS = 800;
export const RETURN_COVER_MS = 1400;
export const RETURN_FLIGHT_MS = 1600;
export const CLOUD_PHASE_MS = 1600;
export const READY_CAP_MS = 800;
export const OVERVIEW_HOLD_MS = 1200;
export const INTRO_MS = 2200;
export const OVERVIEW_MIN_FACTOR = 0.8;

export type CinematicKind =
  'island-to-regions' | 'regions-to-island' | 'regions-to-region' | 'region-to-regions';
