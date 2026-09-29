import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { GradientSurface } from '@/components/GradientSurface';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';

import { useVoiceBars } from '../hooks/useVoiceBars';
import { barsMode, type VoiceStatus } from '../logic/voice';

type Props = {
  status: VoiceStatus;
  /** Message affiché à la place du statut (permission refusée, limite atteinte…). */
  notice?: string;
  onInterrupt: () => void;
  onLongPress?: () => void;
};

const STATUS_TEXT: Record<VoiceStatus, string> = {
  connecting: fr.tutor.voiceStatus.connecting,
  aiSpeaking: fr.tutor.voiceStatus.aiSpeaking,
  userSpeaking: fr.tutor.voiceStatus.listening,
  waiting: fr.tutor.voiceStatus.listening,
  muted: fr.tutor.voiceStatus.muted,
  ended: fr.tutor.voiceStatus.ended,
  error: fr.tutor.voiceStatus.error,
};

/** Visualiseur à 4 barres : toute la zone est un bouton, la toucher interrompt le tuteur. */
export function VoiceVisualizer({ status, notice, onInterrupt, onLongPress }: Props) {
  const heights = useVoiceBars(barsMode(status));
  const aiSpeaking = status === 'aiSpeaking';
  return (
    <PressableBase
      onPress={onInterrupt}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityLabel={aiSpeaking ? fr.tutor.interrupt : fr.tutor.listeningLabel}
      accessibilityHint={onLongPress ? fr.tutor.reportHint : undefined}
      style={styles.stage}>
      <View style={styles.bars} importantForAccessibility="no-hide-descendants">
        {heights.map((height, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bar,
              {
                height,
                transitionProperty: 'height',
                transitionDuration: 140,
                transitionTimingFunction: 'ease-out',
              },
            ]}>
            <GradientSurface
              gradient={theme.voice.bars}
              angle={180}
              radius={theme.radius.full}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        ))}
      </View>
      <View style={styles.texts}>
        <Text
          variant="bodyLg"
          weight="medium"
          color="textSecondary"
          align="center"
          accessibilityLiveRegion="polite">
          {notice ?? STATUS_TEXT[status]}
        </Text>
        <Text variant="bodySm" color="textSecondary" align="center">
          {fr.tutor.voiceHint}
        </Text>
      </View>
    </PressableBase>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    paddingHorizontal: theme.layout.screenPadding,
  },
  bars: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.voice.barGap,
  },
  bar: { width: theme.voice.barWidth, borderRadius: theme.radius.full, overflow: 'hidden' },
  texts: { alignItems: 'center', gap: theme.space[3] },
});
