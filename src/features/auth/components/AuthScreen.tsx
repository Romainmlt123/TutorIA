import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBackdrop } from '@/components/BrandBackdrop';
import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { useAvatarGreeting, VoiceAvatar } from '@/components/VoiceAvatar';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

const A = theme.auth;
/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;

type Props = {
  /** Élève en bleu (tutoiement), parent en violet (vouvoiement). */
  tone: 'student' | 'parent';
  title: string;
  subtitle: string;
  onBack: () => void;
  /** Formulaire, dans la feuille blanche. */
  children: ReactNode;
  /** Liens collés en bas de la feuille (créer un compte, code parent). */
  footer?: ReactNode;
};

/**
 * Connexion plein écran (AuthScreen, v2.7, L2 et L3) : le dégradé de l'espace sur tout l'écran,
 * le logo du tuteur qui dit bonjour, le titre en blanc, puis le formulaire dans une feuille
 * blanche qui monte du bas. Clavier ouvert, tout défile.
 */
export function AuthScreen({ tone, title, subtitle, onBack, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const greeting = useAvatarGreeting();

  return (
    <View style={styles.screen}>
      <BrandBackdrop tone={tone} />
      <KeyboardAvoidingView style={styles.fill} behavior="padding">
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.header,
              { paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.space[3] },
            ]}>
            <PressableBase
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={fr.form.back}
              style={({ pressed }) => [
                styles.back,
                { top: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.space[3] },
                pressed && styles.pressed,
              ]}>
              <Icon name="chevron-gauche" size={22} color={theme.colors.textOnColor} />
            </PressableBase>
            <View style={styles.avatar}>
              <VoiceAvatar mood={greeting.mood} level={greeting.level} compact />
            </View>
            <Text variant="heading" color="textOnColor" accessibilityRole="header" align="center">
              {title}
            </Text>
            <Text variant="lead" color="textOnColor" align="center" style={styles.subtitle}>
              {subtitle}
            </Text>
          </View>
          <Animated.View
            entering={reduceMotion ? undefined : SlideInDown.duration(A.sheet.enterMs)}
            style={[styles.sheet, { paddingBottom: A.sheet.paddingBottom + insets.bottom }]}>
            {children}
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', backgroundColor: A.background.student.colors[3] },
  fill: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    alignItems: 'center',
    gap: theme.space[2],
    paddingHorizontal: theme.layout.screenPadding,
    paddingBottom: 18,
  },
  back: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.voiceCall.glass,
  },
  pressed: { opacity: 0.8 },
  avatar: { marginTop: -34 + theme.space[10] },
  subtitle: { maxWidth: 320, opacity: 0.85 },
  sheet: {
    flexGrow: 1,
    gap: theme.space[4],
    paddingTop: A.sheet.paddingTop,
    paddingHorizontal: A.sheet.paddingHorizontal,
    borderTopLeftRadius: A.sheet.radius,
    borderTopRightRadius: A.sheet.radius,
    backgroundColor: theme.colors.surface,
    boxShadow: A.sheet.shadow,
  },
  footer: { marginTop: 'auto', alignItems: 'center', gap: theme.space[3] },
});
