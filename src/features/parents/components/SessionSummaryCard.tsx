import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon } from '@/components/Icon';
import { Pill } from '@/components/Pill';
import { Text } from '@/components/Text';
import { Watermark } from '@/components/Watermark';
import { chapterById } from '@/data/curriculum';
import { fr } from '@/i18n/fr';
import { formatClock } from '@/lib/parisTime';
import type { ParentSession } from '@/services/parents/ParentService';
import { extras, subjectTheme, theme } from '@/theme';

import { StatusChip } from './StatusChip';

/**
 * P3 · Résumé d'une séance : en-tête dans la couleur de la matière, résumé (jamais la conversation),
 * résultat et mode utilisé.
 */
export function SessionSummaryCard({ session }: { session: ParentSession }) {
  const t = fr.parent.sessions;
  const subject = subjectTheme(session.subjectId);
  const title = (session.chapterId && chapterById(session.chapterId)?.title) || subject.name;
  const meta = t.meta(
    subject.name,
    formatClock(new Date(session.startedAt)),
    session.durationMinutes,
  );
  const tags = [t.modes[session.mode], ...session.tools.map((tool) => t.tools[tool])];
  return (
    <View style={styles.card}>
      <GradientSurface gradient={subject.gradient} radius={0} contentStyle={styles.header}>
        <Watermark
          icon={subject.icon}
          size={90}
          offset={-16}
          placement="top"
          opacity={extras.watermarkOpacity.subject}
        />
        <View style={styles.veil}>
          <Icon name={subject.icon} size={20} color={theme.colors.textOnColor} />
        </View>
        <View style={styles.titles}>
          <Text variant="overline" color="textOnColor" style={styles.meta}>
            {meta}
          </Text>
          <Text variant="cardTitle" color="textOnColor" accessibilityRole="header">
            {title}
          </Text>
        </View>
      </GradientSurface>
      <View style={styles.body}>
        <Text variant="lead" color={theme.palette.gray[700]}>
          {session.summary}
        </Text>
        <View style={styles.tags}>
          <StatusChip outcome={session.outcome} />
          {tags.map((tag) => (
            <Pill
              key={tag}
              label={tag}
              backgroundColor={subject.soft}
              color={subject.ink}
              size="md"
              style={styles.tag}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Dans la carte de section (v2.5) : un bloc sur le fond `bg`, sans ombre.
  card: {
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.bg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[3],
    paddingVertical: theme.space[4],
    paddingHorizontal: theme.space[5],
  },
  veil: {
    width: theme.space[10],
    height: theme.space[10],
    borderRadius: theme.radius.full,
    backgroundColor: theme.onColor.veil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1 },
  meta: { opacity: 0.9 },
  body: {
    gap: 14,
    paddingTop: theme.space[4],
    paddingHorizontal: theme.space[5],
    paddingBottom: theme.space[5],
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  tag: { paddingVertical: 6 },
});
