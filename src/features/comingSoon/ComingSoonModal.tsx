import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/components/BottomSheet';
import { Button } from '@/components/Button';
import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { useAccount } from '@/lib/session/SessionProvider';
import { theme } from '@/theme';

const t = fr.comingSoon;

type Topic = {
  title: string;
  icon: IconName;
  /** Texte sans liste. Sujets communs aux deux espaces : ni tutoiement ni vouvoiement. */
  body?: string;
  /** Ce qui arrive vraiment, une ligne par point (B1), et le bouton qui dit où l'on revient. */
  soon?: { intro: string; items: readonly string[]; back: string };
};

const TOPICS: Record<string, Topic> = {
  notifications: { title: t.topics.notifications, icon: 'cloche', body: t.neutralBody },
  reglages: { title: t.topics.reglages, icon: 'reglages', soon: t.reglages },
  comptes: { title: t.topics.comptes, icon: 'cadenas', body: t.neutralBody },
  conditions: { title: t.topics.conditions, icon: 'bouclier', body: t.neutralBody },
  abonnement: { title: t.topics.abonnement, icon: 'etoile', body: t.neutralBody },
};

/**
 * B1 · « Bientôt disponible » (v2.19) : une feuille du bas sur l'écran d'où l'on vient (notifications,
 * réglages des révisions, Apple et Google, conditions, abonnement), qui dit ce qui arrive.
 */
export function ComingSoonModal() {
  const router = useRouter();
  const parent = useAccount()?.role === 'parent';
  const { sujet } = useLocalSearchParams<{ sujet?: string }>();
  const topic = TOPICS[sujet ?? ''] ?? {
    title: fr.common.comingSoon,
    icon: 'etoile',
    body: t.neutralBody,
  };
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <BottomSheet
      onClose={close}
      closeLabel={t.close}
      accessibilityLabel={topic.title}
      gap={theme.space[4]}>
      <View style={styles.head}>
        <GradientSurface
          gradient={theme.spaces[parent ? 'parent' : 'student'].gradient}
          radius={18}
          style={styles.tile}
          contentStyle={styles.tileContent}>
          <Icon name={topic.icon} size={26} color={theme.colors.textOnColor} />
        </GradientSurface>
        <View style={styles.titles}>
          <Pill
            label={t.soon}
            backgroundColor={theme.colors.warningSoft}
            color={theme.colors.warning}
            style={styles.pill}
          />
          <Text variant="metric" accessibilityRole="header">
            {topic.title}
          </Text>
        </View>
        <PressableBase
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t.close}
          hitSlop={2}
          style={({ pressed }) => [styles.close, pressed && styles.pressed]}>
          <Icon name="croix" size={20} color={theme.colors.textSecondary} strokeWidth={2} />
        </PressableBase>
      </View>

      <Text variant="lead" color="textSecondary">
        {topic.soon?.intro ?? topic.body}
      </Text>
      {topic.soon ? (
        <View style={styles.items}>
          {topic.soon.items.map((item) => (
            <View key={item} style={styles.item}>
              <View style={styles.itemIcon}>
                <Icon
                  name="horloge"
                  size={14}
                  color={theme.colors.primaryHover}
                  strokeWidth={2.25}
                />
              </View>
              <Text variant="lead" style={styles.itemText}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Button
        label={topic.soon?.back ?? t.close}
        onPress={close}
        tone={parent ? 'parent' : 'student'}
        size="lg"
        highlight
        style={styles.back}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  tile: { width: 56, height: 56 },
  tileContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, gap: 6 },
  pill: { alignSelf: 'flex-start' },
  close: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bg,
  },
  pressed: { opacity: 0.8 },
  items: { gap: 10 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: {
    width: 24,
    height: 24,
    borderRadius: theme.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySoft,
  },
  itemText: { flex: 1 },
  back: { marginTop: theme.space[1] },
});
