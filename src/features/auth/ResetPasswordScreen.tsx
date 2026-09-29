import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { authService } from '@/services/auth';
import { isLinkCodeFormat, normalizeLinkCode } from '@/services/auth/api-contract';
import { theme, type SpaceTone } from '@/theme';

import { AuthTopBar } from './components/AuthTopBar';
import { authErrorMessage, errorMessages } from './logic/errors';
import { isValidEmail, normalizeEmail } from './logic/validation';

/**
 * Mot de passe oublié (sans maquette) : l'e-mail, puis le code reçu.
 * Le code ouvre une session de récupération ; le nouveau mot de passe se choisit ensuite.
 */
export function ResetPasswordScreen() {
  const router = useRouter();
  const { espace } = useLocalSearchParams<{ espace?: string }>();
  const tone: SpaceTone = espace === 'parent' ? 'parent' : 'student';
  const t = tone === 'parent' ? fr.parent.reset : fr.studentAuth.reset;

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!isValidEmail(email)) {
      setMessage(errorMessages(tone).invalid_email);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await authService.requestPasswordReset(normalizeEmail(email));
      setSentTo(normalizeEmail(email));
    } catch (error) {
      setMessage(authErrorMessage(error, tone));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!sentTo || !isLinkCodeFormat(code)) {
      setMessage(errorMessages(tone).invalid_otp);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await authService.verifyRecoveryCode(sentTo, code);
    } catch (error) {
      setBusy(false);
      setMessage(authErrorMessage(error, tone));
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthTopBar onBack={() => (sentTo ? setSentTo(null) : router.back())} />
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
        <Text variant="lead" color="textSecondary">
          {sentTo ? t.codeSubtitle(sentTo) : t.subtitle}
        </Text>
      </View>
      {sentTo ? (
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
          onSubmitEditing={verify}
        />
      ) : (
        <TextField
          label={fr.form.email}
          value={email}
          onChangeText={setEmail}
          icon="email"
          autoComplete="email"
          keyboardType="email-address"
          autoCapitalize="none"
          onSubmitEditing={send}
        />
      )}
      <FormMessage message={message} />
      <Button
        label={sentTo ? t.verify : t.send}
        onPress={sentTo ? verify : send}
        disabled={busy}
        tone={tone}
        size="lg"
        icon="fleche-droite"
        highlight
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  header: { gap: 6 },
});
