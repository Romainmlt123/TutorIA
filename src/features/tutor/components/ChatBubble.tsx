import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { parseMathMessage } from '../logic/mathText';
import { MathFormula } from './MathFormula';

type Props = {
  role: 'tutor' | 'student';
  text: string;
  /** Étiquette au-dessus du texte (« Entraînement » en mode hors ligne). */
  label?: string;
  /** Appui long sur une bulle du tuteur : signaler la réponse. */
  onLongPress?: () => void;
  reported?: boolean;
};

/** Texte d'un message : paragraphes, notions en italique et formules dessinées (MathJax). */
function RichText({ text, color }: { text: string; color: 'text' | 'textOnColor' }) {
  const ink = theme.colors[color];
  return (
    <View style={styles.parts}>
      {parseMathMessage(text).map((part, index) =>
        part.kind === 'display' ? (
          <MathFormula key={index} tex={part.tex} display color={ink} />
        ) : (
          <Text key={index} variant="body" color={color}>
            {part.pieces.map((piece, i) =>
              piece.kind === 'math' ? (
                <MathFormula key={i} tex={piece.tex} color={ink} />
              ) : (
                <Text key={i} variant="body" italic={piece.italic} color={color}>
                  {piece.text}
                </Text>
              ),
            )}
          </Text>
        ),
      )}
    </View>
  );
}

/** Bulle de chat façon SMS : tuteur à gauche avec son avatar, élève à droite en bleu. */
export function ChatBubble({ role, text, label, onLongPress, reported = false }: Props) {
  if (role === 'student') {
    return (
      <View style={[styles.bubble, styles.student]}>
        <RichText text={text} color="textOnColor" />
      </View>
    );
  }
  return (
    <View style={styles.tutorRow}>
      <View style={styles.avatar}>
        <Logo
          variant="onBlue"
          size={32}
          borderRadius={theme.radius.full}
          accessibilityLabel={fr.tutor.tutorName}
        />
      </View>
      <PressableBase
        onLongPress={onLongPress}
        delayLongPress={500}
        accessibilityHint={onLongPress ? fr.tutor.reportHint : undefined}
        accessibilityActions={
          onLongPress ? [{ name: 'longpress', label: fr.tutor.report }] : undefined
        }
        onAccessibilityAction={onLongPress}
        style={[styles.bubble, styles.tutor]}>
        {label ? (
          <Text variant="overline" color="accent" style={styles.label}>
            {label}
          </Text>
        ) : null}
        <RichText text={text} color="text" />
        {reported ? (
          <Text variant="caption" color="textSecondary" style={styles.reported}>
            {fr.tutor.reportDone}
          </Text>
        ) : null}
      </PressableBase>
    </View>
  );
}

const styles = StyleSheet.create({
  tutorRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.space[2],
  },
  avatar: { borderRadius: theme.radius.full, boxShadow: theme.shadow.sm },
  bubble: {
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
  },
  tutor: { maxWidth: 256, backgroundColor: theme.colors.surface, boxShadow: theme.shadow.sm },
  student: { alignSelf: 'flex-end', maxWidth: 280, backgroundColor: theme.colors.primary },
  parts: { gap: theme.space[2] },
  label: { marginBottom: theme.space[1] },
  reported: { marginTop: theme.space[2] },
});
