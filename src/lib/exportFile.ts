import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/**
 * Remet un fichier JSON à l'utilisateur (export RGPD) : partage du système sur mobile.
 * Le fichier est écrit dans le cache de l'app, jamais dans un dossier partagé.
 */
export async function deliverJsonFile(fileName: string, json: string): Promise<void> {
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(json);
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: fileName });
}
