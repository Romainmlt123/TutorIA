import { router, Stack } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { renderRouter } from 'expo-router/testing-library';
import { act, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { isShownRoute, useTabShown } from './useTabShown';

// Paquet publié en modules ES, que Jest ne transforme pas, et dont expo-router n'a besoin que pour
// les navigateurs « standard » (inutilisés ici).
jest.mock('standard-navigation', () => ({}));

/** L'onglet Explorer d'essai : il dit si sa scène doit se voir. */
function Explorer() {
  return <Text>{useTabShown() ? 'scène visible' : 'scène cachée'}</Text>;
}

/** Un onglet caché reste monté : on le cherche quand même. */
const HIDDEN = { includeHiddenElements: true } as const;

/** La forme de l'app : une pile à la racine, l'espace élève en onglets, un niveau par-dessus. */
async function renderApp() {
  await renderRouter(
    {
      _layout: () => <Stack screenOptions={{ headerShown: false }} />,
      '(eleve)/_layout': () => <Tabs screenOptions={{ headerShown: false }} />,
      '(eleve)/index': () => <Text>accueil</Text>,
      '(eleve)/explorer': Explorer,
      niveau: () => <Text>niveau</Text>,
    },
    { initialUrl: '/explorer' },
  );
}

describe('onglet montré (scène d’Explorer à la racine)', () => {
  it('reconnaît l’écran que son navigateur montre', () => {
    const state = { index: 1, routes: [{ key: 'accueil' }, { key: 'explorer' }] };
    expect(isShownRoute(state, 'explorer')).toBe(true);
    expect(isShownRoute(state, 'accueil')).toBe(false);
    expect(isShownRoute(undefined, 'explorer')).toBe(false);
  });

  it('reste vrai sous un niveau ouvert par-dessus, faux dès qu’un autre onglet est choisi', async () => {
    await renderApp();
    expect(screen.getByText('scène visible')).toBeTruthy();
    // Un niveau poussé sur la pile de la racine : l'onglet perd le focus, mais reste choisi.
    await act(() => router.push('/niveau'));
    expect(screen.getByText('niveau')).toBeTruthy();
    expect(screen.getByText('scène visible', HIDDEN)).toBeTruthy();
    await act(() => router.back());
    expect(screen.getByText('scène visible')).toBeTruthy();
    // Un autre onglet : la scène se cache, puis revient avec l'onglet Explorer.
    await act(() => router.navigate('/'));
    expect(screen.getByText('accueil')).toBeTruthy();
    expect(screen.getByText('scène cachée', HIDDEN)).toBeTruthy();
    await act(() => router.navigate('/explorer'));
    expect(screen.getByText('scène visible')).toBeTruthy();
  });
});
