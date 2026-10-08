import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DangerButton } from '@/components/DangerButton';
import { FormMessage } from '@/components/form/FormMessage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { authErrorMessage } from '@/features/auth/logic/errors';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import { logError } from '@/lib/logger';
import { authService } from '@/services/auth';
import type { ParentalSettings } from '@/services/parents';
import { theme } from '@/theme';

import { ParentBand } from './components/ParentBand';
import { ChildProfileCard } from './components/ChildProfileCard';
import { GoalStepper } from './components/GoalStepper';
import { SettingRow, SettingsGroup } from '@/components/SettingRow';
import { useParentalSettings, useParentNotifications } from './hooks/useParentData';
import { useSelectedChild } from './hooks/useSelectedChild';

const t = fr.parent.settings;

/** Heures au format de la maquette : « 17:00 » → « 17 h ». */
const hourLabel = (time: string) => {
  const [hours = '0', minutes = '00'] = time.split(':');
  return minutes === '00' ? `${Number(hours)} h` : `${Number(hours)} h ${minutes}`;
};

/** P4 · Réglages : enregistrés en base et appliqués côté élève dès cette étape. */
export function ParentSettingsScreen() {
  const router = useRouter();
  const { child } = useSelectedChild();
  const { query: settings, update } = useParentalSettings(child?.id ?? null);
  const { query: notifications, update: updateNotifications } = useParentNotifications();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const s = settings.data;
  const n = notifications.data;
  const set = (patch: Partial<ParentalSettings>) => update.mutate(patch);
  const saveFailed = update.isError || updateNotifications.isError;

  const deleteAccount = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await authService.deleteAccount();
    } catch (error) {
      setDeleting(false);
      setDeleteError(authErrorMessage(error, 'parent'));
    }
  };

  return (
    <ScreenContainer
      contentStyle={styles.content}
      band={<ParentBand title={t.title} intro={t.subtitle} />}>
      {child ? <ChildProfileCard name={child.firstName} line={t.childLine(child.grade)} /> : null}
      {child && s ? (
        <>
          <GoalStepper
            hours={s.weeklyGoalHours}
            childName={child.firstName}
            onChange={(weeklyGoalHours) => set({ weeklyGoalHours })}
          />
          {saveFailed ? <FormMessage message={t.saveFailed} /> : null}
          <SettingsGroup title={t.sections.screenTime}>
            <SettingRow
              label={t.limit.label}
              hint={
                s.dailyLimitEnabled
                  ? t.limit.on(
                      formatDuration(s.dailyLimitMinutes),
                      hourLabel(s.allowedFrom),
                      hourLabel(s.allowedUntil),
                    )
                  : t.limit.off
              }
              icon="horloge"
              tile="screenTime"
              value={s.dailyLimitEnabled}
              onValueChange={(dailyLimitEnabled) => set({ dailyLimitEnabled })}
            />
            <SettingRow
              label={t.evening.label}
              hint={t.evening.hint}
              icon="lune"
              tile="night"
              divider
              value={s.eveningPause}
              onValueChange={(eveningPause) => set({ eveningPause })}
            />
          </SettingsGroup>
          <SettingsGroup title={t.sections.features}>
            <SettingRow
              label={t.voice.label}
              hint={t.voice.hint}
              icon="micro"
              tile="voice"
              value={s.voiceEnabled}
              onValueChange={(voiceEnabled) => set({ voiceEnabled })}
            />
            <SettingRow
              label={t.camera.label}
              hint={t.camera.hint}
              icon="camera"
              tile="camera"
              divider
              value={s.cameraEnabled}
              onValueChange={(cameraEnabled) => set({ cameraEnabled })}
            />
            <SettingRow
              label={t.visuals.label}
              hint={t.visuals.hint}
              icon="graphique"
              tile="visuals"
              divider
              value={s.visualsEnabled}
              onValueChange={(visualsEnabled) => set({ visualsEnabled })}
            />
          </SettingsGroup>
        </>
      ) : null}
      {n ? (
        <SettingsGroup title={t.sections.notifications}>
          <SettingRow
            label={t.weekly.label}
            hint={t.weekly.hint}
            icon="email"
            tile="email"
            value={n.weeklyReport}
            onValueChange={(weeklyReport) => updateNotifications.mutate({ weeklyReport })}
          />
          <SettingRow
            label={t.alerts.label}
            hint={t.alerts.hint}
            icon="cloche"
            tile="alerts"
            divider
            value={n.alerts}
            onValueChange={(alerts) => updateNotifications.mutate({ alerts })}
          />
        </SettingsGroup>
      ) : null}
      <SettingsGroup title={t.sections.account}>
        <SettingRow
          label={t.subscription.label}
          hint={t.subscription.hint}
          icon="etoile"
          tile="screenTime"
          onPress={() => router.push({ pathname: '/bientot', params: { sujet: 'abonnement' } })}
        />
        <SettingRow
          label={t.data.label}
          hint={child ? t.data.hint(child.firstName) : t.data.hintNoChild}
          icon="bouclier"
          tile="voice"
          divider
          onPress={() => router.push('/parents/donnees')}
        />
        <SettingRow
          label={t.addChild.label}
          hint={t.addChild.hint}
          icon="plus"
          tile="email"
          divider
          onPress={() => router.push('/parents/enfant')}
        />
        <SettingRow
          label={t.signOut}
          icon="sortie"
          tile="night"
          divider
          onPress={() => {
            authService.signOut().catch((error: unknown) => logError('auth.signOut', error));
          }}
        />
      </SettingsGroup>
      <FormMessage message={deleteError} />
      <DangerButton label={t.deleteAccount} onPress={() => setConfirmDelete(true)} />
      <ConfirmDialog
        visible={confirmDelete}
        title={t.deleteTitle}
        body={t.deleteBody}
        confirmLabel={t.deleteConfirm}
        cancelLabel={t.cancel}
        busy={deleting}
        onConfirm={() => void deleteAccount()}
        onCancel={() => setConfirmDelete(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
});
