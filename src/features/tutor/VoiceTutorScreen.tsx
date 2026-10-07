import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import { useStudyRules } from '@/lib/session/useStudyRules';
import { theme } from '@/theme';

import { CallControls } from './components/CallControls';
import { TopicCard } from './components/TopicCard';
import { TutorHeader } from './components/TutorHeader';
import { TutorModeToggle } from './components/TutorModeToggle';
import { VoiceVisualizer } from './components/VoiceVisualizer';
import { useTopicLabels, useTopicParams } from './hooks/useTutorTopic';
import { useVoiceCall } from './hooks/useVoiceCall';
import { formatCallTime } from './logic/voice';

/** 02B · Tuteur vocal (design/screens/02b-Tuteur-Vocal.dc.html). La barre de navigation reste visible. */
export function VoiceTutorScreen() {
  const router = useRouter();
  const topic = useTopicParams();
  const { subjectName, chapterTitle } = useTopicLabels(topic);
  const { clearance } = useBottomNavLayout();
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

  return (
    <View style={styles.screen}>
      <TutorHeader>
        <TutorModeToggle value="voice" onChange={(mode) => mode === 'written' && call.hangUp()} />
        <TopicCard
          subjectId={topic.subjectId}
          subjectName={subjectName}
          chapterTitle={chapterTitle}
          badge={{ kind: 'timer', label: formatCallTime(call.elapsed) }}
        />
      </TutorHeader>
      <VoiceVisualizer
        status={call.status}
        notice={call.notice}
        onInterrupt={call.interrupt}
        onLongPress={call.report}
      />
      <View style={{ paddingBottom: clearance }}>
        <CallControls
          muted={call.muted}
          cameraActive={call.cameraActive}
          cameraVisible={cameraEnabled}
          onToggleMute={call.toggleMute}
          onHangUp={call.hangUp}
          onCamera={call.sendPhoto}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
});
