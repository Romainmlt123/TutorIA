import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { daysBetween, parisDay } from '@/lib/parisTime';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { theme } from '@/theme';

/** Accueil d'un élève de moins de 15 ans en attente : ce qui est possible et comment débloquer. */
export function ConsentBanner() {
  const router = useRouter();
  const student = useStudentAccount();
  if (student?.consentStatus !== 'pending') return null;
  const days = student.consentDeadline
    ? Math.max(0, daysBetween(parisDay(new Date()), parisDay(new Date(student.consentDeadline))))
    : 30;
  return (
    <View accessibilityRole="summary" style={styles.card}>
      <View style={styles.head}>
        <Icon name="bouclier" size={22} color={theme.palette.violet[600]} strokeWidth={2} />
        <Text variant="rowTitle" color={theme.palette.violet[600]} style={styles.title}>
          {fr.consent.bannerTitle}
        </Text>
      </View>
      <Text variant="bodySm" color={theme.palette.violet[800]}>
        {fr.consent.bannerBody(days)}
      </Text>
      <Button
        label={fr.consent.action}
        onPress={() => router.push('/relier-parent')}
        variant="soft"
        leadingIcon="lien"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[3],
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.accentSoft,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  title: { flex: 1 },
});
