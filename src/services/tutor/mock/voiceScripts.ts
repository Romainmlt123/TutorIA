import type { TutorVisual } from '../visuals';
import { mockVisualTurn } from './visualScripts';

/** Appel simulé (Expo Go, hors ligne) : ce que dit le tuteur, tour après tour, et ses visuels. */
export const MOCK_TUTOR_LINES: readonly { text: string; visual?: TutorVisual }[] = [
  {
    text: 'Salut ! On reprend les équations ? Pour résoudre 3x + 5 = 20, que fais-tu en premier ?',
  },
  {
    text: 'Regarde le graphique : la droite rouge, c’est y = 3x + 5. Elle croise la droite bleue en x = 5.',
    visual: mockVisualTurn('graphique')?.visual,
  },
  {
    text: 'Je l’écris au tableau. On retire 5 des deux côtés, puis on divise par 3. Et voilà : x = 5.',
    visual: mockVisualTurn('tableau')?.visual,
  },
];
