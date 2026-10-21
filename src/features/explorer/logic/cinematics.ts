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

export type CinematicPhase =
  | 'flight'
  | 'dive'
  | 'dezoom'
  | 'cover'
  | 'waiting'
  | 'open'
  | 'overview-hold'
  | 'zoom'
  | 'return-flight'
  | 'ending'
  | 'done';

export type CinematicProgress = {
  phase: CinematicPhase;
  camera: number;
  clouds: number;
  drift: number;
  mapZoom: number;
  sceneChanged: boolean;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function timed(progress: number, duration: number): number {
  return clamp01(progress / duration);
}

export function cinematicAt(
  kind: CinematicKind,
  elapsedMs: number,
  readyDelayMs = 0,
): CinematicProgress {
  const time = Math.max(0, elapsedMs);
  if (kind === 'island-to-regions' || kind === 'regions-to-island') {
    const camera = timed(time, ISLAND_FLIGHT_MS);
    return time < ISLAND_FLIGHT_MS
      ? { phase: 'flight', camera, clouds: 0, drift: camera, mapZoom: 0, sceneChanged: true }
      : time < ISLAND_FLIGHT_MS + CINEMA_FRAME_MS
        ? {
            phase: 'ending',
            camera: 1,
            clouds: 0,
            drift: 1,
            mapZoom: 0,
            sceneChanged: true,
          }
        : finalCinematicState();
  }

  if (kind === 'regions-to-region') {
    if (time < DIVE_COVER_START_MS) {
      return {
        phase: 'dive',
        camera: timed(time, DIVE_MS),
        clouds: 0,
        drift: 0,
        mapZoom: 0,
        sceneChanged: false,
      };
    }
    if (time < DIVE_MS) {
      return {
        phase: 'cover',
        camera: timed(time, DIVE_MS),
        clouds: timed(time - DIVE_COVER_START_MS, DIVE_COVER_MS),
        drift: 0,
        mapZoom: 0,
        sceneChanged: false,
      };
    }
    const afterSceneChange = time - DIVE_MS;
    if (afterSceneChange < readyDelayMs) {
      return {
        phase: 'waiting',
        camera: 1,
        clouds: 1,
        drift: 0,
        mapZoom: 0,
        sceneChanged: true,
      };
    }
    const afterReady = afterSceneChange - readyDelayMs;
    if (afterReady < CLOUD_PHASE_MS) {
      return {
        phase: 'open',
        camera: 1,
        clouds: 1 + timed(afterReady, CLOUD_PHASE_MS),
        drift: 0,
        mapZoom: 0,
        sceneChanged: true,
      };
    }
    const afterOpen = afterReady - CLOUD_PHASE_MS;
    if (afterOpen < OVERVIEW_HOLD_MS) {
      return {
        phase: 'overview-hold',
        camera: 1,
        clouds: 2,
        drift: 0,
        mapZoom: 0,
        sceneChanged: true,
      };
    }
    const afterHold = afterOpen - OVERVIEW_HOLD_MS;
    if (afterHold < INTRO_MS) {
      return {
        phase: 'zoom',
        camera: 1,
        clouds: 2,
        drift: 0,
        mapZoom: timed(afterHold, INTRO_MS),
        sceneChanged: true,
      };
    }
    return time <
      DIVE_MS + readyDelayMs + CLOUD_PHASE_MS + OVERVIEW_HOLD_MS + INTRO_MS + CINEMA_FRAME_MS
      ? {
          phase: 'ending',
          camera: 1,
          clouds: 2,
          drift: 0,
          mapZoom: 1,
          sceneChanged: true,
        }
      : finalCinematicState();
  }

  if (time < RETURN_OVERVIEW_MS) {
    return {
      phase: 'dezoom',
      camera: 0,
      clouds: 0,
      drift: 0,
      mapZoom: timed(time, RETURN_OVERVIEW_MS),
      sceneChanged: false,
    };
  }
  const coverEnd = RETURN_OVERVIEW_MS + RETURN_COVER_MS;
  if (time < coverEnd) {
    return {
      phase: 'cover',
      camera: 0,
      clouds: timed(time - RETURN_OVERVIEW_MS, RETURN_COVER_MS),
      drift: 0,
      mapZoom: 1,
      sceneChanged: false,
    };
  }
  const afterSceneChange = time - coverEnd;
  if (afterSceneChange < CLOUD_PHASE_MS) {
    return {
      phase: 'open',
      camera: timed(afterSceneChange, RETURN_FLIGHT_MS),
      clouds: 1 + timed(afterSceneChange, CLOUD_PHASE_MS),
      drift: 0,
      mapZoom: 1,
      sceneChanged: true,
    };
  }
  if (afterSceneChange < RETURN_FLIGHT_MS) {
    return {
      phase: 'return-flight',
      camera: timed(afterSceneChange, RETURN_FLIGHT_MS),
      clouds: 2,
      drift: 0,
      mapZoom: 1,
      sceneChanged: true,
    };
  }
  return time < coverEnd + RETURN_FLIGHT_MS + CINEMA_FRAME_MS
    ? {
        phase: 'ending',
        camera: 1,
        clouds: 2,
        drift: 0,
        mapZoom: 1,
        sceneChanged: true,
      }
    : finalCinematicState();
}

export function finalCinematicState(): CinematicProgress {
  return {
    phase: 'done',
    camera: 1,
    clouds: 0,
    drift: 0,
    mapZoom: 1,
    sceneChanged: true,
  };
}
