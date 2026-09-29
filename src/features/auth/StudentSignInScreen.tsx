import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { AuthError, authService } from '@/services/auth';
import { isLinkCodeFormat, normalizeLinkCode } from '@/services/auth/api-contract';
import { theme } from '@/theme';

import { AuthHero } from './components/AuthHero';
import { AuthTopBar } from './components/AuthTopBar';
import { authErrorMessage } from './logic/errors';
import { setPendingSignUp } from './logic/pendingSignUp';
import { isValidEmail, normalizeEmail } from './logic/validation';

const t = fr.studentAuth.signIn;
const errors = fr.studentAuth.errors;

/** L2 · Connexion élève, avec le code parent facultatif. */
export function StudentSignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>();
  const [codeError, setCodeError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const normalizedCode = normalizeLinkCode(code);
    const badEmail = !isValidEmail(email);
    const badCode = normalizedCode !== '' && !isLinkCodeFormat(normalizedCode);
    setEmailError(badEmail ? errors.invalid_email : undefined);
    setCodeError(badCode ? errors.invalid_code : undefined);
    setMessage(!password ? errors.invalid_credentials : null);
    if (badEmail || badCode || !password) return;

    setBusy(true);
    try {
      await authService.signIn(normalizeEmail(email), password);
    } catch (error) {
      setBusy(false);
      if (error instanceof AuthError && error.code === 'email_not_confirmed') {
        setPendingSignUp({ tone: 'student', email: normalizeEmail(email), parentEmail: null });
        authService
          .resendSignUpCode(normalizeEmail(email))
          .catch((resendError: unknown) => logError('auth.resend', resendError));
        router.push('/verification');
        return;
      }
      setMessage(authErrorMessage(error, 'student'));
      return;
    }
    // Connecté : l'espace élève s'ouvre. Le code parent est relié ensuite, sans bloquer.
    if (normalizedCode) {
      authService
        .redeemLinkCode(normalizedCode)
        .then(() => showNotice(fr.parentLink.linked))
        .catch((error: unknown) =>
          showNotice(`${t.linkFailed} ${authErrorMessage(error, 'student')}`),
        );
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthTopBar onBack={() => router.back()} />
      <AuthHero tone="student" kicker={t.kicker} title={t.title} subtitle={t.subtitle} />
      <View accessibilityLabel={t.formLabel} style={styles.form}>
        <TextField
          label={fr.form.email}
          value={email}
          onChangeText={setEmail}
          icon="utilisateur"
          placeholder={t.emailPlaceholder}
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="username"
          error={emailError}
        />
        <TextField
          label={fr.form.password}
          value={password}
          onChangeText={setPassword}
          icon="cadenas"
          secure
          placeholder={t.passwordPlaceholder}
          autoComplete="current-password"
          textContentType="password"
          onSubmitEditing={submit}
        />
        <TextLink
          variant="label"
          label={t.forgot}
          onPress={() => router.push({ pathname: '/mot-de-passe', params: { espace: 'eleve' } })}
          style={styles.forgot}
        />
        <TextField
          label={t.parentCode}
          badge={fr.form.optional}
          value={code}
          onChangeText={(value) => setCode(normalizeLinkCode(value))}
          icon="cle"
          placeholder={t.parentCodePlaceholder}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={6}
          spaced
          hint={t.parentCodeHint}
          error={codeError}
        />
        <FormMessage message={message} />
        <Button
          label={t.submit}
          onPress={submit}
          disabled={busy}
          size="lg"
          icon="fleche-droite"
          highlight
        />
      </View>
      <Text variant="lead" color="textSecondary" align="center" style={styles.footer}>
        {t.noAccount}
        <TextLink
          variant="lead"
          label={t.createAccount}
          onPress={() => router.push('/inscription/eleve')}
        />
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: theme.space[6] },
  form: { gap: theme.space[4] },
  forgot: { alignSelf: 'flex-end' },
  footer: { marginTop: 'auto' },
});
