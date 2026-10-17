import { render, screen } from '@testing-library/react-native';
import { memo } from 'react';
import { StyleSheet, Text } from 'react-native';

import type { IslandStageProps } from '../components/IslandStage';
import type { IslandSlide } from '../logic/islands';
import { createOrbit } from '../logic/orbit';
import { shotFor } from '../logic/shots';
import { DEFAULT_FRAME } from '../logic/stageFrame';
import { ExplorerStage } from './ExplorerStage';
import { ExplorerStageHost } from './ExplorerStageHost';
import { ROOT_STAGE } from './rootStage';
import { clearStage, EXPLORER_STAGE } from './stageStore';

/** La scène 3D est remplacée par un texte : combien de fois elle est montée, et si elle échoue. */
const mockScene = { mounts: 0, fails: false };
/** Plateforme simulée : l'hôte de la racine ne sert que sur Android. */
const mockPlatform = { android: true };

jest.mock('./rootStage', () => ({
  get ROOT_STAGE() {
    return mockPlatform.android;
  },
}));

jest.mock('../components/IslandStage', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  const { useEffect: useMockEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    IslandStage: ({ index, active }: { index: number; active: boolean }) => {
      useMockEffect(() => {
        mockScene.mounts += 1;
      }, []);
      if (mockScene.fails) throw new Error('scène en panne');
      return <MockText>{`île ${index} · ${active ? 'active' : 'en pause'}`}</MockText>;
    },
  };
});
jest.mock('../components/StageFallback', () => {
  const { Text: MockText } = jest.requireActual<typeof import('react-native')>('react-native');
  return { StageFallback: () => <MockText>image fixe</MockText> };
});
jest.mock('@/lib/logger', () => ({ logError: jest.fn() }));

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
const ORBIT = createOrbit();
const SLIDES = [MATHS];
const SHOT = shotFor({ kind: 'carousel' }, DEFAULT_FRAME, null);
const REGIONS = { mix: 0, focus: null };
/** L'hôte est caché aux lecteurs d'écran (`aria-hidden`) : on le cherche quand même. */
const HIDDEN = { includeHiddenElements: true } as const;

function stageOf(active: boolean, index: number): IslandStageProps {
  return {
    slides: SLIDES,
    index,
    shot: SHOT,
    orbit: ORBIT,
    regions: REGIONS,
    active,
    animated: true,
  };
}

/** L'hôte, qui ne se redessine pas quand l'écran Explorer se redessine (comme à la racine de l'app). */
const RootHost = memo(ExplorerStageHost);

/**
 * La racine de l'app (l'hôte, sur Android seulement) et, si l'onglet Explorer est monté, son écran
 * (qui publie sa scène sur Android, et la dessine lui-même ailleurs). Par défaut, l'onglet Explorer
 * est choisi (`shown`) quand il est affiché (`active`).
 */
function App({
  explorer,
  active,
  shown = active,
  index = 0,
}: {
  explorer: boolean;
  active: boolean;
  shown?: boolean;
  index?: number;
}) {
  return (
    <>
      {ROOT_STAGE ? <RootHost /> : null}
      {explorer ? (
        <ExplorerStage
          stage={stageOf(active, index)}
          fallback={{ slide: MATHS, frame: DEFAULT_FRAME }}
          shown={shown}
        />
      ) : null}
    </>
  );
}

/** Vrai si l'élément ou l'un de ses parents est transparent (opacité nulle) : la scène est cachée. */
function isFaded(element: ReturnType<typeof screen.getByText>): boolean {
  for (let node: typeof element | null = element; node; node = node.parent) {
    if (StyleSheet.flatten(node.props.style)?.opacity === 0) return true;
  }
  return false;
}

beforeEach(() => {
  clearStage(EXPLORER_STAGE);
  mockScene.mounts = 0;
  mockScene.fails = false;
  mockPlatform.android = true;
});

describe('scène d’Explorer montée à la racine', () => {
  it('ne monte rien avant la première visite d’Explorer', async () => {
    await render(
      <>
        <App explorer={false} active={false} />
        <Text>autre écran</Text>
      </>,
    );
    expect(screen.getByText('autre écran')).toBeTruthy();
    expect(screen.queryByText(/île/, HIDDEN)).toBeNull();
    expect(mockScene.mounts).toBe(0);
  });

  it('garde la même scène d’une visite à l’autre, en pause hors de l’onglet', async () => {
    const { rerender } = await render(<App explorer active />);
    expect(screen.getByText('île 0 · active', HIDDEN)).toBeTruthy();
    // Autre onglet, puis retour, puis un changement de vue : jamais remontée.
    await rerender(<App explorer active={false} />);
    expect(screen.getByText('île 0 · en pause', HIDDEN)).toBeTruthy();
    await rerender(<App explorer active />);
    await rerender(<App explorer active index={1} />);
    expect(screen.getByText('île 1 · active', HIDDEN)).toBeTruthy();
    // L'écran Explorer démonté : la scène reste, arrêtée.
    await rerender(<App explorer={false} active={false} />);
    expect(screen.getByText('île 1 · en pause', HIDDEN)).toBeTruthy();
    expect(mockScene.mounts).toBe(1);
  });

  it('montre l’image fixe si la scène échoue, et ne la retente qu’à la visite suivante', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockScene.fails = true;
    const { rerender } = await render(<App explorer active />);
    expect(screen.getByText('image fixe', HIDDEN)).toBeTruthy();
    mockScene.fails = false;
    // Même visite : pas de nouvel essai (un échec durable ne boucle pas).
    await rerender(<App explorer active index={1} />);
    expect(screen.getByText('image fixe', HIDDEN)).toBeTruthy();
    await rerender(<App explorer active={false} index={1} />);
    expect(screen.getByText('image fixe', HIDDEN)).toBeTruthy();
    // Visite suivante : nouvel essai, réussi.
    await rerender(<App explorer active index={1} />);
    expect(screen.getByText('île 1 · active', HIDDEN)).toBeTruthy();
  });

  it('cache la scène hors de l’onglet Explorer, mais pas sous un niveau ouvert par-dessus', async () => {
    const { rerender } = await render(<App explorer active />);
    expect(isFaded(screen.getByText('île 0 · active', HIDDEN))).toBe(false);
    // Un niveau poussé par-dessus : en pause, mais toujours visible sous l'interface qui glisse.
    await rerender(<App explorer active={false} shown />);
    expect(isFaded(screen.getByText('île 0 · en pause', HIDDEN))).toBe(false);
    // Un autre onglet : cachée, sans être démontée.
    await rerender(<App explorer active={false} shown={false} />);
    expect(isFaded(screen.getByText('île 0 · en pause', HIDDEN))).toBe(true);
    await rerender(<App explorer active />);
    expect(isFaded(screen.getByText('île 0 · active', HIDDEN))).toBe(false);
    // L'écran Explorer démonté : plus rien ne la laisse voir.
    await rerender(<App explorer={false} active={false} />);
    expect(isFaded(screen.getByText('île 0 · en pause', HIDDEN))).toBe(true);
    expect(mockScene.mounts).toBe(1);
  });

  it('oublie la scène quand l’hôte est démonté (changement d’espace)', async () => {
    const { unmount } = await render(<App explorer active />);
    expect(EXPLORER_STAGE.scene).not.toBeNull();
    await unmount();
    expect(EXPLORER_STAGE.scene).toBeNull();
  });
});

describe('scène d’Explorer sur iOS et le web', () => {
  it('est dessinée dans l’écran Explorer, sans hôte ni magasin', async () => {
    mockPlatform.android = false;
    const { rerender } = await render(<App explorer active />);
    expect(screen.getByText('île 0 · active', HIDDEN)).toBeTruthy();
    expect(EXPLORER_STAGE.scene).toBeNull();
    // Autre onglet, puis retour : la scène de l'écran est gardée, en pause entre les deux.
    await rerender(<App explorer active={false} />);
    expect(screen.getByText('île 0 · en pause', HIDDEN)).toBeTruthy();
    await rerender(<App explorer active />);
    expect(mockScene.mounts).toBe(1);
    expect(EXPLORER_STAGE.scene).toBeNull();
  });
});
