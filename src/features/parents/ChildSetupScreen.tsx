import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Platform, Share, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { TextField } from '@/components/form/TextField';
import { GradePicker } from '@/components/GradePicker';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { StepHeader } from '@/components/StepHeader';
import { Text } from '@/components/Text';
import type { Grade } from '@/data/types';
import { authErrorMessage, errorMessages } from '@/features/auth/logic/errors';
import { normalizeFirstName } from '@/features/auth/logic/validation';
import { fr } from '@/i18n/fr';
import { logError } from '@/lib/logger';
import { showNotice } from '@/lib/notice';
import { useSession } from '@/lib/session/SessionProvider';
import { authService } from '@/services/auth';
import { formatLinkCode } from '@/services/auth/api-contract';
import { liftShadow, theme } from '@/theme';

import { ChildAvatar } from './components/ChildSwitcher';
import { ParentBand } from './components/ParentBand';
import { ParentCodeCard } from './components/ParentCodeCard';
import { StepList } from './components/StepList';
import { useChildren, useUpdateChild } from './hooks/useFamily';

const t = fr.parent.child;

type Created = { name: string; grade: Grade; code: string };

/**
 * Profil d'un enfant, en trois usages :
 * - L5 et L6 : étape 2 de l'inscription du parent (en-tête d'étape), puis le code de l'enfant ;
 * - F1 et F2 : « Ajouter un enfant » depuis l'espace Parents (bandeau violet), puis le code ;
 * - F5 : « Modifier le profil de Léa » (`?id=`), pour le parent qui a validé le compte d'un enfant
 *   de moins de 15 ans ; la base vérifie ce droit (`update_child_profile`).
 */
export function ChildSetupScreen() {
  const router = useRouter();
  const session = useSession();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const children = useChildren();
  const update = useUpdateChild();
  const freshSignUp = session.status === 'signedIn' && session.freshSignUp;
  const editing = id ? children.data?.find((child) => child.id === id) : undefined;
  const [firstName, setFirstName] = useState('');
  const [grade, setGrade] = useState<Grade | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);

  const name = normalizeFirstName(firstName);

  // F5 : le formulaire prend l'enfant à modifier une fois, dès que la liste est lue ; une relecture
  // de la liste ne réécrit pas la saisie.
  if (editing && prefilledFor !== editing.id) {
    setPrefilledFor(editing.id);
    setFirstName(editing.firstName);
    setGrade(editing.grade);
  }

  // L'écran reste monté : en le quittant, il repart de zéro pour le prochain enfant.
  useFocusEffect(
    useCallback(
      () => () => {
        setPrefilledFor(null);
        setCreated(null);
        setFirstName('');
        setGrade(null);
        setMessage(null);
      },
      [],
    ),
  );

  const create = async () => {
    if (!name || !grade) {
      setMessage(errorMessages('parent').required);
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      const result = await authService.createLinkCode(name, grade);
      setCreated({ name, grade, code: result.code });
    } catch (error) {
      setMessage(authErrorMessage(error, 'parent'));
    } finally {
      setBusy(false);
    }
  };

  const back = () => (router.canGoBack() ? router.back() : router.replace('/parents/reglages'));

  const save = async () => {
    if (!editing) return;
    if (!name || !grade) {
      setMessage(errorMessages('parent').required);
      return;
    }
    setMessage(null);
    try {
      await update.mutateAsync({ id: editing.id, firstName: name, grade });
      showNotice(t.saved(name));
      back();
    } catch (error) {
      logError('family.updateChild', error);
      setMessage(authErrorMessage(error, 'parent'));
    }
  };

  const share = async (child: Created) => {
    const text = t.shareMessage(child.name, formatLinkCode(child.code));
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && !navigator.share) {
      showNotice(text);
      return;
    }
    try {
      await Share.share({ message: text });
    } catch (error) {
      logError('linkCode.share', error);
      showNotice(text);
    }
  };

  const finishSignUp = () => {
    authService.acknowledgeSignUp();
    if (router.canGoBack()) router.back();
    else router.replace('/parents');
  };

  // Hors inscription, la carte est posée à cheval sur le bandeau violet (v2.18).
  const onBand = !freshSignUp;
  const title = created
    ? t.readyTitle(created.name)
    : editing
      ? t.editTitle(editing.firstName)
      : freshSignUp
        ? t.title
        : t.addTitle;
  const intro = created ? t.readySubtitle : t.subtitle;
  const others = (children.data ?? []).filter((child) => child.id !== id);

  const form = (
    <View
      accessibilityLabel={t.formLabel}
      style={[styles.form, onBand && [styles.card, styles.cardForm, styles.lifted]]}>
      {onBand ? (
        <Text variant="metric" accessibilityRole="header">
          {t.formTitle}
        </Text>
      ) : null}
      <TextField
        label={t.firstName}
        value={firstName}
        onChangeText={setFirstName}
        icon="utilisateur"
        placeholder={t.firstNamePlaceholder}
        autoComplete="off"
        maxLength={40}
        filled={onBand}
      />
      <View style={styles.grade}>
        <Text variant="label" weight="bold">
          {fr.form.grade}
        </Text>
        <GradePicker
          value={grade}
          onChange={setGrade}
          tone="parent"
          layout={onBand ? 'columns' : 'grid'}
        />
      </View>
    </View>
  );

  const ready = created ? (
    <>
      <View style={[styles.profile, onBand && styles.lifted]}>
        <ChildAvatar name={created.name} size={48} />
        <View style={styles.profileText}>
          <Text variant="rowTitle">{created.name}</Text>
          <Text variant="hint" color="textSecondary">
            {t.created(created.grade)}
          </Text>
        </View>
        <Button
          label={t.edit}
          onPress={() => setCreated(null)}
          variant={onBand ? 'vividSoft' : 'soft'}
          weight="bold"
        />
      </View>
      <ParentCodeCard
        childName={created.name}
        code={created.code}
        onShare={() => void share(created)}
      />
      <StepList title={t.stepsTitle(created.name)} icon="telephone" steps={t.steps(created.name)} />
      <Button
        label={freshSignUp ? t.dashboard : t.done}
        onPress={freshSignUp ? finishSignUp : back}
        tone="parent"
        size="lg"
        icon={freshSignUp ? 'fleche-droite' : undefined}
        highlight
      />
    </>
  ) : null;

  const body: ReactNode = ready ?? (
    <>
      {form}
      <FormMessage message={message} />
      {!editing && onBand && others.length > 0 ? (
        <View style={styles.family}>
          <ChildAvatar name={others[0]?.firstName ?? ''} size={32} />
          <Text variant="caption" color="textSecondary" style={styles.familyText}>
            {t.family}{' '}
            {others.map((child, i) => (
              <Text key={child.id} variant="caption" color="textSecondary">
                {i > 0 ? ' · ' : ''}
                <Text variant="caption" weight="bold">
                  {child.firstName}
                </Text>
                {child.grade ? t.familyGrade(child.grade) : ''}
              </Text>
            ))}
          </Text>
        </View>
      ) : null}
      <Button
        label={editing ? t.save : t.create(name)}
        onPress={() => void (editing ? save() : create())}
        disabled={busy || update.isPending}
        tone="parent"
        size="lg"
        icon={editing ? undefined : 'fleche-droite'}
        highlight
      />
    </>
  );

  if (!onBand) {
    return (
      <ScreenContainer withNav={false} contentStyle={styles.content}>
        <StepHeader step={2} total={2} tone="parent" layout="stacked" />
        <View style={styles.header}>
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          <Text variant="lead" color="textSecondary">
            {intro}
          </Text>
        </View>
        {body}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      withNav={false}
      contentStyle={styles.bandContent}
      band={
        <ParentBand
          pills="standard"
          top={
            <View style={styles.top}>
              <IconButton
                icon="chevron-gauche"
                iconSize={22}
                onBand
                accessibilityLabel={fr.form.back}
                onPress={back}
              />
            </View>
          }
          title={title}
          intro={intro}
        />
      }>
      {body}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[5] },
  bandContent: { gap: theme.space[4] },
  header: { gap: 6 },
  top: { flexDirection: 'row' },
  form: { gap: theme.space[5] },
  cardForm: { gap: 18 },
  card: {
    padding: theme.space[5],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
  },
  lifted: { boxShadow: liftShadow('white', true) },
  grade: { gap: theme.space[3] },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    padding: theme.space[4],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
  profileText: { flex: 1 },
  family: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.bg,
  },
  familyText: { flex: 1 },
});
