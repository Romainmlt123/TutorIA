import { StyleSheet, View } from 'react-native';

import { Logo } from '@/components/Logo';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { parseEmphasis } from '../logic/emphasis';

type Props = {
  role: 'tutor' | 'student';
  text: string;
  /** Étiquette au-dessus du texte (« Entraînement » en mode hors ligne). */
  label?: string;
  /** Appui long sur une bulle du tuteur : signaler la réponse. */
  onLongPress?: () => void;
  reported?: boolean;
};

function RichText({ text, color }: { text: string; color: 'text' | 'textOnColor' }) {
  return (
    <Text variant="body" color={color}>
      {parseEmphasis(text).map((segment, index) => (
        <Text key={index} variant="body" italic={segment.italic} color={color}>
          {segment.text}
        </Text>
      ))}
    </Text>
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
  label: { marginBottom: theme.space[1] },
  reported: { marginTop: theme.space[2] },
});
