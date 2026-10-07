import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import { fr } from '@/i18n/fr';
import { useStudyRules } from '@/lib/session/useStudyRules';
import { useKeyboardVisible } from '@/lib/useKeyboardVisible';
import { theme } from '@/theme';

import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { OfflineBanner } from './components/OfflineBanner';
import { TipCard } from './components/TipCard';
import { TopicCard } from './components/TopicCard';
import { TutorHeader } from './components/TutorHeader';
import { TutorModeToggle } from './components/TutorModeToggle';
import { VisualChip } from './components/visual/VisualChip';
import { VisualModal } from './components/visual/VisualModal';
import { VisualPanel } from './components/visual/VisualPanel';
import { useTutorChat, type ChatMessage } from './hooks/useTutorChat';
import { useTutorTopic } from './hooks/useTutorTopic';
import { useVisualViewer } from './hooks/useVisualViewer';

/** 02A · Tuteur écrit (design/screens/02a-Tuteur-Ecrit.dc.html). */
export function WrittenTutorScreen() {
  const router = useRouter();
  const { topic, subjectName, chapterTitle, lessonLabel, isResume } = useTutorTopic();
  const { messages, pending, offline, visual, send, retry, report } = useTutorChat(topic, isResume);
  const keyboardVisible = useKeyboardVisible();
  const viewer = useVisualViewer(visual, keyboardVisible);
  const { bottom } = useBottomNavLayout();
  const voiceEnabled = useStudyRules().data?.voiceEnabled ?? true;
  const list = useRef<FlatList<ChatMessage>>(null);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.kind === 'tip') return <TipCard text={item.text} />;
    if (item.kind === 'student') return <ChatBubble role="student" text={item.text} />;
    const bubble = (
      <ChatBubble
        role="tutor"
        text={item.streaming && !item.text ? fr.tutor.typing : item.text}
        label={item.practice ? fr.tutor.practice : undefined}
        reported={item.reported}
        onLongPress={item.practice || item.streaming ? undefined : () => report(item.id)}
      />
    );
    const shown = item.visual;
    if (!shown) return bubble;
    // La réponse qui avait un visuel garde une pastille pour le revoir en grand.
    return (
      <View style={styles.withVisual}>
        {bubble}
        <VisualChip kind={shown.kind} onPress={() => viewer.expand(shown)} />
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <TutorHeader>
        {/* Tuteur vocal désactivé par un parent (P4) : pas de bascule vers le vocal. */}
        {voiceEnabled ? (
          <TutorModeToggle
            value="written"
            onChange={(mode) =>
              mode === 'voice' &&
              router.push({ pathname: '/tuteur/vocal', params: { chapter: topic.chapterId } })
            }
          />
        ) : null}
        <TopicCard
          subjectId={topic.subjectId}
          subjectName={subjectName}
          chapterTitle={chapterTitle}
          badge={{ kind: 'lesson', label: lessonLabel }}
        />
      </TutorHeader>

      {/* 2C et 2E : le dernier visuel du tuteur, replié tant que le clavier est ouvert. */}
      {visual ? (
        <View style={styles.visual}>
          <VisualPanel
            visual={visual}
            subjectId={topic.subjectId}
            open={viewer.open}
            onToggle={viewer.toggle}
            onExpand={() => viewer.expand(visual)}
          />
        </View>
      ) : null}

      {/* Android bord à bord : la fenêtre ne rétrécit plus avec le clavier, `padding` le compense. */}
      <KeyboardAvoidingView style={styles.body} behavior="padding">
        {offline ? (
          <View style={styles.banner}>
            <OfflineBanner onRetry={retry} />
          </View>
        ) : null}
        <FlatList
          ref={list}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={renderItem}
          accessibilityLabel={fr.tutor.conversationLabel}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
          // Le clavier réduit la liste : le dernier message reste en vue.
          onLayout={() => list.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
        <View
          style={[
            styles.input,
            {
              paddingBottom: keyboardVisible
                ? theme.space[3]
                : bottom + theme.navigation.height + theme.space[4],
            },
          ]}>
          <ChatInput onSend={send} disabled={pending} />
        </View>
      </KeyboardAvoidingView>
      <VisualModal visual={viewer.expanded} subjectId={topic.subjectId} onClose={viewer.close} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  body: { flex: 1 },
  banner: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.space[3] },
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: theme.space[3],
    paddingHorizontal: theme.layout.screenPadding,
    paddingTop: theme.space[4],
    paddingBottom: theme.space[5],
  },
  input: { paddingHorizontal: theme.layout.screenPadding },
  visual: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.space[3] },
  withVisual: { gap: theme.space[2] },
});
