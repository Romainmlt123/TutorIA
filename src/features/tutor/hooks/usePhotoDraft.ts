import { useState } from 'react';

import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';

import type { PhotoAttachment } from '../components/ChatInput';
import { takeExercisePhoto, type PhotoSource } from './useExercisePhoto';

/**
 * Photo d'exercice en attente d'envoi dans une discussion écrite (C4) : choix de la source, photo
 * réduite prête à partir, et message bienveillant si elle ne peut pas être prise. `enabled` : le
 * parent autorise la caméra, et la discussion l'accepte (pas en évaluation, pas hors ligne).
 */
export function usePhotoDraft(enabled: boolean) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [choosing, setChoosing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const choose = async (source: PhotoSource) => {
    setChoosing(false);
    setNotice(null);
    try {
      const result = await takeExercisePhoto(source);
      if (result.status === 'ok') setPhoto(result.dataUrl);
      if (result.status === 'denied') setNotice(fr.tutor.photo.denied);
      if (result.status === 'tooLarge') setNotice(fr.tutor.cameraTooLarge);
    } catch (error) {
      logError('tutor.photoDraft', error);
      setNotice(fr.tutor.errors.upstream);
    }
  };

  const attachment: PhotoAttachment | undefined = enabled
    ? {
        photo,
        notice,
        onAdd: () => setChoosing(true),
        onRemove: () => setPhoto(null),
      }
    : undefined;

  return {
    attachment,
    /** La photo à envoyer avec le message, retirée du brouillon. */
    take: (): string | undefined => {
      if (!enabled || !photo) return undefined;
      setPhoto(null);
      return photo;
    },
    dialog: { visible: choosing, onChoose: choose, onCancel: () => setChoosing(false) },
  };
}
