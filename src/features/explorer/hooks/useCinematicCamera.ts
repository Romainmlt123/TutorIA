import { useCallback, useRef, useState } from 'react';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import type { CameraFlight } from '../components/IslandStage';

type CameraTarget = NonNullable<CameraFlight['to']>;

export function useCinematicCamera() {
  const [cameraFlight, setCameraFlight] = useState<CameraFlight | null>(null);
  const cameraProgress = useSharedValue(0);
  const flightId = useRef(0);
  const flightWaiter = useRef<{ id: number; resolve: () => void } | null>(null);

  const onFlightFinished = useCallback((id: number) => {
    if (flightWaiter.current?.id === id) {
      flightWaiter.current.resolve();
      flightWaiter.current = null;
    }
    setTimeout(() => setCameraFlight((flight) => (flight?.id === id ? null : flight)), 32);
  }, []);
  const startCameraFlight = useCallback(
    (
      to: CameraTarget,
      duration: number,
      easing: NonNullable<CameraFlight['easing']>,
      arc: number,
      from?: CameraFlight['from'],
    ) => {
      const id = ++flightId.current;
      const done = new Promise<void>((resolve) => {
        flightWaiter.current = { id, resolve };
      });
      cameraProgress.set(0);
      setCameraFlight({ id, progress: cameraProgress, to, from, easing, arc });
      cameraProgress.set(
        withTiming(1, { duration, easing: Easing.linear }, (finished) => {
          if (finished) runOnJS(onFlightFinished)(id);
        }),
      );
      return done;
    },
    [cameraProgress, onFlightFinished],
  );
  const snapCamera = useCallback(
    (to: CameraTarget) => {
      cancelAnimation(cameraProgress);
      flightWaiter.current?.resolve();
      flightWaiter.current = null;
      const id = ++flightId.current;
      cameraProgress.set(1);
      setCameraFlight({
        id,
        progress: cameraProgress,
        to,
        easing: 'inOutCubic',
        arc: 0,
        snap: true,
      });
      setTimeout(() => setCameraFlight((flight) => (flight?.id === id ? null : flight)), 32);
    },
    [cameraProgress],
  );
  const cancel = useCallback(() => {
    cancelAnimation(cameraProgress);
    flightWaiter.current?.resolve();
    flightWaiter.current = null;
  }, [cameraProgress]);

  return { cameraFlight, startCameraFlight, snapCamera, cancel };
}
