import { useIsFocused } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { extras, theme } from '@/theme';

import { BrandBackdrop } from './BrandBackdrop';
import { Icon, type IconName } from './Icon';
import { useBottomNavLayout } from './navigation/useBottomNavLayout';
import { Text } from './Text';
import { useAvatarGreeting, VoiceAvatar } from './VoiceAvatar';

/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;
/** Le badge déborde du logo de 148 px, en haut à droite (maquettes R1 à R3). */
const BADGE_SIZE = 48;

type Props = {
  /** Badge blanc posé sur le logo : l'icône de la raison, dans sa couleur. */
  badge: { icon: IconName; color: string };
  title: string;
  body: string;
  /** Laisse la place de la barre de navigation (onglet Tutor'IA) ; sinon, plein écran. */
  withNav?: boolean;
  /** Carte et boutons, sous le texte. */
  children: ReactNode;
};

/**
 * Message plein écran sur le fond de marque (pause R1 à R3, v2.15) : le logo du tuteur qui dit
 * bonjour avec un badge, le titre et le texte en blanc, puis les actions. Tout est centré et défile
 * sur les petits écrans.
 */
export function BrandMessage({ badge, title, body, withNav = true, children }: Props) {
  const insets = useSafeAreaInsets();
  const { clearance } = useBottomNavLayout();
  const greeting = useAvatarGreeting();
  // Heure et batterie en blanc sur le dégradé, tant que l'écran est affiché.
  const focused = useIsFocused();
  return (
    <View style={styles.screen}>
      {focused ? <StatusBar style="light" /> : null}
      <BrandBackdrop />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.space[6],
            paddingBottom: withNav ? clearance : insets.bottom + theme.space[6],
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.avatar}>
          <VoiceAvatar mood={greeting.mood} level={greeting.level} />
          <View aria-hidden style={styles.badge}>
            <Icon name={badge.icon} size={24} color={badge.color} strokeWidth={2} />
          </View>
        </View>
        <Text
          variant="heading"
          color="textOnColor"
          align="center"
          accessibilityRole="header"
          style={styles.title}>
          {title}
        </Text>
        <Text variant="lead" weight="medium" color="textOnColor" align="center" style={styles.body}>
          {body}
        </Text>
        <View style={styles.actions}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, overflow: 'hidden', backgroundColor: theme.auth.background.student.colors[3] },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.layout.screenPadding,
  },
  avatar: { width: 196, alignItems: 'center' },
  badge: {
    position: 'absolute',
    top: theme.voiceCall.avatar.hop,
    right: theme.space[4],
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    boxShadow: extras.studyPause.badgeShadow,
  },
  title: { marginTop: theme.space[3] },
  body: { marginTop: 6, maxWidth: 300, opacity: 0.85 },
  actions: { alignSelf: 'stretch', marginTop: theme.space[6], gap: theme.space[6] },
});
