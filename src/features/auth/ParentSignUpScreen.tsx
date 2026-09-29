import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Checkbox } from '@/components/form/Checkbox';
import { FormMessage } from '@/components/form/FormMessage';
import { PasswordRules } from '@/components/form/PasswordRules';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StepHeader } from '@/components/StepHeader';
import { Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { fr } from '@/i18n/fr';
import { authService } from '@/services/auth';
import { theme } from '@/theme';

import { authErrorMessage, fieldMessage } from './logic/errors';
import { setPendingSignUp } from './logic/pendingSignUp';
import {
  hasErrors,
  normalizeEmail,
  normalizeFirstName,
  passwordRules,
  validateParentSignUp,
  type FieldErrors,
} from './logic/validation';

const t = fr.parent.signUp;

/** L4 · Inscription parent, étape 1 : le compte. L'étape 2 (L5) ajoute l'enfant. */
export function ParentSignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rules = passwordRules(password).map((rule) => ({ label: t.rules[rule.id], ok: rule.ok }));
  const openTerms = () => router.push({ pathname: '/bientot', params: { sujet: 'conditions' } });

  const submit = async () => {
    const found = validateParentSignUp({ firstName, email, password, termsAccepted });
    setErrors(found);
    setMessage(found.terms ? (fieldMessage(found.terms, 'parent') ?? null) : null);
    if (hasErrors(found)) return;

    setBusy(true);
    try {
      await authService.signUpParent({
        firstName: normalizeFirstName(firstName),
        email: normalizeEmail(email),
        password,
        weeklyReport,
      });
      setPendingSignUp({ tone: 'parent', email: normalizeEmail(email), parentEmail: null });
      router.push('/verification');
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <StepHeader step={1} total={2} tone="parent" layout="stacked" onBack={() => router.back()} />
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
        <Text variant="lead" color="textSecondary">
          {t.subtitle}
        </Text>
      </View>
      <View accessibilityLabel={t.formLabel} style={styles.form}>
        <TextField
          label={fr.form.firstName}
          value={firstName}
          onChangeText={setFirstName}
          icon="utilisateur"
          placeholder={t.firstNamePlaceholder}
          autoComplete="given-name"
          textContentType="givenName"
          maxLength={40}
          error={fieldMessage(errors.firstName, 'parent')}
        />
        <TextField
          label={fr.form.email}
          value={email}
          onChangeText={setEmail}
          icon="email"
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
          error={fieldMessage(errors.email, 'parent')}
        />
        <TextField
          label={fr.form.password}
          value={password}
          onChangeText={setPassword}
          icon="cadenas"
          secure
          placeholder={t.passwordPlaceholder}
          autoComplete="new-password"
          textContentType="newPassword"
          error={fieldMessage(errors.password, 'parent')}
        />
        <PasswordRules rules={rules} />
      </View>
      <View style={styles.checks}>
        <Checkbox
          checked={termsAccepted}
          onChange={setTermsAccepted}
          tone="parent"
          accessibilityLabel={t.termsLabel}>
          {t.termsStart}
          <TextLink variant="bodySm" label={fr.form.terms} onPress={openTerms} />
          {t.termsMiddle}
          <TextLink variant="bodySm" label={fr.form.privacy} onPress={openTerms} />
          {t.termsEnd}
        </Checkbox>
        <Checkbox
          checked={weeklyReport}
          onChange={setWeeklyReport}
          tone="parent"
          accessibilityLabel={t.weekly}>
          {t.weekly}
        </Checkbox>
      </View>
      <View style={styles.footer}>
        <FormMessage message={message} />
        <Button
          label={t.submit}
          onPress={submit}
          disabled={busy}
          tone="parent"
          size="lg"
          icon="fleche-droite"
          highlight
        />
        <Text variant="lead" color="textSecondary" align="center">
          {t.hasAccount}
          <TextLink
            variant="lead"
            label={t.signIn}
            onPress={() => router.replace('/connexion/parent')}
          />
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: theme.space[6] },
  header: { gap: 6 },
  form: { gap: theme.space[4] },
  checks: { gap: 14 },
  footer: { marginTop: 'auto', gap: theme.space[3] },
});
