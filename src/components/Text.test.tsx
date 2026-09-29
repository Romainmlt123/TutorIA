import { render, screen } from '@testing-library/react-native';

import { theme } from '@/theme';

import { Text } from './Text';

describe('Text', () => {
  it('applique la variante et le rôle de couleur du thème', async () => {
    await render(
      <Text variant="caption" color="textSecondary">
        Il y a 2 min
      </Text>,
    );
    expect(screen.getByText('Il y a 2 min')).toHaveStyle({
      fontFamily: 'Satoshi-Medium',
      fontSize: 12,
      color: theme.colors.textSecondary,
    });
  });

  it('accepte une couleur de la palette', async () => {
    await render(<Text color={theme.palette.green[200]}>340 / 500 XP</Text>);
    expect(screen.getByText('340 / 500 XP')).toHaveStyle({ color: theme.palette.green[200] });
  });
});
