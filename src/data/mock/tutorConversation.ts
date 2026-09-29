import type { ChatRole } from '../types';

/** Début de conversation affiché dans le tuteur écrit (02a-Tuteur-Ecrit). */
export const openingConversation: readonly { role: ChatRole | 'tip'; text: string }[] = [
  {
    role: 'tutor',
    text: 'Bien joué, tu as retiré 5 des deux côtés : on arrive à 3x = 15. Et maintenant, comment tu trouves x ?',
  },
  { role: 'student', text: 'Je fais 15 − 3, donc x = 12' },
  {
    role: 'tutor',
    text: 'Presque ! Regarde bien l’étape précédente. Dans 3x, le 3 *multiplie* x. Quelle opération défait une multiplication ?',
  },
  {
    role: 'tip',
    text: 'Pour défaire une multiplication, on divise. Pour défaire une addition, on soustrait.',
  },
];
