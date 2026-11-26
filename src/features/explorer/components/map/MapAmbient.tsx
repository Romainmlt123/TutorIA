import { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { mapArt } from '@/theme/mapArt';

import {
  GLINT_SHAPE,
  type CloudField,
  type CloudPuff,
  type Glint,
  type MapCloud,
} from '../../logic/ambientLayout';
import { cloudShift, GLINT_GROUPS, glintAt } from '../../logic/mapAmbient';
import { worldToContentDp, type ImageFrame } from '../../logic/mapProjection';

/*
 * La vie d'une carte pré-rendue (X2b), dans le contenu qui défile (RegionMapWorld) : les nuages qui
 * dérivent sous l'île, visibles là où le rendu est transparent, et les reflets du soleil qui
 * scintillent sur l'eau. Tout est monté une fois pour toutes ; seuls la place des nuages et l'éclat
 * des reflets changent, sur le fil de l'interface, au pas de l'horloge de la carte (`useMapClock` :
 * 30 fois par seconde au plus, figée avec « Réduire les animations » et hors de l'onglet).
 *
 * Formes douces sans image ni SVG : un cœur aux bouts arrondis, et une ombre floue de sa couleur
 * pour bord. Un nuage (une vue qui a des enfants) ne fait que glisser, sans opacité animée : iOS
 * composerait tout le groupe hors écran. Les reflets, eux, animent leur opacité : sur iOS, leur
 * ombre est un calque de plus (déjà composé hors écran, à cause de son masque), et chaque reflet
 * allumé l'est donc aussi. C'est le prix accepté pour quelques éclats de quelques dp.
 */

type Placement = {
  /** Coin haut gauche du rendu (mètres du plan image) et échelle de la carte (dp par mètre). */
  origin: Pick<ImageFrame, 'x0' | 'v0'>;
  k: number;
  /** Horloge de la carte (secondes). */
  clock: SharedValue<number>;
};

/** Longueur au dixième de dp, dans une ombre (chaîne CSS). */
const round = (dp: number) => Math.round(dp * 10) / 10;

/** Bord doux d'une forme : une ombre floue de sa couleur, sans décalage. */
const softEdge = (spread: number, blur: number, color: string) =>
  `0px 0px ${round(blur)}px ${round(spread)}px ${color}`;

/** Une bouffée, dans la vue de son nuage (dp). */
function puffStyle(puff: CloudPuff, cloud: MapCloud, k: number) {
  const color = mapArt.cloud[puff.tone];
  const width = puff.width * k;
  const height = puff.height * k;
  return {
    left: (cloud.halfWidth + puff.dx) * k - width / 2,
    top: (cloud.halfHeight + puff.dv) * k - height / 2,
    width,
    height,
    borderRadius: Math.min(width, height) / 2,
    backgroundColor: color,
    boxShadow: softEdge(puff.spread * k, puff.blur * k, color),
  };
}

/** Un nuage et ses bouffées, qui dérive vers la droite et revient à gauche hors de l'image. */
const Cloud = memo(function Cloud({
  cloud,
  wrap,
  origin,
  k,
  clock,
}: Placement & { cloud: MapCloud; wrap: CloudField['wrap'] }) {
  const [min, max] = wrap;
  const { x, speed } = cloud;
  const drift = useAnimatedStyle(() => ({
    transform: [{ translateX: cloudShift(clock.value, x, speed, min, max) * k }],
  }));
  const box = {
    left: (cloud.x - cloud.halfWidth - origin.x0) * k,
    top: (cloud.v - cloud.halfHeight - origin.v0) * k,
    width: 2 * cloud.halfWidth * k,
    height: 2 * cloud.halfHeight * k,
  };
  return (
    <Animated.View style={[styles.layer, box, drift]}>
      {cloud.puffs.map((puff, i) => (
        <View key={i} style={[styles.layer, puffStyle(puff, cloud, k)]} />
      ))}
    </Animated.View>
  );
});

/** Les nuages de la carte (`mapClouds`), à poser sous les tuiles. */
export const MapClouds = memo(function MapClouds({
  field,
  ...placement
}: Placement & { field: CloudField }) {
  return (
    <>
      {field.clouds.map((cloud, i) => (
        <Cloud key={i} cloud={cloud} wrap={field.wrap} {...placement} />
      ))}
    </>
  );
});

/** Un reflet, à son point de l'eau (dp du contenu). */
function glintStyle(glint: Glint, surface: number, origin: Placement['origin'], k: number) {
  const at = worldToContentDp(origin, k, glint.x, glint.z, surface);
  const width = glint.length * k;
  const height = width * GLINT_SHAPE.height;
  return {
    left: at.x - width / 2,
    top: at.y - height / 2,
    width,
    height,
    borderRadius: height / 2,
    backgroundColor: mapArt.glint,
    boxShadow: softEdge(width * GLINT_SHAPE.spread, width * GLINT_SHAPE.blur, mapArt.glint),
  };
}

/**
 * Les reflets d'un groupe : un seul style animé pour tous (`glintAt`). Éteint, le style ne change
 * plus (`{ opacity: 0 }`) : Reanimated n'envoie aucune mise à jour.
 */
function GlintGroup({
  group,
  glints,
  surface,
  origin,
  k,
  clock,
}: Placement & { group: number; glints: readonly Glint[]; surface: number }) {
  const twinkle = useAnimatedStyle(() => {
    const state = glintAt(clock.value, group);
    if (state.opacity === 0) return { opacity: 0 };
    return {
      opacity: state.opacity,
      transform: [
        { translateX: state.dx * k },
        { translateY: state.dv * k },
        { scale: state.scale },
      ],
    };
  });
  return (
    <>
      {glints.map((glint, i) => (
        <Animated.View
          key={i}
          style={[styles.layer, glintStyle(glint, surface, origin, k), twinkle]}
        />
      ))}
    </>
  );
}

/** Les reflets du soleil sur l'eau (`waterGlints`, à la hauteur `surface`), à poser sur les tuiles. */
export const WaterGlints = memo(function WaterGlints({
  glints,
  surface,
  ...placement
}: Placement & { glints: readonly Glint[]; surface: number }) {
  const groups = useMemo(
    () =>
      Array.from({ length: GLINT_GROUPS }, (_, group) => glints.filter((g) => g.group === group)),
    [glints],
  );
  return (
    <>
      {groups.map((members, group) =>
        members.length > 0 ? (
          <GlintGroup key={group} group={group} glints={members} surface={surface} {...placement} />
        ) : null,
      )}
    </>
  );
});

const styles = StyleSheet.create({
  layer: { position: 'absolute' },
});
