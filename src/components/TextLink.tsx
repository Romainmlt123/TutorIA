import { Text, type TextProps } from './Text';

type Props = Omit<TextProps, 'onPress' | 'color'> & { onPress: () => void; label: string };

/** Lien dans un texte (conditions d'utilisation, « Créer mon compte »), en `primary` gras. */
export function TextLink({ onPress, label, variant, weight = 'bold', ...rest }: Props) {
  return (
    <Text
      {...rest}
      variant={variant}
      weight={weight}
      color="primary"
      onPress={onPress}
      accessibilityRole="link"
      suppressHighlighting>
      {label}
    </Text>
  );
}
