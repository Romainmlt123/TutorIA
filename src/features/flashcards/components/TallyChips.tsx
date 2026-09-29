import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

/** Compteurs « Je sais » et « À revoir ». */
export function TallyChips({ known, toReview }: { known: number; toReview: number }) {
  return (
    <View style={styles.row}>
      <View style={[styles.chip, { backgroundColor: theme.colors.successSoft }]}>
        <Text variant="caption" weight="bold" color="successStrong">
          {fr.flashcards.known(known)}
        </Text>
      </View>
      <View style={[styles.chip, { backgroundColor: theme.colors.warningSoft }]}>
        <Text variant="caption" weight="bold" color="warningStrong">
          {fr.flashcards.toReview(toReview)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: theme.space[2] },
  chip: {
    height: 28,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    justifyContent: 'center',
  },
});
