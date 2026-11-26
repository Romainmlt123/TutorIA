function loadPreference(stored: string | null) {
  jest.resetModules();
  jest.doMock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
      getItem: jest.fn(() => Promise.resolve(stored)),
      setItem: jest.fn(() => Promise.resolve()),
    },
  }));
  let preference!: typeof import('./soundsPreference');
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    preference = require('./soundsPreference') as typeof import('./soundsPreference');
  });
  return preference;
}

describe('soundsPreference', () => {
  it('est activée par défaut', () => {
    expect(loadPreference(null).soundsEnabled()).toBe(true);
  });

  it('respecte une valeur enregistrée à zéro', async () => {
    const { soundsEnabled } = loadPreference('0');
    await Promise.resolve();
    expect(soundsEnabled()).toBe(false);
  });
});
