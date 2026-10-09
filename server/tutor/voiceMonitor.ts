import { getVoiceMonitorEnv, type VoiceMonitorEnv } from '../env';
import { serverLog } from '../log';

/** Ce que le surveillant reçoit pour un appel (voir monitor/callMonitor.ts, type `Watch`). */
export type VoiceWatch = {
  callId: string;
  instructionsHash: string;
  tools: string[];
  maxSeconds: number;
  allowedTexts: string[];
  maxPhotos: number;
  /** Consignes que le surveillant glisse au tuteur quand la voix de l'élève est signalée. */
  notes: { distress: string; offTopic: string; tutorCut: string };
};

export type MonitorDeps = {
  env: () => VoiceMonitorEnv | null;
  fetch: typeof fetch;
  /** Sans surveillant configuré, le vocal n'est permis qu'en développement. */
  production: () => boolean;
};

const defaultDeps: MonitorDeps = {
  env: getVoiceMonitorEnv,
  fetch: (input, init) => fetch(input, init),
  production: () => process.env.NODE_ENV === 'production',
};

/** Le surveillant répond dès qu'il est branché sur l'appel (quelques centaines de ms). */
const ATTACH_TIMEOUT_MS = 6_000;

/**
 * Confie l'appel au surveillant. `false` : l'appel ne doit pas continuer sans lui (il est raccroché
 * par l'appelant). En développement, sans surveillant configuré, l'appel continue avec un
 * avertissement dans le journal.
 */
export async function attachVoiceMonitor(
  watch: VoiceWatch,
  deps: MonitorDeps = defaultDeps,
): Promise<boolean> {
  let env: VoiceMonitorEnv | null;
  try {
    env = deps.env();
  } catch (error) {
    serverLog.error('voice.monitor', error);
    return false;
  }
  if (!env) {
    if (deps.production()) {
      serverLog.error('voice.monitor', new Error('VOICE_MONITOR_URL manquant en production'));
      return false;
    }
    serverLog.warn('voice.monitor', { unmonitored: true });
    return true;
  }
  try {
    const response = await deps.fetch(new URL('/watch', env.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.token}` },
      body: JSON.stringify(watch),
      signal: AbortSignal.timeout(ATTACH_TIMEOUT_MS),
    });
    if (response.ok) return true;
    serverLog.warn('voice.monitor', { status: response.status });
    return false;
  } catch (error) {
    serverLog.error('voice.monitor', error);
    return false;
  }
}
