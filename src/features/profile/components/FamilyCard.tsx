import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { SectionCard } from '@/components/SectionCard';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { dayOfMonth, monthIndex, parisDay } from '@/lib/parisTime';
import type { LinkedParent } from '@/services/family/FamilyService';
import { theme } from '@/theme';

const T = fr.profile.family;

const linkDate = (iso: string) => {
  const day = parisDay(new Date(iso));
  return `${dayOfMonth(day)} ${fr.dates.months[monthIndex(day)]}`;
};

type Props = { parents: readonly LinkedParent[]; onLink: () => void };

/**
 * Ma famille (v2.8) : les parents reliés, la transparence sur ce qu'ils voient, et le lien vers
 * « Relier un parent ». L'élève ne retire pas un parent : c'est au parent de le faire.
 */
export function FamilyCard({ parents, onLink }: Props) {
  const names = parents
    .map((p) => p.firstName)
    .filter(Boolean)
    .join(' et ');
  return (
    <SectionCard title={T.title}>
      {parents.length === 0 ? (
        <Text variant="bodySm" color="textSecondary">
          {T.noParent}
        </Text>
      ) : (
        parents.map((parent) => (
          <View key={parent.id} style={styles.parent}>
            <GradientSurface
              gradient={theme.subjects['physique-chimie'].gradient}
              radius={theme.radius.full}
              style={styles.initial}
              contentStyle={styles.center}>
              <Text variant="body" weight="black" color="textOnColor">
                {(parent.firstName ?? '?').charAt(0).toUpperCase()}
              </Text>
            </GradientSurface>
            <View style={styles.texts}>
              <Text variant="body" weight="bold">
                {parent.firstName ?? ''}
              </Text>
              <Text variant="hint" color="textSecondary">
                {T.linkedSince(linkDate(parent.linkedAt))}
              </Text>
            </View>
          </View>
        ))
      )}
      {names ? (
        <View style={styles.transparency}>
          <Icon name="bouclier" size={18} color={theme.palette.violet[600]} strokeWidth={2} />
          <Text variant="hint" color="textSecondary" style={styles.flex}>
            {parents.length > 1 ? T.transparencyMany(names) : T.transparency(names)}{' '}
            <Text variant="hint" weight="bold">
              {T.never}
            </Text>
          </Text>
        </View>
      ) : null}
      <Button
        label={parents.length === 0 ? T.link : T.linkAnother}
        onPress={onLink}
        variant="soft"
        tone="parent"
        leadingIcon="lien"
      />
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  parent: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  initial: { width: 44, height: 44 },
  center: { alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  transparency: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: theme.space[3],
    paddingHorizontal: 14,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.bg,
  },
  flex: { flex: 1 },
});
