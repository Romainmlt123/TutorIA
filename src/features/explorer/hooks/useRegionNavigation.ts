import { useCallback, type MutableRefObject } from 'react';

import type { SubjectId } from '@/data/types';

import { ISLAND_SPACING } from '../components/IslandStage';
import { upOf, type ExplorerView } from '../logic/explorerView';
import {
  CLOUD_PHASE_MS,
  ISLAND_FLIGHT_MS,
  RETURN_COVER_MS,
  RETURN_FLIGHT_MS,
  RETURN_OVERVIEW_MS,
  type CinematicKind,
} from '../logic/cinematics';
import { nodesOverview, type ZoomState } from '../logic/mapZoom';
import type { RegionMap } from '../logic/regionMap';
import { focusOf } from '../logic/regions';
import { diveShot, regionsShot, shotFor } from '../logic/shots';
import type { IslandFrame } from '../logic/stageFrame';
import type { useSkyVeil } from './useSkyVeil';
import type { MapTiles } from '../tiles';
import type { useCinematicCamera } from './useCinematicCamera';

type ActiveCinema = { id: number; kind: CinematicKind; finalView: ExplorerView } | null;
type Options = {
  activeCinema: MutableRefObject<ActiveCinema>;
  animated: boolean;
  beginCinema: (kind: CinematicKind, finalView: ExplorerView) => number;
  finishCinema: (id: number) => void;
  finishMapIntro: () => void;
  focusPoint: readonly [number, number] | null;
  frame: IslandFrame;
  index: number;
  k: number;
  map: RegionMap | null;
  open: (view: ExplorerView) => void;
  startCameraFlight: ReturnType<typeof useCinematicCamera>['startCameraFlight'];
  subjectId: SubjectId;
  tiles?: MapTiles;
  animateMapTo: (state: ZoomState, duration: number) => void;
  veil: ReturnType<typeof useSkyVeil>;
  view: ExplorerView;
  webgl: boolean;
  worldReadyRef: MutableRefObject<boolean>;
  zone: { left: number; top: number; width: number; height: number } | null;
};

const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));

export function useRegionNavigation({
  activeCinema,
  animated,
  beginCinema,
  finishCinema,
  finishMapIntro,
  focusPoint,
  frame,
  index,
  k,
  map,
  open,
  startCameraFlight,
  subjectId,
  tiles,
  animateMapTo,
  veil,
  view,
  webgl,
  worldReadyRef,
  zone,
}: Options) {
  const overviewState = useCallback((): ZoomState | null => {
    if (!map || !zone) return null;
    return nodesOverview(map.nodes, zone, k);
  }, [k, map, zone]);
  const goBack = useCallback(() => {
    const up = upOf(view);
    if (!up) return;
    if (view.kind === 'region') {
      finishMapIntro();
      worldReadyRef.current = false;
      if (animated) {
        const id = beginCinema('region-to-regions', up);
        const overview = tiles ? overviewState() : null;
        void (async () => {
          if (overview) {
            animateMapTo(overview, RETURN_OVERVIEW_MS);
            await wait(RETURN_OVERVIEW_MS);
          }
          if (activeCinema.current?.id !== id) return;
          const fromShot = tiles
            ? diveShot(focusOf(view.regionId) ?? [0, 0])
            : shotFor(view, frame);
          veil.pass(
            () => {
              open(up);
              if (webgl) {
                void startCameraFlight(
                  {
                    x: index * ISLAND_SPACING,
                    z: 0,
                    shot: regionsShot(focusPoint),
                  },
                  RETURN_FLIGHT_MS,
                  'outCubic',
                  0.15,
                  { x: index * ISLAND_SPACING, z: 0, shot: fromShot },
                ).then(() => finishCinema(id));
              } else finishCinema(id);
            },
            { coverMs: RETURN_COVER_MS, openMs: CLOUD_PHASE_MS },
          );
        })();
        return;
      }
      veil.pass(() => open(up), { coverMs: RETURN_COVER_MS, openMs: CLOUD_PHASE_MS });
      return;
    }
    if (view.kind === 'regions' && up.kind === 'carousel') {
      if (animated && webgl) {
        const id = beginCinema('regions-to-island', up);
        const target = shotFor(up, frame, focusPoint);
        open(up);
        veil.drift(ISLAND_FLIGHT_MS);
        void startCameraFlight(
          { x: index * ISLAND_SPACING, z: 0, shot: target },
          ISLAND_FLIGHT_MS,
          'inOutCubic',
          0.35,
        ).then(() => finishCinema(id));
      } else open(up);
      return;
    }
    open(up);
  }, [
    activeCinema,
    animateMapTo,
    animated,
    beginCinema,
    finishCinema,
    finishMapIntro,
    focusPoint,
    frame,
    index,
    open,
    overviewState,
    startCameraFlight,
    tiles,
    veil,
    view,
    webgl,
    worldReadyRef,
  ]);

  const onExplore = useCallback(() => {
    const finalView: ExplorerView = { kind: 'regions', subjectId };
    if (!animated || !webgl) {
      open(finalView);
      return;
    }
    const id = beginCinema('island-to-regions', finalView);
    const target = regionsShot(focusPoint);
    open(finalView);
    veil.drift(ISLAND_FLIGHT_MS);
    void startCameraFlight(
      { x: index * ISLAND_SPACING, z: 0, shot: target },
      ISLAND_FLIGHT_MS,
      'inOutCubic',
      0.35,
    ).then(() => finishCinema(id));
  }, [
    animated,
    beginCinema,
    finishCinema,
    focusPoint,
    index,
    open,
    startCameraFlight,
    subjectId,
    veil,
    webgl,
  ]);
  return { goBack, onExplore };
}
