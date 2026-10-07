import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenBand } from '@/components/ScreenBand';
import { Text } from '@/components/Text';
import { theme } from '@/theme';

type Props = {
  title: string;
  intro?: string;
  /** Rangée au-dessus du titre (P1 : sélecteur d'enfant, badge, notifications). */
  top?: ReactNode;
  /** Sous le texte (P2 : sélecteur de période). */
  children?: ReactNode;
};

/** En-tête des écrans Parents (v2.5) : bandeau violet de marque, titre et phrase en blanc. */
export function ParentBand({ title, intro, top, children }: Props) {
  return (
    <ScreenBand tone="violet" accessibilityLabel={title}>
      <View style={styles.stack}>
        {top}
        <View style={styles.texts}>
          <Text variant="hero" color="textOnColor" accessibilityRole="header">
            {title}
          </Text>
          {intro ? (
            <Text variant="lead" color="textOnColor" style={styles.intro}>
              {intro}
            </Text>
          ) : null}
        </View>
        {children}
      </View>
    </ScreenBand>
  );
}

const styles = StyleSheet.create({
  stack: { gap: theme.space[5] },
  texts: { gap: theme.space[1] },
  intro: { maxWidth: 300 },
});
