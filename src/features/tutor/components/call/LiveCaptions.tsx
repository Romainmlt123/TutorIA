import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { VoiceCaption } from '@/services/tutor';
import { extras, theme } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import { captionPieces, captionTail } from '../../logic/voiceSync';

const C = theme.voiceCall.captions;
/** En 2D et 2F, deux lignes au plus : la fin de la phrase reste visible. */
const COMPACT_MAX_CHARS = 80;

type Props = {
  caption: VoiceCaption | null;
  /** Avec un visuel (2D, 2F) : 16/22 sur deux lignes, sans « Tutor'IA » ni « Toi ». */
  compact?: boolean;
  /** Message de l'appel (photo envoyée, micro refusé…), à la place des sous-titres. */
  notice?: string;
};

/**
 * Sous-titres de l'appel (LiveCaptions, v2.6) : la phrase en cours, au fil de la transcription,
 * les nombres et les formules en gras, chaque couleur nommée dans une pastille de sa couleur.
 */
export function LiveCaptions({ caption, compact = false, notice }: Props) {
  const size = compact
    ? { fontSize: C.compactSize, lineHeight: C.compactLineHeight }
    : { fontSize: C.size, lineHeight: C.lineHeight };
  if (notice) {
    return (
      <Text
        variant="lead"
        color="textOnColor"
        accessibilityLiveRegion="polite"
        style={styles.center}>
        {notice}
      </Text>
    );
  }
  if (!caption?.text) return <View style={{ minHeight: size.lineHeight }} />;
  const text = compact ? captionTail(caption.text, COMPACT_MAX_CHARS) : caption.text;
  return (
    <View accessibilityLabel={fr.tutor.call.captionsLabel} style={styles.block}>
      {compact ? null : (
        <Text variant="caption" weight="bold" color={extras.call.speaker} style={styles.speaker}>
          {caption.speaker === 'tutor' ? fr.tutor.call.speakerTutor : fr.tutor.call.speakerStudent}
        </Text>
      )}
      <Text
        variant="body"
        weight="medium"
        color={C.spoken}
        numberOfLines={compact ? 2 : 4}
        style={[styles.center, size]}>
        {captionPieces(text).map((piece, i) =>
          piece.kind === 'color' ? (
            <Text
              key={i}
              variant="body"
              weight="bold"
              color="textOnColor"
              style={[size, styles.tone, { backgroundColor: visualArt.tones[piece.tone] }]}>
              {` ${piece.text} `}
            </Text>
          ) : (
            <Text
              key={i}
              variant="body"
              weight={piece.kind === 'number' ? 'bold' : 'medium'}
              color={C.spoken}
              style={size}>
              {piece.text}
            </Text>
          ),
        )}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', gap: theme.space[1] },
  speaker: { textTransform: 'uppercase', letterSpacing: 0.6 },
  center: { textAlign: 'center' },
  tone: { borderRadius: 6 },
});
