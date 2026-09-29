import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerButton } from '@/components/DangerButton';
import { FormMessage } from '@/components/form/FormMessage';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { authErrorMessage } from '@/features/auth/logic/errors';
import { fr } from '@/i18n/fr';
import { deliverJsonFile } from '@/lib/exportFile';
import { showNotice } from '@/lib/notice';
import { authService } from '@/services/auth';
import { familyService, type LinkedChild } from '@/services/family';
import { theme } from '@/theme';

import { familyKeys } from './hooks/useFamily';
import { useSelectedChild } from './hooks/useSelectedChild';

const t = fr.parent.data;

type Pending =
  | { kind: 'unlink'; child: LinkedChild }
  | { kind: 'delete'; child: LinkedChild; confirmed: boolean };

/**
 * Données personnelles (RGPD) : export des données du parent, retrait d'un lien,
 * et, pour le parent qui a validé le compte d'un enfant de moins de 15 ans, suppression de ce compte.
 */
export function ParentDataScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { children } = useSelectedChild();
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportMine = async () => {
    setMessage(null);
    try {
      const file = await authService.exportData();
      await deliverJsonFile(file.fileName, file.json);
      showNotice(t.exported);
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    }
  };

  const confirm = async () => {
    if (!pending) return;
    // Suppression du compte d'un enfant : deux confirmations.
    if (pending.kind === 'delete' && !pending.confirmed) {
      setPending({ ...pending, confirmed: true });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      if (pending.kind === 'unlink') await familyService.unlink(pending.child.id);
      else await familyService.deleteChildAccount(pending.child.id);
      await queryClient.invalidateQueries({ queryKey: familyKeys.children });
      setPending(null);
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    } finally {
      setBusy(false);
    }
  };

  const dialog = pending
    ? pending.kind === 'unlink'
      ? {
          title: t.unlink(pending.child.firstName),
          body: t.unlinkBody(pending.child.firstName),
          confirm: t.confirm,
        }
      : {
          title: t.deleteChildTitle(pending.child.firstName),
          body: t.deleteChildBody(pending.child.firstName),
          confirm: pending.confirmed ? t.confirmAgain : t.confirm,
        }
    : null;

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
          {t.subtitle}
        </Text>
      </View>
      <FormMessage message={message} />
      <View style={styles.card}>
        <Text variant="section">{t.mine}</Text>
        <Button
          label={t.exportMine}
          onPress={() => void exportMine()}
          variant="soft"
          leadingIcon="telechargement"
        />
      </View>
      {children.map((child) => (
        <View key={child.id} style={styles.card}>
          <Text variant="section">{t.child(child.firstName)}</Text>
          <Text variant="bodySm" color="textSecondary">
            {t.childBody(child.firstName)}
          </Text>
          {child.consentGivenByMe ? (
            <Text variant="bodySm" weight="medium">
              {t.consentGiven(child.firstName)}
            </Text>
          ) : null}
          <Button
            label={t.unlink(child.firstName)}
            onPress={() => setPending({ kind: 'unlink', child })}
            variant="soft"
          />
          {child.consentGivenByMe && child.under15 ? (
            <DangerButton
              label={t.deleteChild(child.firstName)}
              onPress={() => setPending({ kind: 'delete', child, confirmed: false })}
            />
          ) : null}
        </View>
      ))}
      <ConfirmDialog
        visible={Boolean(dialog)}
        title={dialog?.title ?? ''}
        body={dialog?.body ?? ''}
        confirmLabel={dialog?.confirm ?? ''}
        cancelLabel={t.cancel}
        busy={busy}
        onConfirm={() => void confirm()}
        onCancel={() => setPending(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  top: { flexDirection: 'row' },
  header: { gap: 6 },
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
});
