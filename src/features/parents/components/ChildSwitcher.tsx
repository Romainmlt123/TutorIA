import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { LinkedChild } from '@/services/family';
import { extras, theme } from '@/theme';

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
        <PressableBase
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel={t.closeChooser}
          style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text variant="section">{t.chooseChild}</Text>
            {childList.map((child) => (
              <PressableBase
                key={child.id}
                onPress={() => {
                  onSelect(child);
                  setOpen(false);
                }}
                role="radio"
                aria-checked={child.id === selected.id}
                accessibilityLabel={child.firstName}
                style={styles.option}>
                <ChildAvatar name={child.firstName} />
                <Text variant="body" weight="bold" style={styles.optionName}>
                  {child.firstName}
                </Text>
                {child.id === selected.id ? (
                  <Icon name="coche" size={18} color={theme.colors.primary} strokeWidth={2.5} />
                ) : null}
              </PressableBase>
            ))}
            <PressableBase
              onPress={() => {
                setOpen(false);
                onAddChild();
              }}
              accessibilityRole="button"
              style={styles.option}>
              <View style={styles.add}>
                <Icon name="plus" size={18} color={theme.colors.accent} strokeWidth={2.5} />
              </View>
              <Text variant="body" weight="bold" color="accent">
                {fr.parent.settings.addChild.label}
              </Text>
            </PressableBase>
          </View>
        </PressableBase>
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
  backdrop: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 120,
    paddingHorizontal: theme.layout.screenPadding,
    backgroundColor: extras.backdrop,
  },
  sheet: {
    gap: theme.space[2],
    padding: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: theme.space[12],
    borderRadius: theme.radius['2xl'],
  },
  optionName: { flex: 1 },
  add: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
