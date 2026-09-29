import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { PasswordRules } from '@/components/form/PasswordRules';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { useAccount } from '@/lib/session/SessionProvider';
import { authService } from '@/services/auth';
import { theme, type SpaceTone } from '@/theme';

import { authErrorMessage, errorMessages } from './logic/errors';
import { isPasswordValid, passwordRules } from './logic/validation';

/** Nouveau mot de passe, après un code de récupération (sans maquette). */
export function NewPasswordScreen() {
  const account = useAccount();
  const tone: SpaceTone = account?.role === 'parent' ? 'parent' : 'student';
  const t = tone === 'parent' ? fr.parent.reset : fr.studentAuth.reset;
  const labels = tone === 'parent' ? fr.parent.signUp.rules : fr.studentAuth.signUp.rules;

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rules = passwordRules(password).map((rule) => ({ label: labels[rule.id], ok: rule.ok }));

  const save = async () => {
    if (!isPasswordValid(password)) {
      setMessage(errorMessages(tone).weak_password);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await authService.updatePassword(password);
    } catch (error) {
      setBusy(false);
      setMessage(authErrorMessage(error, tone));
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
      </View>
      <TextField
        label={t.newPassword}
        value={password}
        onChangeText={setPassword}
        icon="cadenas"
        secure
        placeholder={t.newPasswordPlaceholder}
        autoComplete="new-password"
        textContentType="newPassword"
        autoFocus
        onSubmitEditing={save}
      />
      <PasswordRules rules={rules} inline={tone === 'student'} />
      <FormMessage message={message} />
      <Button
        label={t.save}
        onPress={save}
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
