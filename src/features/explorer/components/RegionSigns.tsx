import { StyleSheet, View } from 'react-native';

import { explorerArt } from '@/theme/explorerArt';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { placeSigns, type Pt, type SignInput } from '../logic/signLayout';
import type { ScreenPoint } from './IslandStage';
import { RegionSign, SIGN_HEIGHT, SIGN_WIDTH } from './RegionSign';

const HUD = explorerArt.hud;

/** Identifiants des points projetés : la région, le bord de l'île vers elle, et le centre de l'île. */
export const edgeId = (regionId: string) => `${regionId}:edge`;
export const CENTRE_ID = 'centre';

const LINE = 3;
const OUTLINE = 2;
const DOT = 13;

/**
 * Trait blanc cerné de bleu nuit entre deux points de l'écran, avec un rond à son extrémité sur
 * la région. Dessiné avec des vues tournées, sans SVG : la même mise en page que les panneaux.
 */
function Leader({ from, to }: { from: Pt; to: Pt }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const thickness = LINE + 2 * OUTLINE;
  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.line,
          {
            left: (from.x + to.x) / 2 - length / 2,
            top: (from.y + to.y) / 2 - thickness / 2,
            width: length,
            height: thickness,
            borderRadius: thickness / 2,
            transform: [{ rotate: `${angle}rad` }],
          },
        ]}>
        <View style={[styles.core, { height: LINE, borderRadius: LINE / 2 }]} />
      </View>
      <View
        pointerEvents="none"
        style={[styles.dot, { left: from.x - DOT / 2, top: from.y - DOT / 2 }]}
      />
    </>
  );
}

type Props = {
  points: readonly ScreenPoint[];
  regions: readonly IslandRegion[];
  selectedId: string | null;
  onSelect: (regionId: string) => void;
  screen: { width: number; height: number };
  /** Zone verticale où les panneaux peuvent se poser. */
  bounds: { top: number; bottom: number };
};

/**
 * Les panneaux de région, posés hors de l'île et reliés par un trait à un point de leur région
 * (trait blanc cerné de bleu nuit, rond au bout), pour que l'île reste bien visible.
 */
export function RegionSigns({ points, regions, selectedId, onSelect, screen, bounds }: Props) {
  const at = new Map(points.map((p) => [p.id, p]));
  const centre = at.get(CENTRE_ID);
  if (!centre) return null;
  const inputs = regions.flatMap((region): SignInput[] => {
    const anchor = at.get(region.regionId);
    const edge = at.get(edgeId(region.regionId));
    return anchor && edge ? [{ id: region.regionId, anchor, edge }] : [];
  });
  const placements = placeSigns(inputs, {
    sign: { width: SIGN_WIDTH, height: SIGN_HEIGHT },
    screen,
    centre,
    bounds,
  });
  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {inputs.map(({ id, anchor }) => {
        const placement = placements.get(id);
        return placement ? <Leader key={id} from={anchor} to={placement.attach} /> : null;
      })}
      {regions.map((region) => {
        const placement = placements.get(region.regionId);
        if (!placement) return null;
        return (
          <View
            key={region.regionId}
            pointerEvents="box-none"
            style={{ position: 'absolute', left: placement.left, top: placement.top }}>
            <RegionSign
              region={region}
              selected={region.regionId === selectedId}
              onPress={() => onSelect(region.regionId)}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    justifyContent: 'center',
    paddingHorizontal: OUTLINE,
    backgroundColor: HUD.ink,
  },
  core: { backgroundColor: HUD.white },
  dot: {
    position: 'absolute',
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    borderWidth: OUTLINE,
    borderColor: HUD.ink,
    backgroundColor: HUD.white,
  },
});
