/**
 * Sous-ensemble de WebRTC utilisé par le vocal, commun au navigateur et à react-native-webrtc.
 */
export interface RtcTrack {
  enabled: boolean;
  stop(): void;
}

export interface RtcStream {
  getTracks(): RtcTrack[];
  getAudioTracks(): RtcTrack[];
}

export interface RtcDataChannel {
  readonly readyState: string;
  send(data: string): void;
  close(): void;
  addEventListener(type: 'open' | 'close', listener: () => void): void;
  addEventListener(type: 'message', listener: (event: { data: unknown }) => void): void;
}

export interface RtcSessionDescription {
  type: 'offer' | 'answer';
  sdp?: string;
}

export interface RtcPeer {
  readonly connectionState: string;
  createDataChannel(label: string): RtcDataChannel;
  addTrack(track: RtcTrack, stream: RtcStream): unknown;
  createOffer(): Promise<RtcSessionDescription>;
  setLocalDescription(description: RtcSessionDescription): Promise<void>;
  setRemoteDescription(description: RtcSessionDescription): Promise<void>;
  addEventListener(type: 'connectionstatechange', listener: () => void): void;
  close(): void;
}

export interface RtcAdapter {
  createPeerConnection(): RtcPeer;
  /** Déclenche la demande de permission du micro, au moment de l'usage. */
  getMicrophone(): Promise<RtcStream>;
  /** Branche la voix du tuteur sur le haut-parleur ; renvoie la fonction de nettoyage. */
  playRemoteAudio(peer: RtcPeer): () => void;
}
