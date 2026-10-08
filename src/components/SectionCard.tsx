import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { theme } from '@/theme';

import { Card } from './Card';
import { SectionHeader } from './SectionHeader';

type Props = {
  title: string;
  /** Précision à droite (« 529 cartes en tout »). */
  meta?: string;
  /** Lien à droite (« Tout voir »). */
  action?: { label: string; onPress: () => void };
  /** Écart entre les éléments du contenu : 16 px, ou 8 à 12 px pour une liste. */
  gap?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Carte de section (v2.5, design/COMPONENTS.md › SectionCard) : le titre de section (22/30 Black)
 * vit dans sa carte blanche ; le contenu passe sur le fond `bg`, sans ombre.
 */
export function SectionCard({ title, meta, action, gap = theme.space[4], style, children }: Props) {
  return (
    <Card radius="3xl" elevation="md" style={[styles.card, style]}>
      <SectionHeader
        title={title}
        meta={meta}
        actionLabel={action?.label}
        onAction={action?.onPress}
      />
      <View style={{ gap }}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.space[4] },
});
