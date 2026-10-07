import { useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { IconButton } from '@/components/IconButton';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import { chapterTitle } from '@/data/curriculum';
import { fr } from '@/i18n/fr';
import { formatDuration } from '@/lib/format';
import { addDays, parisDay } from '@/lib/parisTime';
import { useParentAccount } from '@/lib/session/SessionProvider';
import type { LinkedChild } from '@/services/family';
import { subjectTheme, theme } from '@/theme';

import { ParentBand } from './components/ParentBand';
import { AdviceCard } from './components/AdviceCard';
import { AlertCard } from './components/AlertCard';
import { ChildSwitcher } from './components/ChildSwitcher';
import { LinkRequestCard } from './components/LinkRequestCard';
import { ParentKpiCard } from './components/ParentKpiCard';
import { StudyTimeChart } from './components/StudyTimeChart';
import { WeekSummaryCard } from './components/WeekSummaryCard';
import { useLinkRequests } from './hooks/useFamily';
import { useChildProgress, useParentalSettings, useParentWeek } from './hooks/useParentData';
import { useSelectedChild } from './hooks/useSelectedChild';
import { shortDateLabel, weekRangeLabel } from './logic/dates';
import {
  dailyGoalMinutes,
  lateSessionCount,
  peakWindowStart,
  pickAdvice,
  pickAlert,
  topSubjects,
  weekTotals,
  weekVerdict,
} from './logic/parentSpace';

const t = fr.parent.home;

function ChildWeek({ child }: { child: LinkedChild }) {
  const router = useRouter();
  const week = useParentWeek(child.id);
  const progress = useChildProgress(child.id, 'month');
  const { query: settings } = useParentalSettings(child.id);

  if (week.isError) {
    return (
      <View style={styles.section}>
        <FormMessage message={t.loadFailed} />
        <Button label={t.retry} onPress={() => void week.refetch()} variant="soft" />
      </View>
    );
  }
  if (!week.data) return <ActivityIndicator color={theme.colors.primary} style={styles.loader} />;

  const data = week.data;
  const totals = weekTotals(data);
  const goalHours = settings.data?.weeklyGoalHours ?? 4;
  const subjects = topSubjects(data.minutesBySubject).map((id) => subjectTheme(id).name);
  // Le résumé rédigé ne contient jamais le prénom (non transmis à OpenAI) : {prenom} est remplacé ici.
  const summary = data.aiSummary
    ? data.aiSummary.text.replaceAll('{prenom}', child.firstName)
    : totals.minutes > 0
      ? t.summaryFallback(child.firstName, formatDuration(totals.minutes), subjects.join(t.and))
      : t.summaryEmpty(child.firstName);
  const caption = data.aiSummary
    ? t.summaryBy(shortDateLabel(parisDay(new Date(data.aiSummary.generatedAt))))
    : t.summaryComputed;
  const alert = progress.data ? pickAlert(progress.data.chapters) : null;
  const advice = pickAdvice(data, totals);
  const adviceText =
    advice.kind === 'explain'
      ? t.advice.explain(chapterTitle(advice.chapterId))
      : t.advice[advice.kind];
  const questions =
    advice.kind === 'explain'
      ? t.questions.explain(chapterTitle(advice.chapterId))
      : t.questions[advice.kind];
  const peak = peakWindowStart(data.sessionHours);
  const note = [
    peak === null ? null : t.chartPeak(child.firstName, peak, peak + 2),
    t.chartLate(lateSessionCount(data.sessionHours)),
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <WeekSummaryCard text={summary} caption={caption} verdict={weekVerdict(totals, goalHours)} />
      <View accessibilityLabel={t.kpiLabel} style={styles.kpis}>
        <ParentKpiCard
          icon="horloge"
          value={formatDuration(totals.minutes)}
          label={t.studyTime}
          gradient={theme.subjects.anglais.gradient}
        />
        <ParentKpiCard
          icon="calendrier"
          value={`${totals.activeDays} / 7`}
          label={t.activeDays}
          gradient={theme.subjects['histoire-geo'].gradient}
        />
        <ParentKpiCard
          icon="coche"
          value={String(data.acquiredThisWeek.length)}
          label={t.acquired(data.acquiredThisWeek.length)}
          gradient={theme.subjects['physique-chimie'].gradient}
        />
      </View>
      {alert ? (
        <AlertCard
          text={t.alertBody(
            chapterTitle(alert.chapterId),
            subjectTheme(alert.subjectId).name,
            alert.successRate,
            alert.sessions,
          )}
          onDetail={() => router.push('/parents/progres')}
        />
      ) : null}
      <AdviceCard text={adviceText} questions={questions} />
      <StudyTimeChart days={data.days} goalMinutes={dailyGoalMinutes(goalHours)} note={note} />
    </>
  );
}

/** P1 · Tableau de bord du parent : la semaine de l'enfant, sans gamification. */
export function ParentHomeScreen() {
  const router = useRouter();
  const parent = useParentAccount();
  const { children, child, select, loading, failed, retry } = useSelectedChild();
  const requests = useLinkRequests();
  const addChild = () => router.push('/parents/enfant');

  return (
    <ScreenContainer
      contentStyle={styles.content}
      band={
        <ParentBand
          title={parent?.firstName ? t.greeting(parent.firstName) : t.greetingNoName}
          intro={
            child
              ? t.weekIntro(child.firstName, weekRangeLabel(addDays(parisDay(new Date()), -6)))
              : undefined
          }
          top={
            <View style={styles.top}>
              {child ? (
                <ChildSwitcher
                  childList={children}
                  selected={child}
                  onSelect={select}
                  onAddChild={addChild}
                />
              ) : (
                <View />
              )}
              <View style={styles.topRight}>
                <IconButton
                  icon="cloche"
                  onBand
                  accessibilityLabel={t.notifications}
                  onPress={() =>
                    router.push({ pathname: '/bientot', params: { sujet: 'notifications' } })
                  }
                />
              </View>
            </View>
          }
        />
      }>
      {(requests.data ?? []).map((request) => (
        <LinkRequestCard key={request.studentId} request={request} />
      ))}
      {failed ? (
        <View style={styles.section}>
          <FormMessage message={t.loadFailed} />
          <Button label={t.retry} onPress={retry} variant="soft" />
        </View>
      ) : loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : child ? (
        <ChildWeek key={child.id} child={child} />
      ) : (
        <View style={styles.empty}>
          <Text variant="section">{t.noChild.title}</Text>
          <Text variant="lead" color="textSecondary">
            {t.noChild.body}
          </Text>
          <Button
            label={t.noChild.cta}
            onPress={addChild}
            tone="parent"
            size="lg"
            leadingIcon="plus"
            highlight
          />
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  kpis: { flexDirection: 'row', gap: theme.space[3] },
  section: { gap: theme.space[3] },
  loader: { marginTop: theme.space[8] },
  empty: {
    gap: theme.space[3],
    padding: theme.space[6],
    borderRadius: theme.radius['3xl'],
    backgroundColor: theme.colors.surface,
    boxShadow: theme.shadow.md,
  },
});
