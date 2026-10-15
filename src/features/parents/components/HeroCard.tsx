import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import type { IconName } from '@/components/Icon';
import { Watermark } from '@/components/Watermark';
import { liftShadow, theme } from '@/theme';

type Props = {
  /** Icône en filigrane ; sans icône, pas de filigrane (P2). */
  icon?: IconName;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
};

/**
 * Carte héros de l'espace Parents : dégradé `hero` (bleu → violet), texte blanc, filigrane. C'est la
 * première carte, posée à cheval sur le bandeau violet : elle prend l'ombre portée violette (v2.17).
 */
export function HeroCard({ icon, children, contentStyle }: Props) {
  return (
    <GradientSurface
      gradient={theme.hero.gradient}
      shadow={liftShadow('hero', true)}
      contentStyle={[styles.content, contentStyle]}>
      {icon ? (
        <Watermark icon={icon} size={140} offset={-32} placement="top" opacity={0.12} />
      ) : null}
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
