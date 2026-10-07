import type { ChatRole, SubjectId } from '../types';

/** Discussion déjà commencée, rangée dans le volet en mode tout simulé (02a-Tuteur-Ecrit). */
export const demoConversation: {
  title: string;
  subjectId: SubjectId;
  chapterId: string;
  messages: readonly { role: ChatRole; content: string }[];
} = {
  title: 'Résoudre 3x + 5 = 20',
  subjectId: 'maths',
  chapterId: 'maths-equations',
  messages: [
    {
      role: 'tutor',
      content:
        'Bien joué, tu as retiré 5 des deux côtés : on arrive à 3x = 15. Et maintenant, comment tu trouves x ?',
    },
    { role: 'student', content: 'Je fais 15 − 3, donc x = 12' },
    {
      role: 'tutor',
      content:
        'Presque ! Regarde bien l’étape précédente. Dans 3x, le 3 *multiplie* x. Quelle opération défait une multiplication ?\nConseil : Pour défaire une multiplication, on divise. Pour défaire une addition, on soustrait.',
    },
  ],
};
