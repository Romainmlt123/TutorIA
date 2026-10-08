import { theme } from '@/theme';

import { Text, type TextProps } from './Text';

type Props = Omit<TextProps, 'onPress' | 'color'> & {
  onPress: () => void;
  label: string;
  /** Espace Parents : liens en `violet-600` (v2.7). */
  tone?: 'student' | 'parent';
};

/** Lien dans un texte (conditions d'utilisation, « Créer mon compte »), en `primary` gras. */
export function TextLink({
  onPress,
  label,
  variant,
  weight = 'bold',
  tone = 'student',
  ...rest
}: Props) {
  return (
    <Text
      {...rest}
      variant={variant}
      weight={weight}
      color={tone === 'parent' ? theme.palette.violet[600] : 'primary'}
      onPress={onPress}
      accessibilityRole="link"
      suppressHighlighting>
      {label}
    </Text>
  );
}
