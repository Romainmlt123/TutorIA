import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { explorerArt } from '@/theme/explorerArt';
import { mapArt } from '@/theme/mapArt';

import { rowAppear, sparkleAt, starPopScale } from '../../logic/juice';
import type { MapNode } from '../../logic/regionMap';
import { MAP_TARGET } from './levelMarks';

const HUD = explorerArt.hud;
const STAR = 18;
/** L'étoile cernée de bleu nuit : la même étoile, un peu plus grande, dessous. */
const OUTLINE = STAR + 5;
/** Celle du milieu plus haute : un arc, façon carte de jeu. */
const STAR_LIFT = [0, 6, 0] as const;
/** Étincelles autour d'une étoile qui apparaît : nombre, distance au centre et taille (dp). */
const SPARKS = 8;
const SPARK_RADIUS = 15;
const SPARK = 4;

/** Étoiles qui apparaissent pendant la célébration d'un niveau (useMapCelebration). */
export type StarPop = {
  clock: SharedValue<number>;
  /** Heure où la rangée apparaît (niveau terminé pour la première fois), sinon null. */
  row: number | null;
  /** Étoiles gagnées, à leur heure (rang de 0 à 2 dans la rangée). */
  pops: readonly { slot: number; at: number }[];
};

/** Une étoile cernée de bleu nuit : or si elle est gagnée, grise sinon. */
function StarFace({ gold }: { gold: boolean }) {
  return (
    <>
      <Icon name="etoile" variant="fill" size={OUTLINE} color={HUD.ink} />
      <View style={styles.starFace}>
        <Icon
          name="etoile"
          variant="fill"
          size={STAR}
          color={gold ? HUD.gold.face[1] : explorerArt.map.nodeRimLocked.dark}
        />
      </View>
    </>
  );
}

/** Étincelles posées en cercle autour du centre d'une étoile. */
const SPARK_SPOTS = Array.from({ length: SPARKS }, (_, i) => {
  const angle = (2 * Math.PI * i) / SPARKS;
  return {
    left: OUTLINE / 2 + SPARK_RADIUS * Math.cos(angle) - SPARK / 2,
    top: OUTLINE / 2 + SPARK_RADIUS * Math.sin(angle) - SPARK / 2,
    backgroundColor: mapArt.celebration.sparkle[i % mapArt.celebration.sparkle.length],
  };
});

/**
 * Étoile gagnée pendant la célébration : grise d'abord, puis l'étoile d'or jaillit par-dessus en
 * grossissant (`starPopScale`), dans un anneau d'étincelles qui s'élargit et s'éteint (`sparkleAt`).
 */
function PopStar({ lift, clock, at }: { lift: number; clock: SharedValue<number>; at: number }) {
  const pop = useAnimatedStyle(() => ({
    transform: [{ scale: starPopScale(clock.get() - at) }],
  }));
  const sparkle = useAnimatedStyle(() => {
    const state = sparkleAt(clock.get() - at);
    return { opacity: state.opacity, transform: [{ scale: state.scale }] };
  });
  return (
    <View style={[styles.star, { marginBottom: lift }]}>
      <StarFace gold={false} />
      <Animated.View style={[styles.starFace, pop]}>
        <StarFace gold />
      </Animated.View>
      <Animated.View style={[styles.starFace, sparkle]}>
        {SPARK_SPOTS.map((spot, i) => (
          <View key={i} style={[styles.spark, spot]} />
        ))}
      </Animated.View>
    </View>
  );
}

/** Rangée de la célébration : elle apparaît si le niveau vient d'être terminé, ses étoiles jaillissent. */
function PoppingStars({ stars, pop }: { stars: MapNode['stars']; pop: StarPop }) {
  const { clock, row } = pop;
  const appear = useAnimatedStyle(() => {
    const state = row === null ? { opacity: 1, scale: 1 } : rowAppear(clock.get() - row);
    return { opacity: state.opacity, transform: [{ scale: state.scale }] };
  });
  return (
    <Animated.View style={[styles.stars, appear]} pointerEvents="none">
      {STAR_LIFT.map((lift, i) => {
        const moment = pop.pops.find((p) => p.slot === i);
        return moment ? (
          <PopStar key={i} lift={lift} clock={clock} at={moment.at} />
        ) : (
          <View key={i} style={[styles.star, { marginBottom: lift }]}>
            <StarFace gold={i < stars} />
          </View>
        );
      })}
    </Animated.View>
  );
}

/**
 * Étoiles en arc au-dessus d'un niveau terminé : les gagnées en or, les autres en gris. Posées
 * au-dessus du bouton du niveau (MAP_TARGET) qui les contient. Au retour d'un niveau (`pop`), les
 * étoiles nouvelles jaillissent une à une, celle du milieu en dernier (écart 13).
 */
export function NodeStars({
  stars,
  pop = null,
}: {
  stars: MapNode['stars'];
  pop?: StarPop | null;
}) {
  if (pop) return <PoppingStars stars={stars} pop={pop} />;
  return (
    <View style={styles.stars} pointerEvents="none">
      {STAR_LIFT.map((lift, i) => (
        <View key={i} style={[styles.star, { marginBottom: lift }]}>
          <StarFace gold={i < stars} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stars: {
    position: 'absolute',
    bottom: MAP_TARGET - 4,
    left: -STAR,
    right: -STAR,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  star: { alignItems: 'center', justifyContent: 'center' },
  starFace: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spark: { position: 'absolute', width: SPARK, height: SPARK, borderRadius: SPARK / 2 },
});
