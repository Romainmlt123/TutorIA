import type { ExpoConfig } from 'expo/config';

import designTokens from './design/tokens/tokens.json';

/*
 * Configuration Expo. Identifiants d'app : fr.tutoria.app (à confirmer avant la première publication).
 * L'icône actuelle (250 px) est provisoire : les stores exigent une source de 1024 × 1024.
 */
const EAS_PROJECT_ID = '44b79cfe-3c1f-484e-a2a3-ae3fa65c2d63';
const LOGO_ON_BLUE = './assets/logo/Logo_tutoria_fond_bleu.png';

/* Permissions demandées au moment de l'usage uniquement, avec une explication claire. */
const MICROPHONE_PERMISSION =
  "Tutor'IA utilise le micro pour que tu puisses parler au tuteur vocal.";
const CAMERA_PERMISSION =
  "Tutor'IA utilise l'appareil photo pour que tu puisses montrer ton exercice au tuteur.";

// La config Expo ne peut pas importer src/ : on lit la couleur de fond (token `gray-100`, rôle `bg`) à la source.
const backgroundColor = designTokens.color.tokens.find((t) => t.name === 'gray-100')?.value;

const config: ExpoConfig = {
  name: "Tutor'IA",
  slug: 'tutoria',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: 'tutoria',
  userInterfaceStyle: 'light',
  icon: LOGO_ON_BLUE,
  // Numéros de build gérés par EAS (eas.json : appVersionSource « remote », autoIncrement).
  ios: {
    bundleIdentifier: 'fr.tutoria.app',
    supportsTablet: true,
    infoPlist: {
      NSMicrophoneUsageDescription: MICROPHONE_PERMISSION,
      NSCameraUsageDescription: CAMERA_PERMISSION,
    },
  },
  android: {
    package: 'fr.tutoria.app',
    predictiveBackGestureEnabled: false,
    permissions: ['RECORD_AUDIO', 'MODIFY_AUDIO_SETTINGS', 'CAMERA'],
    // Collecte minimale (Google Play « Familles ») : pas d'accès au stockage ni de surimpression.
    blockedPermissions: [
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
    ],
  },
  web: {
    output: 'server',
    favicon: LOGO_ON_BLUE,
  },
  plugins: [
    'expo-router',
    ['expo-splash-screen', { backgroundColor, image: LOGO_ON_BLUE, imageWidth: 120 }],
    [
      'expo-image-picker',
      {
        cameraPermission: CAMERA_PERMISSION,
        photosPermission: false,
        microphonePermission: MICROPHONE_PERMISSION,
      },
    ],
    // Rappel de révision (O4) : seule la permission est demandée, au moment où l'élève l'active.
    'expo-notifications',
    // Vocal temps réel : module natif absent d'Expo Go, build de développement nécessaire.
    [
      '@config-plugins/react-native-webrtc',
      { microphonePermission: MICROPHONE_PERMISSION, cameraPermission: CAMERA_PERMISSION },
    ],
  ],
  // Projet EAS (builds, mises à jour) : compte romainmlt.
  owner: 'romainmlt',
  extra: {
    eas: { projectId: EAS_PROJECT_ID },
  },
  // Mises à jour du JavaScript sans nouvel APK (EAS Update). L'empreinte du code natif fixe la
  // compatibilité : un module natif ajouté change l'empreinte et impose un nouveau build.
  runtimeVersion: { policy: 'fingerprint' },
  updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
