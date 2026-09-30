import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';

import { fr } from '@/i18n/fr';
import { useKeyboardVisible } from '@/lib/useKeyboardVisible';
import { theme } from '@/theme';

import { Icon, type IconName } from '../Icon';
import { Logo } from '../Logo';
import { PressableBase } from '../PressableBase';
import { Text } from '../Text';
import { useBottomNavLayout } from './useBottomNavLayout';

export type NavTab = { name: string; label: string; icon: IconName | 'logo' };

/** Onglets de l'espace élève, dans l'ordre de la barre. `logo` : l'onglet Tutor'IA. */
export const STUDENT_TABS: readonly NavTab[] = [
  { name: 'index', label: fr.nav.home, icon: 'accueil' },
  { name: 'explorer', label: fr.nav.explorer, icon: 'boussole' },
  { name: 'tuteur', label: fr.nav.tutor, icon: 'logo' },
  { name: 'revisions', label: fr.nav.reviews, icon: 'revisions' },
  { name: 'stats', label: fr.nav.stats, icon: 'stats' },
];

/** Onglets de l'espace Parents : Accueil, Progrès, Sessions, Réglages. */
export const PARENT_TABS: readonly NavTab[] = [
  { name: 'parents/index', label: fr.parent.nav.home, icon: 'accueil' },
  { name: 'parents/progres', label: fr.parent.nav.progress, icon: 'tendance-haut' },
  { name: 'parents/sessions', label: fr.parent.nav.sessions, icon: 'sessions' },
  { name: 'parents/reglages', label: fr.parent.nav.settings, icon: 'reglages' },
];

type TabItemProps = {
  label: string;
  icon: IconName | 'logo';
  active: boolean;
  onPress: () => void;
};

function TabItem({ label, icon, active, onPress }: TabItemProps) {
  const bubbleSize =
    icon === 'logo' ? theme.navigation.activeBubbleTutor : theme.navigation.activeBubble;
  let visual;
  if (active) {
    visual = (
      <View style={[styles.bubble, { width: bubbleSize, height: bubbleSize }]}>
        {icon === 'logo' ? (
          <Logo variant="onBlue" size={42} borderRadius={12} />
        ) : (
          <Icon name={icon} size={22} color={theme.colors.textOnColor} />
        )}
      </View>
    );
  } else {
    visual =
      icon === 'logo' ? (
        <Logo variant="onWhite" size={30} style={styles.logoIdle} />
      ) : (
        <Icon name={icon} size={24} color={theme.palette.gray[400]} />
      );
  }
  return (
    <PressableBase
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      aria-selected={active}
      style={styles.tab}>
      {visual}
      <Text
        variant="caption"
        weight={active ? 'bold' : 'medium'}
        color={active ? 'primary' : 'textSecondary'}
        numberOfLines={1}
        maxFontSizeMultiplier={1.2}
        style={styles.label}>
        {label}
      </Text>
    </PressableBase>
  );
}

type Props = BottomTabBarProps & {
  tabs?: readonly NavTab[];
  accessibilityLabel?: string;
};

/**
 * Barre de navigation flottante des deux espaces. Masquée avec le clavier et sur les écrans
 * qui ne sont pas des onglets (profil, ajout d'un enfant, données personnelles).
 */
export function BottomNav({
  state,
  navigation,
  tabs = STUDENT_TABS,
  accessibilityLabel = fr.nav.label,
}: Props) {
  const { bottom } = useBottomNavLayout();
  const keyboardVisible = useKeyboardVisible();
  const activeName = state.routes[state.index]?.name;
  if (keyboardVisible || !tabs.some((tab) => tab.name === activeName)) return null;

  return (
    <View
      role="navigation"
      accessibilityLabel={accessibilityLabel}
      style={[styles.bar, { bottom }]}>
      {tabs.map((tab) => {
        const route = state.routes.find((r) => r.name === tab.name);
        if (!route) return null;
        const active = state.routes[state.index]?.key === route.key;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!active && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };
        return (
          <TabItem
            key={tab.name}
            label={tab.label}
            icon={tab.icon}
            active={active}
            onPress={onPress}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: theme.navigation.inset,
    right: theme.navigation.inset,
    height: theme.navigation.height,
    paddingHorizontal: theme.space[1],
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: theme.navigation.radius,
    backgroundColor: theme.colors.surface,
    boxShadow: theme.navigation.shadow,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: theme.space[1],
    paddingBottom: theme.space[3],
  },
  bubble: {
    flexShrink: 0,
    borderRadius: theme.radius.full,
    borderWidth: 4,
    borderColor: theme.colors.surface,
    backgroundColor: theme.colors.primary,
    boxShadow: theme.shadow.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIdle: { marginBottom: -2 },
  // La pastille active dépasse de la barre : rien ne doit se comprimer.
  label: { flexShrink: 0 },
});
