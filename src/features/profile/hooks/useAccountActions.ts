import { useState } from 'react';

import { authErrorMessage } from '@/features/auth/logic/errors';
import { fr } from '@/i18n/fr';
import { deliverJsonFile } from '@/lib/exportFile';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { authService } from '@/services/auth';
import { avatarService } from '@/services/avatar';

/**
 * Export des données et suppression du compte de l'élève (Profil et Confidentialité, v2.16) :
 * même confirmation des deux côtés, données lues et effacées par `authService` (Supabase).
 */
export function useAccountActions() {
  const student = useStudentAccount();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportData = async () => {
    setMessage(null);
    try {
      const file = await authService.exportData();
      await deliverJsonFile(file.fileName, file.json);
      showNotice(fr.profile.exported);
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

  return {
    message,
    setMessage,
    busy,
    confirmDelete,
    askDelete: () => setConfirmDelete(true),
    cancelDelete: () => setConfirmDelete(false),
    exportData,
    deleteAccount,
  };
}
