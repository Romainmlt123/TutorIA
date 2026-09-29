import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { Text } from '@/components/Text';
import { authErrorMessage } from '@/features/auth/logic/errors';
import { fr } from '@/i18n/fr';
import type { LinkRequest } from '@/services/family';
import { theme } from '@/theme';

import { useLinkRequestActions } from '../hooks/useFamily';
import { ChildAvatar } from './ChildSwitcher';

/** P1 · Demande de liaison d'un enfant : accepter valide son compte (moins de 15 ans). */
export function LinkRequestCard({ request }: { request: LinkRequest }) {
  const t = fr.parent.home.request;
  const { accept, decline } = useLinkRequestActions();
  const error = accept.error ?? decline.error;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <ChildAvatar name={request.firstName} size={44} />
        <Text variant="rowTitle" style={styles.title}>
          {t.title(request.firstName)}
        </Text>
      </View>
      <Text variant="bodySm" color="textSecondary">
        {t.body}
      </Text>
      {error ? <FormMessage message={authErrorMessage(error, 'parent')} /> : null}
      <View style={styles.actions}>
        <Button
          label={t.decline}
          onPress={() => decline.mutate(request.studentId)}
          variant="soft"
          disabled={decline.isPending || accept.isPending}
          style={styles.action}
        />
        <Button
          label={t.accept}
          onPress={() => accept.mutate({ studentId: request.studentId })}
          tone="parent"
          disabled={decline.isPending || accept.isPending}
          style={styles.action}
        />
      </View>
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
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  title: { flex: 1 },
  actions: { flexDirection: 'row', gap: theme.space[3] },
  action: { flex: 1 },
});
