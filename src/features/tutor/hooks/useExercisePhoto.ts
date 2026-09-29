import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { logError } from '@/lib/logger';
import { TUTOR_LIMITS } from '@/services/tutor/api-contract';

/** Photo de l'exercice, prête à l'envoi : JPEG réduit (768 px au plus) en data URL. */
export type PhotoResult =
  | { status: 'ok'; dataUrl: string }
  | { status: 'denied' }
  | { status: 'cancelled' }
  | { status: 'tooLarge' };

/** Essais successifs (côté le plus long, qualité JPEG) pour rester sous la limite d'envoi. */
const ATTEMPTS = [
  { maxSide: 768, compress: 0.55 },
  { maxSide: 512, compress: 0.45 },
] as const;

const PREFIX = 'data:image/jpeg;base64,';

async function encode(
  asset: ImagePicker.ImagePickerAsset,
  maxSide: number,
  compress: number,
): Promise<string | null> {
  const context = ImageManipulator.ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > maxSide) {
    context.resize(asset.width >= asset.height ? { width: maxSide } : { height: maxSide });
  }
  const image = await context.renderAsync();
  const saved = await image.saveAsync({
    compress,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  return saved.base64 ? `${PREFIX}${saved.base64}` : null;
}

/**
 * Ouvre l'appareil photo (caméra arrière), au moment de l'usage uniquement.
 * Si l'élève refuse la permission, l'appel vocal continue normalement.
 */
export async function takeExercisePhoto(): Promise<PhotoResult> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return { status: 'denied' };

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    cameraType: ImagePicker.CameraType.back,
    quality: 0.8,
  });
  const asset = result.canceled ? undefined : result.assets[0];
  if (!asset) return { status: 'cancelled' };

  try {
    for (const { maxSide, compress } of ATTEMPTS) {
      const dataUrl = await encode(asset, maxSide, compress);
      if (!dataUrl) return { status: 'cancelled' };
      if (dataUrl.length <= TUTOR_LIMITS.imageMaxBytes) return { status: 'ok', dataUrl };
    }
    return { status: 'tooLarge' };
  } catch (error) {
    logError('tutor.photo', error);
    return { status: 'cancelled' };
  }
}
