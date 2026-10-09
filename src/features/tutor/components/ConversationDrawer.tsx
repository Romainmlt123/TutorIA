import { useState } from 'react';
import { Modal, SectionList, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { IconButton } from '@/components/IconButton';
import { PressableBase } from '@/components/PressableBase';
import { SubjectTile } from '@/components/subject/SubjectTile';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import type { ConversationSummary } from '@/services/conversations';
import { ScreenBand } from '@/components/ScreenBand';
import { extras, theme } from '@/theme';

import { useConversationList, useDeleteConversation } from '../hooks/useConversations';
import { subjectNameOf } from '../hooks/useTutorTopic';
import { groupConversations } from '../logic/conversations';

const T = fr.tutor.chat;
/** Largeur du volet : il laisse voir la discussion à droite, comme un tiroir. */
const MAX_WIDTH = 340;

type Props = {
  visible: boolean;
  /** Discussion affichée à l'écran, mise en avant dans la liste. */
  activeId: string | undefined;
  onClose: () => void;
  onOpen: (conversation: ConversationSummary) => void;
  onNew: () => void;
  /** Une discussion vient d'être supprimée (l'écran en ouvre une nouvelle si c'était la sienne). */
  onDeleted: (conversationId: string) => void;
};

function ConversationRow({
  conversation,
  active,
  onPress,
  onDelete,
}: {
  conversation: ConversationSummary;
  active: boolean;
  onPress: () => void;
  onDelete: () => void;
}) {
  const title = conversation.title ?? T.newChat;
  const subject = subjectNameOf(conversation.subjectId ?? undefined);
  return (
    <PressableBase
      onPress={onPress}
      onLongPress={onDelete}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${subject}${active ? `, ${T.current}` : ''}`}
      accessibilityHint={T.deleteHint}
      accessibilityActions={[{ name: 'delete', label: T.deleteAction }]}
      onAccessibilityAction={(event) => event.nativeEvent.actionName === 'delete' && onDelete()}
      aria-selected={active}
      style={({ pressed }) => [
        styles.row,
        active && styles.rowActive,
        pressed && !active && styles.rowPressed,
      ]}>
      <SubjectTile subjectId={conversation.subjectId ?? undefined} size={40} />
      <View style={styles.rowTexts}>
        <Text variant="body" weight="bold" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color="textSecondary" numberOfLines={1}>
          {subject}
        </Text>
      </View>
    </PressableBase>
  );
}

/**
 * Volet des discussions libres, qui glisse depuis la gauche comme sur ChatGPT : nouvelle
 * discussion, discussions rangées par jour, appui long pour en supprimer une.
 */
export function ConversationDrawer({
  visible,
  activeId,
  onClose,
  onOpen,
  onNew,
  onDeleted,
}: Props) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const list = useConversationList();
  const remove = useDeleteConversation();
  const [target, setTarget] = useState<ConversationSummary | null>(null);
  const sections = groupConversations(list.data ?? [], new Date()).map((g) => ({
    title: T.groups[g.group],
    data: g.conversations,
  }));

  const confirmDelete = () => {
    if (!target) return;
    remove.mutate(target.id, {
      onSuccess: () => onDeleted(target.id),
      onSettled: () => setTarget(null),
    });
  };

  const notice = list.isError
    ? T.listError
    : list.isPending
      ? null
      : sections.length === 0
        ? T.empty
        : null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <PressableBase
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={T.close}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View
          entering={SlideInLeft.duration(220)}
          role="dialog"
          accessibilityLabel={T.drawerTitle}
          style={[
            styles.panel,
            { width: Math.min(MAX_WIDTH, width * 0.86), paddingBottom: insets.bottom },
          ]}>
          {/* Bandeau de marque bleu (v2.5), sans carte qui déborde dessus. */}
          <ScreenBand tone="student" overlap={0} accessibilityLabel={T.drawerTitle}>
            <View style={styles.header}>
              <Text variant="title" color="textOnColor" accessibilityRole="header">
                {T.drawerTitle}
              </Text>
              <IconButton icon="croix" onBand accessibilityLabel={T.close} onPress={onClose} />
            </View>
            <Button label={T.newChat} icon="plus" variant="white" onPress={onNew} />
          </ScreenBand>
          {remove.isError ? (
            <Text variant="bodySm" color="error" style={styles.notice}>
              {T.deleteError}
            </Text>
          ) : null}
          {notice ? (
            <Text variant="bodySm" color="textSecondary" style={styles.notice}>
              {notice}
            </Text>
          ) : null}
          <SectionList
            sections={sections}
            keyExtractor={(c) => c.id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
              <Text
                variant="overline"
                color="textSecondary"
                accessibilityRole="header"
                style={styles.group}>
                {section.title}
              </Text>
            )}
            renderItem={({ item }) => (
              <ConversationRow
                conversation={item}
                active={item.id === activeId}
                onPress={() => onOpen(item)}
                onDelete={() => setTarget(item)}
              />
            )}
          />
        </Animated.View>
      </View>
      <ConfirmDialog
        visible={!!target}
        title={T.deleteTitle}
        body={T.deleteBody}
        confirmLabel={T.deleteConfirm}
        cancelLabel={T.deleteCancel}
        busy={remove.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: extras.backdrop },
  panel: {
    flex: 1,
    gap: theme.space[3],
    overflow: 'hidden',
    backgroundColor: theme.colors.bg,
    borderTopRightRadius: theme.radius['3xl'],
    borderBottomRightRadius: theme.radius['3xl'],
    boxShadow: theme.shadow.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  notice: { paddingHorizontal: theme.space[4] },
  list: { paddingHorizontal: theme.space[2], paddingBottom: theme.space[4] },
  group: {
    paddingHorizontal: theme.space[2],
    paddingTop: theme.space[4],
    paddingBottom: theme.space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    minHeight: theme.space[12] + theme.space[2],
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius['2xl'],
  },
  rowActive: { backgroundColor: theme.spaces.student.soft },
  rowPressed: { backgroundColor: theme.colors.surface },
  rowTexts: { flex: 1 },
});
