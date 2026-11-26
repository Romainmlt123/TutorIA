import { useState } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated';

import { logError } from '@/lib/logger';
import { explorerArt } from '@/theme/explorerArt';

import { CLOUD_PROGRESS, DRIFT_PROGRESS } from '../hooks/useSkyVeil';
import type { useSkyVeil } from '../hooks/useSkyVeil';

const CLOUD = require('../../../../assets/explorer/sprites/nuage.webp');

function CoverCloud({
  dx,
  dy,
  layer,
  width,
  height,
  size,
}: (typeof explorerArt.cloud.cover)[number] & { width: number; height: number; size: number }) {
  const [spriteUnavailable, setSpriteUnavailable] = useState(false);
  const {
    y: layerY,
    scale: layerScale,
    opacity: layerOpacity,
    delay,
  } = explorerArt.cloud.layers[layer];
  const style = useAnimatedStyle(() => {
    const progress = CLOUD_PROGRESS.value;
    const parallax = 1 + 0.5 * layer;
    const arrival = Math.min(1, Math.max(0, (progress - delay) / (1 - delay)) * parallax);
    const opening = Math.min(1, Math.max(0, progress - 1) * parallax);
    const outward =
      progress <= 1
        ? interpolate(arrival, [0, 1], [1.35, 0.22])
        : interpolate(opening, [0, 1], [0.22, 2.05]);
    const sizeScale = parallax * layerScale;
    return {
      opacity:
        progress <= 1
          ? interpolate(arrival, [0, 0.5, 1], [0, layerOpacity * 0.7, layerOpacity])
          : interpolate(opening, [0, 0.45, 1], [layerOpacity, layerOpacity * 0.6, 0]),
      transform: [
        { translateX: dx * width * outward * parallax },
        { translateY: dy * height * outward * parallax },
        {
          scale:
            progress <= 1
              ? interpolate(arrival, [0, 1], [0.6, layerScale]) * parallax
              : interpolate(opening, [0, 1], [sizeScale, sizeScale * 0.7]),
        },
      ],
    };
  });
  const cloudStyle = [
    styles.cloud,
    {
      left: width / 2 - size / 2,
      top: (layerY - 0.5) * height + height / 2 - size * explorerArt.cloud.sprite.coverOffset,
      width: size,
      height: size * explorerArt.cloud.sprite.aspectRatio,
    },
    style,
  ];
  return spriteUnavailable ? (
    <Animated.View pointerEvents="none" style={[cloudStyle, styles.cloudFallback]} />
  ) : (
    <Animated.Image
      source={CLOUD}
      resizeMode="contain"
      onError={(event) => {
        logError('explorer.cloud.sprite', event.nativeEvent.error);
        setSpriteUnavailable(true);
      }}
      style={cloudStyle}
    />
  );
}

function DriftCloud({
  y,
  direction,
  size,
  width,
  height,
}: (typeof explorerArt.cloud.drift)[number] & { width: number; height: number }) {
  const [spriteUnavailable, setSpriteUnavailable] = useState(false);
  const cloudSize = width * size;
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      DRIFT_PROGRESS.value,
      [0, 0.12, 0.85, 1],
      [0, explorerArt.cloud.sprite.driftOpacity, explorerArt.cloud.sprite.driftOpacity, 0],
    ),
    transform: [
      {
        translateX:
          direction *
          width *
          interpolate(
            DRIFT_PROGRESS.value,
            [0, 1],
            [explorerArt.cloud.sprite.driftStart, explorerArt.cloud.sprite.driftEnd],
          ),
      },
    ],
  }));
  const cloudStyle = [
    styles.cloud,
    {
      left: width / 2 - cloudSize / 2,
      top: y * height - cloudSize * explorerArt.cloud.sprite.driftOffset,
      width: cloudSize,
      height: cloudSize * explorerArt.cloud.sprite.aspectRatio,
    },
    style,
  ];
  return spriteUnavailable ? (
    <Animated.View pointerEvents="none" style={[cloudStyle, styles.cloudFallback]} />
  ) : (
    <Animated.Image
      source={CLOUD}
      resizeMode="contain"
      onError={(event) => {
        logError('explorer.cloud.sprite', event.nativeEvent.error);
        setSpriteUnavailable(true);
      }}
      style={cloudStyle}
    />
  );
}

/** Nuages transparents sur le ciel, sans intercepter le toucher. */
export function SkyVeil({ style }: { style: ReturnType<typeof useSkyVeil>['style'] }) {
  const { width, height } = useWindowDimensions();
  const size = width * explorerArt.cloud.sprite.size;
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.drift, { width, height }]}>
        {explorerArt.cloud.drift.map((cloud, index) => (
          <DriftCloud key={index} {...cloud} width={width} height={height} />
        ))}
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.veil, style]} />
      <Animated.View pointerEvents="none" style={styles.coverClouds}>
        {explorerArt.cloud.cover.map((cloud, index) => (
          <CoverCloud key={index} {...cloud} width={width} height={height} size={size} />
        ))}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  veil: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: explorerArt.cloud.veil,
  },
  coverClouds: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  drift: { position: 'absolute', top: 0, left: 0, pointerEvents: 'none' },
  cloud: { position: 'absolute' },
  cloudFallback: {
    backgroundColor: explorerArt.cloud.fallback,
    borderRadius: explorerArt.cloud.fallbackRadius,
  },
});
