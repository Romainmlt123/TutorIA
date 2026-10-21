import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { logError } from '@/lib/logger';

import { setSoundsPreference } from './soundsPreference';
import { playCue } from './index';

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({ seekTo: jest.fn(), play: jest.fn() })),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('@/lib/logger', () => ({ logError: jest.fn() }));

describe('feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('ne crée ni lecteur ni vibration quand la préférence est coupée', async () => {
    setSoundsPreference(false);
    await playCue('tap');
    expect(createAudioPlayer).not.toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
  });

  it('joue sur le web sans vibration', async () => {
    const original = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    setSoundsPreference(true);
    await playCue('tap');
    expect(createAudioPlayer).toHaveBeenCalled();
    expect(Haptics.selectionAsync).not.toHaveBeenCalled();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: original });
  });

  it('journalise une erreur de lecteur sans la remonter', async () => {
    (createAudioPlayer as jest.Mock).mockImplementationOnce(() => {
      throw new Error('player');
    });
    setSoundsPreference(true);
    await expect(playCue('reward')).resolves.toBeUndefined();
    expect(logError).toHaveBeenCalledWith('feedback.play', expect.any(Error));
  });

  it('réessaie la configuration audio après une erreur', async () => {
    jest.resetModules();
    let audio!: typeof import('expo-audio');
    let feedback!: typeof import('./index');
    let isolatedLogError!: jest.Mock;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      audio = require('expo-audio') as typeof import('expo-audio');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      feedback = require('./index') as typeof import('./index');
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      isolatedLogError = (require('@/lib/logger') as { logError: jest.Mock }).logError;
    });

    const error = new Error('audio mode');
    jest.mocked(audio.setAudioModeAsync).mockRejectedValueOnce(error).mockResolvedValueOnce();
    feedback.setSoundsPreference(true);
    await feedback.playCue('tap');
    await feedback.playCue('tap');

    expect(audio.setAudioModeAsync).toHaveBeenCalledTimes(2);
    expect(audio.createAudioPlayer).toHaveBeenCalledTimes(1);
    expect(isolatedLogError).toHaveBeenCalledTimes(1);
    expect(isolatedLogError).toHaveBeenCalledWith('feedback.play', error);
  });
});
