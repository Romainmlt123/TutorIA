import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { Text } from '@/components/Text';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { parisDay } from '@/lib/parisTime';
import { theme } from '@/theme';

import { SessionsWeekCard } from './components/SessionsWeekCard';
import { SessionSummaryCard } from './components/SessionSummaryCard';
import { SubjectFilters } from './components/SubjectFilters';
import { useChildSessions } from './hooks/useParentData';
import { useSelectedChild } from './hooks/useSelectedChild';
import { dayLabel } from './logic/dates';
import { groupSessionsByDay, sessionStats, sessionSubjects } from './logic/parentSpace';

const t = fr.parent.sessions;

/** P3 · Sessions de la semaine : un résumé par séance, jamais la conversation. */
export function ParentSessionsScreen() {
  const { child } = useSelectedChild();
  const sessions = useChildSessions(child?.id ?? null);
  const [filter, setFilter] = useState<SubjectId | null>(null);
  const name = child?.firstName ?? '';
  const all = sessions.data ?? [];
  const visible = filter ? all.filter((s) => s.subjectId === filter) : all;
  const today = parisDay(new Date());

  return (
    <ScreenContainer contentStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="heading" accessibilityRole="header">
          {t.title(name)}
        </Text>
        <Text variant="bodySm" color="textSecondary">
          {t.subtitle(name)}
        </Text>
      </View>
      {sessions.isError ? (
        <View style={styles.group}>
          <FormMessage message={fr.parent.home.loadFailed} />
          <Button
            label={fr.parent.home.retry}
            onPress={() => void sessions.refetch()}
            variant="soft"
          />
        </View>
      ) : !sessions.data ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.loader} />
      ) : (
        <>
          <SessionsWeekCard stats={sessionStats(all)} childName={name} />
          {all.length === 0 ? (
            <Text variant="lead" color="textSecondary">
              {t.empty}
            </Text>
          ) : (
            <SubjectFilters
              subjects={sessionSubjects(all)}
              selected={filter}
              onSelect={setFilter}
            />
          )}
          {groupSessionsByDay(visible).map((group) => (
            <View key={group.day} style={styles.group}>
              <Text variant="section" accessibilityRole="header">
                {dayLabel(group.day, today)}
              </Text>
              {group.sessions.map((session) => (
                <SessionSummaryCard key={session.id} session={session} />
              ))}
            </View>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[6] },
  header: { gap: theme.space[1] },
  group: { gap: theme.space[4] },
  loader: { marginTop: theme.space[8] },
});
