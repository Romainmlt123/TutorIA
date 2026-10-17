import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { BottomSheet } from '@/components/BottomSheet';
import { IconButton } from '@/components/IconButton';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import type { LinkedChild } from '@/services/family';
import { theme } from '@/theme';

import { useChildrenWeek } from '../hooks/useFamily';

type Props = {
  childList: readonly LinkedChild[];
  selected: LinkedChild;
  onSelect: (child: LinkedChild) => void;
  onAddChild: () => void;
};

export function ChildAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <GradientSurface
      gradient={[theme.palette.blue[400], theme.palette.blue[600]]}
      radius={theme.radius.full}
      style={{ width: size, height: size }}
      contentStyle={styles.center}>
      <Text variant="body" weight="black" color="textOnColor">
        {name.charAt(0).toUpperCase()}
      </Text>
    </GradientSurface>
  );
}

/** Enfant affiché (pastille de 48 px) ; ouvre le choix de l'enfant. */
export function ChildSwitcher({ childList, selected, onSelect, onAddChild }: Props) {
  const [open, setOpen] = useState(false);
  const t = fr.parent.home;
  // Temps de la semaine de chaque enfant, lu seulement quand la feuille est ouverte.
  const week = useChildrenWeek(
    childList.map((child) => child.id),
    open,
  );
  return (
    <>
      <PressableBase
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={t.switchChild(selected.firstName)}
        shadow={theme.shadow.sm}
        style={styles.pill}>
        <ChildAvatar name={selected.firstName} />
        <View>
          <Text variant="label" weight="bold">
            {selected.firstName}
          </Text>
          {selected.grade ? (
            <Text variant="caption" color="textSecondary">
              {selected.grade}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron-bas" size={18} color={theme.palette.gray[500]} strokeWidth={2} />
      </PressableBase>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <BottomSheet
          onClose={() => setOpen(false)}
          closeLabel={t.closeChooser}
          accessibilityLabel={t.chooseChild}>
          <View style={styles.sheetHead}>
            <Text variant="metric" accessibilityRole="header" style={styles.sheetTitle}>
              {t.chooseChild}
            </Text>
            <IconButton
              icon="croix"
              accessibilityLabel={t.closeChooser}
              onPress={() => setOpen(false)}
            />
          </View>
          {childList.map((child) => {
            const active = child.id === selected.id;
            const seconds = week.data?.[child.id];
            return (
              <PressableBase
                key={child.id}
                onPress={() => {
                  onSelect(child);
                  setOpen(false);
                }}
                role="radio"
                aria-checked={active}
                accessibilityLabel={child.firstName}
                style={[styles.option, active && styles.optionActive]}>
                <ChildAvatar name={child.firstName} size={44} />
                <View style={styles.optionText}>
                  <Text variant="body" weight="bold">
                    {child.firstName}
                  </Text>
                  <Text variant="caption" color="textSecondary">
                    {t.childLine(
                      child.grade,
                      seconds === undefined ? null : formatDuration(seconds / 60),
                    )}
                  </Text>
                </View>
                <View aria-hidden style={[styles.radio, active && styles.radioActive]}>
                  {active ? (
                    <Icon name="coche" size={14} color={theme.colors.textOnColor} strokeWidth={3} />
                  ) : null}
                </View>
              </PressableBase>
            );
          })}
          <PressableBase
            onPress={() => {
              setOpen(false);
              onAddChild();
            }}
            accessibilityRole="button"
            style={[styles.option, styles.addOption]}>
            <View style={styles.add}>
              <Icon name="plus" size={20} color={theme.colors.accent} strokeWidth={2.5} />
            </View>
            <View style={styles.optionText}>
              <Text variant="body" weight="bold" color="accent">
                {fr.parent.settings.addChild.label}
              </Text>
              <Text variant="caption" color="textSecondary">
                {fr.parent.settings.addChild.hint}
              </Text>
            </View>
          </PressableBase>
        </BottomSheet>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    height: theme.space[12],
    paddingLeft: 6,
    paddingRight: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
  },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  sheetHead: { flexDirection: 'row', alignItems: 'center' },
  sheetTitle: { flex: 1 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: 68,
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[3],
    borderRadius: theme.radius['2xl'],
    borderWidth: 2,
    borderColor: theme.colors.bg,
    backgroundColor: theme.colors.bg,
  },
  optionActive: {
    borderColor: theme.palette.violet[500],
    backgroundColor: theme.palette.violet[100],
  },
  optionText: { flex: 1, gap: 2 },
  radio: {
    width: 26,
    height: 26,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    borderColor: theme.palette.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: theme.palette.violet[500],
    backgroundColor: theme.palette.violet[500],
  },
  addOption: {
    borderStyle: 'dashed',
    borderColor: theme.palette.violet[200],
    backgroundColor: theme.colors.surface,
  },
  add: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
