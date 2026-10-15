import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormMessage } from '@/components/form/FormMessage';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { PrivacyCard, PrivacyLine } from '@/components/PrivacyCard';
import { useAccountActions } from './hooks/useAccountActions';

const t = fr.profile.privacy;
/**
 * Lignes de « Ce que garde le tuteur », dans l'ordre des textes : les messages sont gardés 6 mois
 * (purge de la base), les photos et la voix ne sont jamais enregistrées.
 */
const TUTOR_ROWS = [
  { icon: 'bulle-chat', never: false },
  { icon: 'appareil-photo', never: true },
  { icon: 'micro', never: true },
] as const;

/**
 * D1 · Confidentialité (depuis le profil, v2.16) : ce que voient les parents, ce que garde le tuteur
 * (en listes, avec les durées des purges de la base), et les droits : l'export et la suppression
 * du compte, avec la même confirmation que le profil.
 */
export function PrivacyScreen() {
  const router = useRouter();
  const account = useAccountActions();
  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <View style={styles.top}>
        <IconButton
          icon="chevron-gauche"
          iconSize={22}
          accessibilityLabel={fr.form.back}
          onPress={() => router.back()}
        />
      </View>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
        <Text variant="lead" color="textSecondary">
          {t.lead}
        </Text>
      </View>
      <FormMessage message={account.message} />

      <PrivacyCard icon="oeil" tile="privacy" title={t.parentsTitle}>
        {t.parentsSee.map((label, i) => (
          <PrivacyLine key={label} icon="coche-cercle" tone="yes" label={label} first={i === 0} />
        ))}
        {t.parentsNever.map((label) => (
          <PrivacyLine key={label} icon="cadenas" tone="never" label={label} />
        ))}
      </PrivacyCard>

      <PrivacyCard icon="bulle-chat" tile="captions" title={t.tutorTitle}>
        {t.tutorKeeps.map((row, i) => (
          <PrivacyLine
            key={row.label}
            icon={TUTOR_ROWS[i]?.icon ?? 'bulle-chat'}
            tone="neutral"
            label={row.label}
            keep={{ label: row.keep, never: TUTOR_ROWS[i]?.never ?? false }}
            first={i === 0}
          />
        ))}
      </PrivacyCard>

      <PrivacyCard icon="bouclier" tile="sounds" title={t.rightsTitle}>
        <Text variant="bodySm" style={styles.rights}>
          {t.rightsBody}
        </Text>
        <View style={styles.actions}>
          <Button
            label={fr.profile.export}
            variant="soft"
            leadingIcon="telechargement"
            onPress={() => void account.exportData()}
          />
          <Button
            label={fr.profile.delete}
            variant="danger"
            weight="bold"
            onPress={account.askDelete}
          />
        </View>
      </PrivacyCard>

      <ConfirmDialog
        visible={account.confirmDelete}
        title={fr.profile.deleteTitle}
        body={fr.profile.deleteBody}
        confirmLabel={fr.profile.deleteConfirm}
        keepLabel={fr.profile.keep}
        extra={{ label: fr.profile.exportFirst, onPress: () => void account.exportData() }}
        busy={account.busy}
        onConfirm={() => void account.deleteAccount()}
        onCancel={account.cancelDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  top: { flexDirection: 'row' },
  header: { gap: theme.space[1] },
  rights: { marginBottom: theme.space[2] },
  actions: { gap: theme.space[3], paddingBottom: theme.space[1] },
});
