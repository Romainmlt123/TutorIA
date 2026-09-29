import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NoticeToast } from '@/components/NoticeToast';
import { UnavailableScreen } from '@/features/auth/UnavailableScreen';
import { logError } from '@/lib/logger';
import { queryClient } from '@/lib/queryClient';
import { resolveSpace } from '@/lib/session/resolveSpace';
import { SessionProvider, useSession } from '@/lib/session/SessionProvider';
import { fontSources, theme } from '@/theme';

SplashScreen.preventAutoHideAsync().catch((error: unknown) => logError('splash', error));

/**
 * Un groupe de routes par espace, choisi par la session (resolveSpace).
 * Un seul groupe est ouvert à la fois ; avec le SDK 57, l'ordre des blocs décide de l'écran
 * affiché quand l'espace change : les groupes passent avant les écrans communs.
 */
function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const space = resolveSpace(useSession());
  const ready = fontsReady && space !== 'loading';

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch((error: unknown) => logError('splash', error));
  }, [ready]);

  if (!ready) return null;
  if (space === 'unavailable') return <UnavailableScreen />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}>
      <Stack.Protected guard={space === 'auth'}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'account'}>
        <Stack.Screen name="(compte)" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'onboarding'}>
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'parent'}>
        <Stack.Screen name="(parents)" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'student'}>
        <Stack.Screen name="(eleve)" />
      </Stack.Protected>
      <Stack.Protected guard={space === 'student' || space === 'onboarding'}>
        <Stack.Screen name="relier-parent" options={{ presentation: 'modal' }} />
      </Stack.Protected>
      <Stack.Screen name="bientot" options={{ presentation: 'modal' }} />
      <Stack.Protected guard={__DEV__}>
        <Stack.Screen name="dev/catalogue" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontSources);
  // En cas d'échec de chargement, l'app reste utilisable avec la police système.
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontError) logError('fonts', fontError);
  }, [fontError]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <StatusBar style="dark" />
          <View style={styles.app}>
            <RootNavigator fontsReady={fontsReady} />
            <NoticeToast />
          </View>
        </SessionProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // Web : même écran mobile, dans une colonne centrée en attendant l'adaptation web complète.
  app: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: theme.colors.bg,
    ...(Platform.OS === 'web' ? { maxWidth: theme.layout.webMaxWidth } : null),
  },
});
