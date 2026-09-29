import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { theme } from '@/theme';

type Props = { icon: IconName; body: string; actionLabel: string; onAction: () => void };

/** Carte d'explication (pause, compte à valider) : icône, message bienveillant, une action. */
export function AccessCard({ icon, body, actionLabel, onAction }: Props) {
  return (
    <Card padding={theme.space[6]} radius="3xl" style={styles.card}>
      <View style={styles.icon}>
        <Icon name={icon} size={32} color={theme.colors.primary} />
      </View>
      <Text variant="body" align="center">
        {body}
      </Text>
      <Button label={actionLabel} variant="soft" onPress={onAction} style={styles.button} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', gap: theme.space[4] },
  icon: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: { alignSelf: 'stretch' },
});
