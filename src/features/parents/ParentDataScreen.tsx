import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormMessage } from '@/components/form/FormMessage';
import { Icon } from '@/components/Icon';
import { IconButton } from '@/components/IconButton';
import { PrivacyCard } from '@/components/PrivacyCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { authErrorMessage } from '@/features/auth/logic/errors';
import { fr } from '@/i18n/fr';
import { deliverJsonFile } from '@/lib/exportFile';
import { showNotice } from '@/lib/notice';
import { authService } from '@/services/auth';
import { familyService, type LinkedChild } from '@/services/family';
import { liftShadow, theme } from '@/theme';

import { ChildDataCard } from './components/ChildDataCard';
import { ParentBand } from './components/ParentBand';
import { familyKeys } from './hooks/useFamily';
import { useSelectedChild } from './hooks/useSelectedChild';

const t = fr.parent.data;

type Pending = { kind: 'unlink' | 'delete'; child: LinkedChild };

/** Les cartes montent de 48 px sur le bandeau violet (D3). */
const DATA_OVERLAP = 48;

/**
 * D3 · Données personnelles (RGPD, v2.16) : ce que Tutor'IA garde, l'export des données du parent,
 * puis une carte par enfant : retrait du lien et, pour le parent qui a validé le compte d'un enfant
 * de moins de 15 ans, suppression de ce compte (D4, une seule confirmation avec une case).
 */
export function ParentDataScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { children } = useSelectedChild();
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const exportMine = async () => {
    setMessage(null);
    try {
      const file = await authService.exportData();
      await deliverJsonFile(file.fileName, file.json);
      showNotice(t.exported);
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    }
  };

  const confirm = async () => {
    if (!pending) return;
    setBusy(true);
    setMessage(null);
    try {
      if (pending.kind === 'unlink') await familyService.unlink(pending.child.id);
      else await familyService.deleteChildAccount(pending.child.id);
      await queryClient.invalidateQueries({ queryKey: familyKeys.children });
      setPending(null);
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    } finally {
      setBusy(false);
    }
  };

  const name = pending?.child.firstName ?? '';
  return (
    <ScreenContainer
      withNav={false}
      contentStyle={styles.content}
      bandOverlap={DATA_OVERLAP}
      band={
        <ParentBand
          pills="standard"
          overlap={DATA_OVERLAP}
          top={
            <View style={styles.top}>
              <IconButton
                icon="chevron-gauche"
                iconSize={22}
                onBand
                accessibilityLabel={fr.form.back}
                onPress={() => router.back()}
              />
            </View>
          }
          title={t.title}
          intro={t.subtitle}
        />
      }>
      <PrivacyCard
        icon="bouclier"
        tile="privacy"
        title={t.keptTitle}
        shadow={liftShadow('white', true)}>
        <View style={styles.kept}>
          {t.kept.map((item) => (
            <View key={item} style={styles.keptPill}>
              <Icon name="coche" size={14} color={theme.palette.violet[600]} strokeWidth={2.5} />
              <Text variant="caption" weight="bold" color={theme.palette.violet[600]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.note}>
          <Icon name="info" size={18} color={theme.colors.textSecondary} strokeWidth={2} />
          <Text variant="caption" color="textSecondary" style={styles.noteText}>
            {t.keptNote}
          </Text>
        </View>
      </PrivacyCard>
      <FormMessage message={message} />
      <PrivacyCard icon="telechargement" tile="captions" title={t.mine}>
        <Text variant="bodySm" color="textSecondary">
          {t.mineBody}
        </Text>
        <Button
          label={t.exportMine}
          variant="vividSoft"
          weight="bold"
          leadingIcon="telechargement"
          onPress={() => void exportMine()}
          style={styles.export}
        />
      </PrivacyCard>
      {children.map((child) => (
        <ChildDataCard
          key={child.id}
          child={child}
          onUnlink={() => setPending({ kind: 'unlink', child })}
          onDelete={() => setPending({ kind: 'delete', child })}
        />
      ))}
      {pending?.kind === 'unlink' ? (
        <ConfirmDialog
          visible
          tone="parent"
          icon="lien-barre"
          title={t.unlink(name)}
          body={t.unlinkBody(name)}
          confirmLabel={t.unlink(name)}
          keepLabel={t.keepLink}
          busy={busy}
          onConfirm={() => void confirm()}
          onCancel={() => setPending(null)}
        />
      ) : (
        <ConfirmDialog
          visible={pending?.kind === 'delete'}
          tone="parent"
          title={t.deleteChildTitle(name)}
          body={t.deleteChildBody(name)}
          confirmLabel={t.deleteConfirm}
          keepLabel={t.keepChild}
          ackLabel={t.deleteChildAck}
          busy={busy}
          onConfirm={() => void confirm()}
          onCancel={() => setPending(null)}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  top: { flexDirection: 'row' },
  kept: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  keptPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 32,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: theme.palette.violet[100],
  },
  note: { flexDirection: 'row', gap: theme.space[2], marginTop: theme.space[2] },
  noteText: { flex: 1 },
  export: { marginTop: theme.space[1], marginBottom: theme.space[1] },
});
