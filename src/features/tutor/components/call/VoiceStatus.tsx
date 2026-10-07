import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { extras, theme } from '@/theme';

import type { CallState } from '../../logic/callState';

const T = fr.tutor.call.status;

const ICON: Record<CallState, IconName> = {
  connecting: 'points',
  speaking: 'haut-parleur',
  listening: 'micro',
  muted: 'micro-barre',
  ended: 'combine',
  error: 'alerte',
};

type Props = { state: CallState; size?: 'md' | 'sm' };

/**
 * Pastille d'état de l'appel (VoiceStatus) : verte « Je t'explique… » quand le tuteur parle, rouge
 * « Je t'écoute… » quand c'est à l'élève (un voyant d'écoute, jamais une erreur), sinon neutre.
 * Annoncée aux lecteurs d'écran.
 */
export function VoiceStatus({ state, size = 'md' }: Props) {
  const height = size === 'md' ? 40 : 32;
  const label = (
    <>
      <Icon name={ICON[state]} size={18} color={theme.colors.textOnColor} strokeWidth={2} />
      <Text variant="lead" weight="bold" color="textOnColor">
        {T[state]}
      </Text>
    </>
  );
  const colored = state === 'speaking' || state === 'listening';
  return (
    <View accessible accessibilityLiveRegion="polite" accessibilityLabel={T[state]}>
      {colored ? (
        <GradientSurface
          gradient={
            state === 'speaking'
              ? theme.voiceCall.status.speaking
              : theme.voiceCall.status.listening
          }
          radius={theme.radius.full}
          shadow={state === 'speaking' ? extras.call.speakingGlow : extras.call.listeningGlow}
          contentStyle={[styles.pill, styles.ring, { height }]}>
          {label}
        </GradientSurface>
      ) : (
        <View style={[styles.pill, styles.neutral, { height }]}>{label}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingLeft: 14,
    paddingRight: 18,
    borderRadius: theme.radius.full,
  },
  ring: { borderWidth: 1, borderColor: extras.call.statusRing },
  neutral: { backgroundColor: theme.voiceCall.status.neutral },
});
