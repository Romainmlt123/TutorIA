import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { AuthProviderButtons, OrDivider } from '@/components/form/AuthProviderButtons';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { AuthError, authService } from '@/services/auth';
import { theme } from '@/theme';

import { AuthHero } from './components/AuthHero';
import { AuthTopBar } from './components/AuthTopBar';
import { authErrorMessage } from './logic/errors';
import { setPendingSignUp } from './logic/pendingSignUp';
import { isValidEmail, normalizeEmail } from './logic/validation';

const t = fr.parent.signIn;
const errors = fr.parent.errors;

/** L3 · Connexion parent : e-mail et mot de passe d'abord, puis Apple et Google. */
export function ParentSignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const soon = () => router.push({ pathname: '/bientot', params: { sujet: 'comptes' } });

  const submit = async () => {
    const badEmail = !isValidEmail(email);
    setEmailError(badEmail ? errors.invalid_email : undefined);
    setMessage(!password ? errors.invalid_credentials : null);
    if (badEmail || !password) return;

    setBusy(true);
    try {
      await authService.signIn(normalizeEmail(email), password);
    } catch (error) {
      setBusy(false);
      if (error instanceof AuthError && error.code === 'email_not_confirmed') {
        setPendingSignUp({ tone: 'parent', email: normalizeEmail(email), parentEmail: null });
        authService
          .resendSignUpCode(normalizeEmail(email))
          .catch((resendError: unknown) => logError('auth.resend', resendError));
        router.push('/verification');
        return;
      }
      setMessage(authErrorMessage(error, 'parent'));
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthTopBar onBack={() => router.back()} />
      <AuthHero tone="parent" kicker={t.kicker} title={t.title} subtitle={t.subtitle} />
      <View accessibilityLabel={t.formLabel} style={styles.form}>
        <TextField
          label={fr.form.email}
          value={email}
          onChangeText={setEmail}
          icon="email"
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
          onPress={() => router.push({ pathname: '/mot-de-passe', params: { espace: 'parent' } })}
          style={styles.forgot}
        />
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
      </View>
      <OrDivider />
      <AuthProviderButtons onApple={soon} onGoogle={soon} />
      <Text variant="lead" color="textSecondary" align="center" style={styles.footer}>
        {t.noAccount}
        <TextLink
          variant="lead"
          label={t.createAccount}
          onPress={() => router.push('/inscription/parent')}
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
