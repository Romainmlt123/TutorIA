import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { logError } from '@/lib/logger';

import { soundsEnabled } from './soundsPreference';

export type Cue =
  | 'tap'
  | 'star1'
  | 'star2'
  | 'star3'
  | 'unlock'
  | 'cityDone'
  | 'cityCue'
  | 'dive'
  | 'levelPassed'
  | 'reward';

type Haptic = 'selection' | 'light' | 'success' | null;

export const CUES: Record<Cue, { sound: number; haptic: Haptic }> = {
  tap: { sound: require('../../../assets/sounds/tap.m4a'), haptic: 'selection' },
  star1: { sound: require('../../../assets/sounds/star1.m4a'), haptic: 'light' },
  star2: { sound: require('../../../assets/sounds/star2.m4a'), haptic: 'light' },
  star3: { sound: require('../../../assets/sounds/star3.m4a'), haptic: 'light' },
  unlock: { sound: require('../../../assets/sounds/unlock.m4a'), haptic: 'light' },
  cityDone: { sound: require('../../../assets/sounds/cityDone.m4a'), haptic: 'success' },
  cityCue: { sound: require('../../../assets/sounds/cityCue.m4a'), haptic: 'light' },
  dive: { sound: require('../../../assets/sounds/dive.m4a'), haptic: null },
  levelPassed: { sound: require('../../../assets/sounds/levelPassed.m4a'), haptic: 'success' },
  reward: { sound: require('../../../assets/sounds/reward.m4a'), haptic: 'success' },
};

const players = new Map<Cue, AudioPlayer>();
let audioMode: Promise<void> | null = null;

function configureAudio(): Promise<void> {
  if (!audioMode) {
    audioMode = setAudioModeAsync({
      playsInSilentMode: false,
      interruptionMode: 'mixWithOthers',
    }).catch((error: unknown) => {
      audioMode = null;
      logError('feedback.play', error);
      throw error;
    });
  }
  return audioMode;
}

async function playHaptic(haptic: Haptic): Promise<void> {
  if (Platform.OS === 'web' || haptic === null) return;
  if (haptic === 'selection') {
    await Haptics.selectionAsync();
  } else if (haptic === 'light') {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } else {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
}

/** Joue le son et, quand disponible, le retour haptique du cue. */
export async function playCue(cue: Cue): Promise<void> {
  if (!soundsEnabled()) return;
  const definition = CUES[cue];
  let audioReady = true;
  try {
    await configureAudio();
  } catch {
    audioReady = false;
  }
  if (audioReady) {
    try {
      let player = players.get(cue);
      if (!player) {
        player = createAudioPlayer(definition.sound);
        players.set(cue, player);
      }
      player.seekTo(0);
      player.play();
    } catch (error: unknown) {
      logError('feedback.play', error);
    }
  }
  try {
    await playHaptic(definition.haptic);
  } catch (error: unknown) {
    logError('feedback.play', error);
  }
}

export {
  setSoundsPreference,
  soundsEnabled,
  SOUNDS_KEY,
  useSoundsPreference,
} from './soundsPreference';
