import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubjectTile } from '@/components/subject/SubjectTile';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { useStudyRules } from '@/lib/session/useStudyRules';
import type { TutorVisual } from '@/services/tutor/visuals';
import { angleToPoints, theme } from '@/theme';

import { CallDock } from './components/call/CallDock';
import { CallTopBar } from './components/call/CallTopBar';
import { LiveCaptions } from './components/call/LiveCaptions';
import { VoiceAvatar } from './components/call/VoiceAvatar';
import { VoiceStatus } from './components/call/VoiceStatus';
import { VisualModal } from './components/visual/VisualModal';
import { CallVisualCard } from './components/visual/VisualPanel';
import { useCallVisualSync } from './hooks/useCallVisualSync';
import { useSpokenCaption } from './hooks/useSpokenCaption';
import { useTopicLabels, useTopicParams } from './hooks/useTutorTopic';
import { useVoiceCall } from './hooks/useVoiceCall';
import { callStateOf } from './logic/callState';
import { formatCallTime } from './logic/voice';

/** Marge haute sur le web : celle des maquettes (56 px), faute de zone sûre. */
const WEB_TOP = 56;
const background = theme.voiceCall.background;
const { start, end } = angleToPoints(theme.voiceCall.angle);

/**
 * 02B · Tuteur vocal (design/screens/02b-Tuteur-Vocal.dc.html, v2.6) : un écran d'appel plein
 * écran, sans barre de navigation. Le logo du tuteur rebondit quand il parle, la pastille dit qui a
 * la parole, les sous-titres suivent la voix. Avec un visuel (2D, 2F), la carte prend la moitié
 * haute et avance avec la voix.
 */
export function VoiceTutorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topic = useTopicParams();
  const { subjectName, chapterTitle } = useTopicLabels(topic);
  const cameraEnabled = useStudyRules().data?.cameraEnabled ?? true;
  const backToWritten = () =>
    router.canGoBack()
      ? router.back()
      : router.replace({
          pathname: '/tuteur',
          params: {
            ...(topic.subjectId ? { subject: topic.subjectId } : {}),
            ...(topic.chapterId ? { chapter: topic.chapterId } : {}),
          },
        });
  const call = useVoiceCall(topic, backToWritten);
  const state = callStateOf(call.status);
  const spoken = useSpokenCaption(call.caption, state === 'speaking');
  // La courbe s'allume quand sa couleur est prononcée, pas quand elle est écrite.
  const said =
    call.caption && spoken !== undefined
      ? { ...call.caption, text: call.caption.text.slice(0, spoken) }
      : call.caption;
  const { focus, progress } = useCallVisualSync(call.visual, said, state === 'speaking');
  const [expanded, setExpanded] = useState<TutorVisual | null>(null);
  const visual = call.visual;

  // Micro coupé quand c'est à l'élève : les sous-titres l'invitent à le réactiver.
  const notice = call.notice ?? (state === 'muted' ? fr.tutor.call.mutedHint : undefined);

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[background.colors[0]!, background.colors[1]!, ...background.colors.slice(2)]}
        locations={[
          background.locations[0]!,
          background.locations[1]!,
          ...background.locations.slice(2),
        ]}
        start={start}
        end={end}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.space[3],
            paddingBottom: insets.bottom + theme.space[6],
          },
        ]}>
        <CallTopBar
          elapsed={formatCallTime(call.elapsed)}
          live={state !== 'ended' && state !== 'error'}
          onWritten={call.hangUp}
        />

        {visual ? (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.visual}>
            <CallVisualCard
              visual={visual}
              subjectId={topic.subjectId}
              focus={focus}
              progress={progress}
              onExpand={() => setExpanded(visual)}
            />
          </Animated.View>
        ) : (
          <View
            accessible
            accessibilityLabel={`${fr.tutor.topicLabel} : ${subjectName}, ${chapterTitle}`}
            style={styles.subject}>
            <View style={styles.subjectLine}>
              <SubjectTile subjectId={topic.subjectId} size={24} />
              <Text variant="overline" weight="bold" color="textOnColor">
                {subjectName}
              </Text>
            </View>
            <Text variant="h3" weight="black" color="textOnColor" style={styles.center}>
              {chapterTitle}
            </Text>
          </View>
        )}

        <Animated.View layout={LinearTransition.duration(300)} style={styles.middle}>
          <VoiceAvatar
            state={state}
            level={call.level}
            compact={!!visual}
            onInterrupt={call.interrupt}
            onReport={call.report}
          />
          <VoiceStatus state={state} size={visual ? 'sm' : 'md'} />
          <View style={[styles.captions, visual ? styles.captionsCompact : null]}>
            {call.captionsOn || notice ? (
              <LiveCaptions
                caption={call.caption}
                compact={!!visual}
                notice={notice}
                spoken={spoken}
              />
            ) : null}
          </View>
        </Animated.View>

        <CallDock
          muted={call.muted}
          captionsOn={call.captionsOn}
          cameraActive={call.cameraActive}
          cameraVisible={cameraEnabled}
          onToggleMute={call.toggleMute}
          onToggleCaptions={call.toggleCaptions}
          onCamera={call.sendPhoto}
          onHangUp={call.hangUp}
        />
      </View>
      <VisualModal
        visual={expanded}
        subjectId={topic.subjectId}
        onClose={() => setExpanded(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.voiceCall.background.colors[2] },
  content: { flex: 1, paddingHorizontal: theme.layout.screenPadding, gap: theme.space[4] },
  subject: { alignItems: 'center', gap: theme.space[1], marginTop: theme.space[5] },
  subjectLine: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  center: { textAlign: 'center' },
  visual: { marginTop: theme.space[2] },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: theme.space[4] },
  captions: { alignSelf: 'stretch', minHeight: 120, paddingHorizontal: theme.space[2] },
  captionsCompact: { minHeight: 48, paddingHorizontal: theme.space[1] },
});
