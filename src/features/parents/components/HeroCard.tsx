import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import type { IconName } from '@/components/Icon';
import { Watermark } from '@/components/Watermark';
import { theme } from '@/theme';

type Props = {
  icon: IconName;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/** Carte héros de l'espace Parents : dégradé `hero` (bleu → violet), texte blanc, filigrane. */
export function HeroCard({ icon, children, contentStyle }: Props) {
  return (
    <GradientSurface
      gradient={theme.hero.gradient}
      shadow={theme.shadow.md}
      contentStyle={[styles.content, contentStyle]}>
      <Watermark icon={icon} size={140} offset={-32} placement="top" opacity={0.12} />
      {children}
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: theme.space[4],
    paddingVertical: theme.space[6],
    paddingHorizontal: theme.space[6],
  },
});
