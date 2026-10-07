import type { LevelRecord } from '@/features/explorer/logic/progression';

/**
 * Progression de l'élève connecté dans Explorer : son meilleur résultat par niveau.
 * Les résultats sont écrits par le serveur à la fin d'un niveau (server/tutor/chat.ts), jamais
 * par l'app.
 */
export interface ExplorerService {
  levelRecords(): Promise<readonly LevelRecord[]>;
}
