import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { TextField } from '@/components/form/TextField';
import { fr } from '@/i18n/fr';
import { isLinkCodeFormat, normalizeLinkCode } from '@/services/auth/api-contract';
import { theme } from '@/theme';

import { AuthScreen } from './components/AuthScreen';
import { getPendingLinkCode, setPendingLinkCode } from './logic/pendingLinkCode';

const t = fr.studentAuth.linkCode;

/**
 * « Relier mon compte à un parent » (v2.7, depuis L2) : l'élève tape le code de son parent avant
 * de se connecter ; il est gardé, puis relié juste après la connexion.
 */
export function ParentCodeEntryScreen() {
  const router = useRouter();
  const [code, setCode] = useState(getPendingLinkCode() ?? '');
  const [error, setError] = useState<string>();

  const keep = () => {
    if (!isLinkCodeFormat(code)) {
      setError(fr.studentAuth.errors.invalid_code);
      return;
    }
    setPendingLinkCode(code);
    router.back();
  };

  return (
    <AuthScreen tone="student" title={t.title} subtitle={t.subtitle} onBack={() => router.back()}>
      <View style={styles.form}>
        <TextField
          label={t.label}
          value={code}
          onChangeText={(value) => setCode(normalizeLinkCode(value))}
          icon="cle"
          placeholder={t.placeholder}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={6}
          spaced
          filled
          hint={t.hint}
          error={error}
          onSubmitEditing={keep}
        />
        <Button label={t.submit} onPress={keep} size="lg" icon="fleche-droite" highlight />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: theme.space[4] },
});
