import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import { PressableBase } from '../PressableBase';
import { Text } from '../Text';

type Props = {
  /** Empilés (L3) ou côte à côte (E1). */
  layout?: 'stack' | 'row';
  onApple: () => void;
  onGoogle: () => void;
};

const APPLE_LOGO =
  'M16.37 12.6c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.78-3.33-1.8-1.42-.14-2.77.83-3.49.83-.72 0-1.83-.81-3.01-.79-1.55.02-2.98.9-3.78 2.29-1.61 2.8-.41 6.94 1.16 9.21.77 1.11 1.68 2.36 2.88 2.31 1.16-.05 1.6-.75 3-.75 1.4 0 1.79.75 3.01.73 1.24-.02 2.03-1.13 2.79-2.25.88-1.29 1.24-2.54 1.26-2.6-.03-.01-2.42-.93-2.46-3.72zM14.07 5.83c.64-.77 1.07-1.85.95-2.92-.92.04-2.03.61-2.69 1.38-.59.68-1.11 1.78-.97 2.83 1.02.08 2.07-.52 2.71-1.29z';

/** Logos officiels, à gauche du libellé (v2.7). */
function AppleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" aria-hidden>
      <Path d={APPLE_LOGO} fill={theme.colors.textOnColor} />
    </Svg>
  );
}

function GoogleLogo() {
  const g = extras.googleLogo;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" aria-hidden>
      <Path
        fill={g.blue}
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
      />
      <Path
        fill={g.green}
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3a7.24 7.24 0 0 1-10.8-3.8H1.28v3.09A12 12 0 0 0 12 24z"
      />
      <Path
        fill={g.yellow}
        d="M5.27 14.29A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.29V6.62H1.28a12 12 0 0 0 0 10.76z"
      />
      <Path
        fill={g.red}
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.28 6.62l3.99 3.09A7.16 7.16 0 0 1 12 4.75z"
      />
    </Svg>
  );
}

/**
 * Boutons Apple et Google, toujours sous le formulaire, avec leurs logos officiels.
 * À remplacer par les boutons officiels des SDK quand la connexion sera branchée (règle Apple 4.8).
 */
export function AuthProviderButtons({ layout = 'stack', onApple, onGoogle }: Props) {
  const row = layout === 'row';
  const labels = row ? fr.form.providersShort : fr.form.providers;
  return (
    <View style={[styles.group, row && styles.row]}>
      <PressableBase
        onPress={onApple}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.button,
          row && styles.half,
          styles.apple,
          pressed && styles.applePressed,
        ]}>
        <AppleLogo />
        <Text variant={row ? 'lead' : 'body'} weight="bold" color="textOnColor">
          {labels.apple}
        </Text>
      </PressableBase>
      <PressableBase
        onPress={onGoogle}
        accessibilityRole="button"
        shadow={theme.shadow.sm}
        style={({ pressed }) => [
          styles.button,
          row && styles.half,
          styles.google,
          pressed && styles.googlePressed,
        ]}>
        <GoogleLogo />
        <Text variant={row ? 'lead' : 'body'} weight="bold">
          {labels.google}
        </Text>
      </PressableBase>
    </View>
  );
}

/** Séparateur « ou » (« ou continuer avec » sur L2 et L3) entre le formulaire et Apple / Google. */
export function OrDivider({ label = fr.form.or }: { label?: string }) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={styles.divider}>
      <View style={styles.line} />
      <Text variant="hint" weight="bold" color="textSecondary">
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: theme.space[3] },
  row: { flexDirection: 'row' },
  button: {
    height: 52,
    flexDirection: 'row',
    gap: theme.space[2],
    borderRadius: theme.radius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space[4],
  },
  half: { flex: 1 },
  apple: { backgroundColor: theme.palette.gray[900] },
  applePressed: { backgroundColor: theme.palette.gray[800] },
  google: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  googlePressed: { backgroundColor: theme.colors.bg },
  divider: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.border },
});
