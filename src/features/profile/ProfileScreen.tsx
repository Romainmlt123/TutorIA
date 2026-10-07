import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerButton } from '@/components/DangerButton';
import { FormMessage } from '@/components/form/FormMessage';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { ConsentBanner } from '@/features/access/ConsentBanner';
import { authErrorMessage } from '@/features/auth/logic/errors';
import { useAvatarLook } from '@/features/avatar/hooks/useAvatarLook';
import { fr } from '@/i18n/fr';
import { deliverJsonFile } from '@/lib/exportFile';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { authService } from '@/services/auth';
import { avatarService } from '@/services/avatar';
import { familyService } from '@/services/family';
import { theme } from '@/theme';

const t = fr.profile;

/** Profil de l'élève (sans maquette) : parents reliés, transparence, export et suppression du compte. */
export function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const student = useStudentAccount();
  const parents = useQuery({
    queryKey: ['family', 'parents'],
    queryFn: () => familyService.parents(),
  });
  const avatar = useAvatarLook();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportData = async () => {
    setMessage(null);
    try {
      const file = await authService.exportData();
      await deliverJsonFile(file.fileName, file.json);
      showNotice(t.exported);
    } catch (error) {
      setMessage(authErrorMessage(error, 'student'));
    }
  };

  const unlink = async (parentId: string) => {
    setMessage(null);
    try {
      await familyService.unlink(parentId);
      await queryClient.invalidateQueries({ queryKey: ['family', 'parents'] });
    } catch (error) {
      setMessage(authErrorMessage(error, 'student'));
    }
  };

  const deleteAccount = async () => {
    setBusy(true);
    setMessage(null);
    const accountId = student?.id;
    try {
      await authService.deleteAccount();
      // L'avatar n'est que sur l'appareil : il part avec le compte.
      if (accountId) {
        avatarService.forget(accountId).catch((error: unknown) => logError('avatar.forget', error));
      }
    } catch (error) {
      setBusy(false);
      setConfirmDelete(false);
      setMessage(authErrorMessage(error, 'student'));
    }
  };

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
      <View style={styles.identity}>
        <View style={styles.avatar}>
          <Text variant="h2" weight="black" color="textOnColor">
            {(student?.firstName ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.identityText}>
          <Text variant="heading" accessibilityRole="header">
            {student?.firstName}
          </Text>
          <Text variant="bodySm" color="textSecondary">
            {student?.grade ? t.grade(student.grade) : t.noGrade}
          </Text>
        </View>
      </View>
      <ConsentBanner />
      <FormMessage message={message} />
      <View style={styles.card}>
        <View style={styles.avatarRow}>
          <Icon name="utilisateur" size={22} color={theme.colors.primary} strokeWidth={2} />
          <View style={styles.avatarText}>
            <Text variant="section">{t.avatarTitle}</Text>
            <Text variant="bodySm" color="textSecondary">
              {t.avatarBody}
            </Text>
          </View>
        </View>
        <Button
          label={avatar.data ? t.avatarEdit : t.avatarCreate}
          onPress={() => router.push('/avatar')}
          variant="soft"
        />
      </View>
      <View style={styles.card}>
        <Text variant="section">{t.parents}</Text>
        {(parents.data ?? []).length === 0 ? (
          <Text variant="bodySm" color="textSecondary">
            {t.noParent}
          </Text>
        ) : (
          (parents.data ?? []).map((parent) => (
            <View key={parent.id} style={styles.parentRow}>
              <Icon name="famille" size={20} color={theme.colors.accent} strokeWidth={2} />
              <Text variant="body" weight="bold" style={styles.parentName}>
                {parent.firstName ?? ''}
              </Text>
              <Button
                label={t.unlinkShort}
                onPress={() => void unlink(parent.id)}
                variant="soft"
                accessibilityLabel={t.unlink(parent.firstName ?? '')}
              />
            </View>
          ))
        )}
        <Button
          label={t.linkParent}
          onPress={() => router.push('/relier-parent')}
          variant="soft"
          leadingIcon="lien"
        />
        <View style={styles.transparency}>
          <Icon name="bouclier" size={18} color={theme.colors.textSecondary} strokeWidth={2} />
          <Text variant="hint" color="textSecondary" style={styles.transparencyText}>
            {t.transparency}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Button
          label={t.export}
          onPress={() => void exportData()}
          variant="soft"
          leadingIcon="telechargement"
        />
        <Button
          label={t.signOut}
          onPress={() => {
            authService.signOut().catch((error: unknown) => logError('auth.signOut', error));
          }}
          variant="soft"
          leadingIcon="sortie"
        />
      </View>
      <DangerButton label={t.delete} onPress={() => setConfirmDelete(true)} />
      <ConfirmDialog
        visible={confirmDelete}
        title={t.deleteTitle}
        body={t.deleteBody}
        confirmLabel={t.deleteConfirm}
        cancelLabel={t.cancel}
        busy={busy}
        onConfirm={() => void deleteAccount()}
        onCancel={() => setConfirmDelete(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  top: { flexDirection: 'row' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: theme.space[4] },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: { flex: 1 },
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  avatarText: { flex: 1 },
  parentRow: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  parentName: { flex: 1 },
  transparency: { flexDirection: 'row', gap: theme.space[2], alignItems: 'flex-start' },
  transparencyText: { flex: 1 },
  actions: { gap: theme.space[3] },
});
