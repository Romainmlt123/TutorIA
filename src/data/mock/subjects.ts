import type { Subject } from '../types';

/** Les 6 matières de Léa et leur maîtrise (01-Accueil, 04-Stats). */
export const subjects: readonly Subject[] = [
  { id: 'maths', name: 'Maths', mastery: 0.72 },
  { id: 'francais', name: 'Français', mastery: 0.64 },
  { id: 'histoire-geo', name: 'Histoire-Géo', mastery: 0.58 },
  { id: 'anglais', name: 'Anglais', mastery: 0.81 },
  { id: 'svt', name: 'SVT', mastery: 0.69 },
  { id: 'physique-chimie', name: 'Physique-Chimie', mastery: 0.47 },
];
