import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { Pill } from '@/components/Pill';
import { ProgressBar } from '@/components/ProgressBar';
import { ProgressRing } from '@/components/ProgressRing';
import { SegmentedControl } from '@/components/SegmentedControl';
import { StreakBadge } from '@/components/StreakBadge';
import { SubjectCard } from '@/components/subject/SubjectCard';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { authService, mockAuthService } from '@/services/auth';
import type { PersonaId } from '@/services/auth/mock/MockAuthService';
import { theme, type ColorRole, type TypeVariant } from '@/theme';
import { fontWeights } from '@/theme/fonts';

const t = fr.dev;
const variants = Object.keys(theme.typeScale) as (keyof typeof theme.typeScale & TypeVariant)[];
const roles = Object.keys(theme.colors) as ColorRole[];
const shadows = Object.keys(theme.shadow) as (keyof typeof theme.shadow)[];

/** Catalogue de développement : vérifie le thème et les composants isolément (jamais en production). */
export default function Catalogue() {
  const insets = useSafeAreaInsets();
  const [segment, setSegment] = useState<'a' | 'b'>('a');
  const router = useRouter();
  if (!__DEV__) return <Redirect href="/" />;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + theme.layout.screenTopGap,
          paddingBottom: insets.bottom + theme.space[8],
        },
      ]}>
      <Text variant="h2" weight="black" accessibilityRole="header">
        {t.catalogueTitle}
      </Text>

      <PersonaSwitcher />
      <Button label={t.avatarLab} variant="soft" onPress={() => router.push('/dev/avatars')} />

      <Section title={t.components}>
        <Button label="Reprendre" icon="fleche-droite" highlight />
        <View style={styles.row2}>
          <Button label="C’est parti" variant="vivid" weight="bold" icon="fleche-droite" />
          <Button label="Réviser" variant="small" />
          <Button label="Soft" variant="soft" />
        </View>
        <Button label="Carte suivante" disabled />
        <View style={styles.row2}>
          <IconButton icon="cloche" accessibilityLabel="Notifications" badge />
          <StreakBadge days={12} />
          <Pill
            label="Plus qu’une !"
            backgroundColor={theme.colors.primarySoft}
            color={theme.colors.primary}
            size="md"
          />
          <ProgressRing value={2 / 3} label="2/3" />
        </View>
        <SegmentedControl
          accessibilityLabel="Démo"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'a', label: 'Écrit', icon: 'clavier' },
            { value: 'b', label: 'Vocal', icon: 'micro' },
          ]}
        />
        <ProgressBar
          value={0.6}
          trackColor={theme.colors.primarySoft}
          fill={theme.colors.primary}
        />
        <View style={styles.row2}>
          <SubjectCard
            mode="progress"
            subjectId="maths"
            name="Maths"
            mastery={0.72}
            onPress={() => undefined}
          />
          <SubjectCard
            mode="select"
            subjectId="physique-chimie"
            name="Physique-Chimie"
            cardCount={17}
            selected
            onPress={() => undefined}
          />
        </View>
      </Section>

      <Section title={t.typography}>
        {variants.map((variant) => (
          <View key={variant} style={styles.row}>
            <Text variant="caption" color="textSecondary">
              {variant} · {theme.typeScale[variant].fontSize}/{theme.typeScale[variant].lineHeight}
            </Text>
            <Text variant={variant}>{theme.typeScale[variant].sample}</Text>
          </View>
        ))}
      </Section>

      <Section title={t.weights}>
        {fontWeights.map((weight) => (
          <Text key={weight} variant="bodyLg" weight={weight}>
            {weight} · {t.weightSample}
          </Text>
        ))}
        <Text variant="bodyLg" italic>
          {t.italicSample}
        </Text>
      </Section>

      <Section title={t.colors}>
        <View style={styles.swatches}>
          {roles.map((role) => (
            <View key={role} style={styles.swatch}>
              <View style={[styles.swatchColor, { backgroundColor: theme.colors[role] }]} />
              <Text variant="caption">{role}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title={t.shadows}>
        <View style={styles.swatches}>
          {shadows.map((name) => (
            <View key={name} style={[styles.shadowCard, { boxShadow: theme.shadow[name] }]}>
              <Text variant="label">{name}</Text>
            </View>
          ))}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="h3" weight="black" accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    paddingHorizontal: theme.layout.screenPadding,
    gap: theme.space[8],
    width: '100%',
    maxWidth: theme.layout.webMaxWidth,
    alignSelf: 'center',
  },
  section: { gap: theme.space[3] },
  row: { gap: theme.space[1] },
  row2: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: theme.space[3] },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] },
  swatch: { width: 96, gap: theme.space[1] },
  swatchColor: {
    height: theme.space[12],
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  shadowCard: {
    width: 96,
    height: 64,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const PERSONAS: readonly { id: PersonaId; label: string }[] = [
  { id: 'lea', label: t.personas.lea },
  { id: 'claire', label: t.personas.claire },
  { id: 'hugo', label: t.personas.hugo },
];

/**
 * Changement de persona. Mode simulé : connexion immédiate. Supabase : les comptes du seed
 * (npm run db:seed) se connectent depuis l'écran de connexion ; on se déconnecte ici.
 */
function PersonaSwitcher() {
  const signOut = () => {
    authService.signOut().catch((error: unknown) => logError('dev.signOut', error));
  };
  return (
    <Section title={t.personas.title}>
      {mockAuthService ? (
        <View style={styles.row2}>
          {PERSONAS.map((persona) => (
            <Button
              key={persona.id}
              label={persona.label}
              variant="soft"
              onPress={() => mockAuthService?.signInAs(persona.id)}
            />
          ))}
        </View>
      ) : (
        <Text variant="bodySm" color="textSecondary">
          {t.personas.supabaseHint}
        </Text>
      )}
      <Button label={t.personas.signOut} variant="soft" onPress={signOut} />
    </Section>
  );
}
