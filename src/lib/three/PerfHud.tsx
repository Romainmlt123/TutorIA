import { useSyncExternalStore } from 'react';
import { PixelRatio, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { getMapPerf, getPerf, subscribePerf, type MapPerf, type PerfSnapshot } from './perfStats';

const t = fr.dev.perf;

const ms = (value: number) => value.toFixed(1);

function linesOf(perf: PerfSnapshot): { id: string; text: string }[] {
  return [
    { id: 'frames', text: t.frames(perf.fps.toFixed(0), ms(perf.p50), ms(perf.p95), ms(perf.max)) },
    { id: 'gl', text: perf.glLag === null ? t.glLagWeb : t.glLag(ms(perf.glLag)) },
    {
      id: 'draws',
      text: t.draws(String(perf.calls), (perf.triangles / 1000).toFixed(0)),
    },
    { id: 'memory', text: t.memory(String(perf.textures), String(perf.geometries)) },
    {
      id: 'context',
      text: t.context(perf.contextId === null ? t.unknown : String(perf.contextId), perf.contexts),
    },
    { id: 'ratio', text: t.ratio(String(PixelRatio.get()), String(perf.renderRatio)) },
  ];
}

function mapLinesOf(map: MapPerf): { id: string; text: string }[] {
  return [
    { id: 'ambient', text: t.ambient(String(map.rate)) },
    {
      id: 'uiFrames',
      text: t.uiFrames(String(map.fps), String(map.p95), String(map.max), map.late),
    },
  ];
}

/**
 * Compteur de performance (développement seulement, allumé par `usePerfHud`), posé en haut à
 * gauche de l'écran : il lit le relevé publié par `PerfProbe` (scène 3D) et celui d'une carte
 * pré-rendue (`useMapClock` : rythme de ses animations et des images du fil de l'interface), et
 * laisse passer les touchers.
 */
export function PerfHud() {
  const insets = useSafeAreaInsets();
  const perf = useSyncExternalStore(subscribePerf, getPerf, getPerf);
  const map = useSyncExternalStore(subscribePerf, getMapPerf, getMapPerf);
  const lines = [
    ...(perf ? linesOf(perf) : [{ id: 'waiting', text: t.waiting }]),
    ...(map ? mapLinesOf(map) : []),
  ];
  return (
    <View
      pointerEvents="none"
      accessible={false}
      aria-hidden
      style={[styles.hud, { top: insets.top + theme.space[1] }]}>
      {lines.map((line) => (
        <Text key={line.id} variant="caption" style={styles.line}>
          {line.text}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    left: theme.space[2],
    paddingVertical: theme.space[1],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
  },
  line: { fontVariant: ['tabular-nums'] },
});
