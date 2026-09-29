import type { Chapter } from '../types';

/** Chapitres du programme de 4e (repris de design/screens/03a-Flashcards-Choix.dc.html). */
export const chapters: readonly Chapter[] = [
  { id: 'maths-equations', subjectId: 'maths', title: 'Équations du 1er degré' },
  { id: 'maths-calcul-litteral', subjectId: 'maths', title: 'Calcul littéral' },
  { id: 'maths-pythagore', subjectId: 'maths', title: 'Théorème de Pythagore' },
  { id: 'maths-puissances', subjectId: 'maths', title: 'Puissances' },
  // Au programme plus tard dans l'année (P2 : « Pas commencé ») : pas encore de flashcards.
  { id: 'maths-proportionnalite', subjectId: 'maths', title: 'Proportionnalité' },
  { id: 'fr-participe-passe', subjectId: 'francais', title: 'Accord du participe passé' },
  { id: 'fr-figures-de-style', subjectId: 'francais', title: 'Les figures de style' },
  { id: 'fr-recit-fantastique', subjectId: 'francais', title: 'Le récit fantastique' },
  { id: 'fr-subordonnees', subjectId: 'francais', title: 'Les subordonnées' },
  { id: 'hg-revolution', subjectId: 'histoire-geo', title: 'La Révolution française' },
  { id: 'hg-empire', subjectId: 'histoire-geo', title: 'L’Empire napoléonien' },
  { id: 'hg-urbanisation', subjectId: 'histoire-geo', title: 'L’urbanisation du monde' },
  { id: 'hg-mobilites', subjectId: 'histoire-geo', title: 'Les mobilités humaines' },
  { id: 'en-preterit', subjectId: 'anglais', title: 'Le prétérit simple' },
  { id: 'en-comparatifs', subjectId: 'anglais', title: 'Les comparatifs' },
  { id: 'en-voyage', subjectId: 'anglais', title: 'Vocabulaire : le voyage' },
  { id: 'en-present-perfect', subjectId: 'anglais', title: 'Le present perfect' },
  { id: 'svt-digestion', subjectId: 'svt', title: 'La digestion' },
  { id: 'svt-reproduction', subjectId: 'svt', title: 'La reproduction humaine' },
  { id: 'svt-seismes-volcans', subjectId: 'svt', title: 'Séismes et volcans' },
  { id: 'svt-systeme-nerveux', subjectId: 'svt', title: 'Le système nerveux' },
  { id: 'pc-masse-volumique', subjectId: 'physique-chimie', title: 'La masse volumique' },
  { id: 'pc-circuits', subjectId: 'physique-chimie', title: 'Les circuits électriques' },
  { id: 'pc-atomes-molecules', subjectId: 'physique-chimie', title: 'Atomes et molécules' },
  { id: 'pc-combustion', subjectId: 'physique-chimie', title: 'La combustion' },
];
