import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';

import type { MapCelebration } from '../../hooks/useMapCelebration';
import { useMapContent } from '../../hooks/useMapContent';
import { cityBannerAnchor, discFace } from '../../logic/mapMarkers';
import { worldToContentDp, type ScreenSize } from '../../logic/mapProjection';
import type { MapCity, MapNode, RegionMap } from '../../logic/regionMap';
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
};

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
}: Props) {
  const { k, origin, area, shift } = useMapContent(tiles, screen);
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
  return (
    <Animated.View pointerEvents="box-none" style={[styles.content, area, shift]}>
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
        const [x, y, z] = cityBannerAnchor(city);
        const at = worldToContentDp(origin, k, x, z, y);
        return (
          <View
            key={city.id}
            pointerEvents="box-none"
            style={[styles.banner, { left: at.x, top: at.y }]}>
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
});
