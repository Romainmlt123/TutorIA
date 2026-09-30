import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { GameButton } from './hud/GameButton';
import { GameText } from './hud/GameText';
import { IslandBanner } from './hud/IslandBanner';
import { RegionList } from './RegionList';
import { RegionPanel } from './RegionPanel';

type Props = {
  subjectId: SubjectId;
  regions: readonly IslandRegion[];
  selected: IslandRegion | null;
  onSelect: (regionId: string) => void;
  onEnter: (regionId: string) => void;
  onBack: () => void;
  /** Geste qui fait tourner l'île. */
  rotate: ReturnType<typeof Gesture.Pan>;
  /** Liste à la place des panneaux posés sur l'île : sans WebGL ou avec un lecteur d'écran. */
  listMode: boolean;
};

/**
 * X2a · les régions de l'île : retour, banderole, consigne, puis le panneau de la région choisie.
 * Les panneaux posés sur l'île sont dessinés à part (RegionSign), à la position où la caméra les voit.
 */
export function RegionsHud({
  subjectId,
  regions,
  selected,
  onSelect,
  onEnter,
  onBack,
  rotate,
  listMode,
}: Props) {
  return (
    <>
      <View style={styles.top}>
        <GameButton
          tone="yellow"
          round
          size={48}
          icon="chevron-gauche"
          accessibilityLabel={fr.explorer.backToIslands}
          onPress={onBack}
        />
        <View style={styles.banner}>
          <IslandBanner subjectId={subjectId} />
        </View>
      </View>
      <GameText size={18} align="center" stroke={2} drop={2}>
        {fr.explorer.regionsCaption}
      </GameText>
      {listMode ? (
        <View style={styles.list}>
          <RegionList
            regions={regions}
            selectedId={selected?.regionId ?? null}
            onSelect={onSelect}
          />
        </View>
      ) : (
        <GestureDetector gesture={rotate}>
          <View
            accessible
            accessibilityLabel={fr.explorer.islandLabel(fr.explorer.islandNames[subjectId])}
            accessibilityHint={fr.explorer.rotateHint}
            style={styles.zone}
          />
        </GestureDetector>
      )}
      {selected ? (
        <RegionPanel region={selected} onEnter={() => onEnter(selected.regionId)} />
      ) : null}
    </>
  );
}

type RegionViewProps = { region: IslandRegion | undefined; onBack: () => void };

/** X2b · carte d'une région : pour l'instant le retour et le nom ; la carte arrive à l'étape suivante. */
export function RegionPlaceholderHud({ region, onBack }: RegionViewProps) {
  return (
    <>
      <View style={styles.top}>
        <GameButton
          tone="yellow"
          round
          size={48}
          icon="chevron-gauche"
          accessibilityLabel={fr.explorer.backToRegions}
          onPress={onBack}
        />
        <View style={styles.banner}>
          <GameText size={22} align="center" numberOfLines={2}>
            {region?.region.name ?? ''}
          </GameText>
        </View>
      </View>
      <View style={styles.zone}>
        <GameText size={16} align="center" stroke={2} drop={2}>
          {fr.explorer.regionMapSoon}
        </GameText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  banner: { flex: 1, alignItems: 'center', marginRight: 48 + theme.space[3] },
  zone: { flex: 1, justifyContent: 'center' },
  list: { flex: 1, justifyContent: 'center' },
});
