import { Text, type TextProps } from '@/components/Text';

type Props = Omit<TextProps, 'children'> & { text: string };

/** Texte où les passages entre ** ** sont en gras (résumé de la semaine, alerte). */
export function StrongText({ text, ...rest }: Props) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return (
    <Text {...rest}>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <Text key={index} {...rest} weight="bold">
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}
