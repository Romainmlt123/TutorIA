import { screenBand } from './tokens.generated';

export type LiftTone = keyof typeof screenBand.lift.tones;

/**
 * Ombre portée d'une carte posée à cheval sur le bandeau de marque (v2.17, `shadow-lift`) : elle
 * descend sous la carte et prend sa couleur, avec un contact bleu nuit côté élève, violet côté
 * parents. Seule la première rangée sous le bandeau la prend ; les autres cartes gardent
 * `shadow.md`.
 */
export function liftShadow(tone: LiftTone, parents = false): string {
  const { contact, tones } = screenBand.lift;
  const [card, opacity] = tones[tone];
  // Une carte blanche sur le violet des parents prend la teinte violette.
  const rgb = tone === 'white' && parents ? contact.parents : card;
  const under = parents ? contact.parents : contact.student;
  return `0 18px 32px -10px rgba(${rgb}, ${opacity}), 0 4px 12px rgba(${under}, 0.16)`;
}
