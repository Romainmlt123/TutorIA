import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { SubjectIconBadge } from '@/components/subject/SubjectIconBadge';
import { Text } from '@/components/Text';
import type { AnswerIndex, Flashcard } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme, type SubjectId } from '@/theme';

import type { Feedback, OptionState } from '../logic/session';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

/** Couleurs des réponses : vert pour la bonne, orange pour le mauvais choix, jamais de rouge. */
const OPTION_COLORS: Record<
  OptionState,
  { bg: string; border: string; text: string; letter: string }
> = {
  idle: {
    bg: theme.colors.bg,
    border: theme.colors.bg,
    text: theme.colors.text,
    letter: theme.palette.gray[400],
  },
  correct: {
    bg: theme.colors.successSoft,
    border: theme.colors.success,
    text: theme.colors.successStrong,
    letter: theme.colors.successStrong,
  },
  wrongPick: {
    bg: theme.colors.warningSoft,
    border: theme.colors.warning,
    text: theme.colors.warningStrong,
    letter: theme.colors.warningStrong,
  },
  dimmed: {
    bg: theme.colors.bg,
    border: theme.colors.bg,
    text: theme.colors.text,
    letter: theme.palette.gray[400],
  },
};

const FEEDBACK_COLORS: Record<Feedback['tone'], { bg: string; text: string }> = {
  idle: { bg: theme.colors.bg, text: theme.colors.textSecondary },
  right: { bg: theme.colors.successSoft, text: theme.colors.successStrong },
  wrong: { bg: theme.colors.warningSoft, text: theme.colors.warningStrong },
};

type Props = {
  card: Flashcard;
  subjectId: SubjectId;
  answered: boolean;
  optionState: (option: AnswerIndex) => OptionState;
  feedback: Feedback;
  onPick: (option: AnswerIndex) => void;
};

/** Carte question : liseré de la matière, question en grand, 4 réponses en 2 × 2, retour bienveillant. */
export function QuizCard({ card, subjectId, answered, optionState, feedback, onPick }: Props) {
  const subject = subjectTheme(subjectId);
  const feedbackColors = FEEDBACK_COLORS[feedback.tone];
  const rows = [
    [0, 1],
    [2, 3],
  ] as const;

  return (
    <View style={styles.shadow} accessibilityLabel={fr.flashcards.questionLabel}>
      <View style={styles.card}>
        <GradientSurface gradient={subject.tile} angle={90} radius={0} style={styles.stripe} />
        <View style={styles.body}>
          <SubjectIconBadge subjectId={subjectId} size={48} />
          <View style={styles.question}>
            <Text variant="title" align="center" accessibilityRole="header">
              {card.question}
            </Text>
          </View>
          <View accessibilityLabel={fr.flashcards.chooseAnswer} style={styles.grid}>
            {rows.map((row) => (
              <View key={row.join()} style={styles.gridRow}>
                {row.map((option) => {
                  const state = optionState(option);
                  const colors = OPTION_COLORS[state];
                  const label = card.options[option];
                  return (
                    <PressableBase
                      key={option}
                      onPress={() => onPick(option)}
                      disabled={answered}
                      accessibilityRole="button"
                      accessibilityLabel={fr.flashcards.answerLabel(LETTERS[option], label)}
                      aria-disabled={answered}
                      aria-selected={state === 'wrongPick' || (answered && state === 'correct')}
                      style={styles.optionPress}>
                      <Animated.View
                        style={[
                          styles.option,
                          {
                            transitionProperty: ['backgroundColor', 'borderColor', 'opacity'],
                            transitionDuration: 200,
                            transitionTimingFunction: 'ease',
                          },
                          {
                            backgroundColor: colors.bg,
                            borderColor: colors.border,
                            opacity: state === 'dimmed' ? 0.45 : 1,
                          },
                        ]}>
                        <Text
                          variant="caption"
                          weight="bold"
                          color={colors.letter}
                          style={styles.letter}>
                          {LETTERS[option]}
                        </Text>
                        <Text variant="bodyLg" weight="bold" color={colors.text} align="center">
                          {label}
                        </Text>
                        {state === 'correct' ? (
                          <View style={styles.check}>
                            <Icon
                              name="coche"
                              size={14}
                              color={theme.colors.textOnColor}
                              strokeWidth={3}
                            />
                          </View>
                        ) : null}
                      </Animated.View>
                    </PressableBase>
                  );
                })}
              </View>
            ))}
          </View>
          <View
            accessibilityLiveRegion="polite"
            style={[styles.feedback, { backgroundColor: feedbackColors.bg }]}>
            <Text variant="label" color={feedbackColors.text} style={styles.feedbackText}>
              {feedback.text}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { borderRadius: theme.radius['3xl'], boxShadow: theme.shadow.lg },
  card: {
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  stripe: { height: theme.space[2] },
  body: { alignItems: 'center', gap: theme.space[4], padding: theme.space[6] },
  question: { minHeight: 64, justifyContent: 'center' },
  grid: { alignSelf: 'stretch', gap: theme.space[3] },
  gridRow: { flexDirection: 'row', gap: theme.space[3] },
  optionPress: { flex: 1, borderRadius: theme.radius['2xl'] },
  option: {
    minHeight: 88,
    padding: theme.space[3],
    borderRadius: theme.radius['2xl'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: { position: 'absolute', top: theme.space[2], left: 10 },
  check: {
    position: 'absolute',
    top: theme.space[2],
    right: theme.space[2],
    width: 22,
    height: 22,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedback: {
    alignSelf: 'stretch',
    minHeight: theme.space[12],
    justifyContent: 'center',
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
  },
  feedbackText: { flexShrink: 1 },
});
