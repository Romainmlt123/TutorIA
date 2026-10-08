import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useSharedValue } from 'react-native-reanimated';

import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import {
  mockTutorService,
  tutorService,
  TUTOR_LIMITS,
  VoiceSessionError,
  type TutorService,
  type TutorTopic,
  type VoiceCaption,
  type VoiceSession,
} from '@/services/tutor';
import type { TutorVisual } from '@/services/tutor/visuals';

import { initialVoiceState, voiceReducer, voiceStatus } from '../logic/voice';
import { useCaptionsPreference } from './useCaptionsPreference';
import { takeExercisePhoto } from './useExercisePhoto';

type CameraState = 'idle' | 'active';

const NOTICE_MS = 4000;

/**
 * Appel vocal : démarre la session (réelle, ou simulée si le vocal en direct est indisponible),
 * suit son état, gère le micro, l'interruption, la photo et la durée maximale. Pour l'écran
 * d'appel (v2.6), il expose aussi le niveau de la voix du tuteur (valeur partagée, sans rendu),
 * les sous-titres et le dernier visuel montré.
 */
export function useVoiceCall(
  topic: TutorTopic,
  onEnd: () => void,
  service: TutorService = tutorService,
) {
  const [state, dispatch] = useReducer(voiceReducer, initialVoiceState);
  const [notice, setNotice] = useState<string | undefined>();
  const [persistentNotice, setPersistentNotice] = useState<string | undefined>();
  const [camera, setCamera] = useState<CameraState>('idle');
  const [elapsed, setElapsed] = useState(0);
  const session = useRef<VoiceSession | null>(null);
  const status = voiceStatus(state);
  const level = useSharedValue(0);
  const [caption, setCaption] = useState<VoiceCaption | null>(null);
  const [visual, setVisual] = useState<TutorVisual | null>(null);
  const { captionsOn, toggleCaptions } = useCaptionsPreference();

  const flash = useCallback((message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(undefined), NOTICE_MS);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const start = async (current: TutorService) => {
      const started = await current.startVoiceSession({
        topic,
        onEvent: dispatch,
        onCaption: setCaption,
        onLevel: (value) => {
          level.value = value;
        },
        onVisual: setVisual,
      });
      if (cancelled) started.stop();
      else session.current = started;
    };
    start(service).catch(async (error: unknown) => {
      if (error instanceof VoiceSessionError && error.code === 'unavailable') {
        // Expo Go ou navigateur sans WebRTC : appel d'entraînement, annoncé comme tel.
        setPersistentNotice(fr.tutor.voiceUnavailable);
        await start(mockTutorService);
        return;
      }
      const code = error instanceof VoiceSessionError ? error.code : 'network';
      if (code !== 'microphone') logError('voice.start', error);
      setPersistentNotice(
        code === 'microphone'
          ? fr.tutor.micDenied
          : code === 'daily_limit'
            ? fr.tutor.voiceDailyLimit
            : code === 'rate_limited'
              ? fr.tutor.errors.rate_limited
              : fr.tutor.voiceStatus.error,
      );
      dispatch({ type: 'failed' });
    });
    return () => {
      cancelled = true;
      session.current?.stop();
      session.current = null;
    };
    // Une session par sujet de discussion.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic.chapterId, service]);

  // Chrono de l'appel et raccrochage automatique après 10 minutes.
  useEffect(() => {
    if (state.phase !== 'live') return;
    const startedAt = Date.now() - elapsed * 1000;
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(seconds);
      if (seconds * 1000 >= TUTOR_LIMITS.voiceCallMaxMs) {
        session.current?.stop();
        setPersistentNotice(fr.tutor.voiceTimeLimit);
      }
    }, 1000);
    return () => clearInterval(timer);
    // Le chrono reprend là où il en était si la phase change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  const toggleMute = () => session.current?.setMuted(!state.muted);

  const interrupt = () => {
    if (status === 'aiSpeaking') session.current?.interrupt();
  };

  const hangUp = () => {
    session.current?.stop();
    session.current = null;
    onEnd();
  };

  const sendPhoto = async () => {
    if (camera === 'active' || !session.current) return;
    setCamera('active');
    // Pendant que l'appareil photo est ouvert, le micro ne doit pas capter la pièce.
    session.current.holdMicrophone(true);
    try {
      const photo = await takeExercisePhoto();
      if (photo.status === 'denied') flash(fr.tutor.cameraDenied);
      if (photo.status === 'tooLarge') flash(fr.tutor.cameraTooLarge);
      if (photo.status === 'ok') {
        setNotice(fr.tutor.cameraSending);
        await session.current?.sendExercisePhoto(photo.dataUrl);
        flash(fr.tutor.cameraSent);
      }
    } catch (error) {
      logError('voice.photo', error);
      flash(fr.tutor.errors.upstream);
    } finally {
      session.current?.holdMicrophone(false);
      setCamera('idle');
    }
  };

  const report = () => {
    service
      .reportMessage(fr.tutor.voice, topic)
      .catch((error: unknown) => logError('voice.report', error));
    flash(fr.tutor.reportDone);
  };

  return {
    status,
    /** Niveau de la voix du tuteur (0 à 1), pour le logo qui rebondit. */
    level,
    caption,
    captionsOn,
    toggleCaptions,
    visual,
    muted: state.muted,
    elapsed,
    notice: notice ?? persistentNotice,
    cameraActive: camera === 'active',
    toggleMute,
    interrupt,
    hangUp,
    sendPhoto,
    report,
  };
}
