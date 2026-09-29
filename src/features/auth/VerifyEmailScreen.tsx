import { useLocalSearchParams, useRouter } from 'expo-router';
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
import { authService } from '@/services/auth';
import { isLinkCodeFormat, normalizeLinkCode } from '@/services/auth/api-contract';
import { theme, type SpaceTone } from '@/theme';

import { AuthTopBar } from './components/AuthTopBar';
import { authErrorMessage, errorMessages } from './logic/errors';
import { getPendingSignUp, setPendingSignUp } from './logic/pendingSignUp';
import { isValidEmail, normalizeEmail } from './logic/validation';

/**
 * Code à 6 chiffres reçu par e-mail, après E1 et L4 (sans maquette).
 * Sous 15 ans, la demande de validation part vers le parent dès que le compte est confirmé.
 */
export function VerifyEmailScreen() {
  const router = useRouter();
  const { espace } = useLocalSearchParams<{ espace?: string }>();
  const pending = getPendingSignUp();
  const tone: SpaceTone = pending?.tone ?? (espace === 'parent' ? 'parent' : 'student');
  const t = tone === 'parent' ? fr.parent.verify : fr.studentAuth.verify;

  const [email, setEmail] = useState(pending?.email ?? '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setInfo(null);
    if (!isValidEmail(email)) {
      setMessage(errorMessages(tone).invalid_email);
      return;
    }
    if (!isLinkCodeFormat(code)) {
      setMessage(errorMessages(tone).invalid_otp);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await authService.verifySignUpCode(normalizeEmail(email), code);
    } catch (error) {
      setBusy(false);
      setMessage(authErrorMessage(error, tone));
      return;
    }
    setPendingSignUp(null);
    // Compte confirmé : l'espace suivant s'ouvre. La demande au parent ne bloque pas l'élève.
    if (pending?.parentEmail) {
      authService
        .requestParentConsent(pending.parentEmail)
        .then(() => showNotice(fr.parentLink.sent))
        .catch((error: unknown) => logError('auth.consentRequest', error));
    }
  };

  const resend = async () => {
    setMessage(null);
    try {
      await authService.resendSignUpCode(normalizeEmail(email));
      setInfo(t.resent);
    } catch (error) {
      setMessage(authErrorMessage(error, tone));
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthTopBar onBack={() => router.back()} />
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
        {pending ? (
          <Text variant="lead" color="textSecondary">
            {t.subtitle(pending.email)}
          </Text>
        ) : null}
      </View>
      {pending ? null : (
        <TextField
          label={fr.form.email}
          value={email}
          onChangeText={setEmail}
          icon="email"
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      )}
      <TextField
        label={fr.form.code}
        value={code}
        onChangeText={(value) => setCode(normalizeLinkCode(value))}
        icon="cadenas"
        placeholder="000000"
        keyboardType="number-pad"
        inputMode="numeric"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={6}
        spaced
        autoFocus
        onSubmitEditing={submit}
        hint={t.spam}
      />
      <FormMessage message={message} />
      <FormMessage message={info} tone="success" />
      <Button
        label={t.submit}
        onPress={submit}
        disabled={busy}
        tone={tone}
        size="lg"
        icon="fleche-droite"
        highlight
      />
      <TextLink variant="label" label={t.resend} onPress={resend} style={styles.resend} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  header: { gap: 6 },
  resend: { alignSelf: 'center' },
});
