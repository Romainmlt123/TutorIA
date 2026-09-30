import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import type { IslandRegion } from '../hooks/useIslandRegions';
import { GameButton } from './hud/GameButton';
import { GameText } from './hud/GameText';
import { IslandBanner } from './hud/IslandBanner';
import { RegionCarousel } from './RegionCarousel';

type Props = {
  subjectId: SubjectId;
  regions: readonly IslandRegion[];
  selectedId: string | null;
  onSelect: (regionId: string) => void;
  onEnter: (regionId: string) => void;
  onBack: () => void;
  /** Geste qui fait tourner l'île. */
  rotate: ReturnType<typeof Gesture.Pan>;
};

/**
 * X2a · les régions de l'île : retour, banderole et consigne en haut, l'île au milieu (qu'on fait
 * tourner au doigt), et en bas le carrousel des régions, dont la région choisie est allumée sur l'île.
 */
export function RegionsHud({
  subjectId,
  regions,
  selectedId,
  onSelect,
  onEnter,
  onBack,
  rotate,
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
      <GestureDetector gesture={rotate}>
        <View
          accessible
          accessibilityLabel={fr.explorer.islandLabel(fr.explorer.islandNames[subjectId])}
          accessibilityHint={fr.explorer.rotateHint}
          style={styles.zone}
        />
      </GestureDetector>
      <RegionCarousel
        regions={regions}
        selectedId={selectedId}
        onSelect={onSelect}
        onEnter={onEnter}
      />
    </>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  banner: { flex: 1, alignItems: 'center', marginRight: 48 + theme.space[3] },
  zone: { flex: 1 },
});
