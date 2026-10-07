import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { TUTOR_LIMITS } from '@/services/tutor';
import { fontFamily, theme } from '@/theme';

/** Photo d'exercice à joindre (C4) ; absente : pas de bouton photo (parent, évaluation, hors ligne). */
export type PhotoAttachment = {
  photo: string | null;
  notice: string | null;
  onAdd: () => void;
  onRemove: () => void;
};

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  attachment?: PhotoAttachment;
};

/** Barre de saisie : bouton photo éventuel, champ de 48 px et bouton d'envoi rond. */
export function ChatInput({
  onSend,
  disabled = false,
  placeholder = fr.tutor.inputPlaceholder,
  attachment,
}: Props) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const remaining = TUTOR_LIMITS.messageMaxChars - value.length;
  const photo = attachment?.photo ?? null;
  // Une photo peut partir seule, sans texte.
  const canSend = (value.trim().length > 0 || !!photo) && !disabled;

  const send = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue('');
  };

  return (
    <View accessibilityLabel={fr.tutor.formLabel} style={styles.container}>
      {remaining <= 50 ? (
        <Text
          variant="caption"
          color="textSecondary"
          accessibilityLiveRegion="polite"
          style={styles.counter}>
          {fr.tutor.charactersLeft(remaining)}
        </Text>
      ) : null}
      {attachment?.notice ? (
        <Text variant="caption" color="textSecondary" accessibilityLiveRegion="polite">
          {attachment.notice}
        </Text>
      ) : null}
      {photo && attachment ? (
        <View style={styles.preview}>
          <Image
            source={{ uri: photo }}
            accessibilityLabel={fr.tutor.photo.attached}
            style={styles.thumbnail}
          />
          <Text variant="caption" color="textSecondary" style={styles.previewHint}>
            {fr.tutor.photo.hint}
          </Text>
          <PressableBase
            onPress={attachment.onRemove}
            accessibilityRole="button"
            accessibilityLabel={fr.tutor.photo.remove}
            style={styles.round}>
            <Icon name="croix" size={20} color={theme.colors.textSecondary} />
          </PressableBase>
        </View>
      ) : null}
      <View style={styles.row}>
        {attachment ? (
          <PressableBase
            onPress={attachment.onAdd}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={fr.tutor.photo.add}
            aria-disabled={disabled}
            shadow={theme.shadow.sm}
            style={({ pressed }) => [styles.round, styles.camera, pressed && styles.cameraPressed]}>
            <Icon name="appareil-photo" size={22} color={theme.colors.primary} />
          </PressableBase>
        ) : null}
        <TextInput
          value={value}
          onChangeText={setValue}
          onSubmitEditing={send}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor={theme.palette.gray[400]}
          accessibilityLabel={fr.tutor.inputLabel}
          maxLength={TUTOR_LIMITS.messageMaxChars}
          returnKeyType="send"
          submitBehavior="submit"
          style={[styles.input, focused && styles.inputFocused]}
        />
        <PressableBase
          onPress={send}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel={fr.tutor.send}
          aria-disabled={!canSend}
          style={({ pressed }) => [
            styles.send,
            pressed && canSend && styles.sendPressed,
            // Estompé seulement pendant que le tuteur répond (comme la maquette, plein sinon).
            disabled && styles.sendDisabled,
          ]}>
          <Icon name="envoi" size={22} color={theme.colors.textOnColor} strokeWidth={2} />
        </PressableBase>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: theme.space[1] },
  counter: { alignSelf: 'flex-end' },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  input: {
    flex: 1,
    height: theme.space[12],
    paddingHorizontal: theme.space[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.sm,
    fontFamily: fontFamily.regular,
    fontSize: theme.typeScale.body.fontSize,
    color: theme.colors.text,
    outlineWidth: 0,
  },
  inputFocused: { boxShadow: `${theme.shadow.sm}, ${theme.shadow.focus}` },
  send: {
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPressed: { backgroundColor: theme.colors.primaryPressed },
  round: {
    width: theme.space[12],
    height: theme.space[12],
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: { backgroundColor: theme.colors.surface },
  cameraPressed: { backgroundColor: theme.colors.primarySoft },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.sm,
  },
  thumbnail: { width: 56, height: 56, borderRadius: theme.radius['2xl'] },
  previewHint: { flex: 1 },
  sendDisabled: { opacity: 0.4 },
});
