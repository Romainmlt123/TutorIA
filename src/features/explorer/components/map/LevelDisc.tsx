import { memo, type ReactNode } from 'react';
import {
  Image,
  Platform,
  StyleSheet,
  View,
  type ImageErrorEventData,
  type NativeSyntheticEvent,
} from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/Icon';
import { logError } from '@/lib/logger';
import { explorerArt } from '@/theme/explorerArt';

import type { DiscTouch } from '../../hooks/useDiscTouch';
import type { CelebrationMoment } from '../../hooks/useMapCelebration';
import { lockedShake, pressBounce, unlockAt } from '../../logic/juice';
import { haloPulseOpacity } from '../../logic/mapAmbient';
import {
  discFace,
  discSpriteOf,
  groundSpriteRect,
  haloSpritesOf,
  nodeGround,
} from '../../logic/mapMarkers';
import type { ImageFrame } from '../../logic/mapProjection';
import type { MapNode } from '../../logic/regionMap';
import { nodeSprites, type GroundSprite } from '../../tiles';
import { LEVEL_ICON_STROKE, levelIcon, levelIconSize } from './levelMarks';

/*
 * Un niveau sur la carte pré-rendue (X2b), dans le contenu qui défile : son disque (sprite de Blender,
 * rebord doré ou argenté, liseré bleu nuit, ombre de contact) avec l'icône de son type par-dessus,
 * et le halo des niveaux ouverts, posé dessous. Les sprites sont rendus au pied du niveau, à 336 px
 * par mètre : ils sont ramenés à l'échelle de la carte.
 *
 * Le disque répond au toucher (useDiscTouch) et, pendant la célébration d'un niveau qui s'ouvre
 * (useMapCelebration), passe du verrou à sa couleur ; sur le fil de l'interface, sans rendu React.
 */

type Placement = {
  node: MapNode;
  /** Coin haut gauche du rendu (mètres du plan image) et échelle de la carte (dp par mètre). */
  origin: Pick<ImageFrame, 'x0' | 'v0'>;
  k: number;
};

/**
 * Lueur posée en mode « écran », qui éclaire l'herbe au lieu de la teinter. Sauf sur Android : React
 * Native y compose une vue en mode « écran » dans un calque hors écran de la taille de son parent,
 * ici le contenu de la carte, à chaque image du défilement. La lueur y est un simple fondu.
 */
const SCREEN_BLEND = Platform.OS === 'android' ? null : ({ mixBlendMode: 'screen' } as const);

const onSpriteError = (event: NativeSyntheticEvent<ImageErrorEventData>) =>
  logError('explorer.sprites', event.nativeEvent.error);

/** Image d'un sprite, sans fondu d'apparition sur Android. */
const IMAGE = {
  fadeDuration: 0,
  resizeMethod: 'scale',
  resizeMode: 'stretch',
  onError: onSpriteError,
} as const;

/** Place d'un sprite des niveaux, ancré au pied du niveau. */
function spriteRect(sprite: GroundSprite, { node, origin, k }: Placement) {
  return groundSpriteRect(sprite, nodeGround(origin, k, node), k / nodeSprites.ppm);
}

function Sprite({ sprite, placement }: { sprite: GroundSprite; placement: Placement }) {
  return (
    <Image
      source={sprite.source}
      {...IMAGE}
      style={[styles.sprite, spriteRect(sprite, placement)]}
    />
  );
}

/** Lueur d'un halo, dans une vue posée en mode « écran » (SCREEN_BLEND). */
function Glow({ sprite, placement }: { sprite: GroundSprite; placement: Placement }) {
  return (
    <View style={[styles.sprite, spriteRect(sprite, placement), SCREEN_BLEND]}>
      <Image source={sprite.source} {...IMAGE} style={styles.fill} />
    </View>
  );
}

/**
 * Seconde lueur du niveau à jouer, dont l'opacité bat sur le fil de l'interface (`haloPulseOpacity`) ;
 * celle d'un niveau qui s'ouvre ne bat qu'une fois son halo apparu.
 */
function GlowPulse({
  sprite,
  placement,
  clock,
  appear,
}: {
  sprite: GroundSprite;
  placement: Placement;
  clock: SharedValue<number>;
  appear: CelebrationMoment | null;
}) {
  const beat = useAnimatedStyle(() => {
    const shown = appear ? unlockAt(appear.clock.get() - appear.at).halo : 1;
    return { opacity: haloPulseOpacity(clock.value) * shown };
  });
  return (
    <Animated.View style={[styles.sprite, spriteRect(sprite, placement), SCREEN_BLEND, beat]}>
      <Image source={sprite.source} {...IMAGE} style={styles.fill} />
    </Animated.View>
  );
}

/** Halo d'un niveau qui s'ouvre : la lueur et l'anneau apparaissent en fondu, chacun à sa place. */
function AppearingHalo({
  placement,
  pulse,
  appear,
}: {
  placement: Placement;
  pulse: SharedValue<number> | null;
  appear: CelebrationMoment;
}) {
  const { ring, glow } = haloSpritesOf(placement.node, nodeSprites);
  const fade = useAnimatedStyle(() => ({
    opacity: unlockAt(appear.clock.get() - appear.at).halo,
  }));
  return (
    <>
      <Animated.View
        style={[styles.sprite, spriteRect(nodeSprites[glow], placement), SCREEN_BLEND, fade]}>
        <Image source={nodeSprites[glow].source} {...IMAGE} style={styles.fill} />
      </Animated.View>
      {pulse ? (
        <GlowPulse sprite={nodeSprites[glow]} placement={placement} clock={pulse} appear={appear} />
      ) : null}
      <Animated.Image
        source={nodeSprites[ring].source}
        {...IMAGE}
        style={[styles.sprite, spriteRect(nodeSprites[ring], placement), fade]}
      />
    </>
  );
}

/**
 * Halo d'un niveau ouvert, sous les disques : la lueur douce, puis l'anneau net. Celui du niveau à
 * jouer bat (`pulse` : l'horloge de la carte), comme sur la carte 3D. Celui d'un niveau qui vient de
 * s'ouvrir apparaît à son heure (`appear`).
 */
export const LevelHalo = memo(function LevelHalo({
  pulse,
  appear = null,
  ...placement
}: Placement & { pulse: SharedValue<number> | null; appear?: CelebrationMoment | null }) {
  if (appear) return <AppearingHalo placement={placement} pulse={pulse} appear={appear} />;
  const { ring, glow } = haloSpritesOf(placement.node, nodeSprites);
  return (
    <>
      <Glow sprite={nodeSprites[glow]} placement={placement} />
      {pulse ? (
        <GlowPulse sprite={nodeSprites[glow]} placement={placement} clock={pulse} appear={null} />
      ) : null}
      <Sprite sprite={nodeSprites[ring]} placement={placement} />
    </>
  );
});

/** Icône d'un niveau à l'encre, centrée sur le dessus de son disque. */
function DiscIcon({ name, size }: { name: IconName; size: number }) {
  return (
    <Icon name={name} size={size} strokeWidth={LEVEL_ICON_STROKE} color={explorerArt.hud.ink} />
  );
}

/** Icône du type d'un niveau qui s'ouvre : elle jaillit après l'envol du cadenas. */
function IconPop({ moment, children }: { moment: CelebrationMoment; children: ReactNode }) {
  const pop = useAnimatedStyle(() => ({
    transform: [{ scale: unlockAt(moment.clock.get() - moment.at).icon }],
  }));
  return <Animated.View style={pop}>{children}</Animated.View>;
}

/**
 * Ce qui reste du verrou d'un niveau qui s'ouvre, posé sur son disque de couleur : le disque gris,
 * qui rebondit avec lui en s'effaçant, et le cadenas, qui s'envole et s'efface.
 */
function LockShell({
  placement,
  moment,
  icon,
}: {
  placement: Placement;
  moment: CelebrationMoment;
  icon: { left: number; top: number; size: number };
}) {
  const shell = nodeSprites[discSpriteOf({ ...placement.node, state: 'locked' }, nodeSprites)];
  const disc = useAnimatedStyle(() => {
    const state = unlockAt(moment.clock.get() - moment.at);
    return { opacity: state.shell, transform: [{ scale: state.disc }] };
  });
  const lock = useAnimatedStyle(() => {
    const state = unlockAt(moment.clock.get() - moment.at);
    return { opacity: state.lockOpacity, transform: [{ translateY: state.lockLift }] };
  });
  return (
    <>
      <Animated.Image
        source={shell.source}
        {...IMAGE}
        style={[styles.sprite, spriteRect(shell, placement), disc]}
      />
      <Animated.View style={[styles.icon, { left: icon.left, top: icon.top }, lock]}>
        <DiscIcon name="cadenas" size={icon.size} />
      </Animated.View>
    </>
  );
}

/**
 * Disque d'un niveau, et l'icône de son type (ou le cadenas) à l'encre, centrée sur son dessus.
 * Touché (`touch`, rang `index`), il s'enfonce puis rebondit s'il est ouvert, et tremble à peine s'il
 * est fermé. Pendant la célébration de son ouverture (`unlock`), le verrou s'efface sur sa couleur.
 */
export const LevelDisc = memo(function LevelDisc({
  index,
  touch,
  unlock = null,
  ...placement
}: Placement & { index: number; touch: DiscTouch; unlock?: CelebrationMoment | null }) {
  const { node, origin, k } = placement;
  const face = discFace(origin, k, node);
  const size = levelIconSize(node.type);
  const icon = { left: face.x - size / 2, top: face.y - size / 2, size };
  const locked = node.state === 'locked';
  // Le disque et son icône bougent ensemble, chacun autour de son centre (le pied du niveau, le
  // dessus du disque : quelques dp d'écart, sans effet visible sur un rebond de 6 %).
  const motion = useAnimatedStyle(() => {
    const t = touch.index.get() === index ? touch.progress.get() : 1;
    const opening = unlock ? unlockAt(unlock.clock.get() - unlock.at) : null;
    return {
      opacity: opening ? opening.color : 1,
      transform: [
        { translateX: locked ? lockedShake(t) : 0 },
        { scale: (locked ? 1 : pressBounce(t)) * (opening ? opening.disc : 1) },
      ],
    };
  });
  const sprite = nodeSprites[discSpriteOf(node, nodeSprites)];
  const glyph = <DiscIcon name={levelIcon(node)} size={size} />;
  return (
    <>
      <Animated.Image
        source={sprite.source}
        {...IMAGE}
        style={[styles.sprite, spriteRect(sprite, placement), motion]}
      />
      {unlock ? <LockShell placement={placement} moment={unlock} icon={icon} /> : null}
      <Animated.View style={[styles.icon, { left: icon.left, top: icon.top }, motion]}>
        {unlock ? <IconPop moment={unlock}>{glyph}</IconPop> : glyph}
      </Animated.View>
    </>
  );
});

const styles = StyleSheet.create({
  sprite: { position: 'absolute' },
  fill: { width: '100%', height: '100%' },
  icon: { position: 'absolute' },
});
