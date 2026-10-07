import { StyleSheet, View } from 'react-native';

import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { Parchment, WoodFrame } from '@/components/game/WoodFrame';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { fr } from '@/i18n/fr';
import type { LevelOutcome } from '@/services/tutor/api-contract';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { Level } from '../../content';

const HUD = explorerArt.hud;
const T = fr.explorer.level;

type Props = {
  level: Level;
  outcome: LevelOutcome;
  firstName: string;
  /** Leçon à revoir quand le niveau n'est pas réussi (null : aucune). */
  review: Level | null;
  onContinue: () => void;
  onReview: (lesson: Level) => void;
};

function scoreLine(level: Level, outcome: LevelOutcome): string {
  if (level.type === 'lecon') return T.lessonScore(outcome.correct, outcome.total);
  return T.score(outcome.correct, outcome.total, Math.round(outcome.score * 100));
}

/**
 * X5 et X5b · bilan d'un niveau, calculé par le serveur : réussi ou à revoir, étoiles, score, XP
 * accordée, puis la suite (continuer sur la carte, ou revoir la notion).
 */
export function LevelResultPanel({
  level,
  outcome,
  firstName,
  review,
  onContinue,
  onReview,
}: Props) {
  const verdict = T.verdict[level.type][outcome.passed ? 'passed' : 'retry'];
  const title = outcome.passed ? T.passedTitle(firstName) : T.retryTitle(firstName);
  return (
    <View style={styles.backdrop}>
      <View role="dialog" aria-modal style={styles.panel}>
        <WoodFrame
          tab={T.kicker(fr.explorer.levelTypes[level.type], verdict)}
          accessibilityLabel={T.resultLabel}>
          <GameText size={26} align="center" accessibilityRole="header">
            {title}
          </GameText>
          <Parchment lines={3}>
            {outcome.passed ? T.passedBody(level.title) : T.retryBody[level.type]}
          </Parchment>
          <View accessible accessibilityLabel={T.starsLabel(outcome.stars)} style={styles.stars}>
            {[1, 2, 3].map((n) => (
              <Icon
                key={n}
                name="etoile"
                variant="fill"
                size={n === 2 ? 52 : 42}
                color={n <= outcome.stars ? HUD.gold.face[1] : HUD.wood.groove}
              />
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.score}>
              <GameText size={15} stroke={2} drop={0} align="center">
                {scoreLine(level, outcome)}
              </GameText>
            </View>
            {/* Rejouer sans nouvelle étoile ne rapporte pas d'XP : rien à annoncer. */}
            {outcome.xp > 0 ? (
              <View accessible accessibilityLabel={T.xpLabel(outcome.xp)}>
                <GradientSurface
                  gradient={HUD.gold.face}
                  angle={180}
                  radius={theme.radius.full}
                  contentStyle={styles.xp}>
                  <GameText size={16} stroke={2} drop={0}>
                    {T.xp(outcome.xp)}
                  </GameText>
                </GradientSurface>
              </View>
            ) : null}
          </View>
          {outcome.passed ? (
            <>
              {level.objectives.length > 0 ? (
                <Parchment lines={6}>{`${T.worked} : ${level.objectives.join(' ')}`}</Parchment>
              ) : null}
              {outcome.stars < 3 && level.type !== 'lecon' ? (
                <Parchment>{T.moreStars}</Parchment>
              ) : null}
            </>
          ) : review ? (
            <Parchment lines={3}>{T.toReview(review.title)}</Parchment>
          ) : null}
          <View style={styles.actions}>
            {!outcome.passed && review ? (
              <>
                <GameButton
                  tone="yellow"
                  label={T.backToMap}
                  accessibilityLabel={T.backToMap}
                  size={50}
                  onPress={onContinue}
                  style={styles.action}
                />
                <GameButton
                  tone="green"
                  label={T.review}
                  accessibilityLabel={T.review}
                  size={50}
                  onPress={() => onReview(review)}
                  style={styles.action}
                />
              </>
            ) : (
              <GameButton
                tone="green"
                label={T.continue}
                accessibilityLabel={T.continue}
                size={52}
                onPress={onContinue}
                style={styles.action}
              />
            )}
          </View>
        </WoodFrame>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'center',
    paddingHorizontal: theme.layout.screenPadding,
    backgroundColor: HUD.sheetVeil,
  },
  panel: { alignSelf: 'center', width: '100%', maxWidth: 440 },
  stars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[1],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  score: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    borderRadius: theme.radius.full,
    backgroundColor: HUD.wood.groove,
  },
  xp: {
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: theme.space[4],
    borderWidth: 2,
    borderColor: HUD.gold.depth,
    borderRadius: theme.radius.full,
  },
  actions: { flexDirection: 'row', gap: theme.space[3], marginTop: theme.space[1] },
  action: { flex: 1 },
});
