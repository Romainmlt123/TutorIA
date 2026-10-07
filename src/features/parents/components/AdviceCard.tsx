import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

/**
 * P1 · Comment l'encourager : conseil et questions à poser, choisis parmi des formulations
 * rédigées à l'avance (rien n'est écrit par l'IA).
 */
export function AdviceCard({ text, questions }: { text: string; questions: readonly string[] }) {
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <GradientSurface
          gradient={theme.subjects['physique-chimie'].gradient}
          radius={theme.radius.full}
          style={styles.badge}
          contentStyle={styles.center}>
          <Icon name="ampoule" size={20} color={theme.colors.textOnColor} strokeWidth={2} />
        </GradientSurface>
        <Text
          variant="h3"
          weight="black"
          color={theme.palette.violet[600]}
          accessibilityRole="header">
          {fr.parent.home.adviceTitle}
        </Text>
      </View>
      <Text variant="lead" color={theme.palette.violet[800]}>
        {text}
      </Text>
      <View style={styles.questions}>
        <Text variant="label" weight="bold" color={theme.palette.violet[600]}>
          {fr.parent.home.questionsTitle}
        </Text>
        {questions.map((question) => (
          <View key={question} style={styles.question}>
            <Icon name="bulle-chat" size={18} color={theme.palette.violet[600]} />
            <Text variant="bodySm" color={theme.palette.violet[800]} style={styles.questionText}>
              {question}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  questions: {
    gap: theme.space[2],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
  },
  question: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[2] },
  questionText: { flex: 1 },
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.accentSoft,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  badge: { width: theme.space[10], height: theme.space[10] },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
});
