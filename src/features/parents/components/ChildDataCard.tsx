import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { DangerButton } from '@/components/DangerButton';
import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { LinkedChild } from '@/services/family';
import { theme } from '@/theme';

import { ChildAvatar } from './ChildSwitcher';

const t = fr.parent.data;

type Props = { child: LinkedChild; onUnlink: () => void; onDelete: () => void };

/**
 * D3 · Données d'un enfant (ChildDataCard, v2.16) : sa classe et l'accord donné (lus en base par
 * `familyService`), l'export depuis son profil, le retrait du lien, puis, à part, la suppression de
 * son compte, seulement pour le parent qui a validé le compte d'un enfant de moins de 15 ans.
 */
export function ChildDataCard({ child, onUnlink, onDelete }: Props) {
  const canDelete = child.consentGivenByMe && child.under15;
  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <ChildAvatar name={child.firstName} size={44} />
        <View style={styles.headText}>
          <Text variant="cardTitle" accessibilityRole="header">
            {t.child(child.firstName)}
          </Text>
          <View style={styles.meta}>
            {child.grade ? (
              <Text variant="caption" color="textSecondary">
                {t.grade(child.grade)}
              </Text>
            ) : null}
            {child.consentGivenByMe ? (
              <View style={styles.consent}>
                <Icon name="coche" size={12} color={theme.colors.successStrong} strokeWidth={2.5} />
                <Text variant="caption" weight="bold" color="successStrong">
                  {t.consentGiven}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>
      <Text variant="bodySm" color="textSecondary">
        {t.childBody(child.firstName)}
      </Text>
      <Button
        label={t.unlink(child.firstName)}
        variant="vividSoft"
        weight="bold"
        leadingIcon="lien-barre"
        onPress={onUnlink}
      />
      {canDelete ? (
        <View style={styles.danger}>
          <Text variant="label" weight="bold" color="errorStrong">
            {t.deleteChild(child.firstName)}
          </Text>
          <Text variant="caption" color="textSecondary">
            {t.deleteChildHint}
          </Text>
          <DangerButton label={t.deleteChild(child.firstName)} onPress={onDelete} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  headText: { flex: 1, gap: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: theme.space[2] },
  consent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 22,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.successSoft,
  },
  danger: {
    gap: theme.space[2],
    marginTop: theme.space[1],
    paddingTop: theme.space[4],
    borderTopWidth: 1,
    borderTopColor: theme.palette.blue[100],
  },
});
