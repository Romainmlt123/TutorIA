import { StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

type Props = {
  muted: boolean;
  cameraActive: boolean;
  /** Caméra désactivée par un parent (P4) : le bouton est masqué. */
  cameraVisible?: boolean;
  onToggleMute: () => void;
  onHangUp: () => void;
  onCamera: () => void;
};

type RoundProps = {
  icon: 'micro' | 'micro-barre' | 'camera' | 'camera-barree';
  label: string;
  caption: string;
  active: boolean;
  activeColor: string;
  pressed?: boolean;
  onPress: () => void;
};

function RoundButton({ icon, label, caption, active, activeColor, pressed, onPress }: RoundProps) {
  return (
    <View style={styles.item}>
      <PressableBase
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        aria-checked={pressed}
        shadow={theme.shadow.md}
        style={[styles.round, { backgroundColor: active ? activeColor : theme.colors.surface }]}>
        <Icon
          name={icon}
          size={24}
          color={active ? theme.colors.textOnColor : theme.colors.textSecondary}
        />
      </PressableBase>
      <Text variant="caption" weight="regular" color="textSecondary" numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}

/** Contrôles de l'appel : micro, raccrocher (rouge, erreur système autorisée ici), caméra. */
export function CallControls({
  muted,
  cameraActive,
  cameraVisible = true,
  onToggleMute,
  onHangUp,
  onCamera,
}: Props) {
  return (
    <View style={styles.row}>
      <RoundButton
        icon={muted ? 'micro-barre' : 'micro'}
        label={muted ? fr.tutor.unmute : fr.tutor.mute}
        caption={muted ? fr.tutor.micMutedCaption : fr.tutor.micCaption}
        active={muted}
        activeColor={theme.colors.text}
        pressed={muted}
        onPress={onToggleMute}
      />
      <View style={styles.hangUpItem}>
        <PressableBase
          onPress={onHangUp}
          accessibilityRole="button"
          accessibilityLabel={fr.tutor.hangUp}
          shadow={theme.shadow.md}
          style={styles.hangUp}>
          <Icon name="croix" size={28} color={theme.colors.textOnColor} strokeWidth={2.25} />
        </PressableBase>
        <Text variant="caption" weight="regular" color="textSecondary">
          {fr.tutor.hangUpCaption}
        </Text>
      </View>
      {cameraVisible ? (
        <RoundButton
          icon={cameraActive ? 'camera' : 'camera-barree'}
          label={fr.tutor.camera}
          caption={cameraActive ? fr.tutor.cameraActiveCaption : fr.tutor.cameraCaption}
          active={cameraActive}
          activeColor={theme.colors.primary}
          onPress={onCamera}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: theme.space[8],
  },
  item: { width: 64, alignItems: 'center', gap: theme.space[2], paddingTop: theme.space[2] },
  round: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hangUpItem: { width: 80, alignItems: 'center', gap: theme.space[2] },
  hangUp: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.errorStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
