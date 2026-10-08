import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { fr } from '@/i18n/fr';
import { textStyle, theme } from '@/theme';

import { Icon, type IconName } from '../Icon';
import { Pill } from '../Pill';
import { PressableBase } from '../PressableBase';
import { Text } from '../Text';

export type TextFieldProps = Pick<
  TextInputProps,
  | 'autoComplete'
  | 'autoCapitalize'
  | 'keyboardType'
  | 'inputMode'
  | 'textContentType'
  | 'maxLength'
  | 'returnKeyType'
  | 'onSubmitEditing'
  | 'autoFocus'
  | 'placeholder'
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Icône de 20 px à gauche du champ. */
  icon?: IconName;
  /** Mot de passe : texte masqué et bouton œil pour l'afficher. */
  secure?: boolean;
  /** Pastille à droite du libellé (« Facultatif »). */
  badge?: string;
  /** Aide sous le champ. */
  hint?: string;
  /** Message d'erreur sous le champ, à la place de l'aide. */
  error?: string;
  /** Code à chiffres : texte espacé. */
  spaced?: boolean;
  /** Dans une carte ou une feuille blanche (v2.7) : fond `bg`, bordure claire, sans ombre. */
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Champ de formulaire (design-system › TextField) : libellé au-dessus, champ de 52 px,
 * focus en `primary` avec `shadow-focus`. `onChangeText` reçoit le texte saisi.
 */
export function TextField({
  label,
  value,
  onChangeText,
  icon,
  secure = false,
  badge,
  hint,
  error,
  spaced = false,
  filled = false,
  style,
  placeholder,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  // Dès que le champ est touché, l'exemple et l'icône s'effacent : le texte part de la gauche.
  const showIcon = Boolean(icon) && !focused && !value;
  const message = error ?? hint;

  return (
    <View style={[styles.field, style]}>
      <View style={styles.labelRow}>
        <Text variant="label" weight="bold">
          {label}
        </Text>
        {badge ? (
          <Pill
            label={badge}
            backgroundColor={theme.colors.primarySoft}
            color={theme.colors.primary}
            size="md"
          />
        ) : null}
      </View>
      <View>
        <TextInput
          {...inputProps}
          value={value}
          onChangeText={onChangeText}
          accessibilityLabel={label}
          accessibilityHint={message}
          aria-invalid={Boolean(error)}
          secureTextEntry={secure && !revealed}
          placeholder={focused ? undefined : placeholder}
          placeholderTextColor={theme.colors.textDisabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            styles.input,
            showIcon ? styles.withIcon : null,
            secure ? styles.withToggle : null,
            spaced ? styles.spaced : null,
            filled ? styles.filled : null,
            error ? styles.invalid : null,
            focused ? styles.focused : null,
          ]}
        />
        {/* Dessinée après le champ : sur Android, l'ombre de focus le ferait passer au-dessus. */}
        {showIcon && icon ? (
          <View style={styles.icon}>
            <Icon name={icon} size={20} color={theme.palette.gray[400]} />
          </View>
        ) : null}
        {secure ? (
          <PressableBase
            onPress={() => setRevealed((shown) => !shown)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? fr.form.hidePassword : fr.form.showPassword}
            hitSlop={4}
            style={styles.toggle}>
            <Icon
              name={revealed ? 'oeil-barre' : 'oeil'}
              size={20}
              color={theme.palette.gray[400]}
            />
          </PressableBase>
        ) : null}
      </View>
      {message ? (
        <Text variant="hint" color={error ? theme.colors.warningStrong : 'textSecondary'}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const FIELD_HEIGHT = 52;

const styles = StyleSheet.create({
  field: { gap: theme.space[2] },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.space[2],
  },
  icon: { position: 'absolute', left: theme.space[4], top: theme.space[4], pointerEvents: 'none' },
  input: {
    ...textStyle('body'),
    height: FIELD_HEIGHT,
    paddingLeft: theme.space[4],
    paddingRight: theme.space[4],
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    boxShadow: theme.shadow.sm,
    ...(Platform.OS === 'web' ? { outlineWidth: 0 } : null),
  },
  withIcon: { paddingLeft: theme.space[12] },
  withToggle: { paddingRight: FIELD_HEIGHT },
  spaced: { letterSpacing: 1.3 },
  filled: {
    backgroundColor: theme.auth.field.filledBackground,
    borderColor: theme.auth.field.filledBorder,
    boxShadow: 'none',
  },
  invalid: { borderColor: theme.colors.warning },
  focused: { borderColor: theme.colors.primary, boxShadow: theme.shadow.focus },
  toggle: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: theme.space[10],
    height: theme.space[10],
    borderRadius: theme.space[3],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
