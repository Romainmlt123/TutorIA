import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme, type SpaceTone } from '@/theme';

import { LegalText } from './components/LegalText';
import { ProfileChoiceCard } from './components/ProfileChoiceCard';
import { SubjectCluster } from './components/SubjectCluster';

/** L1 · Bienvenue : « Je suis élève » ou « Je suis parent », rien d'autre. */
export function WelcomeScreen() {
  const router = useRouter();
  const [choice, setChoice] = useState<SpaceTone>('student');

  const next = () => router.push(choice === 'parent' ? '/connexion/parent' : '/connexion/eleve');

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <SubjectCluster />
      <Text variant="splash" align="center" accessibilityRole="header">
        {fr.welcome.title}
      </Text>
      <View role="radiogroup" accessibilityLabel={fr.welcome.choiceLabel} style={styles.choices}>
        <Text variant="section">{fr.welcome.question}</Text>
        <ProfileChoiceCard
          tone="student"
          title={fr.welcome.student}
          selected={choice === 'student'}
          onPress={() => setChoice('student')}
        />
        <ProfileChoiceCard
          tone="parent"
          title={fr.welcome.parent}
          selected={choice === 'parent'}
          onPress={() => setChoice('parent')}
        />
      </View>
      <View style={styles.footer}>
        <Button
          label={fr.welcome.continueAs[choice]}
          onPress={next}
          tone={choice}
          size="lg"
          icon="fleche-droite"
          highlight
        />
        <LegalText
          start={fr.welcome.legalStart}
          middle={fr.welcome.legalMiddle}
          end={fr.welcome.legalEnd}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: theme.space[6] },
  choices: { gap: theme.space[3] },
  footer: { marginTop: 'auto', gap: theme.space[3] },
});
