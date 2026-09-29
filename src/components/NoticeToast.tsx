import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dismissNotice, useNotice } from '@/lib/notice';
import { theme } from '@/theme';

import { PressableBase } from './PressableBase';
import { Text } from './Text';

const DURATION_MS = 6_000;

/** Message bref en haut de l'écran, lu par les lecteurs d'écran ; il disparaît seul. */
export function NoticeToast() {
  const notice = useNotice();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(dismissNotice, DURATION_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  if (!notice) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { top: (Platform.OS === 'web' ? 0 : insets.top) + theme.space[3] }]}>
      <PressableBase
        onPress={dismissNotice}
        accessibilityRole="alert"
        aria-live="polite"
        shadow={theme.shadow.lg}
        style={styles.toast}>
        <Text variant="label" weight="medium" color="textOnColor">
          {notice}
        </Text>
      </PressableBase>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    right: theme.layout.screenPadding,
    zIndex: 10,
  },
  toast: {
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[4],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.palette.gray[900],
  },
});
