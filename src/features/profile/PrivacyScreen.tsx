import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionCard } from '@/components/SectionCard';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

const t = fr.profile.privacy;

/** Confidentialité (depuis le profil, v2.8) : ce que voient les parents, ce qui est gardé, les droits. */
export function PrivacyScreen() {
  const router = useRouter();
  return (
    <ScreenContainer withNav={false} contentStyle={styles.content}>
      <View style={styles.top}>
        <IconButton
          icon="chevron-gauche"
          iconSize={22}
          accessibilityLabel={fr.form.back}
          onPress={() => router.back()}
        />
      </View>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title}
        </Text>
        <Text variant="lead" color="textSecondary">
          {t.lead}
        </Text>
      </View>
      <SectionCard title={t.parentsTitle}>
        <Text variant="body">{t.parentsBody}</Text>
      </SectionCard>
      <SectionCard title={t.tutorTitle}>
        <Text variant="body">{t.tutorBody}</Text>
      </SectionCard>
      <SectionCard title={t.rightsTitle}>
        <Text variant="body">{t.rightsBody}</Text>
      </SectionCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  top: { flexDirection: 'row' },
  header: { gap: theme.space[1] },
});
