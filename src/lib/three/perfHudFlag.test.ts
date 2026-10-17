type Storage = typeof import('@react-native-async-storage/async-storage').default;
type Flag = typeof import('./perfHudFlag');

/** Un interrupteur neuf, comme au lancement de l'app, avec le stockage qu'il utilise. */
function freshFlag(): { flag: Flag; storage: Storage } {
  let loaded: { flag: Flag; storage: Storage } | undefined;
  jest.isolateModules(() => {
    loaded = {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      flag: require('./perfHudFlag') as Flag,
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      storage: require('@react-native-async-storage/async-storage') as Storage,
    };
  });
  if (!loaded) throw new Error('module non chargé');
  return loaded;
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('interrupteur du compteur de performance', () => {
  it('reprend la valeur retenue sur l’appareil au premier abonné', async () => {
    const { flag, storage } = freshFlag();
    await storage.setItem(flag.PERF_HUD_KEY, '1');
    const listener = jest.fn();
    flag.subscribePerfHud(listener);
    await settle();
    expect(flag.getPerfHud()).toBe(true);
    expect(listener).toHaveBeenCalled();
  });

  it('prévient tous les écrans abonnés et retient le choix', async () => {
    const { flag, storage } = freshFlag();
    const explorer = jest.fn();
    const atelier = jest.fn();
    flag.subscribePerfHud(explorer);
    flag.subscribePerfHud(atelier);
    await settle();
    flag.setPerfHud(true);
    expect(flag.getPerfHud()).toBe(true);
    expect(explorer).toHaveBeenCalled();
    expect(atelier).toHaveBeenCalled();
    await settle();
    expect(await storage.getItem(flag.PERF_HUD_KEY)).toBe('1');
  });

  it('garde le choix fait pendant la lecture, sans revenir à l’ancienne valeur', async () => {
    const { flag, storage } = freshFlag();
    let finishRead: (value: string | null) => void = () => undefined;
    jest
      .spyOn(storage, 'getItem')
      .mockImplementationOnce(() => new Promise((resolve) => (finishRead = resolve)));
    flag.subscribePerfHud(jest.fn());
    flag.setPerfHud(false);
    finishRead('1');
    await settle();
    expect(flag.getPerfHud()).toBe(false);
  });
});
