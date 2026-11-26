import { StyleSheet, View } from 'react-native';

import { GameText } from '@/components/game/GameText';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { CityStatus } from '../../logic/progression';
import type { MapCity } from '../../logic/regionMap';
import { BannerFlip, type CityFlip } from './CityCelebration';
import { MAP_TARGET } from './levelMarks';

const HUD = explorerArt.hud;

/** Rebord du bandeau, et son icône, selon l'état de la ville. */
const CITY_COLORS: Record<CityStatus, string> = {
  done: HUD.status.done.face,
  current: HUD.status.current.face,
  consolidate: HUD.status.consolidate.face,
  locked: explorerArt.map.node.locked,
};

/** Icône de l'état (design/COMPONENTS.md › CityBanner) : l'état ne se lit pas qu'à la couleur. */
const CITY_ICONS: Record<CityStatus, IconName> = {
  done: 'coche-cercle',
  current: 'drapeau',
  consolidate: 'retour',
  locked: 'cadenas',
};

type Props = {
  city: MapCity;
  onPress: () => void;
  /** Icône de l'état devant le nom (carte pré-rendue). */
  withStatus?: boolean;
  /** Célébration de la ville (carte pré-rendue) : le bandeau se retourne de son ancien état au nouveau. */
  flip?: CityFlip | null;
};

/** Ce qu'affiche le bandeau : l'icône de l'état (`withStatus`) et le nom de la ville. */
function BannerContent({
  name,
  status,
  withStatus,
}: {
  name: string;
  status: CityStatus;
  withStatus: boolean;
}) {
  return (
    <>
      {withStatus ? (
        <Icon name={CITY_ICONS[status]} size={16} strokeWidth={2.5} color={CITY_COLORS[status]} />
      ) : null}
      <GameText size={12} stroke={2} drop={1} numberOfLines={1}>
        {name}
      </GameText>
    </>
  );
}

/**
 * Bandeau en bois d'une ville, posé sur la carte d'une région : son nom, cerclé de la couleur de son
 * état. Son bas est centré sur le point de la vue qui le contient. Le toucher fait glisser la carte
 * jusqu'à la ville. Pendant une célébration (`flip`), il montre d'abord l'ancien état de la ville,
 * puis se retourne sur le nouveau ; il reste touchable pendant tout ce temps.
 */
export function CityBanner({ city, onPress, withStatus = false, flip = null }: Props) {
  const button = (
    <PressableBase
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={fr.explorer.cityBanner(city.name, fr.explorer.cityStatus[city.status])}
      style={[styles.body, flip ? null : styles.anchor, { borderColor: CITY_COLORS[city.status] }]}>
      <BannerContent name={city.name} status={city.status} withStatus={withStatus} />
    </PressableBase>
  );
  if (!flip) return button;
  return (
    <View pointerEvents="box-none" style={styles.anchor}>
      <BannerFlip
        flip={flip}
        seed={city.id}
        front={
          <View style={[styles.body, styles.front, { borderColor: CITY_COLORS[flip.from] }]}>
            <BannerContent name={city.name} status={flip.from} withStatus={withStatus} />
          </View>
        }>
        {button}
      </BannerFlip>
    </View>
  );
}

const styles = StyleSheet.create({
  // Le bas du bandeau est centré sur le point de la vue qui le contient.
  anchor: { transform: [{ translateX: '-50%' }, { translateY: '-100%' }] },
  body: {
    minHeight: MAP_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[1],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    borderWidth: 3,
    backgroundColor: HUD.wood.frame,
  },
  front: { flex: 1 },
});
