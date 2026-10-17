import { useMemo, useState, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { theme } from '@/theme';
import { mapArt } from '@/theme/mapArt';

import type { CelebrationMoment } from '../../hooks/useMapCelebration';
import { CELEBRATION } from '../../logic/celebration';
import {
  bannerFlipAt,
  confettiAt,
  confettiPieces,
  cueRingAt,
  FLIP_HIDDEN,
  type ConfettiPiece,
} from '../../logic/juice';
import type { CityChange } from '../../logic/mapProgress';
import { seedOf } from '../../logic/regionSeed';

/*
 * Célébration d'une ville sur la carte pré-rendue, autour de son bandeau (CityBanner) : le bandeau se
 * retourne de l'ancien état de la ville au nouveau ; une ville validée reçoit une pluie de confettis
 * aux couleurs du HUD de jeu, une ville à consolider un anneau chaud et doux, un encouragement (jamais
 * le sentiment d'un échec). Tout est animé sur le fil de l'interface par l'horloge de la célébration,
 * sans toucher : le bandeau reste touchable.
 */

/** Une ville dont l'état change pendant la célébration. */
export type CityFlip = CelebrationMoment & Pick<CityChange, 'from' | 'to'>;

/** Confettis d'une pluie : assez pour une fête, assez peu pour rester léger (une vue chacun). */
const CONFETTI_COUNT = 36;

type Clocked = { clock: SharedValue<number>; at: number };

/** Un confetti : il jaillit du centre du bandeau, retombe en voletant, puis s'efface. */
function ConfettiBit({ piece, clock, at }: Clocked & { piece: ConfettiPiece }) {
  const fly = useAnimatedStyle(() => {
    const state = confettiAt(clock.get() - at, piece);
    return {
      opacity: state.opacity,
      transform: [
        { translateX: state.x },
        { translateY: state.y },
        { rotate: `${state.rotate}deg` },
        { scaleY: state.flip },
      ],
    };
  });
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.bit,
        {
          width: piece.width,
          height: piece.height,
          marginLeft: -piece.width / 2,
          marginTop: -piece.height / 2,
          borderRadius: piece.width / 4,
          backgroundColor: mapArt.celebration.confetti[piece.color],
        },
        fly,
      ]}
    />
  );
}

/** Pluie de confettis d'une ville validée, démontée une fois retombée. */
function Confetti({ clock, at, seed }: Clocked & { seed: number }) {
  const pieces = useMemo(
    () => confettiPieces(CONFETTI_COUNT, mapArt.celebration.confetti.length, seed),
    [seed],
  );
  const [over, setOver] = useState(false);
  useAnimatedReaction(
    () => clock.get() - at >= CELEBRATION.confetti,
    (done, previous) => {
      if (done && !previous) runOnJS(setOver)(true);
    },
    [clock, at],
  );
  if (over) return null;
  return pieces.map((piece, i) => <ConfettiBit key={i} piece={piece} clock={clock} at={at} />);
}

/** Anneau chaud qui s'élargit une fois autour du bandeau d'une ville à consolider. */
function CueRing({ clock, at }: Clocked) {
  const ring = useAnimatedStyle(() => {
    const state = cueRingAt(clock.get() - at);
    return { opacity: state.opacity, transform: [{ scale: state.scale }] };
  });
  return <Animated.View pointerEvents="none" style={[styles.ring, ring]} />;
}

/**
 * Le bandeau qui se retourne, posé dans la vue qui le place : le nouvel état (`children`, le bouton)
 * dessous, l'ancien (`front`, une simple image du bandeau) devant, qui s'aplatit à son heure ; puis
 * le nouveau se déplie en rebondissant (`bannerFlipAt`).
 */
export function BannerFlip({
  flip,
  seed,
  front,
  children,
}: {
  flip: CityFlip;
  /** Identifiant de la ville : ses confettis sont toujours les mêmes. */
  seed: string;
  front: ReactNode;
  children: ReactNode;
}) {
  const { clock, at } = flip;
  const back = useAnimatedStyle(() => ({
    transform: [{ scaleY: bannerFlipAt(clock.get() - at).back }],
  }));
  const face = useAnimatedStyle(() => {
    const scale = bannerFlipAt(clock.get() - at).front;
    return { opacity: scale > FLIP_HIDDEN ? 1 : 0, transform: [{ scaleY: scale }] };
  });
  return (
    <>
      {flip.to === 'consolidate' ? <CueRing clock={clock} at={at} /> : null}
      <Animated.View style={back}>{children}</Animated.View>
      <Animated.View pointerEvents="none" aria-hidden style={[styles.front, face]}>
        {front}
      </Animated.View>
      {flip.to === 'done' ? <Confetti clock={clock} at={at} seed={seedOf(seed)} /> : null}
    </>
  );
}

const styles = StyleSheet.create({
  front: { ...StyleSheet.absoluteFill },
  ring: {
    ...StyleSheet.absoluteFill,
    borderRadius: theme.radius['2xl'],
    borderWidth: mapArt.celebration.cueWidth,
    borderColor: mapArt.celebration.cue,
    boxShadow: mapArt.celebration.cueGlow,
  },
  // Chaque confetti part du centre du bandeau.
  bit: { position: 'absolute', left: '50%', top: '50%' },
});
