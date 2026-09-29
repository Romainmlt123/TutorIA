import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { Logo } from '@/components/Logo';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

type Props = { onBack: () => void; logo?: boolean };

/** Retour à gauche et logo de 40 px à droite (L2, L3, E1). */
export function AuthTopBar({ onBack, logo = true }: Props) {
  return (
    <View style={styles.row}>
      <IconButton
        icon="chevron-gauche"
        iconSize={22}
        accessibilityLabel={fr.form.back}
        onPress={onBack}
      />
      {logo ? <Logo variant="onBlue" size={40} borderRadius={theme.space[3]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
