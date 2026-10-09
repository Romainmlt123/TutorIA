import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMessage } from '@/components/form/FormMessage';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SectionCard } from '@/components/SectionCard';
import { Text } from '@/components/Text';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { parisDay } from '@/lib/parisTime';
import { theme } from '@/theme';

import { ParentBand } from './components/ParentBand';
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
    <ScreenContainer
      contentStyle={styles.content}
      band={<ParentBand title={t.title(name)} intro={t.subtitle(name)} />}>
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
            <SectionCard key={group.day} title={dayLabel(group.day, today)} gap={theme.space[3]}>
              {group.sessions.map((session) => (
                <SessionSummaryCard key={session.id} session={session} />
              ))}
            </SectionCard>
          ))}
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.space[4] },
  group: { gap: theme.space[4] },
  loader: { marginTop: theme.space[8] },
});
