import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { theme, type SettingTileId } from '@/theme';

/**
 * Carte de confidentialité (PrivacyCard, v2.16) : tuile d'icône, titre, puis des lignes ou du texte.
 * Page Confidentialité de l'élève (D1) et Données personnelles du parent (D3).
 */
export function PrivacyCard({
  icon,
  tile,
  title,
  shadow = theme.shadow.md,
  children,
}: {
  icon: IconName;
  tile: SettingTileId;
  title: string;
  /** Posée à cheval sur un bandeau : `liftShadow` (D3). */
  shadow?: string;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, { boxShadow: shadow }]}>
      <View style={styles.head}>
        <GradientSurface
          gradient={theme.settingTiles[tile]}
          radius={12}
          style={styles.tile}
          contentStyle={styles.tileContent}>
          <Icon name={icon} size={20} color={theme.colors.textOnColor} strokeWidth={2} />
        </GradientSurface>
        <Text variant="metric" accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

type LineTone = 'yes' | 'never' | 'neutral';

const LINE_ICON: Record<LineTone, { color: string }> = {
  yes: { color: theme.colors.success },
  never: { color: theme.colors.primary },
  neutral: { color: theme.colors.textSecondary },
};

/**
 * Une ligne de la carte, séparée de la précédente par un filet : une icône, le texte, et
 * éventuellement une durée en pastille (bleue : gardé un temps ; verte : jamais enregistré).
 */
export function PrivacyLine({
  icon,
  tone,
  label,
  keep,
  first = false,
}: {
  icon: IconName;
  tone: LineTone;
  label: string;
  keep?: { label: string; never: boolean };
  first?: boolean;
}) {
  return (
    <View style={[styles.line, !first && styles.divided]}>
      <Icon name={icon} size={20} color={LINE_ICON[tone].color} strokeWidth={2} />
      <Text variant="bodySm" style={styles.lineText}>
        {label}
      </Text>
      {keep ? (
        <Pill
          label={keep.label}
          backgroundColor={keep.never ? theme.colors.successSoft : theme.colors.primarySoft}
          color={keep.never ? theme.colors.successStrong : theme.colors.primary}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: theme.space[2],
    paddingTop: theme.space[5],
    paddingBottom: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3], marginBottom: 6 },
  tile: { width: 40, height: 40 },
  tileContent: { alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
  line: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[2],
  },
  divided: { borderTopWidth: 1, borderTopColor: theme.palette.blue[100] },
  lineText: { flex: 1 },
});
