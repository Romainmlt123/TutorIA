import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Platform, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { WoodDialog } from '@/components/game/WoodDialog';
import { Parchment, WoodFrame } from '@/components/game/WoodFrame';
import { GradientSurface } from '@/components/GradientSurface';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { useStudentAccount } from '@/lib/session/SessionProvider';
import { SceneBoundary } from '@/lib/three/SceneBoundary';
import { useSceneActive } from '@/lib/three/useSceneActive';
import { canUseWebGL } from '@/lib/three/webgl';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import type { AvatarAnimation } from './avatar3d/Avatar3D';
import { AvatarPreview } from './avatar3d/AvatarPreview';
import { EditorControlView } from './components/EditorControlView';
import { useAvatarLook, useSaveAvatarLook } from './hooks/useAvatarLook';
import { useWardrobe } from './hooks/useWardrobe';
import { DEFAULT_LOOK, randomLook, type AvatarLook } from './logic/avatarLook';
import {
  EDITOR_CONTROLS,
  EDITOR_TABS,
  sameLook,
  starterLook,
  TAB_FRAMING,
  type EditorTab,
} from './logic/editor';
import { beginTurn, createTurn, dragTurn, faceFront } from './logic/preview';
import { wearable } from './logic/wardrobe';

const t = fr.avatar;
const noSubscription = () => () => undefined;
const SKY = explorerArt.post.natural.sky;
/** Marge haute sur le web, faute de zone sûre (celle des maquettes, comme Explorer). */
const WEB_TOP = 56;
/**
 * Rotation de la figurine au doigt : modifiée par le geste, lue à chaque image par l'aperçu. Un
 * objet de module (un seul éditeur à la fois), comme la rotation de l'île d'Explorer.
 */
const TURN = createTurn();
/** Durée des animations jouées en réaction : le saut (au hasard) et le salut (enregistré). */
const REACTION_MS: Record<AvatarAnimation, number> = {
  attente: 0,
  marche: 0,
  saut: 1200,
  salut: 1500,
};

/**
 * « Crée ton avatar », dans le style du HUD de jeu d'Explorer (ciel, boutons en relief, panneau de
 * bois) : la figurine en 3D en haut, qu'on tourne au doigt, et quatre onglets de réglages. Rien n'est gardé avant « Enregistrer » ; quitter avec des changements demande une
 * confirmation. `?premiere=1` : proposé à la première visite d'Explorer, avec « Plus tard ».
 */
export function AvatarEditorScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { premiere, onglet } = useLocalSearchParams<{ premiere?: string; onglet?: string }>();
  const student = useStudentAccount();
  const saved = useAvatarLook();
  const save = useSaveAvatarLook();
  const { owned } = useWardrobe();
  const screen = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const animated = !useReducedMotion();
  const active = useSceneActive();
  // Faux au rendu serveur (web) : pas de WebGL côté serveur, pas de décalage à l'hydratation.
  const webgl = useSyncExternalStore(noSubscription, canUseWebGL, () => false);

  // « Essayer » un objet gagné ouvre directement la tenue.
  const [tab, setTab] = useState<EditorTab>(onglet === 'tenue' ? 'tenue' : 'visage');
  const [edits, setEdits] = useState<AvatarLook | null>(null);
  const [animation, setAnimation] = useState<AvatarAnimation>('attente');
  const [message, setMessage] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const [leave, setLeave] = useState<(() => void) | null>(null);
  const allowLeave = useRef(false);

  const isNew = saved.data === null;
  // Un objet qui ne serait plus gagné (progression remise à zéro) est retiré de la tenue.
  const baseline = wearable(
    saved.data ?? (student ? starterLook(student.id) : DEFAULT_LOOK),
    owned,
  );
  const look = edits ?? baseline;
  const dirty = edits !== null && !sameLook(edits, baseline);

  // À chaque ouverture, la figurine se présente de face.
  useEffect(() => faceFront(TURN), []);

  // Quitter (retour, geste, bouton d'Android) avec des changements : on demande d'abord.
  useEffect(
    () =>
      navigation.addListener('beforeRemove', (event) => {
        if (!dirty || allowLeave.current) return;
        event.preventDefault();
        setLeave(() => () => {
          allowLeave.current = true;
          navigation.dispatch(event.data.action);
        });
      }),
    [navigation, dirty],
  );

  // Retour à l'écran d'avant, ou à l'accueil si l'éditeur a été ouvert directement par son adresse.
  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [router]);

  // Fermeture voulue (enregistré, « Plus tard ») : sans demander de confirmation.
  const close = useCallback(() => {
    allowLeave.current = true;
    goBack();
  }, [goBack]);

  // Le saut et le salut ne se jouent qu'une fois, puis la figurine revient à l'attente.
  useEffect(() => {
    const duration = REACTION_MS[animation];
    if (!duration) return;
    const timer = setTimeout(() => setAnimation('attente'), duration);
    return () => clearTimeout(timer);
  }, [animation]);

  // Après l'enregistrement, la figurine salue, puis l'éditeur se ferme.
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(close, animated && webgl ? REACTION_MS.salut : 0);
    return () => clearTimeout(timer);
  }, [closing, close, animated, webgl]);

  const changeTab = (next: EditorTab) => {
    setTab(next);
    // Pour régler le visage ou la coiffure, la figurine se remet de face.
    if (TAB_FRAMING[next] === 'face') faceFront(TURN);
  };

  const shuffle = () => {
    setEdits(randomLook(Math.floor(Math.random() * 2 ** 31)));
    if (animated) setAnimation('saut');
  };

  const submit = () => {
    setMessage(null);
    save.mutate(look, {
      onSuccess: () => {
        showNotice(t.saved);
        setEdits(null);
        setAnimation('salut');
        setClosing(true);
      },
      onError: (error) => {
        logError('avatar.save', error);
        setMessage(t.saveError);
      },
    });
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-6, 6])
    .onBegin(() => beginTurn(TURN))
    .onUpdate((event) => dragTurn(TURN, event.translationX));

  const stageHeight = Math.round(Math.min(330, Math.max(200, screen.height * 0.31)));
  const noPreview = (
    <View style={styles.noPreview}>
      <GameText size={15} align="center" stroke={2} drop={1}>
        {t.noPreview}
      </GameText>
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <GradientSurface
        gradient={{ colors: [SKY.top, SKY.middle, SKY.horizon], locations: [0, 0.55, 1] }}
        angle={180}
        radius={0}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.content,
          {
            paddingTop: Platform.OS === 'web' ? WEB_TOP : insets.top + theme.layout.screenTopGap,
            paddingBottom: insets.bottom + theme.space[4],
          },
        ]}>
        <View style={styles.header}>
          <GameButton
            tone="yellow"
            round
            size={48}
            icon="chevron-gauche"
            accessibilityLabel={fr.form.back}
            onPress={goBack}
          />
          <View style={styles.titles}>
            <GameText size={24} align="center" numberOfLines={1} accessibilityRole="header">
              {isNew ? t.createTitle : t.title}
            </GameText>
            {isNew ? (
              <GameText size={13} align="center" stroke={2} drop={1} numberOfLines={2}>
                {t.createLead}
              </GameText>
            ) : null}
          </View>
          <GameButton
            tone="green"
            round
            size={48}
            icon="de"
            accessibilityLabel={t.random}
            onPress={shuffle}
          />
        </View>
        {saved.isPending ? null : (
          <>
            <View style={{ height: stageHeight }}>
              {webgl ? (
                <SceneBoundary scope="avatar.editor" fallback={noPreview}>
                  <GestureDetector gesture={pan}>
                    <View
                      style={StyleSheet.absoluteFill}
                      collapsable={false}
                      accessible
                      accessibilityRole="image"
                      accessibilityLabel={t.preview}>
                      <AvatarPreview
                        look={look}
                        framing={TAB_FRAMING[tab]}
                        animation={animation}
                        animated={animated}
                        active={active}
                        turn={TURN}
                      />
                    </View>
                  </GestureDetector>
                </SceneBoundary>
              ) : (
                noPreview
              )}
            </View>
            <View role="tablist" accessibilityLabel={t.tabsLabel} style={styles.tabs}>
              {EDITOR_TABS.map((value) => (
                <GameButton
                  key={value}
                  tone={value === tab ? 'yellow' : 'blue'}
                  role="tab"
                  selected={value === tab}
                  size={40}
                  label={t.tabs[value]}
                  accessibilityLabel={t.tabs[value]}
                  onPress={() => changeTab(value)}
                  style={styles.tab}
                />
              ))}
            </View>
            <WoodFrame fill accessibilityLabel={t.tabs[tab]}>
              <ScrollView
                style={styles.controls}
                contentContainerStyle={styles.controlsContent}
                showsVerticalScrollIndicator={false}>
                {EDITOR_CONTROLS[tab].map((control) => (
                  <EditorControlView
                    key={control.id}
                    control={control}
                    look={look}
                    owned={owned}
                    onChange={setEdits}
                  />
                ))}
              </ScrollView>
            </WoodFrame>
            {message ? <Parchment>{message}</Parchment> : null}
            <View style={styles.footer}>
              {premiere && isNew ? (
                <GameButton
                  tone="yellow"
                  label={t.later}
                  accessibilityLabel={t.later}
                  onPress={close}
                  style={styles.footerButton}
                />
              ) : null}
              <GameButton
                tone="green"
                label={t.save}
                accessibilityLabel={t.save}
                onPress={submit}
                disabled={save.isPending || closing}
                style={styles.footerButton}
              />
            </View>
          </>
        )}
      </View>
      <WoodDialog
        visible={leave !== null}
        title={t.leaveTitle}
        body={t.leaveBody}
        primaryLabel={t.leaveCancel}
        onPrimary={() => setLeave(null)}
        secondaryLabel={t.leaveConfirm}
        onSecondary={() => {
          const go = leave;
          setLeave(null);
          go?.();
        }}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.bg },
  content: {
    flex: 1,
    gap: theme.space[3],
    paddingHorizontal: theme.layout.screenPadding,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  titles: { flex: 1 },
  noPreview: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.space[6],
  },
  tabs: { flexDirection: 'row', gap: theme.space[2] },
  tab: { flex: 1 },
  controls: { flex: 1 },
  controlsContent: {
    gap: theme.space[5],
    paddingTop: theme.space[1],
    paddingBottom: theme.space[2],
  },
  footer: { flexDirection: 'row', gap: theme.space[3] },
  footerButton: { flex: 1 },
});
