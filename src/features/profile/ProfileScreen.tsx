import { useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerButton } from '@/components/DangerButton';
import { FormMessage } from '@/components/form/FormMessage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SettingRow, SettingsGroup } from '@/components/SettingRow';
import { Text } from '@/components/Text';
import { ConsentBanner } from '@/features/access/ConsentBanner';
import { authErrorMessage } from '@/features/auth/logic/errors';
import { useAvatarLook } from '@/features/avatar/hooks/useAvatarLook';
import { useWardrobe } from '@/features/avatar/hooks/useWardrobe';
import { requestReminderPermission } from '@/features/onboarding/logic/reminder';
import { useCaptionsPreference } from '@/features/tutor/hooks/useCaptionsPreference';
import { fr } from '@/i18n/fr';
import { deliverJsonFile } from '@/lib/exportFile';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { monthIndex, parisDay } from '@/lib/parisTime';
import { useDevicePreference } from '@/lib/useDevicePreference';
import { authService } from '@/services/auth';
import { avatarService } from '@/services/avatar';
import { familyService } from '@/services/family';
import { onboardingService } from '@/services/onboarding';
import { theme } from '@/theme';

import { FamilyCard } from './components/FamilyCard';
import { PROFILE_OVERLAP, ProfileHero } from './components/ProfileHero';
import { ProfileSummary } from './components/ProfileSummary';
import { TrophyShelf } from './components/TrophyShelf';
import { useProfileData } from './hooks/useProfileData';

const t = fr.profile;
/** Sons et vibrations : retenu sur l'appareil, sans effet pour l'instant (feuille de route). */
const SOUNDS_KEY = 'tutoria.sounds';
const onboardingKey = ['onboarding', 'answers'] as const;

/**
 * 05 · Profil de l'élève (design/screens/05-Profil.dc.html, v2.8) : bandeau avec la figurine,
 * résumé et niveau, trophées, famille, préférences, compte et données.
 */
export function ProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const data = useProfileData();
  const student = data.account;
  const parents = useQuery({
    queryKey: ['family', 'parents'],
    queryFn: () => familyService.parents(),
  });
  const avatar = useAvatarLook();
  const { fresh } = useWardrobe();
  const answers = useQuery({ queryKey: onboardingKey, queryFn: () => onboardingService.load() });
  const { captionsOn, setCaptionsOn } = useCaptionsPreference();
  const [sounds, setSounds] = useDevicePreference(SOUNDS_KEY, false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const since = student?.createdAt
    ? (fr.dates.months[monthIndex(parisDay(new Date(student.createdAt)))] ?? null)
    : null;

  const setReminder = async (on: boolean) => {
    const current = answers.data;
    if (!current) return;
    setMessage(null);
    // La permission des notifications n'est demandée qu'au moment de l'usage.
    const allowed = on ? await requestReminderPermission() : true;
    const next = { ...current, reminder: on && allowed };
    queryClient.setQueryData(onboardingKey, next);
    try {
      await onboardingService.save(next);
    } catch (error) {
      logError('profile.reminder', error);
      queryClient.setQueryData(onboardingKey, current);
      setMessage(t.preferences.saveFailed);
    }
  };

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

  const deleteAccount = async () => {
    setBusy(true);
    setMessage(null);
    const accountId = student?.id;
    try {
      await authService.deleteAccount();
      // L'avatar gardé sur l'appareil part avec le compte.
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
    <ScreenContainer
      withNav={false}
      contentStyle={styles.content}
      bandOverlap={PROFILE_OVERLAP}
      band={
        <ProfileHero
          firstName={student?.firstName ?? ''}
          grade={student?.grade ?? null}
          sinceMonth={since}
          look={avatar.data ?? null}
          lookLoading={avatar.isPending}
          news={fresh.length}
          onBack={() => router.back()}
          onAvatar={() => router.push('/avatar')}
        />
      }>
      <ProfileSummary
        streak={data.streak}
        stars={data.stars}
        weekMinutes={data.weekMinutes}
        level={data.level.level}
        xp={data.level.xp}
        max={data.level.xpForNextLevel}
      />
      <ConsentBanner />
      <FormMessage message={message} />
      <TrophyShelf {...data.shelf} />
      <FamilyCard parents={parents.data ?? []} onLink={() => router.push('/relier-parent')} />

      <SettingsGroup title={t.preferences.title}>
        <SettingRow
          label={t.preferences.reminder}
          hint={t.preferences.reminderHint}
          icon="cloche"
          tile="reminder"
          value={answers.data?.reminder ?? false}
          onValueChange={(on) => void setReminder(on)}
        />
        <SettingRow
          label={t.preferences.captions}
          hint={t.preferences.captionsHint}
          icon="sous-titres"
          tile="captions"
          divider
          value={captionsOn}
          onValueChange={setCaptionsOn}
        />
        <SettingRow
          label={t.preferences.sounds}
          hint={t.preferences.soundsHint}
          icon="haut-parleur"
          tile="sounds"
          divider
          value={sounds}
          onValueChange={setSounds}
        />
      </SettingsGroup>

      <SettingsGroup title={t.account.title}>
        <SettingRow
          label={t.export}
          hint={t.account.exportHint}
          icon="telechargement"
          tile="download"
          onPress={() => void exportData()}
        />
        <SettingRow
          label={t.account.privacy}
          hint={t.account.privacyHint}
          icon="bouclier"
          tile="privacy"
          divider
          onPress={() => router.push('/confidentialite')}
        />
      </SettingsGroup>

      <View style={styles.actions}>
        <Button
          label={t.signOut}
          onPress={() => {
            authService.signOut().catch((error: unknown) => logError('auth.signOut', error));
          }}
          variant="soft"
          leadingIcon="sortie"
        />
        <DangerButton label={t.delete} onPress={() => setConfirmDelete(true)} />
      </View>
      <Text variant="caption" color="textDisabled" align="center">
        {t.version(Constants.expoConfig?.version ?? '')}
      </Text>
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
  content: { gap: theme.space[4] },
  actions: { gap: theme.space[3] },
});
