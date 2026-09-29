import { Modal, StyleSheet, View } from 'react-native';

import { extras, theme } from '@/theme';

import { Button } from './Button';
import { PressableBase } from './PressableBase';
import { Text } from './Text';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

/**
 * Confirmation d'une action définitive (suppression de compte). Remplace `Alert.alert`,
 * sans effet sur le web.
 */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <PressableBase
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={cancelLabel}
          style={StyleSheet.absoluteFill}
        />
        <View role="alertdialog" accessibilityLabel={title} style={styles.dialog}>
          <Text variant="section" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="lead" color="textSecondary">
            {body}
          </Text>
          <PressableBase
            onPress={onConfirm}
            disabled={busy}
            accessibilityRole="button"
            aria-disabled={busy}
            style={({ pressed }) => [
              styles.danger,
              pressed && styles.dangerPressed,
              busy && styles.busy,
            ]}>
            <Text variant="label" weight="bold" color={theme.palette.red[600]}>
              {confirmLabel}
            </Text>
          </PressableBase>
          <Button label={cancelLabel} onPress={onCancel} variant="soft" />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.layout.screenPadding,
    backgroundColor: extras.backdrop,
  },
  dialog: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    gap: theme.space[3],
    padding: theme.space[6],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.lg,
  },
  danger: {
    height: theme.space[12],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.palette.red[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.space[2],
  },
  dangerPressed: { backgroundColor: theme.palette.red[200] },
  busy: { opacity: 0.5 },
});
