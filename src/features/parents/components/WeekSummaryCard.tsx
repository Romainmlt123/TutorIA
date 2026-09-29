import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { WeekVerdict } from '../logic/parentSpace';
import { HeroCard } from './HeroCard';
import { StrongText } from './StrongText';

type Props = { text: string; caption: string; verdict: WeekVerdict };

/** P1 · Résumé de la semaine (HeroCard) : texte rédigé ou calculé, pastille verte. */
export function WeekSummaryCard({ text, caption, verdict }: Props) {
  const t = fr.parent.home;
  return (
    <HeroCard icon="etoile">
      <View style={styles.head}>
        <View style={styles.logo}>
          <Logo variant="onWhite" size={36} />
        </View>
        <View style={styles.titles}>
          <Text variant="section" color="textOnColor" accessibilityRole="header">
            {t.summaryTitle}
          </Text>
          <Text variant="caption" color="textOnColor" style={styles.caption}>
            {caption}
          </Text>
        </View>
      </View>
      <StrongText variant="body" color="textOnColor" text={text} style={styles.body} />
      <Pill
        label={t.verdict[verdict]}
        icon="tendance-haut"
        backgroundColor={theme.palette.green[500]}
        color={theme.palette.green[900]}
        size="md"
        style={styles.badge}
      />
    </HeroCard>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  logo: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  titles: { flex: 1 },
  caption: { opacity: 0.85 },
  body: { lineHeight: 26 },
  badge: { paddingVertical: 6 },
});
