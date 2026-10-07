import { StyleSheet, View } from 'react-native';

import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { LevelPlace } from '../../content';

const HUD = explorerArt.hud;
const T = fr.explorer.level;

type Props = {
  place: LevelPlace;
  /** Étapes, exercices ou questions terminés. */
  done: number;
  /** À la voix (X4b) : la durée de l'appel remplace la progression, qui n'est pas suivie à l'oral. */
  callTime?: string;
  onBack: () => void;
};

/**
 * En-tête de la discussion d'un niveau (X4, X4b) : retour à la carte, type, titre, et progression en
 * segments à l'écrit.
 */
export function LevelHeader({ place, done, callTime, onBack }: Props) {
  const { level, city } = place;
  const total = level.steps;
  const current = Math.min(done + 1, total);
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <GameButton
          tone="yellow"
          round
          size={48}
          icon="chevron-gauche"
          accessibilityLabel={T.back}
          onPress={onBack}
        />
        <View style={styles.titles}>
          <View style={[styles.type, { backgroundColor: explorerArt.map.node[level.type] }]}>
            <GameText size={12} stroke={2} drop={0}>
              {fr.explorer.levelTypes[level.type]}
            </GameText>
          </View>
          <GameText size={20} numberOfLines={1} accessibilityRole="header">
            {level.title}
          </GameText>
        </View>
      </View>
      {callTime ? (
        <GameText size={13} stroke={2} drop={1} numberOfLines={1}>
          {T.voiceProgress(callTime, city.name)}
        </GameText>
      ) : (
        <>
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={T.progressLabel(done, total)}
            accessibilityValue={{ min: 0, max: total, now: done }}
            style={styles.segments}>
            {Array.from({ length: total }, (_, i) => (
              <View key={i} style={[styles.segment, i < done && styles.segmentDone]} />
            ))}
          </View>
          <GameText size={13} stroke={2} drop={1} numberOfLines={1}>
            {T.progress(T.unit[level.type], current, total, city.name)}
          </GameText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: theme.space[2] },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  titles: { flex: 1, alignItems: 'flex-start', gap: 2 },
  type: {
    paddingVertical: 2,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
  },
  segments: { flexDirection: 'row', gap: theme.space[1] },
  segment: {
    flex: 1,
    height: 10,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    backgroundColor: HUD.wood.groove,
  },
  segmentDone: { backgroundColor: HUD.xp.fill[1] },
});
