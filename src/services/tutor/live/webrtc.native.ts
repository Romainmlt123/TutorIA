import { NativeModules } from 'react-native';

import type { RtcAdapter, RtcPeer, RtcStream } from './webrtc.types';

/**
 * WebRTC natif (react-native-webrtc). Absent d'Expo Go : le vocal en direct demande
 * un build de développement (`eas build --profile development`). On renvoie alors `null`.
 */
export function getRtcAdapter(): RtcAdapter | null {
  if (!NativeModules.WebRTCModule) return null;
  // Chargement paresseux : un import statique ferait planter Expo Go, où le module natif manque.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const webrtc = require('react-native-webrtc') as typeof import('react-native-webrtc');
  return {
    createPeerConnection: () => new webrtc.RTCPeerConnection({}) as unknown as RtcPeer,
    getMicrophone: async () =>
      (await webrtc.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })) as unknown as RtcStream,
    // La piste audio distante est jouée automatiquement par react-native-webrtc.
    playRemoteAudio: () => () => undefined,
  };
}
