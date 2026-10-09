import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import type { TutorVisual, VisualKind, VisualTone } from '@/services/tutor/visuals';
import { extras, subjectTheme, theme } from '@/theme';
import { visualArt } from '@/theme/visualArt';

import { VisualView } from './VisualView';

const T = fr.tutor.visual;

export const VISUAL_ICON: Record<VisualKind, IconName> = {
  graph: 'graphique',
  board: 'crayon',
  chart: 'stats',
  figure: 'triangle',
};

type HeaderProps = {
  visual: TutorVisual;
  /** Absente : discussion libre sur toutes les matières (le surtitre ne nomme que le visuel). */
  subjectId?: SubjectId;
  /** Repliable : absent en plein écran. */
  open?: boolean;
  onToggle?: () => void;
  onExpand?: () => void;
  onClose?: () => void;
};

/** En-tête d'un visuel (PanelHeader des maquettes) : tuile de la matière, surtitre, titre, actions. */
export function VisualHeader({
  visual,
  subjectId,
  open,
  onToggle,
  onExpand,
  onClose,
}: HeaderProps) {
  const subject = subjectId ? subjectTheme(subjectId) : undefined;
  const kind = visualArt.kinds[visual.kind];
  const noun = T.nouns[visual.kind];
  const titles = (
    <>
      <GradientSurface gradient={kind.gradient} radius={12} contentStyle={styles.tile}>
        <Icon name={VISUAL_ICON[visual.kind]} size={22} color={theme.colors.textOnColor} />
      </GradientSurface>
      <View style={styles.titles}>
        <Text variant="overline" color={kind.ink} numberOfLines={1}>
          {subject ? T.kicker(T.kinds[visual.kind], subject.name) : T.kinds[visual.kind]}
        </Text>
        <Text variant="body" weight="bold" numberOfLines={2}>
          {visual.title}
        </Text>
      </View>
    </>
  );
  return (
    <View style={styles.header}>
      {/* Tout le bandeau ouvre ou replie le panneau, même pendant que l'élève écrit. */}
      {onToggle ? (
        <PressableBase
          onPress={onToggle}
          accessibilityRole="button"
          aria-expanded={open}
          accessibilityLabel={open ? T.collapse(noun) : T.show(noun)}
          style={styles.band}>
          {titles}
        </PressableBase>
      ) : (
        <View style={styles.band}>{titles}</View>
      )}
      {onExpand ? (
        <PressableBase
          onPress={onExpand}
          accessibilityRole="button"
          accessibilityLabel={T.expand(noun)}
          style={styles.action}>
          <Icon name="agrandir" size={20} color={theme.colors.textSecondary} />
        </PressableBase>
      ) : null}
      {onToggle ? (
        <PressableBase
          onPress={onToggle}
          accessibilityRole="button"
          aria-expanded={open}
          accessibilityLabel={open ? T.collapse(noun) : T.show(noun)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.action}>
          <Icon
            name={open ? 'chevron-haut' : 'chevron-bas'}
            size={20}
            color={theme.colors.textSecondary}
          />
        </PressableBase>
      ) : null}
      {onClose ? (
        <PressableBase
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={T.close}
          style={styles.action}>
          <Icon name="croix" size={20} color={theme.colors.textSecondary} />
        </PressableBase>
      ) : null}
    </View>
  );
}

/**
 * Légende d'un graphique : chaque courbe nommée, dans sa couleur (« la droite rouge »). Au vocal,
 * la courbe que le tuteur nomme s'allume (`focus`).
 */
function Legend({ visual, focus = null }: { visual: TutorVisual; focus?: VisualTone | null }) {
  if (visual.kind !== 'graph') return null;
  const named = visual.curves.filter((c) => c.label);
  if (!named.length) return null;
  return (
    <View style={styles.legend}>
      {named.map((curve, i) => (
        <View
          key={i}
          style={[
            styles.legendItem,
            focus === curve.tone && { backgroundColor: visualArt.soft[curve.tone] },
          ]}>
          <View
            style={[
              styles.legendLine,
              { borderColor: visualArt.tones[curve.tone] },
              curve.dashed && styles.legendDashed,
            ]}
          />
          <Text variant="caption" weight="bold" color={visualArt.tones[curve.tone]}>
            {curve.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

type Props = Omit<HeaderProps, 'onClose'> & {
  open: boolean;
  onToggle: () => void;
  onExpand: () => void;
};

/**
 * 2C et 2E · panneau du dernier visuel, au-dessus de la discussion : carte blanche repliable en
 * bandeau, agrandissable en plein écran.
 */
export function VisualPanel(props: Props) {
  const { visual, open } = props;
  const kind = visualArt.kinds[visual.kind];
  return (
    <View style={[styles.panel, { backgroundColor: kind.soft, borderColor: kind.border }]}>
      <VisualHeader {...props} />
      {open ? (
        // Le dessin reste sur une feuille blanche, pour la lisibilité.
        <View style={styles.sheet}>
          <VisualView visual={visual} />
          <Legend visual={visual} />
        </View>
      ) : null}
    </View>
  );
}

/** Hauteur du dessin dans la carte de l'appel : la carte occupe la moitié haute de l'écran. */
const CALL_VISUAL_HEIGHT = 180;

type CallProps = {
  visual: TutorVisual;
  subjectId?: SubjectId;
  /** Couleur que le tuteur vient de nommer (graphique). */
  focus: VisualTone | null;
  /** Lignes du tableau déjà écrites. */
  progress?: number;
  onExpand: () => void;
};

/**
 * 2D et 2F · le visuel pendant l'appel vocal : la même carte teintée, surélevée, sans chevron
 * (seulement « Agrandir »), et qui avance avec la voix du tuteur.
 */
export function CallVisualCard({ visual, subjectId, focus, progress, onExpand }: CallProps) {
  const kind = visualArt.kinds[visual.kind];
  return (
    <View
      style={[
        styles.panel,
        styles.elevated,
        { backgroundColor: kind.soft, borderColor: kind.border },
      ]}>
      <VisualHeader visual={visual} subjectId={subjectId} onExpand={onExpand} />
      <View style={styles.sheet}>
        <VisualView visual={visual} height={CALL_VISUAL_HEIGHT} focus={focus} progress={progress} />
        <Legend visual={visual} focus={focus} />
      </View>
    </View>
  );
}

export { Legend as VisualLegend };

const styles = StyleSheet.create({
  panel: {
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['3xl'],
    borderWidth: 2,
    boxShadow: theme.shadow.md,
  },
  sheet: {
    gap: theme.space[3],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
  },
  elevated: { boxShadow: extras.call.visualShadow },
  header: { flexDirection: 'row', alignItems: 'center', gap: theme.space[2] },
  band: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: theme.space[3], minHeight: 48 },
  tile: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  titles: { flex: 1, minWidth: 0 },
  action: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius['2xl'],
    backgroundColor: theme.colors.surface,
  },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[2],
    paddingVertical: 2,
    paddingHorizontal: theme.space[2],
    borderRadius: theme.radius.full,
  },
  legendLine: { width: 18, borderTopWidth: 3 },
  legendDashed: { borderStyle: 'dashed' },
});
