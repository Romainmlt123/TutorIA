import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { GameText } from './GameText';

// Texture de planches rendue par Blender (tools/explorer-3d/wood_panel.py).
const WOOD = require('../../../../../assets/explorer/images/wood-panel.webp');

const HUD = explorerArt.hud;
const WOOD_COLORS = HUD.wood;
/** Clous aux quatre coins du panneau. */
const NAILS: readonly ViewStyle[] = [
  { top: 8, left: 8 },
  { top: 8, right: 8 },
  { bottom: 8, left: 8 },
  { bottom: 8, right: 8 },
];

function Nail({ style }: { style: ViewStyle }) {
  return (
    <GradientSurface
      gradient={WOOD_COLORS.nail}
      angle={160}
      radius={theme.radius.full}
      style={[styles.nail, style]}
    />
  );
}

type FrameProps = {
  /** Texte du ruban bleu posé sur le bord haut (« Ta quête »). */
  tab: string;
  accessibilityLabel: string;
  children: ReactNode;
};

/** Panneau de bois du HUD d'Explorer : planches, cadre, clous et ruban. Le contenu est dans `children`. */
export function WoodFrame({ tab, accessibilityLabel, children }: FrameProps) {
  return (
    <View accessibilityLabel={accessibilityLabel} style={styles.frame}>
      <View style={styles.board}>
        <Image
          source={WOOD}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bevel} />
        <View style={styles.content}>{children}</View>
      </View>
      {NAILS.map((corner, i) => (
        <Nail key={i} style={corner} />
      ))}
      <View style={styles.tab}>
        <GradientSurface
          gradient={HUD.panel.tab}
          angle={180}
          radius={theme.radius.full}
          contentStyle={styles.tabFace}>
          <GameText size={13} stroke={2} drop={0}>
            {tab}
          </GameText>
        </GradientSurface>
      </View>
    </View>
  );
}

/** Pastille des étoiles gagnées, dans une encoche sombre. */
export function StarChip({ stars, label }: { stars: number; label: string }) {
  return (
    <View accessible accessibilityLabel={label} style={styles.stars}>
      <Icon name="etoile" variant="fill" size={18} color={HUD.gold.face[1]} />
      <GameText size={17} stroke={2} drop={0}>
        {String(stars)}
      </GameText>
    </View>
  );
}

/** Étiquette de parchemin : la prochaine étape, bien lisible sur le bois. */
export function Parchment({ children }: { children: string }) {
  return (
    <View style={styles.parchment}>
      <Text variant="caption" weight="bold" color={WOOD_COLORS.parchmentInk} numberOfLines={2}>
        {children}
      </Text>
    </View>
  );
}

/** Jauge creusée dans le bois, remplie d'un dégradé de 0 à 100 %. */
export function WoodGauge({
  percent,
  gradient,
}: {
  percent: number;
  gradient: Parameters<typeof GradientSurface>[0]['gradient'];
}) {
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.gauge}>
      {percent > 0 ? (
        <GradientSurface
          gradient={gradient}
          angle={180}
          radius={theme.radius.full}
          style={[styles.gaugeFill, { width: `${percent}%` }]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: theme.radius['3xl'] + 4,
    backgroundColor: WOOD_COLORS.frame,
    paddingVertical: 4,
    paddingHorizontal: 4,
    boxShadow: theme.shadow.lg,
  },
  board: { borderRadius: theme.radius['3xl'], overflow: 'hidden' },
  bevel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: theme.radius['3xl'],
    borderWidth: 2,
    borderColor: WOOD_COLORS.bevel,
  },
  content: {
    gap: theme.space[2],
    paddingTop: theme.space[5],
    paddingBottom: theme.space[3],
    paddingHorizontal: theme.space[4],
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    height: 30,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.gold.depth,
    backgroundColor: WOOD_COLORS.groove,
  },
  parchment: {
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[3],
    borderRadius: 10,
    borderWidth: 2,
    borderColor: WOOD_COLORS.parchmentBorder,
    backgroundColor: WOOD_COLORS.parchment,
  },
  gauge: {
    height: 12,
    paddingVertical: 2,
    paddingHorizontal: 2,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: HUD.ink,
    backgroundColor: WOOD_COLORS.groove,
  },
  gaugeFill: { height: '100%' },
  nail: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderWidth: 1.5,
    borderColor: WOOD_COLORS.groove,
  },
  tab: {
    position: 'absolute',
    top: -14,
    left: theme.space[5],
    borderRadius: theme.radius.full,
    backgroundColor: HUD.ink,
    paddingVertical: HUD.button.border,
    paddingHorizontal: HUD.button.border,
  },
  tabFace: { height: 24, paddingHorizontal: theme.space[3], justifyContent: 'center' },
});
