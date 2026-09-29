import { StyleSheet } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { theme, type SpaceTone } from '@/theme';

type Props = { tone: SpaceTone; kicker: string; title: string; subtitle: string };

/** En-tête de connexion en dégradé de l'espace, avec le mortier (élève) ou la famille (parent). */
export function AuthHero({ tone, kicker, title, subtitle }: Props) {
  return (
    <GradientSurface
      gradient={theme.spaces[tone].gradient}
      shadow={theme.shadow.md}
      contentStyle={styles.content}>
      <Watermark
        icon={tone === 'parent' ? 'famille' : 'casquette'}
        size={130}
        offset={-24}
        placement="top"
        opacity={0.14}
      />
      <Text variant="overline" color="textOnColor" style={styles.kicker}>
        {kicker}
      </Text>
      <Text variant="heading" color="textOnColor" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="lead" weight="medium" color="textOnColor" style={styles.subtitle}>
        {subtitle}
      </Text>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 6,
    paddingVertical: theme.space[6],
    paddingHorizontal: theme.space[6],
  },
  kicker: { opacity: 0.9 },
  subtitle: { opacity: 0.92 },
});
