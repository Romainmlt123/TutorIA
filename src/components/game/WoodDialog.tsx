import { Modal, StyleSheet, View } from 'react-native';

import { PressableBase } from '@/components/PressableBase';
import { extras, theme } from '@/theme';

import { GameButton } from './GameButton';
import { GameText } from './GameText';
import { Parchment, WoodFrame } from './WoodFrame';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  /** Action principale (bouton vert) : celle qu'on conseille, par exemple « Continuer ». */
  primaryLabel: string;
  onPrimary: () => void;
  /** Autre choix (bouton jaune), par exemple « Quitter ». */
  secondaryLabel: string;
  onSecondary: () => void;
};

/**
 * Question posée dans un écran de jeu, sur un panneau de bois. Toucher en dehors, ou le bouton
 * retour d'Android, équivaut à l'action principale.
 */
export function WoodDialog({
  visible,
  title,
  body,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onPrimary}>
      <View style={styles.backdrop}>
        <PressableBase
          onPress={onPrimary}
          accessibilityRole="button"
          accessibilityLabel={primaryLabel}
          style={StyleSheet.absoluteFill}
        />
        <View role="alertdialog" accessibilityLabel={title} style={styles.dialog}>
          <WoodFrame accessibilityLabel={title}>
            <GameText size={22} align="center" accessibilityRole="header">
              {title}
            </GameText>
            <Parchment lines={5}>{body}</Parchment>
            <View style={styles.actions}>
              <GameButton
                tone="yellow"
                label={secondaryLabel}
                accessibilityLabel={secondaryLabel}
                onPress={onSecondary}
                size={48}
                style={styles.action}
              />
              <GameButton
                tone="green"
                label={primaryLabel}
                accessibilityLabel={primaryLabel}
                onPress={onPrimary}
                size={48}
                style={styles.action}
              />
            </View>
          </WoodFrame>
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
  dialog: { alignSelf: 'center', width: '100%', maxWidth: 420 },
  actions: { flexDirection: 'row', gap: theme.space[3], marginTop: theme.space[2] },
  action: { flex: 1 },
});
