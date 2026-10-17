import type { ExpoConfig } from 'expo/config';

import designTokens from './design/tokens/tokens.json';

/*
 * Configuration Expo. Identifiants d'app : fr.tutoria.app (à confirmer avant la première publication).
 * L'icône actuelle (250 px) est provisoire : les stores exigent une source de 1024 × 1024.
 */
const EAS_PROJECT_ID = '44b79cfe-3c1f-484e-a2a3-ae3fa65c2d63';
const LOGO_ON_BLUE = './assets/logo/Logo_tutoria_fond_bleu.png';

/*
 * Variante « Labo » (APP_VARIANT=labo) : une deuxième copie de l'app, lancée à côté de la
 * principale dans Expo Go sans partager son stockage. Sans projet EAS, Expo Go la range sous une
 * clé anonyme tirée de son slug ; son identifiant d'app ne sert qu'aux builds.
 */
const IS_LABO = process.env.APP_VARIANT === 'labo';
const APP_ID = IS_LABO ? 'fr.tutoria.app.labo' : 'fr.tutoria.app';

/* Permissions demandées au moment de l'usage uniquement, avec une explication claire. */
const MICROPHONE_PERMISSION =
  "Tutor'IA utilise le micro pour que tu puisses parler au tuteur vocal.";
const CAMERA_PERMISSION =
  "Tutor'IA utilise l'appareil photo pour que tu puisses montrer ton exercice au tuteur.";

// La config Expo ne peut pas importer src/ : on lit la couleur de fond (token `gray-100`, rôle `bg`) à la source.
const backgroundColor = designTokens.color.tokens.find((t) => t.name === 'gray-100')?.value;

const config: ExpoConfig = {
  name: IS_LABO ? "Tutor'IA Labo" : "Tutor'IA",
  slug: IS_LABO ? 'tutoria-labo' : 'tutoria',
  version: '0.1.0',
  orientation: 'portrait',
  scheme: IS_LABO ? 'tutoria-labo' : 'tutoria',
  userInterfaceStyle: 'light',
  icon: LOGO_ON_BLUE,
  // Numéros de build gérés par EAS (eas.json : appVersionSource « remote », autoIncrement).
  ios: {
    bundleIdentifier: APP_ID,
    supportsTablet: true,
    infoPlist: {
      NSMicrophoneUsageDescription: MICROPHONE_PERMISSION,
      NSCameraUsageDescription: CAMERA_PERMISSION,
    },
  },
  android: {
    package: APP_ID,
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
  // Mises à jour du JavaScript sans nouvel APK (EAS Update). L'empreinte du code natif fixe la
  // compatibilité : un module natif ajouté change l'empreinte et impose un nouveau build.
  runtimeVersion: { policy: 'fingerprint' },
  // Projet EAS (builds, mises à jour) : équipe romainmlts-team. La variante Labo n'en a pas.
  ...(IS_LABO
    ? {}
    : {
        owner: 'romainmlts-team',
        extra: { eas: { projectId: EAS_PROJECT_ID } },
        updates: { url: `https://u.expo.dev/${EAS_PROJECT_ID}` },
      }),
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

export default config;
