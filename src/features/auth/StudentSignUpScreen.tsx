import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { AuthProviderButtons, OrDivider } from '@/components/form/AuthProviderButtons';
import { FormMessage } from '@/components/form/FormMessage';
import { PasswordRules } from '@/components/form/PasswordRules';
import { Switch } from '@/components/form/Switch';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { authService } from '@/services/auth';
import { theme } from '@/theme';

import { AuthTopBar } from './components/AuthTopBar';
import { LegalText } from './components/LegalText';
import { authErrorMessage, fieldMessage } from './logic/errors';
import { setPendingSignUp } from './logic/pendingSignUp';
import {
  hasErrors,
  normalizeEmail,
  normalizeFirstName,
  passwordRules,
  validateStudentSignUp,
  type FieldErrors,
} from './logic/validation';

const t = fr.studentAuth.signUp;

/** E1 · Crée ton compte. Sous 15 ans, l'e-mail d'un parent est demandé pour valider le compte. */
export function StudentSignUpScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [under15, setUnder15] = useState(true);
  const [parentEmail, setParentEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const soon = () => router.push({ pathname: '/bientot', params: { sujet: 'comptes' } });
  const rules = passwordRules(password).map((rule) => ({ label: t.rules[rule.id], ok: rule.ok }));

  const submit = async () => {
    const found = validateStudentSignUp({ firstName, email, password, under15, parentEmail });
    setErrors(found);
    setMessage(null);
    if (hasErrors(found)) return;

    setBusy(true);
    try {
      await authService.signUpStudent({
        firstName: normalizeFirstName(firstName),
        email: normalizeEmail(email),
        password,
        under15,
      });
      setPendingSignUp({
        tone: 'student',
        email: normalizeEmail(email),
        parentEmail: under15 ? normalizeEmail(parentEmail) : null,
      });
      router.push('/verification');
    } catch (error) {
      setMessage(authErrorMessage(error, 'student'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthTopBar onBack={() => router.back()} />
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
          error={fieldMessage(errors.firstName, 'student')}
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
          error={fieldMessage(errors.email, 'student')}
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
          error={fieldMessage(errors.password, 'student')}
        />
        <PasswordRules rules={rules} inline />
        <View style={styles.switchRow}>
          <View style={styles.switchText}>
            <Text variant="lead" weight="bold">
              {t.under15}
            </Text>
            <Text variant="hint" color="textSecondary">
              {t.under15Hint}
            </Text>
          </View>
          <Switch value={under15} onValueChange={setUnder15} accessibilityLabel={t.under15} />
        </View>
        {under15 ? (
          <TextField
            label={t.parentEmail}
            value={parentEmail}
            onChangeText={setParentEmail}
            icon="email"
            placeholder={t.parentEmailPlaceholder}
            autoComplete="off"
            keyboardType="email-address"
            autoCapitalize="none"
            error={fieldMessage(errors.parentEmail, 'student')}
          />
        ) : null}
      </View>
      <FormMessage message={message} />
      <Button
        label={t.submit}
        onPress={submit}
        disabled={busy}
        size="lg"
        icon="fleche-droite"
        highlight
      />
      <OrDivider />
      <AuthProviderButtons layout="row" onApple={soon} onGoogle={soon} />
      <LegalText start={t.legalStart} end={t.legalEnd} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  header: { gap: 6 },
  form: { gap: theme.space[4] },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.sm,
  },
  switchText: { flex: 1, gap: 2 },
});
