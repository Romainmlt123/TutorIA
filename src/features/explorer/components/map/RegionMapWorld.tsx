import { memo, useMemo, useState, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import type { DiscTouch } from '../../hooks/useDiscTouch';
import type { CelebrationMoment, MapCelebration } from '../../hooks/useMapCelebration';
import { useMapClock } from '../../hooks/useMapClock';
import { useMapContent } from '../../hooks/useMapContent';
import { mapClouds, scaledPi, waterGlints } from '../../logic/ambientLayout';
import { backToFront, doneSegmentsBefore, nodeGround } from '../../logic/mapMarkers';
import {
  scrollToContentTranslation,
  tileRect,
  tilesInView,
  type ScreenSize,
} from '../../logic/mapProjection';
import type { RegionMap } from '../../logic/regionMap';
import { seedOf } from '../../logic/regionSeed';
import type { MapTiles as MapTilesData } from '../../tiles';
import { LevelDisc, LevelHalo } from './LevelDisc';
import { MapClouds, WaterGlints } from './MapAmbient';
import { MapTiles, onTileError } from './MapTiles';
import { RevealSegment } from './RevealSegment';

type Props = {
  tiles: MapTilesData;
  screen: ScreenSize;
  /** Carte de la région : ses niveaux, et le rang du pion (chemin parcouru, halo qui bat). */
  map: RegionMap;
  /** Point suivi à l'ouverture de la carte (mètres) : ses tuiles à l'écran sont attendues. */
  start: { x: number; z: number };
  /**
   * Agrandissement de l'île sous la carte (TERRAIN_SCALES, stylized3d/terrainScales.ts) : l'eau du π
   * y est agrandie d'autant et reçoit des reflets. Sans lui (région sans terrain cuit), pas d'eau.
   */
  terrainScale?: number;
  /** Les animations peuvent tourner : onglet affiché, app au premier plan, animations non réduites. */
  ambient: boolean;
  /** Compteur de performance (développement seulement) : le rythme des animations de la carte. */
  probe?: boolean;
  /** Célébration au retour d'un niveau (useMapCelebration) : tronçons du chemin et niveaux qui s'ouvrent. */
  celebration: MapCelebration | null;
  /** Niveau touché (useDiscTouch) : son disque répond. */
  touch: DiscTouch;
  /** La carte est prête : les tuiles à l'écran à l'ouverture sont chargées. */
  onReady: () => void;
  /** Posé sur les disques, dans le contenu qui défile : l'avatar de l'élève (MapAvatarView). */
  children?: ReactNode;
};

/**
 * Carte d'une région pré-rendue (X2b), dessinée par React Native, sans 3D : le contenu est un seul
 * plan que le fil de l'interface déplace d'après le point suivi (`useMapContent`). De bas en haut :
 * les nuages qui dérivent sous l'île, le sol en tuiles, les reflets du soleil sur l'eau, les
 * tronçons miel du chemin jusqu'au pion, les halos des niveaux ouverts, les disques des niveaux, du
 * fond vers l'avant, puis l'avatar (`children`). Tout est monté une fois pour toutes : seule la
 * progression change ce qui est posé, jamais le défilement. Les nuages, les reflets et le halo du
 * niveau à jouer suivent une seule horloge à 30 Hz (`useMapClock`), arrêtée avec `ambient`. Au
 * retour d'un niveau, la célébration (`celebration`) dévoile les tronçons nouveaux et ouvre les
 * niveaux suivants, sur sa propre horloge ; le disque touché répond (`touch`).
 *
 * Elle ne reçoit aucun toucher (les boutons sont dans RegionMapMarkers, le geste sur la zone de la
 * carte du HUD) et reste cachée aux lecteurs d'écran, qui ont la liste.
 */
export const RegionMapWorld = memo(function RegionMapWorld({
  tiles,
  screen,
  map,
  start,
  terrainScale,
  ambient,
  probe = false,
  celebration,
  touch,
  onReady,
  children,
}: Props) {
  const { k, scale, origin, area, shift } = useMapContent(tiles, screen);
  // Le halo du niveau à jouer bat, sur la carte 3D comme ici.
  const pawn = map.nodes[map.pawnIndex];
  const pulsing = pawn && pawn.state !== 'locked' ? pawn.levelId : null;
  const clock = useMapClock(ambient, probe);
  // Nuages et reflets, tirés une fois pour la région (même graine que ses décors).
  const clouds = useMemo(() => mapClouds(tiles, seedOf(tiles.regionId)), [tiles]);
  const water = useMemo(() => {
    if (terrainScale === undefined) return null;
    const pi = scaledPi(terrainScale);
    return {
      surface: pi.surface,
      glints: waterGlints(pi.outline, pi.surface, tiles, seedOf(tiles.regionId)),
    };
  }, [tiles, terrainScale]);
  // Tuiles à l'écran à l'ouverture, une fois pour toutes : le voile ne les attend qu'à ce moment.
  const [watched] = useState(() =>
    tilesInView(
      tiles.tiles,
      scale,
      scrollToContentTranslation(start.x, start.z, screen, tiles, k),
      screen,
    ),
  );
  const done = useMemo(
    () => doneSegmentsBefore(tiles.doneSegments, map.pawnIndex),
    [tiles, map.pawnIndex],
  );
  const discs = useMemo(() => backToFront(map.nodes), [map.nodes]);
  // Rang de chaque niveau dans la carte : celui que le toucher désigne.
  const rank = useMemo(() => new Map(map.nodes.map((node, i) => [node.levelId, i])), [map.nodes]);
  // Heures de la célébration : tronçon par tronçon, niveau par niveau.
  const moments = useMemo(() => {
    const gaps = new Map<number, CelebrationMoment>();
    const unlocks = new Map<string, CelebrationMoment>();
    if (celebration) {
      const { clock, plan } = celebration;
      for (const { gap, at } of plan.gaps) gaps.set(gap, { clock, at });
      for (const { levelId, at } of plan.unlocks) unlocks.set(levelId, { clock, at });
    }
    return { gaps, unlocks };
  }, [celebration]);

  return (
    <View pointerEvents="none" aria-hidden style={styles.world}>
      <Animated.View style={[styles.content, area, shift]}>
        <MapClouds field={clouds} origin={origin} k={k} clock={clock} />
        <MapTiles tiles={tiles} scale={scale} watched={watched} onReady={onReady} />
        {water ? (
          <WaterGlints
            glints={water.glints}
            surface={water.surface}
            origin={origin}
            k={k}
            clock={clock}
          />
        ) : null}
        {done.map((segment) => {
          const moment = moments.gaps.get(segment.gap);
          const from = map.nodes[segment.gap];
          const to = map.nodes[segment.gap + 1];
          return moment && from && to ? (
            <RevealSegment
              key={segment.gap}
              segment={segment}
              scale={scale}
              from={nodeGround(origin, k, from)}
              to={nodeGround(origin, k, to)}
              moment={moment}
            />
          ) : (
            <Image
              key={segment.gap}
              source={segment.source}
              fadeDuration={0}
              resizeMethod="scale"
              resizeMode="stretch"
              onError={onTileError}
              style={[styles.image, tileRect(segment, scale)]}
            />
          );
        })}
        {map.nodes.map((node) =>
          node.state === 'locked' ? null : (
            <LevelHalo
              key={node.levelId}
              node={node}
              origin={origin}
              k={k}
              pulse={node.levelId === pulsing ? clock : null}
              appear={moments.unlocks.get(node.levelId) ?? null}
            />
          ),
        )}
        {discs.map((node) => (
          <LevelDisc
            key={node.levelId}
            node={node}
            origin={origin}
            k={k}
            index={rank.get(node.levelId) ?? -1}
            touch={touch}
            unlock={moments.unlocks.get(node.levelId) ?? null}
          />
        ))}
        {children}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  // Le contenu est bien plus grand que l'écran : il est rogné, et n'agrandit pas la page sur le web.
  world: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  content: { position: 'absolute' },
  image: { position: 'absolute' },
});
