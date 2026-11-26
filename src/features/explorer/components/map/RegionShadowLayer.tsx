import { Fragment, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { explorerArt } from '@/theme/explorerArt';

import { worldToImagePx } from '../../logic/mapProjection';
import {
  regionShadowSet,
  type RegionPoint,
  type RegionShadow,
} from '../../stylized3d/regionShadows';
import type { MapTiles } from '../../tiles';

const EMPTY_LAND: readonly RegionPoint[] = [];
const EMPTY_SHADOWS: readonly RegionShadow[] = [];

function imagePoint(tiles: MapTiles, [x, z]: RegionPoint) {
  return worldToImagePx(tiles, x, z);
}

function pathFor(tiles: MapTiles, polygon: readonly RegionPoint[], margin: number) {
  return (
    polygon
      .map((coordinates, index) => {
        const point = imagePoint(tiles, coordinates);
        return `${index === 0 ? 'M' : 'L'}${point.x + margin},${point.y + margin}`;
      })
      .join(' ') + ' Z'
  );
}

function ShadowOutline({
  shadow,
  tiles,
  margin,
  fill,
}: {
  shadow: RegionShadow;
  tiles: MapTiles;
  margin: number;
  fill: string | 'none';
}) {
  const path = pathFor(tiles, shadow.polygon, margin);
  return (
    <Fragment key={shadow.id}>
      <Path
        d={path}
        fill="none"
        stroke={explorerArt.regionShadow.glow}
        strokeLinejoin="round"
        strokeWidth={explorerArt.regionShadow.glowWidth}
      />
      <Path
        d={path}
        testID={fill === 'none' ? `explorer-region-outline-${shadow.id}` : 'explorer-region-islet'}
        fill={fill === 'none' ? 'none' : explorerArt.regionShadow.fill}
        stroke={explorerArt.regionShadow.outline}
        strokeLinejoin="round"
        strokeWidth={explorerArt.regionShadow.outlineWidth}
      />
    </Fragment>
  );
}

export function RegionShadowLayer({ tiles, scale }: { tiles: MapTiles; scale: number }) {
  const set = regionShadowSet(tiles.regionId);
  const land = set?.land ?? EMPTY_LAND;
  const shadows = set?.shadows ?? EMPTY_SHADOWS;
  const points = useMemo(
    () => [
      ...land.map((coordinates) => imagePoint(tiles, coordinates)),
      ...shadows.flatMap((shadow) =>
        shadow.polygon.map((coordinates) => imagePoint(tiles, coordinates)),
      ),
    ],
    [land, shadows, tiles],
  );
  const margin =
    Math.ceil(
      points.reduce(
        (extent, point) =>
          Math.max(extent, -point.x, point.x - tiles.width, -point.y, point.y - tiles.height),
        0,
      ) + explorerArt.regionShadow.glowWidth,
    ) || explorerArt.regionShadow.glowWidth;

  if (!land.length && !shadows.length) return null;
  const landPath = pathFor(tiles, land, margin);
  const neighbors = shadows.filter((shadow) => shadow.id !== 'maths-algo');
  const islets = shadows.filter((shadow) => shadow.id === 'maths-algo');

  return (
    <Svg
      testID="explorer-region-shadows"
      pointerEvents="none"
      width={(tiles.width + margin * 2) * scale}
      height={(tiles.height + margin * 2) * scale}
      viewBox={`0 0 ${tiles.width + margin * 2} ${tiles.height + margin * 2}`}
      style={[styles.shadows, { left: -margin * scale, top: -margin * scale }]}>
      {land.length ? (
        <>
          <Path
            testID="explorer-region-land"
            d={landPath}
            fill={explorerArt.regionShadow.fill}
            stroke={explorerArt.regionShadow.glow}
            strokeLinejoin="round"
            strokeWidth={explorerArt.regionShadow.glowWidth}
          />
          <Path
            d={landPath}
            fill="none"
            stroke={explorerArt.regionShadow.outline}
            strokeLinejoin="round"
            strokeWidth={explorerArt.regionShadow.outlineWidth}
          />
        </>
      ) : null}
      {neighbors.map((shadow) => (
        <ShadowOutline key={shadow.id} shadow={shadow} tiles={tiles} margin={margin} fill="none" />
      ))}
      {islets.map((shadow) => (
        <ShadowOutline
          key={shadow.id}
          shadow={shadow}
          tiles={tiles}
          margin={margin}
          fill={explorerArt.regionShadow.fill}
        />
      ))}
    </Svg>
  );
}

const styles = StyleSheet.create({
  shadows: { position: 'absolute', overflow: 'visible' },
});
