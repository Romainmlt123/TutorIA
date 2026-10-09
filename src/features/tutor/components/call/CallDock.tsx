import { StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

const T = fr.tutor.call.dock;
const BUTTON = 56;
const HANGUP = 64;

type ControlProps = {
  icon: IconName;
  label: string;
  accessibilityLabel: string;
  active: boolean;
  onPress: () => void;
};

function Control({ icon, label, accessibilityLabel, active, onPress }: ControlProps) {
  return (
    <View style={styles.cell}>
      <PressableBase
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        aria-pressed={active}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: active ? theme.colors.surface : theme.voiceCall.glass },
          pressed && styles.pressed,
        ]}>
        <Icon
          name={icon}
          size={24}
          color={active ? theme.palette.blue[600] : theme.colors.textOnColor}
          strokeWidth={2}
        />
      </PressableBase>
      <Text variant="caption" weight="medium" color={extras.call.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

type Props = {
  muted: boolean;
  captionsOn: boolean;
  cameraActive: boolean;
  /** Absente si les parents ont désactivé la caméra : il reste trois boutons. */
  cameraVisible: boolean;
  onToggleMute: () => void;
  onToggleCaptions: () => void;
  onCamera: () => void;
  onHangUp: () => void;
};

/** Commandes de l'appel (CallDock, v2.6) : micro, sous-titres, caméra et raccrocher, en verre. */
export function CallDock(props: Props) {
  return (
    <View accessibilityLabel={T.label} style={styles.dock}>
      <Control
        icon={props.muted ? 'micro-barre' : 'micro'}
        label={props.muted ? T.micMuted : T.mic}
        accessibilityLabel={props.muted ? fr.tutor.unmute : fr.tutor.mute}
        active={props.muted}
        onPress={props.onToggleMute}
      />
      <Control
        icon="sous-titres"
        label={T.captions}
        accessibilityLabel={props.captionsOn ? T.captionsHide : T.captionsShow}
        active={props.captionsOn}
        onPress={props.onToggleCaptions}
      />
      {props.cameraVisible ? (
        <Control
          icon="appareil-photo"
          label={T.camera}
          accessibilityLabel={fr.tutor.camera}
          active={props.cameraActive}
          onPress={props.onCamera}
        />
      ) : null}
      <View style={styles.cell}>
        <PressableBase
          onPress={props.onHangUp}
          accessibilityRole="button"
          accessibilityLabel={T.hangUpLabel}
          style={({ pressed }) => [styles.hangup, pressed && styles.pressed]}>
          <View style={styles.handset}>
            <Icon name="combine" size={28} color={theme.colors.textOnColor} strokeWidth={2} />
          </View>
        </PressableBase>
        <Text variant="caption" weight="medium" color={extras.call.label} numberOfLines={1}>
          {T.hangUp}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 14,
    paddingBottom: theme.space[3],
    paddingHorizontal: theme.space[2],
    borderRadius: 32,
    backgroundColor: theme.voiceCall.dock,
  },
  cell: { flex: 1, alignItems: 'center', gap: 6 },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },
  hangup: {
    width: HANGUP,
    height: HANGUP,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.voiceCall.hangup,
    boxShadow: extras.call.hangupShadow,
  },
  handset: { transform: [{ rotate: '135deg' }] },
});
