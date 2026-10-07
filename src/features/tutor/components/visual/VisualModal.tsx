import { Modal, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SubjectId } from '@/data/types';
import type { TutorVisual } from '@/services/tutor/visuals';
import { theme } from '@/theme';

import { VisualHeader, VisualLegend } from './VisualPanel';
import { VisualView } from './VisualView';

type Props = {
  visual: TutorVisual | null;
  subjectId: SubjectId;
  onClose: () => void;
};

/** Un visuel du tuteur en plein écran : plus grand, pour lire les graduations et les étiquettes. */
export function VisualModal({ visual, subjectId, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const screen = useWindowDimensions();
  return (
    <Modal visible={visual !== null} animationType="slide" onRequestClose={onClose}>
      {visual ? (
        <View style={[styles.screen, { paddingTop: insets.top + theme.space[3] }]}>
          <VisualHeader visual={visual} subjectId={subjectId} onClose={onClose} />
          <ScrollView
            contentContainerStyle={[
              styles.body,
              { paddingBottom: insets.bottom + theme.space[6] },
            ]}>
            <View style={styles.card}>
              <VisualView visual={visual} height={Math.min(screen.height * 0.55, 460)} />
            </View>
            <VisualLegend visual={visual} />
          </ScrollView>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    gap: theme.space[4],
    paddingHorizontal: theme.layout.screenPadding,
    backgroundColor: theme.colors.bg,
  },
  body: { gap: theme.space[4] },
  card: {
    paddingVertical: theme.space[4],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
  },
});
