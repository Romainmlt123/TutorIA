import { tiles as mathsNombres } from './maths-nombres.generated';
import { context as mathsNombresContext } from './maths-nombres.context.generated';
import type { MapTiles } from './types';

export { nodeSprites } from './sprites.generated';
export type {
  DoneSegment,
  GroundSprite,
  MapContext,
  MapTile,
  MapTiles,
  NodeSprites,
} from './types';

/**
 * Cartes de région pré-rendues, par identifiant de région (module `<région>.generated.ts`) : les
 * autres régions gardent la carte 3D (RegionWorld). Chaque carte est rendue pour une disposition
 * précise (layoutHash) : logic/mapExport.test.ts refuse des tuiles périmées.
 */
export const PRERENDERED_MAPS: Readonly<Partial<Record<string, MapTiles>>> = {
  'maths-nombres': { ...mathsNombres, context: mathsNombresContext },
};
