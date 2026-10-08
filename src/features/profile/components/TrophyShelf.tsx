import { ScrollView, StyleSheet, View } from 'react-native';

import { GameText } from '@/components/game/GameText';
import { WoodChip, WoodFrame } from '@/components/game/WoodFrame';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { Trophy } from '../logic/trophies';

const T = fr.profile.trophies;
const HUD = explorerArt.hud;
const SIZE = theme.profile.trophy.size;
/** Disque coloré au centre de la médaille, dans son anneau doré. */
const DISC = SIZE - 16;
/** Rebord sous la médaille, comme sous les boutons de jeu. */
const DEPTH = 4;

/**
 * Médaille d'un trophée (TrophyBadge), façon HUD de jeu : disque de couleur dans un anneau doré,
 * cerné de bleu nuit, posé sur son rebord ; la prochaine à gagner est creusée dans le bois, avec un
 * cadenas.
 */
function TrophyBadge({ trophy, earned }: { trophy: Trophy; earned: boolean }) {
  const name = T.names[trophy.id] ?? trophy.id;
  return (
    <View accessible accessibilityLabel={earned ? name : T.locked(name)} style={styles.badge}>
      <View style={styles.medal}>
        <View style={[styles.layer, styles.depth, !earned && styles.lockedDepth]} />
        {earned ? (
          <GradientSurface
            gradient={HUD.gold.face}
            angle={180}
            radius={theme.radius.full}
            style={[styles.layer, styles.face]}
            contentStyle={styles.center}>
            <View style={styles.shine} />
            <GradientSurface
              gradient={extras.trophyGradients[trophy.tone]}
              angle={180}
              radius={theme.radius.full}
              style={styles.disc}
              contentStyle={styles.center}>
              <Icon name={trophy.icon} size={24} color={HUD.white} strokeWidth={2.5} />
            </GradientSurface>
          </GradientSurface>
        ) : (
          <View style={[styles.layer, styles.face, styles.center, styles.locked]}>
            <Icon name="cadenas" size={24} color={HUD.wood.parchmentBorder} strokeWidth={2.5} />
          </View>
        )}
      </View>
      <GameText
        size={12}
        stroke={2}
        drop={0}
        align="center"
        numberOfLines={2}
        color={earned ? HUD.white : HUD.wood.parchment}>
        {name}
      </GameText>
    </View>
  );
}

type Props = { earned: readonly Trophy[]; next: Trophy | null; total: number };

/**
 * Mes trophées (TrophyShelf) : une armoire de bois du HUD de jeu, les médailles alignées sur une
 * étagère, les gagnées d'abord, puis la prochaine, sous cadenas.
 */
export function TrophyShelf({ earned, next, total }: Props) {
  const count = T.count(earned.length, total);
  return (
    <View style={styles.shelfBox}>
      <WoodFrame tab={T.title} accessibilityLabel={`${T.title}, ${count}`}>
        <View style={styles.header}>
          <WoodChip icon="medaille" value={count} label={count} />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.row}>
          <View aria-hidden style={styles.shelf} />
          {earned.map((trophy) => (
            <TrophyBadge key={trophy.id} trophy={trophy} earned />
          ))}
          {next ? <TrophyBadge trophy={next} earned={false} /> : null}
        </ScrollView>
      </WoodFrame>
    </View>
  );
}

const styles = StyleSheet.create({
  // Le ruban dépasse de 14 px au-dessus du panneau : l'armoire descend pour lui laisser la place.
  shelfBox: { marginTop: theme.space[4] },
  header: { flexDirection: 'row', justifyContent: 'flex-end' },
  // La rangée défile jusqu'aux bords du panneau.
  scroll: { marginHorizontal: -theme.space[4] },
  row: {
    gap: theme.space[2],
    paddingTop: theme.space[1],
    paddingBottom: theme.space[1],
    paddingHorizontal: theme.space[4],
  },
  // Étagère creusée sous les médailles, sur toute la longueur de la rangée.
  shelf: {
    position: 'absolute',
    top: theme.space[1] + SIZE + DEPTH - 4,
    left: 0,
    right: 0,
    height: 10,
    borderTopWidth: 2,
    borderTopColor: HUD.wood.bevel,
    backgroundColor: HUD.wood.groove,
  },
  badge: { width: 80, alignItems: 'center', gap: theme.space[3] },
  medal: { width: SIZE, height: SIZE + DEPTH },
  layer: {
    position: 'absolute',
    left: 0,
    width: SIZE,
    height: SIZE,
    borderRadius: theme.radius.full,
    borderWidth: 2.5,
    borderColor: HUD.ink,
  },
  depth: { top: DEPTH, backgroundColor: HUD.gold.depth },
  lockedDepth: { backgroundColor: HUD.wood.frame },
  face: { top: 0, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  disc: {
    width: DISC,
    height: DISC,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: SIZE * 0.4,
    backgroundColor: HUD.shine,
  },
  locked: { backgroundColor: HUD.wood.groove, borderColor: HUD.wood.frame },
});
