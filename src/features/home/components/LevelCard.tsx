import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { ProgressBar } from '@/components/ProgressBar';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

type Props = { level: number; xp: number; xpForNextLevel: number };

/** Carte Niveau : gris ardoise, étoile verte, jauge d'XP verte. */
export function LevelCard({ level, xp, xpForNextLevel }: Props) {
  return (
    <View style={styles.shadow}>
      <View
        accessible
        accessibilityLabel={fr.home.levelLabel(level, xp, xpForNextLevel)}
        style={styles.card}>
        <Watermark icon="etoile" size={104} offset={-26} opacity={extras.watermarkOpacity.level} />
        <View style={styles.top}>
          <View style={styles.star}>
            <Icon name="etoile" size={22} variant="fill" color={theme.palette.green[900]} />
          </View>
          <Text variant="caption" weight="bold" color={theme.palette.green[200]} numberOfLines={1}>
            {fr.home.xp(xp, xpForNextLevel)}
          </Text>
        </View>
        <View style={styles.bottom}>
          <Text variant="title" color="textOnColor" numberOfLines={1}>
            {fr.home.level(level)}
          </Text>
          <ProgressBar
            value={xp / xpForNextLevel}
            height={8}
            trackColor={extras.onColorTrackSoft}
            fill={theme.game.level.xp}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { flex: 1, borderRadius: theme.radius['3xl'], boxShadow: theme.shadow.md },
  card: {
    flex: 1,
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.game.level.background,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  star: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.full,
    backgroundColor: theme.game.level.xp,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { gap: theme.space[2] },
});
