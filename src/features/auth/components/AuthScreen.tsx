import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { VoiceAvatar, type AvatarMood } from '@/components/VoiceAvatar';
import { fr } from '@/i18n/fr';
import { angleToPoints, theme, type Gradient } from '@/theme';

const A = theme.auth;
/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;
const { start, end } = angleToPoints(A.angle);

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

/** Le logo dit bonjour : un petit rebond à l'arrivée, puis il respire. */
function useGreeting() {
  const reduceMotion = useReducedMotion();
  const level = useSharedValue(0);
  const [mood, setMood] = useState<AvatarMood>('idle');
  useEffect(() => {
    if (reduceMotion) return;
    const hello = setTimeout(() => {
      level.set(A.avatar.greetLevel);
      setMood('speaking');
    }, A.avatar.greetFromMs);
    const rest = setTimeout(() => {
      level.set(0);
      setMood('idle');
    }, A.avatar.greetToMs);
    return () => {
      clearTimeout(hello);
      clearTimeout(rest);
    };
  }, [level, reduceMotion]);
  return { level, mood };
}

function gradientColors(gradient: Gradient) {
  const [first = '', second = first, ...rest] = gradient.colors;
  const [l0 = 0, l1 = 1, ...lRest] = gradient.locations;
  return { colors: [first, second, ...rest] as const, locations: [l0, l1, ...lRest] as const };
}

/**
 * Connexion plein écran (AuthScreen, v2.7, L2 et L3) : le dégradé de l'espace sur tout l'écran,
 * le logo du tuteur qui dit bonjour, le titre en blanc, puis le formulaire dans une feuille
 * blanche qui monte du bas. Clavier ouvert, tout défile.
 */
export function AuthScreen({ tone, title, subtitle, onBack, children, footer }: Props) {
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const greeting = useGreeting();
  const background = gradientColors(A.background[tone]);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={background.colors}
        locations={background.locations}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      <View aria-hidden style={[styles.glow, styles.glowTop]} />
      <View
        aria-hidden
        style={[styles.glow, styles.glowBottom, { backgroundColor: A.glows[tone] }]}
      />
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
  glow: { position: 'absolute', borderRadius: theme.radius.full },
  glowTop: { top: -120, left: -120, width: 320, height: 320, backgroundColor: A.glows.top },
  glowBottom: { bottom: -80, right: -140, width: 360, height: 360 },
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
