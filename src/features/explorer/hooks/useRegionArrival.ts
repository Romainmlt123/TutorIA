import { useCallback, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';

import type { SubjectId } from '@/data/types';

import { ISLAND_SPACING } from '../components/IslandStage';
import type { useSkyVeil } from './useSkyVeil';
import type { ExplorerView } from '../logic/explorerView';
import {
  CLOUD_PHASE_MS,
  DIVE_COVER_MS,
  DIVE_COVER_START_MS,
  DIVE_MS,
  INTRO_MS,
  OVERVIEW_HOLD_MS,
  READY_CAP_MS,
  type CinematicKind,
} from '../logic/cinematics';
import type { ZoomState } from '../logic/mapZoom';
import { focusOf } from '../logic/regions';
import { diveShot } from '../logic/shots';
import { PRERENDERED_MAPS } from '../tiles';
import type { useCinematicCamera } from './useCinematicCamera';
import type { useMapPan } from './useMapPan';

type ActiveCinema = { id: number; kind: CinematicKind; finalView: ExplorerView } | null;
type Options = {
  activeCinema: MutableRefObject<ActiveCinema>;
  animated: boolean;
  beginCinema: (kind: CinematicKind, finalView: ExplorerView) => number;
  cinemaStartTimerRef: MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  finishCinema: (id: number) => void;
  index: number;
  introEndWaiterRef: MutableRefObject<(() => void) | null>;
  introReadyWaiterRef: MutableRefObject<(() => void) | null>;
  onOpenAt: ReturnType<typeof useMapPan>['openAt'];
  open: (view: ExplorerView) => void;
  pendingIntroRef: MutableRefObject<{ from: ZoomState; to: ZoomState } | null>;
  select: (regionId: string) => void;
  setDiving: Dispatch<SetStateAction<string | null>>;
  setIntro: Dispatch<SetStateAction<boolean>>;
  startCameraFlight: ReturnType<typeof useCinematicCamera>['startCameraFlight'];
  startIntro: (from: ZoomState, to: ZoomState) => void;
  subjectId: SubjectId;
  startWind: () => void;
  veil: ReturnType<typeof useSkyVeil>;
  webgl: boolean;
  worldReadyRef: MutableRefObject<boolean>;
};

const wait = (duration: number) => new Promise<void>((resolve) => setTimeout(resolve, duration));

export function useRegionArrival({
  activeCinema,
  animated,
  beginCinema,
  cinemaStartTimerRef,
  finishCinema,
  index,
  introEndWaiterRef,
  introReadyWaiterRef,
  onOpenAt,
  open,
  pendingIntroRef,
  select,
  setDiving,
  setIntro,
  startCameraFlight,
  startIntro,
  subjectId,
  startWind,
  veil,
  webgl,
  worldReadyRef,
}: Options) {
  const finishArrival = useCallback(
    async (id: number) => {
      await wait(OVERVIEW_HOLD_MS);
      const sequence = activeCinema.current;
      if (sequence?.id !== id || sequence.finalView.kind !== 'region') return;
      if (!PRERENDERED_MAPS[sequence.finalView.regionId]) {
        finishCinema(id);
        return;
      }
      let pending = pendingIntroRef.current;
      if (!pending) {
        await new Promise<void>((resolve) => {
          let timer: ReturnType<typeof setTimeout>;
          const ready = () => {
            clearTimeout(timer);
            introReadyWaiterRef.current = null;
            resolve();
          };
          timer = setTimeout(ready, READY_CAP_MS);
          introReadyWaiterRef.current = ready;
        });
        if (activeCinema.current?.id !== id) return;
        pending = pendingIntroRef.current;
      }
      if (!pending) {
        finishCinema(id);
        return;
      }
      pendingIntroRef.current = null;
      const arrival = pending;
      let completed = false;
      await Promise.race([
        new Promise<void>((resolve) => {
          introEndWaiterRef.current = () => {
            completed = true;
            resolve();
          };
          startIntro(arrival.from, arrival.to);
        }),
        wait(INTRO_MS + READY_CAP_MS),
      ]);
      if (activeCinema.current?.id !== id) return;
      if (!completed) onOpenAt(arrival.to, arrival.to, false);
      finishCinema(id);
    },
    [
      activeCinema,
      finishCinema,
      introEndWaiterRef,
      introReadyWaiterRef,
      onOpenAt,
      pendingIntroRef,
      startIntro,
    ],
  );

  const enter = useCallback(
    (regionId: string) => {
      select(regionId);
      if (!animated) {
        setIntro(false);
        open({ kind: 'region', subjectId, regionId });
        return;
      }
      const finalView: ExplorerView = { kind: 'region', subjectId, regionId };
      const id = beginCinema('regions-to-region', finalView);
      startWind();
      setIntro(PRERENDERED_MAPS[regionId] !== undefined);
      worldReadyRef.current = false;
      pendingIntroRef.current = null;
      setDiving(regionId);
      if (webgl) {
        void startCameraFlight(
          {
            x: index * ISLAND_SPACING,
            z: 0,
            shot: diveShot(focusOf(regionId) ?? [0, 0]),
          },
          DIVE_MS,
          'inCubic',
          0.2,
        );
      }
      cinemaStartTimerRef.current = setTimeout(() => {
        cinemaStartTimerRef.current = undefined;
        if (activeCinema.current?.id !== id) return;
        veil.pass(
          () => {
            setDiving(null);
            open(finalView);
          },
          {
            coverMs: DIVE_COVER_MS,
            openMs: CLOUD_PHASE_MS,
            waitReady: PRERENDERED_MAPS[regionId] !== undefined,
            onOpened: () => void finishArrival(id),
          },
        );
      }, DIVE_COVER_START_MS);
    },
    [
      activeCinema,
      animated,
      beginCinema,
      cinemaStartTimerRef,
      finishArrival,
      index,
      open,
      pendingIntroRef,
      select,
      setDiving,
      setIntro,
      startCameraFlight,
      subjectId,
      veil,
      startWind,
      webgl,
      worldReadyRef,
    ],
  );

  return { enter };
}
