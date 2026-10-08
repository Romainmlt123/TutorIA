import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { Quote } from '@/data/types';
import { theme } from '@/theme';

/** Citation du jour sous la salutation, dans le bandeau : italique 15/22 en blanc, auteur en 12 Bold. */
export function QuoteOfTheDay({ quote }: { quote: Quote }) {
  return (
    <View style={styles.figure}>
      <Text variant="lead" italic color="textOnColor">
        « {quote.text} »
      </Text>
      <Text variant="caption" weight="bold" color="textOnColor">
        — {quote.author}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  figure: { gap: theme.space[1], maxWidth: 300 },
});
