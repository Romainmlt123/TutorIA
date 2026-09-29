import type { Quote } from '../types';

/** Citations du jour (01-Accueil), une par jour, en boucle. */
export const quotes: readonly Quote[] = [
  {
    text: 'L’éducation est l’arme la plus puissante pour changer le monde.',
    author: 'Nelson Mandela',
  },
  {
    text: 'Ce n’est pas parce que les choses sont difficiles que nous n’osons pas, c’est parce que nous n’osons pas qu’elles sont difficiles.',
    author: 'Sénèque',
  },
  { text: 'Rien ne sert de courir ; il faut partir à point.', author: 'Jean de La Fontaine' },
  { text: 'L’expérience est le nom que chacun donne à ses erreurs.', author: 'Oscar Wilde' },
  {
    text: 'Apprendre sans réfléchir est vain. Réfléchir sans apprendre est dangereux.',
    author: 'Confucius',
  },
  { text: 'C’est en forgeant qu’on devient forgeron.', author: 'Proverbe français' },
  { text: 'Vingt fois sur le métier remettez votre ouvrage.', author: 'Nicolas Boileau' },
];
