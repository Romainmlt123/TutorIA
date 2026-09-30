/** Un niveau tous les 500 XP (Léa : 3 340 XP → niveau 7, 340 / 500). */
export const XP_PER_LEVEL = 500;

/** Niveau de l'élève et XP gagnés dans ce niveau (Accueil, Explorer). */
export function levelOf(totalXp: number): { level: number; xp: number; xpForNextLevel: number } {
  const xp = Math.max(0, Math.floor(totalXp));
  return {
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xp: xp % XP_PER_LEVEL,
    xpForNextLevel: XP_PER_LEVEL,
  };
}
