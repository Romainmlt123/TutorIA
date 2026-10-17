import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SegmentedControl } from '@/components/SegmentedControl';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

export type TutorMode = 'written' | 'voice';

const OPTIONS = [
  { value: 'written', label: fr.tutor.written, icon: 'clavier' },
  { value: 'voice', label: fr.tutor.voice, icon: 'micro' },
] as const;

const LOCKED_OPTIONS = [
  OPTIONS[0],
  { value: 'voice', label: fr.tutor.voice, icon: 'cadenas', locked: true },
] as const;

/** La bulle se referme d'elle-même, le temps de la lire. */
const HINT_MS = 4000;

type Props = {
  value: TutorMode;
  onChange: (mode: TutorMode) => void;
  /** Vocal coupé par un parent (R7) : « Vocal » grisé, et ce texte dans une bulle au toucher. */
  voiceLocked?: string | null;
};

/** Bascule Écrit / Vocal, centrée en haut du tuteur. */
export function TutorModeToggle({ value, onChange, voiceLocked = null }: Props) {
  const [hint, setHint] = useState(false);
  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(false), HINT_MS);
    return () => clearTimeout(timer);
  }, [hint]);

  return (
    <View style={styles.wrap}>
      <SegmentedControl
        options={voiceLocked ? LOCKED_OPTIONS : OPTIONS}
        value={value}
        onChange={(mode) => (mode === 'voice' && voiceLocked ? setHint((h) => !h) : onChange(mode))}
        accessibilityLabel={fr.tutor.modeLabel}
      />
      {hint && voiceLocked ? (
        <View accessibilityLiveRegion="polite" style={styles.bubble}>
          <View aria-hidden style={styles.arrow} />
          <Text variant="hint" weight="medium" color="textOnColor">
            {voiceLocked}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 6 },
  bubble: {
    position: 'absolute',
    top: 56,
    right: -36,
    width: 210,
    paddingVertical: 10,
    paddingHorizontal: theme.space[3],
    borderRadius: 12,
    backgroundColor: theme.palette.gray[700],
    boxShadow: theme.shadow.lg,
  },
  arrow: {
    position: 'absolute',
    top: -6,
    right: 78,
    width: 12,
    height: 12,
    borderRadius: 2,
    backgroundColor: theme.palette.gray[700],
    transform: [{ rotate: '45deg' }],
  },
});
