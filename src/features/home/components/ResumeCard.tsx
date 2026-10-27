import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Pill } from '@/components/Pill';
import { ProgressBar } from '@/components/ProgressBar';
import { SubjectTile } from '@/components/subject/SubjectTile';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme, type SubjectId } from '@/theme';

const F = fr.home.first;

type Props = {
  subjectId: SubjectId;
  chapterTitle: string;
  subtitle: string;
  progress: number;
  /** Premier jour (J1, v2.19) : « Ta première séance », sa durée, et « Commencer ». */
  first?: { minutes: number };
  onResume: () => void;
};

/** Carte « Reprendre » : la seule action principale (`shadow-brand`) de l'Accueil. */
export function ResumeCard({
  subjectId,
  chapterTitle,
  subtitle,
  progress,
  first,
  onResume,
}: Props) {
  const percent = Math.round(progress * 100);
  return (
    <Card
      padding={theme.space[6]}
      radius="3xl"
      style={styles.card}
      accessibilityLabel={first ? F.overline : undefined}>
      {first ? (
        <Text variant="overline" color="primaryHover">
          {F.overline}
        </Text>
      ) : null}
      <View style={styles.row}>
        <SubjectTile subjectId={subjectId} size={48} />
        <View style={styles.texts}>
          <Text variant="metric">{chapterTitle}</Text>
          <Text variant="bodySm" color="textSecondary">
            {subtitle}
          </Text>
        </View>
      </View>
      {first ? (
        <View style={styles.pills}>
          <Pill
            label={F.minutes(first.minutes)}
            icon="horloge"
            iconSize={16}
            size="md"
            backgroundColor={theme.colors.primarySoft}
            color={theme.colors.primaryHover}
          />
          <Pill
            label={F.fromPlan}
            icon="etincelles"
            iconSize={16}
            size="md"
            backgroundColor={theme.colors.primarySoft}
            color={theme.colors.primaryHover}
          />
        </View>
      ) : (
        <View style={styles.progress}>
          <View style={styles.progressLabels}>
            <Text variant="caption" weight="regular" color="textSecondary">
              {fr.home.chapterProgress}
            </Text>
            <Text variant="caption" weight="bold">
              {`${percent} %`}
            </Text>
          </View>
          <ProgressBar
            value={progress}
            height={8}
            trackColor={theme.colors.primarySoft}
            fill={theme.colors.primary}
            accessibilityLabel={fr.home.chapterProgress}
          />
        </View>
      )}
      <Button
        label={first ? F.start : fr.home.resume}
        icon="fleche-droite"
        highlight
        onPress={onResume}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: theme.space[4] },
  row: { flexDirection: 'row', alignItems: 'center', gap: theme.space[3] },
  texts: { flex: 1, gap: 2 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  progress: { gap: theme.space[2] },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between' },
});
