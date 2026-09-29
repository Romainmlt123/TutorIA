import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Button } from './Button';
import { BottomNav } from './navigation/BottomNav';
import { SegmentedControl } from './SegmentedControl';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

describe('Button', () => {
  it('déclenche l’action et expose son libellé', async () => {
    const onPress = jest.fn();
    await render(<Button label="Reprendre" icon="fleche-droite" onPress={onPress} />);
    fireEvent.press(screen.getByRole('button', { name: 'Reprendre' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ne réagit pas quand il est désactivé', async () => {
    const onPress = jest.fn();
    await render(<Button label="Carte suivante" disabled onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'Carte suivante' });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
  });
});

describe('SegmentedControl', () => {
  it('indique le segment actif et signale le changement', async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl
        accessibilityLabel="Période"
        value="week"
        onChange={onChange}
        options={[
          { value: 'week', label: 'Semaine' },
          { value: 'month', label: 'Mois' },
        ]}
      />,
    );
    expect(screen.getByRole('tab', { name: 'Semaine' })).toBeSelected();
    fireEvent.press(screen.getByRole('tab', { name: 'Mois' }));
    expect(onChange).toHaveBeenCalledWith('month');
  });
});

describe('BottomNav', () => {
  const routes = ['index', 'parcours', 'tuteur', 'revisions', 'stats'].map((name) => ({
    key: `${name}-key`,
    name,
  }));

  function renderNav(index: number) {
    const navigation = { emit: jest.fn(() => ({ defaultPrevented: false })), navigate: jest.fn() };
    const props = { state: { index, routes }, navigation } as unknown as BottomTabBarProps;
    return {
      navigation,
      view: render(
        <SafeAreaProvider initialMetrics={metrics}>
          <BottomNav {...props} />
        </SafeAreaProvider>,
      ),
    };
  }

  it('affiche les 5 onglets et marque l’onglet actif', async () => {
    const { view } = renderNav(2);
    await view;
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    expect(screen.getByRole('tab', { name: "Tutor'IA" })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Stats' })).not.toBeSelected();
  });

  it('navigue vers un autre onglet', async () => {
    const { navigation, view } = renderNav(0);
    await view;
    fireEvent.press(screen.getByRole('tab', { name: 'Révisions' }));
    expect(navigation.navigate).toHaveBeenCalledWith('revisions', undefined);
  });
});
