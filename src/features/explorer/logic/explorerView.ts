import type { SubjectId } from '@/data/types';

import type { Island } from '../content';

/*
 * Vues de l'onglet Explorer : le carrousel des îles (X1), les régions d'une île (X2a) et la carte
 * d'une région (X2b). La vue courante vit dans l'adresse de l'écran (`?ile=maths&region=…`) : un
 * lien, comme celui de « Reprendre », peut donc arriver directement dans une région.
 */

export type ExplorerView =
  | { kind: 'carousel' }
  | { kind: 'regions'; subjectId: SubjectId }
  | { kind: 'region'; subjectId: SubjectId; regionId: string };

/** Paramètres d'adresse de l'écran ; `undefined` retire le paramètre. */
export type ViewParams = { ile?: string; region?: string };

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined): string | undefined =>
  (Array.isArray(value) ? value[0] : value) || undefined;

/** Vue décrite par l'adresse ; une île ou une région inconnue ramène à la vue la plus proche. */
export function viewFromParams(params: RawParams, islands: readonly Island[]): ExplorerView {
  const subjectId = first(params.ile);
  const island = islands.find((i) => i.subjectId === subjectId);
  if (!island) return { kind: 'carousel' };
  const regionId = first(params.region);
  if (regionId && island.regions.some((r) => r.id === regionId)) {
    return { kind: 'region', subjectId: island.subjectId, regionId };
  }
  return { kind: 'regions', subjectId: island.subjectId };
}

export function paramsOf(view: ExplorerView): ViewParams {
  switch (view.kind) {
    case 'carousel':
      return { ile: undefined, region: undefined };
    case 'regions':
      return { ile: view.subjectId, region: undefined };
    case 'region':
      return { ile: view.subjectId, region: view.regionId };
  }
}

/** Vue d'au-dessus (bouton « Retour ») ; null depuis le carrousel, qui est la racine. */
export function upOf(view: ExplorerView): ExplorerView | null {
  switch (view.kind) {
    case 'carousel':
      return null;
    case 'regions':
      return { kind: 'carousel' };
    case 'region':
      return { kind: 'regions', subjectId: view.subjectId };
  }
}
