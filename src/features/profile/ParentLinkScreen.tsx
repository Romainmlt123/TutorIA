import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { authErrorMessage, errorMessages } from '@/features/auth/logic/errors';
import { isValidEmail, normalizeEmail } from '@/features/auth/logic/validation';
import { fr } from '@/i18n/fr';
import { showNotice } from '@/lib/notice';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { authService } from '@/services/auth';
import { isLinkCodeFormat, normalizeLinkCode } from '@/services/auth/api-contract';
import { theme } from '@/theme';

const t = fr.parentLink;

/** Relier son compte à un parent (O5, profil) : code parent, ou e-mail pour qu'il valide le compte. */
export function ParentLinkScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const student = useStudentAccount();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const redeem = async () => {
    if (!isLinkCodeFormat(code)) return setMessage(errorMessages('student').invalid_code);
    setBusy(true);
    setMessage(null);
    try {
      await authService.redeemLinkCode(code);
      await queryClient.invalidateQueries({ queryKey: ['family'] });
      showNotice(t.linked);
      close();
    } catch (error) {
      setMessage(authErrorMessage(error, 'student'));
    } finally {
      setBusy(false);
    }
  };

  const invite = async () => {
    if (!isValidEmail(email)) return setMessage(errorMessages('student').invalid_email);
    if (student && normalizeEmail(email) === normalizeEmail(student.email)) {
      return setMessage(errorMessages('student').same_email);
    }
    setBusy(true);
    setMessage(null);
    try {
      await authService.requestParentConsent(normalizeEmail(email));
      showNotice(t.sent);
      close();
    } catch (error) {
      setMessage(authErrorMessage(error, 'student'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <View style={styles.top}>
        <IconButton icon="croix" accessibilityLabel={t.close} onPress={close} />
      </View>
      <Text variant="heading" accessibilityRole="header">
        {t.title}
      </Text>
      <FormMessage message={message} />
      <View style={styles.card}>
        <Text variant="section">{t.codeSection}</Text>
        <TextField
          label={fr.studentAuth.linkCode.label}
          value={code}
          onChangeText={(value) => setCode(normalizeLinkCode(value))}
          icon="cle"
          placeholder={fr.studentAuth.linkCode.placeholder}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={6}
          spaced
          hint={t.codeHint}
        />
        <Button label={t.codeSubmit} onPress={redeem} disabled={busy} size="lg" highlight />
      </View>
      <View style={styles.card}>
        <Text variant="section">{t.emailSection}</Text>
        <TextField
          label={fr.studentAuth.signUp.parentEmail}
          value={email}
          onChangeText={setEmail}
          icon="email"
          placeholder={fr.studentAuth.signUp.parentEmailPlaceholder}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="off"
          hint={t.emailHint}
        />
        <Button label={t.emailSubmit} onPress={invite} disabled={busy} variant="soft" size="lg" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  top: { flexDirection: 'row', justifyContent: 'flex-end' },
  card: {
    gap: theme.space[4],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
});
