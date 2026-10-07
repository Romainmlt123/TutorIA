import { StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

const HUD = explorerArt.hud;

type Props = {
  subjects: readonly SubjectId[];
  index: number;
  onSelect: (index: number) => void;
};

/**
 * Points du carrousel en gemmes : une par matière, la gemme active plus grande et à la couleur de
 * la matière. Zone tactile de 48 × 48 px (40 px et 4 px de marge tactile).
 */
export function GemDots({ subjects, index, onSelect }: Props) {
  return (
    <View role="tablist" accessibilityLabel={fr.explorer.subjects} style={styles.row}>
      {subjects.map((subjectId, i) => {
        const on = i === index;
        return (
          <PressableBase
            key={subjectId}
            accessibilityRole="tab"
            accessibilityLabel={fr.explorer.islandNames[subjectId]}
            aria-selected={on}
            onPress={() => onSelect(i)}
            hitSlop={{ left: 4, right: 4 }}
            style={styles.target}>
            <View
              style={[
                styles.gem,
                on && styles.active,
                { backgroundColor: on ? subjectTheme(subjectId).ink : HUD.gem },
              ]}
            />
          </PressableBase>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  target: { width: 40, height: 48, alignItems: 'center', justifyContent: 'center' },
  gem: {
    width: 12,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: HUD.ink,
    transform: [{ rotate: '45deg' }],
  },
  active: { width: 18, height: 18, borderWidth: HUD.button.border },
});
