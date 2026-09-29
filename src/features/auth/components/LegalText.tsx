import { useRouter } from 'expo-router';

import { Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { fr } from '@/i18n/fr';

type Props = { start: string; middle?: string; end: string; align?: 'left' | 'center' };

/** Mention des conditions d'utilisation (et de la politique de confidentialité si `middle`). */
export function LegalText({ start, middle, end, align = 'center' }: Props) {
  const router = useRouter();
  const open = () => router.push({ pathname: '/bientot', params: { sujet: 'conditions' } });
  return (
    <Text variant="hint" color="textSecondary" align={align}>
      {start}
      <TextLink variant="hint" label={fr.form.terms} onPress={open} />
      {middle ? (
        <>
          {middle}
          <TextLink variant="hint" label={fr.form.privacy} onPress={open} />
        </>
      ) : null}
      {end}
    </Text>
  );
}
