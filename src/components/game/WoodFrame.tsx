import { Fragment, useState, type ReactNode } from 'react';
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { GameText } from './GameText';

// Texture de planches rendue par Blender (tools/explorer-3d/wood_panel.py).
export const WOOD = require('../../../assets/explorer/images/wood-panel.webp');

const HUD = explorerArt.hud;
const WOOD_COLORS = HUD.wood;
/** Rapport largeur / hauteur de la texture : trois planches. */
const WOOD_RATIO = 1.6;
/** Copies de la texture empilées dans un grand panneau (de quoi couvrir un écran entier). */
const WOOD_TILES = 4;
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
  /** Texte du ruban bleu posé sur le bord haut (« Ta quête ») ; sans ruban s'il est absent. */
  tab?: string;
  accessibilityLabel: string;
  children: ReactNode;
  /** Le panneau occupe toute la hauteur disponible (contenu qui défile). */
  fill?: boolean;
};

/** Panneau de bois du HUD de jeu : planches, cadre, clous et ruban. Le contenu est dans `children`. */
export function WoodFrame({ tab, accessibilityLabel, children, fill = false }: FrameProps) {
  // Largeur du panneau, pour donner aux planches répétées leur hauteur (le web ignore aspectRatio
  // sur une image : elle prendrait sa hauteur d'origine).
  const [width, setWidth] = useState(0);
  return (
    <View accessibilityLabel={accessibilityLabel} style={[styles.frame, fill && styles.fill]}>
      <View
        onLayout={fill ? (event) => setWidth(event.nativeEvent.layout.width) : undefined}
        style={[styles.board, fill && styles.fill]}>
        {fill ? (
          // Grand panneau : les planches gardent leur taille, la texture est répétée vers le bas.
          <View style={styles.tiles}>
            {Array.from({ length: WOOD_TILES }, (_, i) => (
              <Fragment key={i}>
                {i > 0 ? <View style={styles.seam} /> : null}
                <Image
                  source={WOOD}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                  style={{ width, height: width / WOOD_RATIO }}
                />
              </Fragment>
            ))}
          </View>
        ) : (
          <Image
            source={WOOD}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.bevel} />
        <View style={[styles.content, fill && styles.fill]}>{children}</View>
      </View>
      {NAILS.map((corner, i) => (
        <Nail key={i} style={corner} />
      ))}
      {tab ? (
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
      ) : null}
    </View>
  );
}

/** Pastille dorée dans une encoche sombre : une icône pleine et un compte. */
export function WoodChip({ icon, value, label }: { icon: IconName; value: string; label: string }) {
  return (
    <View accessible accessibilityLabel={label} style={styles.stars}>
      <Icon name={icon} variant="fill" size={18} color={HUD.gold.face[1]} />
      <GameText size={17} stroke={2} drop={0}>
        {value}
      </GameText>
    </View>
  );
}

/** Pastille des étoiles gagnées. */
export function StarChip({ stars, label }: { stars: number; label: string }) {
  return <WoodChip icon="etoile" value={String(stars)} label={label} />;
}

/** Étiquette de parchemin : la prochaine étape, bien lisible sur le bois (2 lignes au plus par défaut). */
export function Parchment({ children, lines = 2 }: { children: string; lines?: number }) {
  return (
    <View style={styles.parchment}>
      <Text variant="caption" weight="bold" color={WOOD_COLORS.parchmentInk} numberOfLines={lines}>
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
  fill: { flex: 1 },
  tiles: { position: 'absolute', top: 0, right: 0, left: 0 },
  seam: { height: 4, backgroundColor: WOOD_COLORS.groove },
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
