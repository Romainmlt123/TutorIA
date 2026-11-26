/**
 * Graine des décors d'une région : toujours la même pour une région, différente d'une région à
 * l'autre. La carte 3D (RegionWorld) et la carte pré-rendue (mapExport) en tirent les mêmes décors.
 */
export function seedOf(regionId: string): number {
  let hash = 7;
  for (const char of regionId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}
