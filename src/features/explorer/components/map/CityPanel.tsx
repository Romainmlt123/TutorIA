import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { MapCity, MapNode } from '../../logic/regionMap';
import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { Parchment, StarChip, WoodFrame } from '@/components/game/WoodFrame';

/** Ce que dit le parchemin : le niveau à jouer, la raison d'une ville fermée, ou le rappel de 5e. */
function note(city: MapCity, next: MapNode | undefined): string {
  if (!city.open && city.missing.length > 0) return fr.explorer.lockedBy(city.missing.join(', '));
  if (next) {
    return fr.explorer.continueWith(fr.explorer.levelTypes[next.type], next.title);
  }
  return city.recall ? fr.explorer.recall(city.recall) : fr.explorer.allDone;
}

type Props = {
  city: MapCity;
  /** Niveau à jouer dans cette ville (le premier niveau ouvert), s'il y en a un. */
  next: MapNode | undefined;
  onPrevious: (() => void) | null;
  onNext: (() => void) | null;
};

/** Panneau de bois de la ville au centre de l'écran : son état, ses niveaux, sa prochaine étape. */
export function CityPanel({ city, next, onPrevious, onNext }: Props) {
  return (
    <WoodFrame tab={fr.explorer.cityTab} accessibilityLabel={city.name}>
      <View style={styles.row}>
        <GameButton
          tone="yellow"
          round
          size={44}
          icon="chevron-gauche"
          accessibilityLabel={fr.explorer.previousCity}
          onPress={onPrevious ?? undefined}
          style={onPrevious ? null : styles.off}
        />
        <View style={styles.title}>
          <GameText size={18} align="center" numberOfLines={1}>
            {city.name}
          </GameText>
          <GameText size={12} align="center" stroke={2} drop={1}>
            {`${fr.explorer.cityLevels(city.levelsDone, city.levelsTotal)} · ${fr.explorer.cityStatus[city.status]}`}
          </GameText>
        </View>
        <GameButton
          tone="yellow"
          round
          size={44}
          icon="chevron-droit"
          accessibilityLabel={fr.explorer.nextCity}
          onPress={onNext ?? undefined}
          style={onNext ? null : styles.off}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.note}>
          <Parchment>{note(city, next)}</Parchment>
        </View>
        <StarChip stars={city.stars} label={fr.explorer.stars(city.stars)} />
      </View>
    </WoodFrame>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  title: { flex: 1, gap: 1 },
  note: { flex: 1 },
  off: { opacity: 0.35 },
});
