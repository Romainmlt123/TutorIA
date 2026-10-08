import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Switch } from '@/components/form/Switch';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { theme, type SettingTileId } from '@/theme';

type Common = {
  label: string;
  hint?: string;
  icon: IconName;
  tile: SettingTileId;
  divider?: boolean;
};

type Props =
  | (Common & { value: boolean; onValueChange: (value: boolean) => void; onPress?: never })
  | (Common & { onPress: () => void; value?: never; onValueChange?: never });

/** Ligne de réglage (P4) : tuile colorée, libellé, aide, interrupteur ou chevron. */
export function SettingRow(props: Props) {
  const { label, hint, icon, tile, divider = false } = props;
  const content = (
    <>
      <GradientSurface
        gradient={theme.settingTiles[tile]}
        radius={14}
        style={styles.tile}
        contentStyle={styles.center}>
        <Icon name={icon} size={20} color={theme.colors.textOnColor} strokeWidth={2} />
      </GradientSurface>
      <View style={styles.text}>
        <Text variant="body" weight="bold">
          {label}
        </Text>
        {hint ? (
          <Text variant="hint" color="textSecondary">
            {hint}
          </Text>
        ) : null}
      </View>
    </>
  );
  if (props.onPress) {
    return (
      <PressableBase
        onPress={props.onPress}
        accessibilityRole="button"
        accessibilityHint={hint}
        style={({ pressed }) => [styles.row, divider && styles.divider, pressed && styles.pressed]}>
        {content}
        <Icon name="chevron-droit" size={18} color={theme.palette.gray[500]} strokeWidth={2} />
      </PressableBase>
    );
  }
  return (
    <View style={[styles.row, divider && styles.divider]}>
      {content}
      <Switch value={props.value} onValueChange={props.onValueChange} accessibilityLabel={label} />
    </View>
  );
}

/** Groupe de réglages (P4, v2.5) : carte blanche, son titre (22 Black) dans la carte. */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.card}>
      <Text variant="h3" weight="black" accessibilityRole="header" style={styles.groupTitle}>
        {title}
      </Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[5],
  },
  divider: { borderTopWidth: 1, borderTopColor: theme.palette.blue[100] },
  pressed: { backgroundColor: theme.colors.bg },
  tile: { width: 44, height: 44 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  card: {
    paddingTop: theme.space[5],
    paddingBottom: 6,
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
    overflow: 'hidden',
  },
  groupTitle: { marginHorizontal: theme.space[5], marginBottom: 6 },
});
