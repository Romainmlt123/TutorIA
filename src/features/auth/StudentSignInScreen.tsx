import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { AuthProviderButtons, OrDivider } from '@/components/form/AuthProviderButtons';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { AuthError, authService } from '@/services/auth';
import { theme } from '@/theme';

import { AuthScreen } from './components/AuthScreen';
import { authErrorMessage } from './logic/errors';
import { getPendingLinkCode, setPendingLinkCode } from './logic/pendingLinkCode';
import { setPendingSignUp } from './logic/pendingSignUp';
import { isValidEmail, normalizeEmail } from './logic/validation';

const t = fr.studentAuth.signIn;
const errors = fr.studentAuth.errors;

/** L2 · Connexion élève plein écran (v2.7) ; le code parent se saisit à part, puis est relié ici. */
export function StudentSignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string>();
  const [busy, setBusy] = useState(false);
  // Code gardé par « J'ai un code de mon parent », relu au retour sur cet écran.
  const [code, setCode] = useState(getPendingLinkCode());
  useFocusEffect(useCallback(() => setCode(getPendingLinkCode()), []));

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
    if (code) {
      setPendingLinkCode(null);
      authService
        .redeemLinkCode(code)
        .then(() => showNotice(fr.parentLink.linked))
        .catch((error: unknown) =>
          showNotice(`${t.linkFailed} ${authErrorMessage(error, 'student')}`),
        );
    }
  };

  const removeCode = () => {
    setPendingLinkCode(null);
    setCode(null);
  };

  return (
    <AuthScreen
      tone="student"
      title={t.title}
      subtitle={t.subtitle}
      onBack={() => router.back()}
      footer={
        <>
          <PressableBase
            onPress={() => router.push('/connexion/code-parent')}
            accessibilityRole="link"
            style={styles.codeLink}>
            <Icon name="cle" size={18} color={theme.colors.primary} />
            <Text variant="lead" weight="bold" color="primary">
              {fr.studentAuth.linkCode.open}
            </Text>
          </PressableBase>
          <Text variant="lead" color="textSecondary" align="center">
            {t.noAccount}
            <TextLink
              variant="lead"
              label={t.createAccount}
              onPress={() => router.push('/inscription/eleve')}
            />
          </Text>
        </>
      }>
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
          filled
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
          filled
          onSubmitEditing={submit}
        />
        <TextLink
          variant="label"
          label={t.forgot}
          onPress={() => router.push({ pathname: '/mot-de-passe', params: { espace: 'eleve' } })}
          style={styles.forgot}
        />
        {code ? (
          <View style={styles.kept}>
            <Icon name="coche" size={18} color={theme.colors.success} />
            <Text variant="bodySm" color="textSecondary" style={styles.keptText}>
              {fr.studentAuth.linkCode.kept(code)}
            </Text>
            <TextLink variant="label" label={fr.studentAuth.linkCode.remove} onPress={removeCode} />
          </View>
        ) : null}
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
      <OrDivider label={fr.form.orContinue} />
      <AuthProviderButtons onApple={soon} onGoogle={soon} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.space[4] },
  forgot: { alignSelf: 'flex-end' },
  codeLink: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
  },
  kept: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.successSoft,
  },
  keptText: { flex: 1 },
});
