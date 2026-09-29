import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StepHeader } from '@/components/StepHeader';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { useOnboarding } from '../hooks/useOnboarding';
import { ONBOARDING_STEPS, stepNumber, type OnboardingStep } from '../logic/onboarding';

type Props = {
  step: OnboardingStep;
  title: string;
  subtitle: string;
  /** Au-dessus du titre (bulle du tuteur en O1). */
  intro?: ReactNode;
  children: ReactNode;
  ctaLabel?: string;
};

/** Structure commune de O1 à O4 : étape, titre, contenu, « Continuer » en bas, « Passer » en haut. */
export function OnboardingStepLayout({ step, title, subtitle, intro, children, ctaLabel }: Props) {
  const router = useRouter();
  const { goNext } = useOnboarding();
  const first = step === ONBOARDING_STEPS[0];
  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <StepHeader
        step={stepNumber(step)}
        total={ONBOARDING_STEPS.length}
        onBack={first ? undefined : () => router.back()}
        onSkip={() => goNext(step, { skip: true })}
      />
      {intro}
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {title}
        </Text>
        <Text variant="lead" color="textSecondary">
          {subtitle}
        </Text>
      </View>
      {children}
      <View style={styles.footer}>
        <Button
          label={ctaLabel ?? fr.form.continue}
          onPress={() => goNext(step)}
          size="lg"
          icon="fleche-droite"
          highlight
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: theme.space[6] },
  header: { gap: 6 },
  footer: { marginTop: 'auto' },
});
