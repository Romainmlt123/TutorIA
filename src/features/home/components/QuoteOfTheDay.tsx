import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Quote } from '@/data/types';
import { theme } from '@/theme';

/** Citation du jour sous la salutation : italique 14 px, auteur en 12 px. */
export function QuoteOfTheDay({ quote }: { quote: Quote }) {
  return (
    <View style={styles.figure}>
      <Text variant="bodySm" italic color="textSecondary">
        « {quote.text} »
      </Text>
      <Text variant="caption" color="textSecondary">
        — {quote.author}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { gap: theme.space[1], marginTop: -theme.space[2], marginBottom: theme.space[2] },
});
