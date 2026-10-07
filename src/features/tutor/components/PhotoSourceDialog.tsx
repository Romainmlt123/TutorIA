import { Modal, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import type { PhotoSource } from '../hooks/useExercisePhoto';

const T = fr.tutor.photo;

type Props = {
  visible: boolean;
  onChoose: (source: PhotoSource) => void;
  onCancel: () => void;
};

/** Choix de la photo d'un exercice : appareil photo ou galerie, posé en bas de l'écran. */
export function PhotoSourceDialog({ visible, onChoose, onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <PressableBase
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel={T.cancel}
          style={StyleSheet.absoluteFill}
        />
        <View role="dialog" accessibilityLabel={T.sourceTitle} style={styles.sheet}>
          <Text variant="section" accessibilityRole="header">
            {T.sourceTitle}
          </Text>
          <Text variant="bodySm" color="textSecondary">
            {T.hint}
          </Text>
          <Button label={T.camera} icon="appareil-photo" onPress={() => onChoose('camera')} />
          <Button
            label={T.library}
            icon="image"
            variant="soft"
            onPress={() => onChoose('library')}
          />
          <Button label={T.cancel} variant="white" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: theme.space[8],
    backgroundColor: extras.backdrop,
  },
  sheet: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    gap: theme.space[3],
    paddingVertical: theme.space[6],
    paddingHorizontal: theme.space[6],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.lg,
  },
});
