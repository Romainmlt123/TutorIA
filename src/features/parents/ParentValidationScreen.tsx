import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Checkbox } from '@/components/form/Checkbox';
import { FormMessage } from '@/components/form/FormMessage';
import { PasswordRules } from '@/components/form/PasswordRules';
import { TextField } from '@/components/form/TextField';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { TextLink } from '@/components/TextLink';
import { AuthHero } from '@/features/auth/components/AuthHero';
import { authErrorMessage, errorMessages } from '@/features/auth/logic/errors';
import {
  isPasswordValid,
  normalizeFirstName,
  passwordRules,
} from '@/features/auth/logic/validation';
import { fr } from '@/i18n/fr';
import { authService } from '@/services/auth';
import { theme } from '@/theme';

import { useLinkRequestActions, useLinkRequests } from './hooks/useFamily';

const t = fr.parent.validation;
const errors = errorMessages('parent');

/**
 * Parent invité par son enfant (sans maquette) : prénom, mot de passe, conditions,
 * puis accord pour que l'enfant utilise le tuteur. C'est la preuve du consentement.
 */
export function ParentValidationScreen() {
  const router = useRouter();
  const requests = useLinkRequests();
  const { accept } = useLinkRequestActions();
  const request = requests.data?.[0] ?? null;

  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rules = passwordRules(password).map((rule) => ({
    label: fr.parent.signUp.rules[rule.id],
    ok: rule.ok,
  }));
  const openTerms = () => router.push({ pathname: '/bientot', params: { sujet: 'conditions' } });

  const submit = async () => {
    const name = normalizeFirstName(firstName);
    if (!name) return setMessage(errors.required);
    if (!isPasswordValid(password)) return setMessage(errors.weak_password);
    if (!terms || (request && !consent)) return setMessage(errors.terms_required);

    setBusy(true);
    setMessage(null);
    try {
      await authService.updatePassword(password);
      await accept.mutateAsync({ studentId: request?.studentId ?? null, firstName: name });
    } catch (error) {
      setBusy(false);
      setMessage(authErrorMessage(error, 'parent'));
    }
  };

  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <AuthHero
        tone="parent"
        kicker={fr.parent.signIn.kicker}
        title={t.title}
        subtitle={request ? t.subtitle(request.firstName) : t.subtitleNoChild}
      />
      {requests.isSuccess && !request ? <FormMessage message={t.noRequest} /> : null}
      <View style={styles.form}>
        <TextField
          label={fr.form.firstName}
          value={firstName}
          onChangeText={setFirstName}
          icon="utilisateur"
          placeholder={t.firstNamePlaceholder}
          autoComplete="given-name"
          maxLength={40}
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
        />
        <PasswordRules rules={rules} />
      </View>
      <View style={styles.checks}>
        {request ? (
          <Checkbox
            checked={consent}
            onChange={setConsent}
            tone="parent"
            accessibilityLabel={t.consent(request.firstName)}>
            {t.consent(request.firstName)}
          </Checkbox>
        ) : null}
        <Checkbox
          checked={terms}
          onChange={setTerms}
          tone="parent"
          accessibilityLabel={fr.parent.signUp.termsLabel}>
          {fr.parent.signUp.termsStart}
          <TextLink variant="bodySm" label={fr.form.terms} onPress={openTerms} />
          {fr.parent.signUp.termsMiddle}
          <TextLink variant="bodySm" label={fr.form.privacy} onPress={openTerms} />
          {fr.parent.signUp.termsEnd}
        </Checkbox>
        <Text variant="hint" color="textSecondary">
          {t.privacyNote}
        </Text>
      </View>
      <FormMessage message={message} />
      <Button
        label={request ? t.submit : t.continue}
        onPress={submit}
        disabled={busy || requests.isPending}
        tone="parent"
        size="lg"
        icon="fleche-droite"
        highlight
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  form: { gap: theme.space[4] },
  checks: { gap: 14 },
});
