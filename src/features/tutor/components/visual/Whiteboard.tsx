import { ScrollView, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { BoardVisual } from '@/services/tutor/visuals';
import { theme } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import { MathFormula } from '../MathFormula';

/** Les formules du tableau sont plus grandes que le texte, comme écrites au feutre. */
const BOARD_SCALE = 1.3;
const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧'];
/** Largeur de la marge des notes, à droite de chaque ligne. */
const NOTE_WIDTH = 150;

type Props = {
  visual: BoardVisual;
  /** Hauteur au-delà de laquelle le tableau défile vers le bas (plus grande en plein écran). */
  maxHeight: number;
};

/**
 * 2E · tableau blanc du tuteur : un calcul ligne à ligne, l'opération de chaque passage en bleu, les
 * notes numérotées dans la marge et le résultat entouré de rouge. Une ligne n'est jamais coupée :
 * un long calcul fait défiler le tableau sur le côté, un long tableau le fait défiler vers le bas.
 */
export function Whiteboard({ visual, maxHeight }: Props) {
  let noteNumber = 0;
  return (
    <ScrollView
      style={{ maxHeight }}
      nestedScrollEnabled
      accessible
      accessibilityLabel={visual.description}>
      <ScrollView horizontal nestedScrollEnabled contentContainerStyle={styles.board}>
        <View style={styles.lines}>
          {visual.steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <View style={styles.row}>
                <MathFormula
                  tex={step.tex}
                  color={visualArt.ink}
                  scale={BOARD_SCALE}
                  wrap={false}
                />
                {step.note ? (
                  <Text variant="caption" weight="bold" style={styles.note}>
                    {`${CIRCLED[noteNumber++] ?? '•'} ${step.note}`}
                  </Text>
                ) : null}
              </View>
              {step.operation && i < visual.steps.length - 1 ? (
                <View style={styles.operation}>
                  <Text variant="caption" weight="bold" color={visualArt.boardOperation}>
                    ↓
                  </Text>
                  <MathFormula tex={step.operation} color={visualArt.boardOperation} wrap={false} />
                </View>
              ) : null}
            </View>
          ))}
          {visual.result ? (
            <View style={styles.result}>
              <MathFormula
                tex={visual.result}
                color={visualArt.boardResult}
                scale={BOARD_SCALE}
                wrap={false}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  board: { flexGrow: 1, paddingVertical: theme.space[2] },
  lines: { gap: theme.space[2] },
  step: { gap: theme.space[1] },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[4] },
  note: { width: NOTE_WIDTH },
  operation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingLeft: theme.space[3],
  },
  result: {
    alignSelf: 'flex-start',
    marginTop: theme.space[1],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius.full,
    borderWidth: 2.5,
    borderColor: visualArt.boardResult,
  },
});
