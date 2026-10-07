import type { ChatRequest } from '../api-contract';

/**
 * Réponses scriptées du tuteur simulé, dans la voix de la marque :
 * tutoiement, phrases courtes, une question pour relancer, jamais « faux ».
 */
const EQUATION_STEPS: readonly { match: RegExp; reply: string }[] = [
  {
    match: /divis|÷|\/\s*3|partag/i,
    reply: 'Exactement ! On divise les deux côtés par 3 : x = 15 ÷ 3. Ça fait combien ?',
  },
  {
    match: /(^|[^0-9])5([^0-9]|$)|cinq/i,
    reply:
      'Propre ! x = 5. Tu vérifies ? Remplace x par 5 dans 3x + 5 = 20 : tu retombes bien sur 20 ?',
  },
  {
    match: /oui|20|ça marche|vrai/i,
    reply:
      'Bien joué, l’égalité est vraie ! On passe à la suivante : résous 4x − 2 = 10. Par quoi tu commences ?',
  },
  {
    match: /ajout|\+\s*2|plus 2/i,
    reply: 'Bonne idée : on ajoute 2 des deux côtés, donc 4x = 12. Et maintenant ?',
  },
  {
    match: /(^|[^0-9])3([^0-9]|$)|trois/i,
    reply: 'Tu as chopé le truc : x = 3. On tente une équation avec des x des deux côtés ?',
  },
];

const EQUATION_HINTS: readonly string[] = [
  'Pas tout à fait, voyons ensemble où ça bloque. Dans 3x = 15, que fait le 3 à x ?',
  'On y va étape par étape. Pour isoler x, quelle opération défait la multiplication ?',
  'Presque ! Regarde bien les deux côtés de l’égalité. Qu’est-ce qu’on peut faire aux deux en même temps ?',
];

const GENERIC_REPLIES: readonly string[] = [
  'Bonne question ! Dis-m’en un peu plus : qu’est-ce que tu as déjà essayé ?',
  'On découpe ça en petites étapes. Quelle est la première chose que tu remarques ?',
  'Tu es sur la bonne voie. Tu peux me donner un exemple ?',
];

/** Réponse simulée à une photo d'exercice : l'énoncé recopié d'abord, comme le demande le prompt. */
const PHOTO_REPLY =
  'L’exercice : résoudre $3x + 5 = 20$ (photo simulée). Bien reçu ! Dis-moi où tu bloques, ou on commence par isoler $3x$ ?';

/** Choisit la réponse scriptée selon le chapitre, le message et le nombre d'échanges déjà faits. */
export function scriptedReply(request: ChatRequest): string {
  if (request.image) return PHOTO_REPLY;
  const turn = request.history.filter((t) => t.role === 'student').length;
  if (request.topic.chapterId === 'maths-equations') {
    const step = EQUATION_STEPS.find((s) => s.match.test(request.message));
    if (step) return step.reply;
    return EQUATION_HINTS[turn % EQUATION_HINTS.length] ?? EQUATION_HINTS[0]!;
  }
  return GENERIC_REPLIES[turn % GENERIC_REPLIES.length] ?? GENERIC_REPLIES[0]!;
}
