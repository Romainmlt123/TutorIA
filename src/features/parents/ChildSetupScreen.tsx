import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { GradePicker } from '@/components/GradePicker';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StepHeader } from '@/components/StepHeader';
import { Text } from '@/components/Text';
import type { Grade } from '@/data/types';
import { authErrorMessage, errorMessages } from '@/features/auth/logic/errors';
import { normalizeFirstName } from '@/features/auth/logic/validation';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { useSession } from '@/lib/session/SessionProvider';
import { authService } from '@/services/auth';
import { formatLinkCode } from '@/services/auth/api-contract';
import { theme } from '@/theme';

import { ChildAvatar } from './components/ChildSwitcher';
import { ParentCodeCard } from './components/ParentCodeCard';
import { StepList } from './components/StepList';

const t = fr.parent.child;

type Created = { name: string; grade: Grade; code: string };

/**
 * L5 · Ajouter l'enfant, puis L6 · son code de connexion (6 chiffres, 24 h).
 * Étape 2 de l'inscription du parent, et « Ajouter un enfant » depuis les réglages.
 */
export function ChildSetupScreen() {
  const router = useRouter();
  const session = useSession();
  const freshSignUp = session.status === 'signedIn' && session.freshSignUp;
  const [firstName, setFirstName] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const name = normalizeFirstName(firstName);

  // L'onglet reste monté : en le quittant, le formulaire repart de zéro pour le prochain enfant.
  useFocusEffect(
    useCallback(
      () => () => {
        setCreated(null);
        setFirstName('');
        setGrade(null);
        setMessage(null);
      },
      [],
    ),
  );

  const create = async () => {
    if (!name || !grade) {
      setMessage(errorMessages('parent').required);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await authService.createLinkCode(name, grade);
      setCreated({ name, grade, code: result.code });
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    } finally {
      setBusy(false);
    }
  };

  const share = async (child: Created) => {
    const text = t.shareMessage(child.name, formatLinkCode(child.code));
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      showNotice(text);
      return;
    }
    try {
      await Share.share({ message: text });
    } catch (error) {
      logError('linkCode.share', error);
      showNotice(text);
    }
  };

  const finish = () => {
    authService.acknowledgeSignUp();
    if (router.canGoBack()) router.back();
    else router.replace('/parents');
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <StepHeader
        step={2}
        total={2}
        tone="parent"
        layout="stacked"
        onBack={freshSignUp ? undefined : () => router.back()}
      />
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
        <Text variant="lead" color="textSecondary">
          {t.subtitle}
        </Text>
      </View>
      {created ? (
        <>
          <View style={styles.profile}>
            <ChildAvatar name={created.name} size={48} />
            <View style={styles.profileText}>
              <Text variant="rowTitle">{created.name}</Text>
              <Text variant="hint" color="textSecondary">
                {t.created(created.grade)}
              </Text>
            </View>
            <Button label={t.edit} onPress={() => setCreated(null)} variant="soft" />
          </View>
          <ParentCodeCard
            childName={created.name}
            code={created.code}
            onShare={() => void share(created)}
          />
          <StepList title={t.stepsTitle(created.name)} icon="telephone" steps={t.steps} />
          <Button
            label={t.dashboard}
            onPress={finish}
            tone="parent"
            size="lg"
            icon="fleche-droite"
            highlight
          />
        </>
      ) : (
        <>
          <View accessibilityLabel={t.formLabel} style={styles.form}>
            <TextField
              label={t.firstName}
              value={firstName}
              onChangeText={setFirstName}
              icon="utilisateur"
              placeholder={t.firstNamePlaceholder}
              autoComplete="off"
              maxLength={40}
            />
            <View style={styles.grade}>
              <Text variant="label" weight="bold">
                {fr.form.grade}
              </Text>
              <GradePicker value={grade} onChange={setGrade} tone="parent" layout="grid" />
            </View>
          </View>
          <FormMessage message={message} />
          <Button
            label={t.create(name)}
            onPress={create}
            disabled={busy}
            tone="parent"
            size="lg"
            icon="fleche-droite"
            highlight
          />
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  header: { gap: 6 },
  form: { gap: theme.space[5] },
  grade: { gap: theme.space[2] },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  profileText: { flex: 1 },
});
