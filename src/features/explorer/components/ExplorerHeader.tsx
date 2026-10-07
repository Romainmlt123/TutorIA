import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { GameText } from '@/components/game/GameText';

const HUD = explorerArt.hud;
const MEDAL = 44;
/** Étoile à 5 branches arrondies (grille 48). */
const STAR =
  'M24 3.5c1.3 0 2.4.8 2.9 2l4.3 9.2 10 1.3c2.6.3 3.7 3.6 1.7 5.4l-7.4 6.9 1.9 9.9c.5 2.6-2.3 4.6-4.6 3.3L24 36.6l-8.8 4.9c-2.3 1.3-5.1-.7-4.6-3.3l1.9-9.9-7.4-6.9c-2-1.8-.9-5.1 1.7-5.4l10-1.3 4.3-9.2c.5-1.2 1.6-2 2.9-2z';

type Props = {
  firstName: string;
  streakDays: number;
  level: number;
  xp: number;
  xpForNextLevel: number;
};

/** Série en capsule orange brillante, avec sa flamme. */
function StreakCapsule({ days }: { days: number }) {
  return (
    <View accessible accessibilityLabel={fr.common.streakLabel(days)} style={styles.capsule}>
      <GradientSurface
        gradient={HUD.streak.face}
        angle={180}
        radius={theme.radius.full}
        contentStyle={styles.capsuleFace}>
        <View style={styles.capsuleShine} />
        <Icon name="flamme" variant="fill" size={18} color={HUD.white} />
        <GameText size={18} stroke={2} drop={2}>
          {String(days)}
        </GameText>
      </GradientSurface>
    </View>
  );
}

/** Niveau : médaille dorée en étoile, puis jauge d'XP en capsule. */
function LevelMedal({ level, xp, xpForNextLevel }: Omit<Props, 'firstName' | 'streakDays'>) {
  const ratio = xpForNextLevel > 0 ? Math.min(1, xp / xpForNextLevel) : 0;
  return (
    <View
      accessible
      accessibilityLabel={fr.home.levelLabel(level, xp, xpForNextLevel)}
      style={styles.level}>
      <View style={styles.xpTrack}>
        <GradientSurface
          gradient={HUD.xp.fill}
          angle={180}
          radius={theme.radius.full}
          style={[styles.xpFill, { width: `${Math.round(ratio * 100)}%` }]}
        />
      </View>
      <View style={styles.medal}>
        <Svg width={MEDAL} height={MEDAL} viewBox="0 0 48 48">
          <Defs>
            <LinearGradient id="or" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={HUD.gold.face[0]} />
              <Stop offset="0.55" stopColor={HUD.gold.face[1]} />
              <Stop offset="1" stopColor={HUD.gold.face[2]} />
            </LinearGradient>
          </Defs>
          <Path
            d={STAR}
            fill="url(#or)"
            stroke={HUD.ink}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </Svg>
        <View style={styles.medalNumber}>
          <GameText size={17} stroke={2} drop={0} align="center">
            {String(level)}
          </GameText>
        </View>
      </View>
    </View>
  );
}

/** « Explorer » en lettres de jeu, « Choisis ton île, Léa. », la série et le niveau. */
export function ExplorerHeader({ firstName, streakDays, level, xp, xpForNextLevel }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.titles}>
        <GameText size={36} accessibilityRole="header">
          {fr.explorer.title}
        </GameText>
        <GameText size={16} stroke={2} drop={2}>
          {fr.explorer.subtitle(firstName)}
        </GameText>
      </View>
      <View style={styles.chips}>
        <StreakCapsule days={streakDays} />
        <LevelMedal level={level} xp={xp} xpForNextLevel={xpForNextLevel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.space[3],
  },
  titles: { flexShrink: 1, gap: theme.space[1] },
  chips: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  capsule: {
    borderRadius: theme.radius.full,
    backgroundColor: HUD.ink,
    paddingVertical: HUD.button.border,
    paddingHorizontal: HUD.button.border,
    boxShadow: theme.shadow.md,
  },
  capsuleFace: {
    height: 32,
    paddingHorizontal: theme.space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
  },
  capsuleShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 13,
    backgroundColor: HUD.shine,
  },
  level: { flexDirection: 'row', alignItems: 'center' },
  xpTrack: {
    width: 52,
    height: 16,
    marginRight: -12,
    paddingVertical: 2,
    paddingLeft: 2,
    paddingRight: 14,
    borderRadius: theme.radius.full,
    borderWidth: HUD.button.border,
    borderColor: HUD.ink,
    backgroundColor: HUD.xp.track,
  },
  xpFill: { height: '100%' },
  medal: { width: MEDAL, height: MEDAL, alignItems: 'center', justifyContent: 'center' },
  medalNumber: { position: 'absolute', top: 11, left: 0, right: 0 },
});
