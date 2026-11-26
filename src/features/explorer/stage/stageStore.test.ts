import type { IslandSlide } from '../logic/islands';
import { createOrbit } from '../logic/orbit';
import { shotFor } from '../logic/shots';
import { DEFAULT_FRAME } from '../logic/stageFrame';
import {
  clearStage,
  createStageStore,
  followVisit,
  leaveStage,
  publishStage,
  subscribeStage,
  type StageAttempt,
  type StageScene,
} from './stageStore';

/** Une scène telle que l'écran Explorer la publie, sur le carrousel des îles. */
function sceneOf(active = true, shown = active): StageScene {
  return {
    stage: {
      slides: [{ subjectId: 'maths' }],
      index: 0,
      shot: shotFor({ kind: 'carousel' }, DEFAULT_FRAME, null),
      orbit: createOrbit(),
      regions: { mix: 0, focus: null },
      active,
      animated: true,
    },
    fallback: { slide: MATHS, frame: DEFAULT_FRAME },
    shown,
  };
}

const MATHS: IslandSlide = {
  subjectId: 'maths',
  available: true,
  citiesDone: 0,
  citiesTotal: 6,
  stars: 0,
  progress: 0,
  next: null,
  started: false,
};

describe('scène d’Explorer confiée à l’hôte de la racine', () => {
  it('reste vide tant qu’Explorer n’a pas été ouvert : rien n’est monté', () => {
    expect(createStageStore().scene).toBeNull();
  });

  it('garde la scène publiée par l’écran et prévient l’hôte', () => {
    const store = createStageStore();
    const host = jest.fn();
    subscribeStage(store, host);
    const scene = sceneOf();
    publishStage(store, scene);
    expect(store.scene).toBe(scene);
    expect(host).toHaveBeenCalledTimes(1);
  });

  it('prévient l’hôte à chaque publication, comme un enfant redessiné avec l’écran', () => {
    const store = createStageStore();
    const scene = sceneOf();
    publishStage(store, scene);
    const host = jest.fn();
    subscribeStage(store, host);
    publishStage(store, { ...scene });
    publishStage(store, { ...scene, stage: { ...scene.stage, index: 1 } });
    expect(host).toHaveBeenCalledTimes(2);
    expect(store.scene?.stage.index).toBe(1);
  });

  it('ne prévient plus un hôte désabonné', () => {
    const store = createStageStore();
    const host = jest.fn();
    const unsubscribe = subscribeStage(store, host);
    unsubscribe();
    publishStage(store, sceneOf());
    expect(host).not.toHaveBeenCalled();
  });

  it('arrête et cache la scène quand l’écran disparaît, sans l’oublier', () => {
    const store = createStageStore();
    const scene = sceneOf();
    publishStage(store, scene);
    const host = jest.fn();
    subscribeStage(store, host);
    leaveStage(store);
    expect(store.scene?.stage.active).toBe(false);
    expect(store.scene?.shown).toBe(false);
    expect(store.scene?.stage.index).toBe(scene.stage.index);
    expect(store.scene?.fallback).toBe(scene.fallback);
    // Un nouvel objet : l'hôte, qui lit la scène avec useSyncExternalStore, voit le changement.
    expect(store.scene).not.toBe(scene);
    expect(host).toHaveBeenCalledTimes(1);
  });

  it('cache aussi une scène déjà en pause sous un niveau ouvert par-dessus', () => {
    const store = createStageStore();
    publishStage(store, sceneOf(false, true));
    leaveStage(store);
    expect(store.scene?.shown).toBe(false);
  });

  it('ne fait rien au départ si la scène est absente, ou déjà arrêtée et cachée', () => {
    const store = createStageStore();
    const host = jest.fn();
    subscribeStage(store, host);
    leaveStage(store);
    expect(store.scene).toBeNull();
    const hidden = sceneOf(false, false);
    publishStage(store, hidden);
    host.mockClear();
    leaveStage(store);
    expect(store.scene).toBe(hidden);
    expect(host).not.toHaveBeenCalled();
  });

  it('retente une scène en échec à la visite suivante d’Explorer, sous une nouvelle clé', () => {
    const failed: StageAttempt = { key: 2, failed: true, active: false };
    expect(followVisit(failed, true)).toEqual({ key: 3, failed: false, active: true });
  });

  it('ne retente pas pendant la même visite : un échec durable ne boucle pas', () => {
    const failed: StageAttempt = { key: 2, failed: true, active: true };
    expect(followVisit(failed, true)).toBe(failed);
  });

  it('attend la visite suivante quand Explorer se cache après un échec', () => {
    const failed: StageAttempt = { key: 2, failed: true, active: true };
    expect(followVisit(failed, false)).toEqual({ key: 2, failed: true, active: false });
  });

  it('garde la même scène d’une visite à l’autre quand elle marche', () => {
    const fine: StageAttempt = { key: 2, failed: false, active: false };
    expect(followVisit(fine, true)).toEqual({ key: 2, failed: false, active: true });
  });

  it('oublie la scène au changement d’espace (déconnexion), une seule fois', () => {
    const store = createStageStore();
    publishStage(store, sceneOf());
    const host = jest.fn();
    subscribeStage(store, host);
    clearStage(store);
    expect(store.scene).toBeNull();
    clearStage(store);
    expect(host).toHaveBeenCalledTimes(1);
  });
});
