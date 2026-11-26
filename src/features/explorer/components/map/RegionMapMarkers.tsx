import { useMemo } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { explorerArt } from '@/theme/explorerArt';

import { MAP_SCROLL_X, MAP_SCROLL_Z, MAP_ZOOM } from '../../hooks/mapScrollValue';
import type { MapCelebration } from '../../hooks/useMapCelebration';
import { useMapContent } from '../../hooks/useMapContent';
import { cityBannerPlaces, discFace } from '../../logic/mapMarkers';
import { worldToContentDp } from '../../logic/mapProjection';
import type { ScreenSize } from '../../logic/mapProjection';
import { clampPointToScreen, nearestPointOnPolygon, pointUnderFocus } from '../../logic/mapZoom';
import type { MapCity, MapNode, RegionMap } from '../../logic/regionMap';
import { regionShadowSet, type RegionShadow } from '../../stylized3d/regionShadows';
import type { MapTiles } from '../../tiles';
import { CityBanner } from './CityBanner';
import type { CityFlip } from './CityCelebration';
import { MAP_TARGET, nodeLabel } from './levelMarks';
import { NodeStars, type StarPop } from './NodeStars';

type Props = {
  map: RegionMap;
  tiles: MapTiles;
  screen: ScreenSize;
  /** Niveau où se tient l'avatar : son bouton l'annonce (« tu es ici »). */
  avatarLevelId: string | null;
  onNode: (node: MapNode) => void;
  onCity: (city: MapCity) => void;
  /** Célébration au retour d'un niveau (useMapCelebration) : étoiles gagnées et villes. */
  celebration?: MapCelebration | null;
  /** Les disques ne reçoivent plus les touchers sous le zoom de tap. */
  touchable?: boolean;
};

/**
 * Taille d'un bandeau de ville (dp), estimée d'après son nom : la police de jeu à 12 pt fait environ
 * 5,6 dp par lettre (agrandie avec le texte, 1,3 fois au plus), plus l'icône, les marges et le rebord.
 */
function bannerSize(name: string, fontScale: number) {
  return { width: 50 + 5.6 * name.length * Math.min(fontScale, 1.3), height: MAP_TARGET };
}

function ShadowName({
  label,
  tiles,
  screen,
  k,
}: {
  label: RegionShadow;
  tiles: MapTiles;
  screen: ScreenSize;
  k: number;
}) {
  const position = useAnimatedStyle(() => {
    const zoom = MAP_ZOOM.value;
    const center = pointUnderFocus(
      { x: MAP_SCROLL_X.value, z: MAP_SCROLL_Z.value },
      { x: screen.width / 2, y: screen.height / 2 },
      screen,
      k,
      zoom,
    );
    const nearest = nearestPointOnPolygon(label.polygon, center);
    const point = clampPointToScreen(
      nearest,
      center,
      screen,
      k,
      zoom,
      explorerArt.regionShadow.label.width / 2 + 8,
      explorerArt.regionShadow.label.lift + 8,
    );
    const contentPoint = worldToContentDp(tiles, k, point.x, point.z);
    return { left: contentPoint.x, top: contentPoint.y };
  }, [k, label, screen, tiles]);
  const scale = useAnimatedStyle(() => ({
    transform: [{ scale: 1 / Math.max(MAP_ZOOM.value, 0.01) }],
  }));
  const labelText = Object.entries(fr.explorer.regionShadowNames).find(
    ([id]) => id === label.id,
  )?.[1];
  if (!labelText) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.shadowLabel, position]}>
      <Animated.View style={[styles.shadowLabelText, scale]}>
        <Text variant="caption" weight="bold" color="textOnColor">
          {labelText}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

/**
 * Ce qui se touche sur une carte pré-rendue (X2b) : un bouton de 48 dp sur chaque niveau, avec son
 * libellé complet, les étoiles des niveaux terminés et les bandeaux des villes. C'est une seconde vue
 * du contenu de la carte (`useMapContent`, comme RegionMapWorld), posée au-dessus du HUD et rognée à
 * la zone de la carte : chaque élément y garde sa place, sans style animé ni rendu React pendant le
 * défilement, et reste collé à son disque, même pendant un lancer. Au retour d'un niveau, les
 * étoiles gagnées y jaillissent et les bandeaux des villes se retournent (`celebration`).
 */
export function RegionMapMarkers({
  map,
  tiles,
  screen,
  avatarLevelId,
  onNode,
  onCity,
  celebration = null,
  touchable = true,
}: Props) {
  const { k, origin, area, shift } = useMapContent(tiles, screen);
  const labels = regionShadowSet(map.regionId)?.shadows ?? [];
  // Ce que la célébration anime : les étoiles de chaque niveau, le bandeau de chaque ville.
  const moments = useMemo(() => {
    const stars = new Map<string, StarPop>();
    const flips = new Map<string, CityFlip>();
    if (celebration) {
      const { clock, plan } = celebration;
      for (const { levelId, row, pops } of plan.stars) stars.set(levelId, { clock, row, pops });
      for (const { cityId, from, to, at } of plan.cities) {
        flips.set(cityId, { clock, at, from, to });
      }
    }
    return { stars, flips };
  }, [celebration]);
  // Places des bandeaux, une fois pour toutes : aucun ne cache un disque, des étoiles ni un autre bandeau.
  const banners = useMemo(() => {
    const fontScale = PixelRatio.getFontScale();
    const sizes = new Map(map.cities.map((city) => [city.id, bannerSize(city.name, fontScale)]));
    return cityBannerPlaces(map, origin, k, sizes);
  }, [map, origin, k]);
  return (
    <Animated.View
      pointerEvents={touchable ? 'box-none' : 'none'}
      style={[styles.content, area, shift]}>
      {labels.map((label) => (
        <ShadowName key={label.id} label={label} tiles={tiles} screen={screen} k={k} />
      ))}
      {map.nodes.map((node) => {
        const face = discFace(origin, k, node);
        const label = nodeLabel(node);
        return (
          <View
            key={node.levelId}
            pointerEvents="box-none"
            style={[styles.node, { left: face.x - MAP_TARGET / 2, top: face.y - MAP_TARGET / 2 }]}>
            <PressableBase
              onPress={() => onNode(node)}
              accessibilityRole="button"
              accessibilityLabel={
                node.levelId === avatarLevelId ? fr.explorer.levelHere(label) : label
              }
              style={styles.target}
            />
            {node.state === 'completed' ? (
              <NodeStars stars={node.stars} pop={moments.stars.get(node.levelId)} />
            ) : null}
          </View>
        );
      })}
      {map.cities.map((city) => {
        const place = banners.get(city.id);
        if (!place) return null;
        // Le bandeau se pose par le milieu de son bas (CityBanner).
        return (
          <View
            key={city.id}
            pointerEvents="box-none"
            style={[
              styles.banner,
              { left: place.left + place.width / 2, top: place.top + place.height },
            ]}>
            <CityBanner
              city={city}
              onPress={() => onCity(city)}
              withStatus
              flip={moments.flips.get(city.id)}
            />
          </View>
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { position: 'absolute' },
  node: { position: 'absolute', width: MAP_TARGET, height: MAP_TARGET },
  target: { width: MAP_TARGET, height: MAP_TARGET },
  banner: { position: 'absolute', alignItems: 'center' },
  shadowLabel: {
    position: 'absolute',
    zIndex: 2,
    width: explorerArt.regionShadow.label.width,
    marginLeft: -explorerArt.regionShadow.label.width / 2,
    marginTop: -explorerArt.regionShadow.label.lift,
    alignItems: 'center',
  },
  shadowLabelText: {
    paddingHorizontal: explorerArt.regionShadow.label.paddingHorizontal,
    paddingVertical: explorerArt.regionShadow.label.paddingVertical,
    borderRadius: explorerArt.regionShadow.label.radius,
    backgroundColor: explorerArt.regionShadow.fill,
    borderWidth: explorerArt.regionShadow.label.borderWidth,
    borderColor: explorerArt.regionShadow.outline,
    alignItems: 'center',
  },
});
