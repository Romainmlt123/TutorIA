import { Pill } from '@/components/Pill';
import { fr } from '@/i18n/fr';
import type { ChapterStatus, SessionOutcome } from '@/services/parents/ParentService';
import { theme } from '@/theme';

type Props =
  | { status: ChapterStatus; outcome?: never; compact?: boolean }
  | { outcome: SessionOutcome; status?: never; compact?: never };

const OUTCOME_ICON = {
  understood: 'coche',
  progressing: 'tendance-haut',
  toReview: 'retour',
} as const;

/**
 * Statut d'un chapitre (Acquis, En cours, À consolider, Pas commencé) ou résultat d'une séance
 * (Compris, En progrès, À revoir), aux couleurs de `app-tokens.json` › `statuses`.
 */
export function StatusChip(props: Props) {
  if (props.outcome) {
    const style = theme.statuses[theme.statuses.sessionOutcome[props.outcome]];
    return (
      <Pill
        label={fr.parent.sessions.outcomes[props.outcome]}
        icon={OUTCOME_ICON[props.outcome]}
        backgroundColor={style.background}
        color={style.text}
        size="md"
        style={{ paddingVertical: 6 }}
      />
    );
  }
  const style = theme.statuses[props.status];
  return (
    <Pill
      label={style.label}
      backgroundColor={style.background}
      color={style.text}
      size={props.compact ? 'sm' : 'md'}
    />
  );
}
