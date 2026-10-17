import { useEffect, useMemo, useState } from 'react';
import { PixelRatio, Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import type { AvatarLook } from '@/features/avatar/logic/avatarLook';
import { SceneBoundary } from '@/lib/three/SceneBoundary';
import { useSceneKey } from '@/lib/three/useSceneKey';
import { explorerArt } from '@/theme/explorerArt';

import { useAvatarWalk } from '../../hooks/useAvatarWalk';
import { avatarFrame, avatarShadow } from '../../logic/avatarFrame';
import { pointAlong } from '../../logic/avatarWalk';
import {
  dpPerMeter,
  snapToPixel,
  worldToContentDp,
  type ImageFrame,
  type ScreenSize,
} from '../../logic/mapProjection';
import type { RegionMap } from '../../logic/regionMap';
import { MapAvatarCanvas } from '../../stylized3d/MapAvatarCanvas';

/** Apparition de la figurine quand sa vue 3D est (re)créée (ms). */
const FADE_MS = 200;
/** Une figurine qui ne se montre pas (modèle introuvable) ne retient pas l'avatar plus longtemps (ms). */
const SHOWN_CAP_MS = 1500;

/** Longueur de l'ombre portée au dixième de dp. */
const round = (dp: number) => Math.round(dp * 10) / 10;

type Props = {
  map: RegionMap;
  /** Coin haut gauche du rendu (mètres du plan image) : l'origine du contenu de la carte. */
  tiles: Pick<ImageFrame, 'x0' | 'v0'>;
  screen: ScreenSize;
  look: AvatarLook;
  /** Niveau où se tient l'avatar (celui du pion, ou celui que l'élève vient de toucher). */
  levelId: string | null;
  /** Marche courte : l'élève a touché un niveau et attend sa fiche. */
  quick: boolean;
  /** Onglet affiché et app au premier plan : la figurine s'anime, l'avatar peut marcher. */
  active: boolean;
  animated: boolean;
  /** Sonde du compteur de performance (développement seulement). */
  probe?: boolean;
  /** L'avatar attend avant de rejoindre son niveau : la carte célèbre un niveau terminé. */
  hold?: boolean;
  onArrive: (levelId: string) => void;
};

/**
 * L'avatar de l'élève sur une carte pré-rendue (X2b), dans le contenu qui défile (RegionMapWorld) :
 * il bouge donc avec les tuiles, à la même image, même pendant un lancer. Sa marche le long du
 * chemin est animée sur le fil de l'interface (useAvatarWalk) ; la vue qui le porte contient son
 * ombre de contact, dessinée par React Native, puis sa petite vue 3D (MapAvatarCanvas).
 *
 * Sur Android, la vue 3D perd son contexte quand l'onglet est caché ou qu'un niveau s'ouvre
 * par-dessus : elle est recréée au retour (`useSceneKey`), en fondu, pendant que l'ombre reste. Une
 * marche attend que la figurine se soit montrée, et la fin de la célébration d'un niveau (`hold`).
 */
export function MapAvatarView({
  map,
  tiles,
  screen,
  look,
  levelId,
  quick,
  active,
  animated,
  probe = false,
  hold = false,
  onArrive,
}: Props) {
  const k = dpPerMeter(screen.width);
  // Pixels du tampon de la vue 3D par dp : la densité de l'écran en natif (R3F ignore `dpr`), 2 au
  // plus sur le web (dpr={[1, 2]}), pour que la vue tombe sur des pixels entiers.
  const ratio = Platform.OS === 'web' ? Math.min(PixelRatio.get(), 2) : PixelRatio.get();
  const frame = useMemo(() => avatarFrame(k, ratio), [k, ratio]);
  const shadow = useMemo(() => avatarShadow(k), [k]);
  const origin = useMemo(() => ({ x0: tiles.x0, v0: tiles.v0 }), [tiles.x0, tiles.v0]);
  const sceneKey = useSceneKey();
  // Scène dont la figurine s'est montrée (ou a échoué, ou se fait trop attendre).
  const [shownKey, setShownKey] = useState<number | null>(null);
  useEffect(() => {
    const timer = setTimeout(() => setShownKey(sceneKey), SHOWN_CAP_MS);
    return () => clearTimeout(timer);
  }, [sceneKey]);
  const { choreo, route, progress } = useAvatarWalk({
    map,
    levelId,
    quick,
    animated,
    running: active && shownKey === sceneKey && !hold,
    onArrive,
  });
  const opacity = useSharedValue(0);
  // Une nouvelle vue 3D part invisible : elle apparaît en fondu à sa première image.
  useEffect(() => {
    opacity.set(0);
  }, [sceneKey, opacity]);
  const onShown = () => {
    setShownKey(sceneKey);
    opacity.set(animated ? withTiming(1, { duration: FADE_MS }) : 1);
  };

  // Le point du sol sous la figurine, tombé sur un pixel de l'écran, comme le contenu de la carte.
  const { left, top } = frame;
  const placed = useAnimatedStyle(() => {
    const walk = route.get();
    const at = pointAlong(walk, progress.get() * walk.length);
    const feet = worldToContentDp(origin, k, at.x, at.z, 0);
    return {
      transform: [
        { translateX: snapToPixel(feet.x, ratio) + left },
        { translateY: snapToPixel(feet.y, ratio) + top },
      ],
    };
  });
  const fade = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.view, { width: frame.width, height: frame.height }, placed]}>
      <View
        style={[
          styles.shadow,
          {
            left: shadow.left - left,
            top: shadow.top - top,
            width: shadow.size,
            height: shadow.size,
            borderRadius: shadow.size / 2,
            opacity: shadow.opacity,
            boxShadow: `0 0 ${round(shadow.blur)}px ${round(shadow.spread)}px ${explorerArt.map.groundShadow}`,
            transform: [{ scaleY: shadow.scaleY }],
          },
        ]}
      />
      <Animated.View style={[StyleSheet.absoluteFill, fade]}>
        <SceneBoundary
          key={sceneKey}
          scope="explorer.avatar"
          onError={() => setShownKey(sceneKey)}
          fallback={null}>
          <MapAvatarCanvas
            look={look}
            choreo={choreo}
            frame={frame}
            active={active}
            animated={animated}
            onShown={onShown}
            probe={probe}
          />
        </SceneBoundary>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  view: { position: 'absolute', left: 0, top: 0 },
  shadow: { position: 'absolute', backgroundColor: explorerArt.map.groundShadow },
});
