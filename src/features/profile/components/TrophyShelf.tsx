import { ScrollView, StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { SectionCard } from '@/components/SectionCard';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import type { Trophy } from '../logic/trophies';

const T = fr.profile.trophies;
const SIZE = theme.profile.trophy.size;

/** Médaille d'un trophée (TrophyBadge) : gagnée en dégradé, ou grisée avec un cadenas. */
function TrophyBadge({ trophy, earned }: { trophy: Trophy; earned: boolean }) {
  const name = T.names[trophy.id] ?? trophy.id;
  return (
    <View accessible accessibilityLabel={earned ? name : T.locked(name)} style={styles.badge}>
      {earned ? (
        <GradientSurface
          gradient={extras.trophyGradients[trophy.tone]}
          radius={theme.radius.full}
          shadow={theme.shadow.md}
          style={styles.medal}
          contentStyle={[styles.medalContent, styles.ring]}>
          <Icon name={trophy.icon} size={28} color={theme.colors.textOnColor} strokeWidth={2} />
        </GradientSurface>
      ) : (
        <View style={[styles.medal, styles.medalContent, styles.locked]}>
          <Icon name="cadenas" size={24} color={theme.profile.trophy.lockedInk} strokeWidth={2} />
        </View>
      )}
      <Text
        variant="caption"
        weight="bold"
        color={earned ? 'text' : theme.profile.trophy.lockedInk}
        align="center"
        numberOfLines={2}>
        {name}
      </Text>
    </View>
  );
}

type Props = { earned: readonly Trophy[]; next: Trophy | null; total: number };

/** Mes trophées (TrophyShelf, v2.8) : les gagnés d'abord, puis le prochain, grisé. */
export function TrophyShelf({ earned, next, total }: Props) {
  return (
    <SectionCard title={T.title} meta={T.count(earned.length, total)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}>
        {earned.map((trophy) => (
          <TrophyBadge key={trophy.id} trophy={trophy} earned />
        ))}
        {next ? <TrophyBadge trophy={next} earned={false} /> : null}
      </ScrollView>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  // La rangée défile jusqu'aux bords de la carte.
  scroll: { marginHorizontal: -theme.space[4] },
  row: { gap: 6, paddingHorizontal: theme.space[4], paddingVertical: 2 },
  badge: { width: 84, alignItems: 'center', gap: theme.space[2] },
  medal: { width: SIZE, height: SIZE },
  medalContent: { alignItems: 'center', justifyContent: 'center', borderRadius: theme.radius.full },
  ring: { borderWidth: 3, borderColor: extras.medalRing },
  locked: {
    backgroundColor: theme.profile.trophy.locked,
    borderWidth: 3,
    borderColor: theme.profile.trophy.lockedRing,
  },
});
