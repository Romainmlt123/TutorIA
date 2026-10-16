import { useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { extras, theme, type SpaceTone } from '@/theme';

import { Button } from './Button';
import { Checkbox } from './form/Checkbox';
import { Icon } from './Icon';
import { PressableBase } from './PressableBase';
import { Text } from './Text';

type Common = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
};

/** Confirmation simple (suppression d'une discussion) : l'action en rouge doux, puis « Annuler ». */
type SimpleProps = Common & { cancelLabel: string; keepLabel?: undefined };

/**
 * Suppression d'un compte ou d'un lien (v2.16) : le choix sûr d'abord, avec un libellé qui dit ce
 * qu'on garde, puis la suppression en second.
 */
type KeepFirstProps = Common & {
  keepLabel: string;
  cancelLabel?: undefined;
  /** Bleu côté élève, violet côté parent. */
  tone?: SpaceTone;
  /** Icône du badge : corbeille (par défaut) ou lien barré. */
  icon?: 'poubelle' | 'lien-barre';
  /** Lien au-dessus des boutons (« Télécharger mes données d'abord »), qui ne ferme pas. */
  extra?: { label: string; onPress: () => void };
  /** Case qui active la suppression, alors en rouge plein (« Je comprends que c'est définitif. »). */
  ackLabel?: string;
};

type Props = SimpleProps | KeepFirstProps;

/**
 * Confirmation d'une action définitive. Remplace `Alert.alert`, sans effet sur le web. Toucher le
 * voile annule (garde).
 */
export function ConfirmDialog(props: Props) {
  const { visible, title, onCancel } = props;
  const cancelLabel = props.keepLabel ?? props.cancelLabel;
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
          {props.keepLabel !== undefined ? <KeepFirst {...props} /> : <Simple {...props} />}
        </View>
      </View>
    </Modal>
  );
}

function Simple({
  title,
  body,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  busy,
}: SimpleProps) {
  return (
    <>
      <Text variant="section" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="lead" color="textSecondary">
        {body}
      </Text>
      <Button
        label={confirmLabel}
        variant="danger"
        weight="bold"
        disabled={busy}
        onPress={onConfirm}
        style={styles.firstAction}
      />
      <Button label={cancelLabel} onPress={onCancel} variant="soft" />
    </>
  );
}

function KeepFirst({
  title,
  body,
  confirmLabel,
  keepLabel,
  onConfirm,
  onCancel,
  busy = false,
  tone = 'student',
  icon = 'poubelle',
  extra,
  ackLabel,
}: KeepFirstProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const unlink = icon === 'lien-barre';
  const blocked = busy || (ackLabel !== undefined && !acknowledged);
  return (
    <View style={styles.centered}>
      <View
        aria-hidden
        style={[
          styles.badge,
          { backgroundColor: unlink ? theme.palette.violet[100] : theme.colors.errorSoft },
        ]}>
        <Icon
          name={icon}
          size={26}
          color={unlink ? theme.palette.violet[600] : theme.colors.errorStrong}
          strokeWidth={2}
        />
      </View>
      <Text variant="metric" align="center" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="lead" color="textSecondary" align="center">
        {body}
      </Text>
      {extra ? (
        <PressableBase
          onPress={extra.onPress}
          accessibilityRole="button"
          style={({ pressed }) => [styles.extra, pressed && styles.pressed]}>
          <Icon name="telechargement" size={18} color={theme.colors.primary} strokeWidth={2} />
          <Text variant="label" weight="bold" color="primary">
            {extra.label}
          </Text>
        </PressableBase>
      ) : null}
      {ackLabel ? (
        <View style={[styles.ack, acknowledged && styles.ackChecked]}>
          <Checkbox
            checked={acknowledged}
            onChange={setAcknowledged}
            tone={tone}
            accessibilityLabel={ackLabel}>
            <Text variant="label" weight="bold">
              {ackLabel}
            </Text>
          </Checkbox>
        </View>
      ) : null}
      <View style={styles.actions}>
        <Button
          label={keepLabel}
          variant={tone === 'parent' ? 'vivid' : 'primary'}
          weight="bold"
          highlight
          onPress={onCancel}
        />
        <Button
          label={confirmLabel}
          variant={ackLabel ? 'dangerSolid' : 'danger'}
          weight="bold"
          disabled={blocked}
          onPress={onConfirm}
        />
      </View>
    </View>
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
  firstAction: { marginTop: theme.space[2] },
  centered: { alignItems: 'center', gap: theme.space[3] },
  badge: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extra: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.space[2],
  },
  pressed: { opacity: 0.7 },
  ack: {
    alignSelf: 'stretch',
    paddingHorizontal: theme.space[4],
    paddingVertical: theme.space[2],
    borderRadius: theme.radius['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ackChecked: { borderColor: theme.palette.violet[500] },
  actions: { alignSelf: 'stretch', gap: theme.space[3], marginTop: theme.space[1] },
});
