import type { RtcAdapter, RtcPeer, RtcStream } from './webrtc.types';

/** WebRTC du navigateur (version web). */
export function getRtcAdapter(): RtcAdapter | null {
  if (typeof RTCPeerConnection === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return null;
  }
  return {
    createPeerConnection: () => new RTCPeerConnection() as unknown as RtcPeer,
    getMicrophone: async () =>
      (await navigator.mediaDevices.getUserMedia({ audio: true })) as unknown as RtcStream,
    playRemoteAudio: (peer) => {
      const audio = document.createElement('audio');
      audio.autoplay = true;
      (peer as unknown as RTCPeerConnection).ontrack = (event) => {
        audio.srcObject = event.streams[0] ?? null;
      };
      return () => {
        audio.srcObject = null;
        audio.remove();
      };
    },
  };
}
