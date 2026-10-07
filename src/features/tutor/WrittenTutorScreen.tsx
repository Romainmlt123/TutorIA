import { useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { useBottomNavLayout } from '@/components/navigation/useBottomNavLayout';
import { Text } from '@/components/Text';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { useStudyRules } from '@/lib/session/useStudyRules';
import { useKeyboardVisible } from '@/lib/useKeyboardVisible';
import { theme } from '@/theme';

import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import { ChatStarters } from './components/ChatStarters';
import { ConversationDrawer } from './components/ConversationDrawer';
import { OfflineBanner } from './components/OfflineBanner';
import { TipCard } from './components/TipCard';
import { TopicCard } from './components/TopicCard';
import { TutorHeader } from './components/TutorHeader';
import { TutorModeToggle } from './components/TutorModeToggle';
import { VisualChip } from './components/visual/VisualChip';
import { VisualModal } from './components/visual/VisualModal';
import { VisualPanel } from './components/visual/VisualPanel';
import {
  conversationKeys,
  useConversationList,
  useConversationMessages,
} from './hooks/useConversations';
import { useTutorChat, type ChatMessage } from './hooks/useTutorChat';
import { useTopicLabels, useTopicParams } from './hooks/useTutorTopic';
import { useVisualViewer } from './hooks/useVisualViewer';
import { entryOfParams, storedEntry, type ChatEntry } from './logic/conversations';

const T = fr.tutor.chat;

type ChatProps = {
  entry: ChatEntry;
  resume?: { conversationId: string; messages: readonly ChatMessage[] };
  onConversation: (conversationId: string) => void;
  onTitle: (title: string, subjectId?: SubjectId) => void;
};

/** Une discussion : sujet, dernier visuel, messages et champ de saisie. */
function TutorChat({ entry, resume, onConversation, onTitle }: ChatProps) {
  const { topic } = entry;
  const { messages, pending, offline, visual, send, retry, report } = useTutorChat({
    topic,
    resume,
    onConversation,
    onTitle,
  });
  const labels = useTopicLabels(topic, entry.title);
  const keyboardVisible = useKeyboardVisible();
  const viewer = useVisualViewer(visual, keyboardVisible);
  const { bottom } = useBottomNavLayout();
  const list = useRef<FlatList<ChatMessage>>(null);
  // Avant le premier message d'une discussion libre : des idées de départ.
  const fresh = !topic.chapterId && !messages.some((m) => m.kind === 'student');

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

  // Sans conteneur : la zone qui évite le clavier doit être un enfant direct de l'écran, car elle
  // mesure sa position par rapport à son parent (un parent sous l'en-tête la ferait passer sous le
  // clavier).
  return (
    <>
      <View style={styles.topic}>
        <TopicCard
          subjectId={topic.subjectId}
          subjectName={labels.subjectName}
          chapterTitle={labels.chapterTitle}
          badge={labels.lessonLabel ? { kind: 'lesson', label: labels.lessonLabel } : undefined}
        />
      </View>

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
        {/* Suggestions de départ, juste au-dessus de la saisie (visibles clavier ouvert). */}
        {fresh ? (
          <View style={styles.starters}>
            <ChatStarters onPick={send} />
          </View>
        ) : null}
        <View
          style={[
            styles.input,
            {
              paddingBottom: keyboardVisible
                ? theme.space[3]
                : bottom + theme.navigation.height + theme.space[4],
            },
          ]}>
          <ChatInput
            onSend={send}
            disabled={pending}
            placeholder={topic.chapterId ? undefined : fr.tutor.freeInputPlaceholder}
          />
        </View>
      </KeyboardAvoidingView>
      <VisualModal visual={viewer.expanded} subjectId={topic.subjectId} onClose={viewer.close} />
    </>
  );
}

/** Discussion enregistrée : ses messages sont relus avant de l'afficher. */
function StoredChat(props: Omit<ChatProps, 'resume'> & { onRetry: () => void }) {
  const { entry, onRetry } = props;
  const messages = useConversationMessages(entry.conversationId);
  if (messages.data && entry.conversationId) {
    return (
      <TutorChat
        {...props}
        resume={{ conversationId: entry.conversationId, messages: messages.data }}
      />
    );
  }
  return (
    <View style={styles.notice}>
      <Text variant="lead" color="textSecondary" style={styles.noticeText}>
        {messages.isError ? T.openError : T.loading}
      </Text>
      {messages.isError ? <Button label={fr.tutor.retry} variant="soft" onPress={onRetry} /> : null}
    </View>
  );
}

/** Discussion demandée par l'adresse (`?chapter=…`, `?subject=…`, `?reprendre=1`). */
function useChatEntry() {
  const { reprendre } = useLocalSearchParams<{ reprendre?: string }>();
  const topic = useTopicParams();
  const list = useConversationList();
  const conversations = list.isError ? [] : list.data;
  const request = JSON.stringify([reprendre, topic]);
  const [state, setState] = useState<{ request: string; entry: ChatEntry | null }>({
    request,
    entry: null,
  });
  // Nouvelle adresse : nouvelle discussion (« Reprendre » attend la liste du volet).
  if (state.request !== request) setState({ request, entry: null });
  else if (!state.entry) {
    const entry = entryOfParams(reprendre === '1', topic, conversations);
    if (entry) setState({ request, entry });
  }
  /** Une discussion à la place de la discussion affichée, ou une modification de celle-ci. */
  const setEntry = (change: ChatEntry | ((entry: ChatEntry) => ChatEntry)) =>
    setState((s) =>
      typeof change !== 'function'
        ? { ...s, entry: change }
        : s.entry
          ? { ...s, entry: change(s.entry) }
          : s,
    );
  return { entry: state.entry, setEntry };
}

/**
 * 02A · Tuteur écrit (design/screens/02a-Tuteur-Ecrit.dc.html), en chat libre : un volet garde les
 * discussions, et une nouvelle discussion peut porter sur une matière ou sur toutes.
 */
export function WrittenTutorScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const voiceEnabled = useStudyRules().data?.voiceEnabled ?? true;
  const { entry, setEntry } = useChatEntry();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const newCount = useRef(0);

  const refreshList = () => void queryClient.invalidateQueries({ queryKey: conversationKeys.list });
  const startNew = () => {
    setEntry({ key: `fresh:${++newCount.current}`, topic: {}, stored: false });
    setDrawerOpen(false);
  };
  const chatProps = entry
    ? {
        entry,
        onConversation: (conversationId: string) => {
          setEntry((e) => ({ ...e, conversationId }));
          refreshList();
        },
        // Le titre arrive avec la matière reconnue par le serveur : la carte prend sa couleur.
        onTitle: (title: string, subjectId?: SubjectId) => {
          setEntry((e) => ({
            ...e,
            title,
            topic: subjectId && !e.topic.subjectId ? { ...e.topic, subjectId } : e.topic,
          }));
          refreshList();
        },
      }
    : null;

  const openVoice = () => {
    const topic = entry?.topic ?? {};
    router.push({
      pathname: '/tuteur/vocal',
      params: {
        ...(topic.subjectId ? { subject: topic.subjectId } : {}),
        ...(topic.chapterId ? { chapter: topic.chapterId } : {}),
      },
    });
  };

  return (
    <View style={styles.screen}>
      <TutorHeader>
        <View style={styles.headerRow}>
          <IconButton
            icon="menu"
            accessibilityLabel={T.openHistory}
            onPress={() => setDrawerOpen(true)}
          />
          {/* Tuteur vocal désactivé par un parent (P4) : pas de bascule vers le vocal. */}
          {voiceEnabled ? (
            <TutorModeToggle value="written" onChange={(mode) => mode === 'voice' && openVoice()} />
          ) : null}
          <IconButton icon="plus" accessibilityLabel={T.newChat} onPress={startNew} />
        </View>
      </TutorHeader>

      {chatProps ? (
        chatProps.entry.stored ? (
          <StoredChat
            key={chatProps.entry.key}
            {...chatProps}
            onRetry={() =>
              void queryClient.refetchQueries({
                queryKey: conversationKeys.messages(chatProps.entry.conversationId ?? ''),
              })
            }
          />
        ) : (
          <TutorChat key={chatProps.entry.key} {...chatProps} />
        )
      ) : (
        <View style={styles.notice}>
          <Text variant="lead" color="textSecondary" style={styles.noticeText}>
            {T.loading}
          </Text>
        </View>
      )}

      <ConversationDrawer
        visible={drawerOpen}
        activeId={entry?.conversationId}
        onClose={() => setDrawerOpen(false)}
        onNew={startNew}
        onOpen={(conversation) => {
          if (conversation.id !== entry?.conversationId) setEntry(storedEntry(conversation));
          setDrawerOpen(false);
        }}
        onDeleted={(conversationId) => {
          if (conversationId === entry?.conversationId) startNew();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  headerRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: { flex: 1 },
  topic: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.space[3] },
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
  starters: { paddingBottom: theme.space[2] },
  visual: { paddingHorizontal: theme.layout.screenPadding, paddingTop: theme.space[3] },
  withVisual: { gap: theme.space[2] },
  notice: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[4],
    paddingHorizontal: theme.layout.screenPadding,
  },
  noticeText: { textAlign: 'center' },
});
