import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { formatLinkCode } from '@/services/auth/api-contract';
import { theme } from '@/theme';

type Props = { childName: string; code: string; onShare: () => void };

/** L6 · Code de connexion de l'enfant : 6 chiffres espacés, valable 24 h, à partager. */
export function ParentCodeCard({ childName, code, onShare }: Props) {
  const t = fr.parent.child;
  return (
    <GradientSurface
      gradient={theme.spaces.parent.gradient}
      shadow={theme.shadow.md}
      contentStyle={styles.content}>
      <Watermark icon="cle" size={150} offset={-32} placement="top" opacity={0.14} />
      <Text variant="overline" color="textOnColor" style={styles.kicker}>
        {t.codeTitle(childName)}
      </Text>
      <Text
        variant="display"
        weight="black"
        color="textOnColor"
        style={styles.code}
        accessibilityLabel={t.codeLabel(code)}
        selectable>
        {formatLinkCode(code)}
      </Text>
      <View style={styles.validity}>
        <Icon name="horloge" size={16} color={theme.colors.textOnColor} strokeWidth={2} />
        <Text variant="label" weight="medium" color="textOnColor">
          {t.validity}
        </Text>
      </View>
      <PressableBase onPress={onShare} accessibilityRole="button" style={styles.share}>
        <Icon name="partage" size={18} color={theme.palette.violet[600]} strokeWidth={2} />
        <Text variant="label" weight="bold" color={theme.palette.violet[600]}>
          {t.share}
        </Text>
      </PressableBase>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  content: { gap: 14, padding: theme.space[6] },
  kicker: { opacity: 0.9 },
  code: { letterSpacing: 5.8, lineHeight: 52 },
  validity: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.92 },
  share: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    height: 44,
    paddingHorizontal: theme.space[4],
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
  },
});
