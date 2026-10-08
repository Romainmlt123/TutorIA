import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { Card } from '@/components/Card';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import { extras, theme, type Gradient } from '@/theme';

const T = fr.profile.summary;
const P = theme.profile;

type Stat = {
  icon: IconName;
  value: string;
  label: string;
  gradient: Gradient | readonly string[];
  glow: string;
};

function SummaryStat({ icon, value, label, gradient, glow, divided }: Stat & { divided: boolean }) {
  return (
    <View
      accessible
      accessibilityLabel={`${value} ${label}`}
      style={[styles.stat, divided && styles.divided]}>
      <GradientSurface
        gradient={gradient}
        radius={P.summaryTile.radius}
        shadow={`0 8px 16px ${glow}`}
        style={styles.tile}
        contentStyle={styles.tileContent}>
        <Icon
          name={icon}
          size={P.summaryTile.icon}
          color={theme.colors.textOnColor}
          strokeWidth={2}
        />
      </GradientSurface>
      <View style={styles.statText}>
        <Text variant="title" numberOfLines={1}>
          {value}
        </Text>
        <Text variant="caption" weight="medium" color="textSecondary" align="center">
          {label}
        </Text>
      </View>
    </View>
  );
}

/** Barre de niveau (LevelBar) : niveau actuel, barre en dégradé avec curseur, niveau suivant. */
function LevelBar({ level, xp, max }: { level: number; xp: number; max: number }) {
  const reduceMotion = useReducedMotion();
  const ratio = Math.min(1, Math.max(0, xp / max));
  const fill = useSharedValue(reduceMotion ? ratio : 0);
  useEffect(() => {
    fill.set(reduceMotion ? ratio : withTiming(ratio, { duration: 700 }));
  }, [fill, ratio, reduceMotion]);
  const width = useAnimatedStyle(() => ({ width: `${fill.value * 100}%` }));
  const knob = useAnimatedStyle(() => ({ left: `${fill.value * 100}%` }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={T.levelLabel(level, xp, max)}
      style={styles.level}>
      <View style={styles.levelRow}>
        <GradientSurface
          gradient={P.level.badgeGradient}
          radius={theme.radius.full}
          style={styles.badge}
          contentStyle={styles.badgeContent}>
          <Text variant="lead" weight="black" color="textOnColor">
            {String(level)}
          </Text>
        </GradientSurface>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, width]}>
            <GradientSurface
              gradient={P.level.gradient}
              angle={90}
              radius={theme.radius.full}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          <Animated.View style={[styles.knob, knob]} />
        </View>
        <View style={styles.next}>
          <Text variant="lead" weight="black" color="textDisabled">
            {String(level + 1)}
          </Text>
        </View>
      </View>
      <View style={styles.levelText}>
        <Text variant="hint" weight="bold">
          {T.level(level, xp, max)}
        </Text>
        <Text variant="hint" color="textSecondary">
          {T.remaining(max - xp)}
        </Text>
      </View>
    </View>
  );
}

type Props = {
  streak: number;
  stars: number;
  weekMinutes: number;
  level: number;
  xp: number;
  max: number;
};

/**
 * Résumé du profil (ProfileSummary, v2.8) : série, étoiles gagnées et temps de la semaine, chaque
 * chiffre centré sous sa tuile, puis la barre de niveau. Il déborde sur le bandeau.
 */
export function ProfileSummary({ streak, stars, weekMinutes, level, xp, max }: Props) {
  const stats: Stat[] = [
    {
      icon: 'flamme',
      value: String(streak),
      label: T.streak,
      gradient: extras.trophyGradients.orange,
      glow: P.summaryTile.glow.orange,
    },
    {
      icon: 'etoile',
      value: String(stars),
      label: T.stars,
      gradient: extras.trophyGradients.violet,
      glow: P.summaryTile.glow.violet,
    },
    {
      icon: 'horloge',
      value: formatDuration(weekMinutes),
      label: T.week,
      gradient: extras.trophyGradients.blue,
      glow: P.summaryTile.glow.blue,
    },
  ];
  return (
    <Card radius="3xl" padding={theme.space[5]} style={styles.card} accessibilityLabel={T.label}>
      <View style={styles.stats}>
        {stats.map((stat, i) => (
          <SummaryStat key={stat.icon} {...stat} divided={i === 1} />
        ))}
      </View>
      <LevelBar level={level} xp={xp} max={max} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.space[4] },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center', gap: 10, paddingHorizontal: 6 },
  divided: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.palette.blue[100],
  },
  tile: { width: P.summaryTile.size, height: P.summaryTile.size },
  tileContent: { alignItems: 'center', justifyContent: 'center' },
  statText: { alignItems: 'center', gap: 2 },
  level: {
    gap: 10,
    paddingTop: theme.space[4],
    borderTopWidth: 1,
    borderTopColor: theme.palette.blue[100],
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 34, height: 34 },
  badgeContent: { alignItems: 'center', justifyContent: 'center' },
  track: {
    flex: 1,
    height: P.level.height,
    borderRadius: theme.radius.full,
    backgroundColor: P.level.track,
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
    borderRadius: theme.radius.full,
  },
  knob: {
    position: 'absolute',
    top: (P.level.height - P.level.knob) / 2,
    width: P.level.knob,
    height: P.level.knob,
    marginLeft: -P.level.knob / 2,
    borderRadius: theme.radius.full,
    borderWidth: 4,
    borderColor: theme.palette.violet[500],
    backgroundColor: theme.colors.surface,
  },
  next: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: { flexDirection: 'row', justifyContent: 'space-between', gap: theme.space[2] },
});
