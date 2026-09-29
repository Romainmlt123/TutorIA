import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { extras, theme, type Gradient } from '@/theme';

type Props = {
  icon: IconName;
  label: string;
  value: string;
  caption: string;
  /** Dégradé (temps, sessions, flashcards) ou orange uni (série record). */
  background: Gradient | { solid: string };
};

/** Chiffre clé en carte colorée, icône en filigrane. */
export function KpiCard({ icon, label, value, caption, background }: Props) {
  const solid = 'solid' in background;
  const content = (
    <>
      <Watermark
        icon={icon}
        offset={-22}
        opacity={solid ? extras.watermarkOpacity.streak : extras.watermarkOpacity.subject}
      />
      <View style={styles.head}>
        <View style={[styles.iconPill, solid && styles.iconPillSolid]}>
          <Icon name={icon} size={18} color={solid ? background.solid : theme.colors.textOnColor} />
        </View>
        <Text variant="caption" color="textOnColor" style={styles.label}>
          {label}
        </Text>
      </View>
      <Text variant="h2" weight="black" color="textOnColor" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Pill
        label={caption}
        backgroundColor={theme.onColor.veil}
        color={theme.colors.textOnColor}
        size="xs"
        wrap
      />
    </>
  );
  const a11y = `${label} : ${value}, ${caption}`;
  if (solid) {
    return (
      <View style={styles.shadow}>
        <View
          accessible
          accessibilityLabel={a11y}
          style={[styles.card, styles.content, { backgroundColor: background.solid }]}>
          {content}
        </View>
      </View>
    );
  }
  return (
    <View accessible accessibilityLabel={a11y} style={styles.fill}>
      <GradientSurface
        gradient={background}
        shadow={theme.shadow.md}
        style={styles.fill}
        contentStyle={styles.content}>
        {content}
      </GradientSurface>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  shadow: { flex: 1, borderRadius: theme.radius['3xl'], boxShadow: theme.shadow.md },
  card: { flex: 1, borderRadius: theme.radius['3xl'], overflow: 'hidden' },
  content: { gap: theme.space[2], padding: theme.space[4] },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  label: { flexShrink: 1 },
  iconPill: {
    width: 32,
    height: 32,
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillSolid: { backgroundColor: theme.colors.surface },
});
