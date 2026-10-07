import { useQueryClient } from '@tanstack/react-query';
import { Redirect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/game/GameButton';
import { WoodDialog } from '@/components/game/WoodDialog';
import { GradientSurface } from '@/components/GradientSurface';
import { ChatBubble } from '@/features/tutor/components/ChatBubble';
import { CallControls } from '@/features/tutor/components/CallControls';
import { ChatInput } from '@/features/tutor/components/ChatInput';
import { OfflineBanner } from '@/features/tutor/components/OfflineBanner';
import { TipCard } from '@/features/tutor/components/TipCard';
import { VoiceVisualizer } from '@/features/tutor/components/VoiceVisualizer';
import {
  useTutorChat,
  type ChatMessage,
  type LevelChat,
} from '@/features/tutor/hooks/useTutorChat';
import { useVoiceCall } from '@/features/tutor/hooks/useVoiceCall';
import { formatCallTime } from '@/features/tutor/logic/voice';
import { fr } from '@/i18n/fr';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { studentKeys } from '@/lib/session/useStudentOverview';
import { useStudyRules } from '@/lib/session/useStudyRules';
import { tutorService, type TutorTopic } from '@/services/tutor';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { LevelHeader } from './components/level/LevelHeader';
import { LevelResultPanel } from './components/level/LevelResultPanel';
import { LevelStepCard } from './components/level/LevelStepCard';
import { levelById, type Level, type LevelPlace } from './content';
import { explorerKeys } from './hooks/useExplorer';
import { reviewLessonOf } from './logic/levelSheet';

const SKY = explorerArt.post.natural.sky;
const T = fr.explorer.level;
/** Marge du haut sur le web (pas de zone sûre). */
const WEB_TOP = 56;

/** Retour à la carte, ou à l'onglet Explorer si le niveau a été ouvert directement par son adresse. */
function useBackToMap() {
  const router = useRouter();
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/explorer');
  }, [router]);
}

function topicOf({ island, city, level }: LevelPlace): TutorTopic {
  return { subjectId: island.subjectId, chapterId: city.id, levelId: level.id };
}

/**
 * Fond de ciel et marges des écrans d'un niveau. Le clavier remonte la saisie : sur Android, l'app
 * est affichée bord à bord et la fenêtre ne rétrécit plus quand il sort. `padding` ne compte que la
 * partie de l'écran réellement cachée par le clavier, sur les deux systèmes.
 */
function LevelBackdrop({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.layout.screenTopGap,
          paddingBottom: insets.bottom + theme.space[3],
        },
      ]}>
      <GradientSurface
        gradient={{ colors: [SKY.top, SKY.middle, SKY.horizon], locations: [0, 0.55, 1] }}
        angle={180}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView style={styles.content} behavior="padding">
        {children}
      </KeyboardAvoidingView>
    </View>
  );
}

/**
 * X4b · une leçon à la voix : le tuteur la mène étape par étape, mais à l'oral rien n'est jugé
 * (l'appel compte comme une séance, sans étoiles ni validation). Raccrocher ramène à la carte.
 */
function LevelVoiceView({ place }: { place: LevelPlace }) {
  const backToMap = useBackToMap();
  const topic = useMemo(() => topicOf(place), [place]);
  const cameraEnabled = useStudyRules().data?.cameraEnabled ?? true;
  const call = useVoiceCall(topic, backToMap);
  return (
    <LevelBackdrop>
      <LevelHeader
        place={place}
        done={0}
        callTime={formatCallTime(call.elapsed)}
        onBack={call.hangUp}
      />
      <View style={styles.panel}>
        <VoiceVisualizer
          status={call.status}
          notice={call.notice}
          onInterrupt={call.interrupt}
          onLongPress={call.report}
        />
        <View style={styles.controls}>
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
    </LevelBackdrop>
  );
}

/** X4 et X5 · la discussion écrite d'un niveau, puis son bilan, par-dessus la carte de la région. */
function LevelChatView({ place }: { place: LevelPlace }) {
  const router = useRouter();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const firstName = useStudentAccount()?.firstName ?? '';
  const backToMap = useBackToMap();
  const { level } = place;
  const topic = useMemo(() => topicOf(place), [place]);
  const chat = useMemo<LevelChat>(
    () => ({
      opening: T.opening[level.type](level.title, level.steps),
      stepCard: level.type === 'lecon' ? T.stepDone : undefined,
    }),
    [level],
  );
  const { messages, pending, offline, progress, result, send, retry, report } = useTutorChat(
    topic,
    false,
    tutorService,
    chat,
  );
  const list = useRef<FlatList<ChatMessage>>(null);
  const started = messages.some((m) => m.kind === 'student');

  // Le bilan change la carte (pion, étoiles, villes) et l'XP de l'élève.
  useEffect(() => {
    if (!result) return;
    void queryClient.invalidateQueries({ queryKey: explorerKeys.records });
    void queryClient.invalidateQueries({ queryKey: studentKeys.overview });
  }, [result, queryClient]);

  // Quitter une partie commencée et pas finie : on demande d'abord (elle ne sera pas gardée).
  const [leave, setLeave] = useState<(() => void) | null>(null);
  const allowLeave = useRef(false);
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (!started || result || allowLeave.current) return;
        event.preventDefault();
        setLeave(() => () => {
          allowLeave.current = true;
          navigation.dispatch(event.data.action);
        });
      }),
    [navigation, started, result],
  );

  const review = useMemo(() => (result?.passed ? null : reviewLessonOf(level.id)), [result, level]);
  const openReview = (lesson: Level) => {
    allowLeave.current = true;
    router.replace({ pathname: '/niveau', params: { id: lesson.id, mode: 'ecrit' } });
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    if (item.kind === 'step') return <LevelStepCard text={item.text} />;
    if (item.kind === 'tip') return <TipCard text={item.text} />;
    if (item.kind === 'student') return <ChatBubble role="student" text={item.text} />;
    return (
      <ChatBubble
        role="tutor"
        text={item.streaming && !item.text ? fr.tutor.typing : item.text}
        label={item.practice ? fr.tutor.practice : undefined}
        reported={item.reported}
        onLongPress={item.practice || item.streaming ? undefined : () => report(item.id)}
      />
    );
  };

  return (
    <>
      <LevelBackdrop>
        <LevelHeader place={place} done={progress?.done ?? 0} onBack={backToMap} />
        <View style={styles.chat}>
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
          <View style={styles.input}>
            {!started && !pending ? (
              <GameButton
                tone="green"
                label={T.go}
                accessibilityLabel={T.go}
                size={48}
                onPress={() => void send(T.go)}
              />
            ) : null}
            <ChatInput onSend={send} disabled={pending || result !== null} />
          </View>
        </View>
      </LevelBackdrop>
      {result ? (
        <LevelResultPanel
          level={level}
          outcome={result}
          firstName={firstName}
          review={review}
          onContinue={backToMap}
          onReview={openReview}
        />
      ) : null}
      <WoodDialog
        visible={leave !== null}
        title={T.leave.title}
        body={level.type === 'evaluation' ? T.leave.evaluationBody : T.leave.body}
        primaryLabel={T.leave.stay}
        onPrimary={() => setLeave(null)}
        secondaryLabel={T.leave.leave}
        onSecondary={() => {
          const go = leave;
          setLeave(null);
          go?.();
        }}
      />
    </>
  );
}

/** Route `/niveau?id=<ville>.<niveau>` : un niveau inconnu ramène à l'onglet Explorer. */
export function LevelScreen() {
  const { id, mode } = useLocalSearchParams<{ id?: string; mode?: string }>();
  const place = id ? levelById(id) : undefined;
  const voiceEnabled = useStudyRules().data?.voiceEnabled ?? true;
  if (!place?.city.playable) return <Redirect href="/explorer" />;
  // À la voix : une leçon seulement, et si le parent a laissé le vocal activé.
  if (mode === 'voix' && place.level.type === 'lecon' && voiceEnabled) {
    return <LevelVoiceView key={place.level.id} place={place} />;
  }
  // Une clé par niveau : « Revoir la notion » repart d'une discussion neuve.
  return <LevelChatView key={place.level.id} place={place} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    flex: 1,
    gap: theme.space[3],
    paddingHorizontal: theme.layout.screenPadding,
  },
  chat: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: theme.radius['3xl'],
    borderWidth: 3,
    borderColor: explorerArt.hud.ink,
    backgroundColor: theme.colors.bg,
  },
  panel: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: theme.radius['3xl'],
    borderWidth: 3,
    borderColor: explorerArt.hud.ink,
    backgroundColor: theme.colors.bg,
  },
  controls: { paddingBottom: theme.space[4] },
  banner: { paddingHorizontal: theme.space[4], paddingTop: theme.space[3] },
  messages: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: theme.space[3],
    paddingHorizontal: theme.space[4],
    paddingTop: theme.space[4],
    paddingBottom: theme.space[3],
  },
  input: {
    gap: theme.space[2],
    paddingHorizontal: theme.space[3],
    paddingBottom: theme.space[3],
  },
});
