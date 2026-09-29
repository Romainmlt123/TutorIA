import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { extras, theme, type Gradient } from '@/theme';

import { PlanRow } from './components/PlanRow';
import { useOnboarding } from './hooks/useOnboarding';
import { useStudyPlan } from './hooks/useStudyPlan';

const t = fr.onboarding.ready;

type TileProps = { icon: IconName; value: string; hint: string; background: Gradient | string };

function StatTile({ icon, value, hint, background }: TileProps) {
  const content = (
    <>
      <Icon name={icon} size={20} color={theme.colors.textOnColor} strokeWidth={2} />
      <Text variant="stat" color="textOnColor">
        {value}
      </Text>
      <Text variant="hint" weight="bold" color="textOnColor">
        {hint}
      </Text>
    </>
  );
  if (typeof background === 'string') {
    return (
      <View
        accessible
        accessibilityLabel={`${value} ${hint}`}
        style={[styles.tile, styles.tileContent, { backgroundColor: background }]}>
        {content}
      </View>
    );
  }
  return (
    <View accessible accessibilityLabel={`${value} ${hint}`} style={styles.tileWrap}>
      <GradientSurface
        gradient={background}
        shadow={theme.shadow.md}
        style={styles.fill}
        contentStyle={styles.tileContent}>
        {content}
      </GradientSurface>
    </View>
  );
}

/** O5 · Parcours prêt : plan qui commence par la matière la moins à l'aise. */
export function ReadyScreen() {
  const router = useRouter();
  const student = useStudentAccount();
  const { answers, complete, completing, error } = useOnboarding();
  const plan = useStudyPlan(answers);

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <GradientSurface
        gradient={theme.hero.gradient}
        shadow={theme.shadow.lg}
        contentStyle={styles.hero}>
        <View style={[styles.circle, styles.circleTop]} />
        <View style={[styles.circle, styles.circleBottom]} />
        <View style={styles.logo}>
          <Logo variant="onWhite" size={76} />
        </View>
        <Text variant="overline" color="textOnColor" style={styles.kicker}>
          {t.kicker}
        </Text>
        <Text variant="hero" color="textOnColor" align="center" accessibilityRole="header">
          {t.title(student?.firstName ?? '')}
        </Text>
        <Text
          variant="lead"
          weight="medium"
          color="textOnColor"
          align="center"
          style={styles.subtitle}>
          {t.subtitle}
        </Text>
      </GradientSurface>
      <View accessibilityLabel={t.planTitle} style={styles.plan}>
        <Text variant="section">{t.planTitle}</Text>
        {plan.steps.map((step) => (
          <PlanRow key={step.subjectId} {...step} />
        ))}
        <View style={styles.tiles}>
          <StatTile
            icon="cible"
            value={plan.daily}
            hint={plan.dailyHint}
            background={theme.subjects.francais.gradient}
          />
          <StatTile
            icon="flamme"
            value={t.dayOne}
            hint={t.dayOneHint}
            background={theme.game.streak.background}
          />
        </View>
      </View>
      <View style={styles.footer}>
        <FormMessage message={error} />
        <Button
          label={t.start}
          onPress={complete}
          disabled={completing}
          size="lg"
          icon="fleche-droite"
          highlight
        />
        <Button
          label={t.linkParent}
          onPress={() => router.push('/relier-parent')}
          variant="soft"
          size="lg"
          leadingIcon="lien"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: theme.space[6] },
  hero: {
    alignItems: 'center',
    gap: theme.space[3],
    paddingTop: theme.space[8],
    paddingBottom: 28,
    paddingHorizontal: theme.space[6],
  },
  circle: {
    position: 'absolute',
    borderRadius: theme.radius.full,
    backgroundColor: extras.heroCircle,
  },
  circleTop: { left: -30, top: -30, width: 120, height: 120 },
  circleBottom: { right: -40, bottom: -50, width: 160, height: 160 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  kicker: { opacity: 0.9 },
  subtitle: { opacity: 0.92 },
  plan: { gap: theme.space[3] },
  tiles: { flexDirection: 'row', gap: theme.space[3] },
  tileWrap: { flex: 1 },
  fill: { flex: 1 },
  tile: { flex: 1, borderRadius: theme.radius['3xl'], boxShadow: theme.shadow.md },
  tileContent: { gap: 6, padding: theme.space[4] },
  footer: { marginTop: 'auto', gap: theme.space[3] },
});
