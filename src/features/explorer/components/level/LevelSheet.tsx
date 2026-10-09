import { StyleSheet, View } from 'react-native';

import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { Parchment, WoodFrame } from '@/components/game/WoodFrame';
import { Icon, type IconName } from '@/components/Icon';
import { PressableBase } from '@/components/PressableBase';
import { Text } from '@/components/Text';
import { fr } from '@/i18n/fr';
import { theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { levelById } from '../../content';
import { lockOf, type LevelLock } from '../../logic/levelSheet';
import type { MapNode, RegionMap } from '../../logic/regionMap';

const HUD = explorerArt.hud;
const T = fr.explorer.level;

function lockText(lock: LevelLock): string {
  switch (lock.kind) {
    case 'soon':
      return T.locked.soon;
    case 'city':
      return T.locked.city(lock.names.join(', '));
    case 'bilan':
      return T.locked.bilan(lock.remaining);
    case 'previous':
      return T.locked.previous(fr.explorer.levelTypes[lock.type], lock.title);
  }
}

/** Pastille sombre du panneau : durée, nombre d'étapes. */
function Chip({ icon, text, label }: { icon: IconName; text: string; label: string }) {
  return (
    <View accessible accessibilityLabel={label} style={styles.chip}>
      <Icon name={icon} size={16} strokeWidth={2.4} color={HUD.white} />
      <GameText size={14} stroke={2} drop={0}>
        {text}
      </GameText>
    </View>
  );
}

type Props = {
  map: RegionMap;
  /** Place laissée sous la fiche (barre de navigation). */
  bottom: number;
  node: MapNode;
  /** Le parent autorise le tuteur vocal (P4) : « À la voix » est proposé pour une leçon. */
  voiceEnabled: boolean;
  onWrite: () => void;
  onVoice: () => void;
  onClose: () => void;
};

/**
 * X3 et X3b · fiche d'un niveau, sur la carte assombrie : type, titre, lieu, durée, étoiles,
 * objectifs, puis « À l'écrit » et, pour une leçon, « À la voix ». Fermée, elle dit pourquoi.
 */
export function LevelSheet({ map, bottom, node, voiceEnabled, onWrite, onVoice, onClose }: Props) {
  const place = levelById(node.levelId);
  if (!place) return null;
  const { level, city, region } = place;
  const lock = lockOf(map, node);
  // À la voix, le tuteur n'a pas d'outil pour juger les réponses : seule une leçon s'y prête.
  const voice = voiceEnabled && level.type === 'lecon';
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <PressableBase
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={T.close}
        style={[StyleSheet.absoluteFill, styles.veil]}
      />
      <View role="dialog" aria-modal style={[styles.sheet, { bottom }]}>
        <WoodFrame
          tab={fr.explorer.levelTypes[level.type]}
          accessibilityLabel={T.sheetLabel(level.title)}>
          <View style={styles.header}>
            <View style={styles.titles}>
              <GameText size={24} accessibilityRole="header" numberOfLines={2}>
                {level.title}
              </GameText>
              <GameText size={13} stroke={2} drop={1} numberOfLines={1}>
                {T.place(city.name, region.name)}
              </GameText>
            </View>
            <GameButton
              tone="yellow"
              round
              size={44}
              icon="croix"
              accessibilityLabel={T.close}
              onPress={onClose}
            />
          </View>
          <View style={styles.chips}>
            <Chip
              icon="horloge"
              text={T.minutes(level.minutes)}
              label={T.minutesLabel(level.minutes)}
            />
            <Chip
              icon="cible"
              text={T.count[level.type](level.steps)}
              label={T.count[level.type](level.steps)}
            />
            <View accessible accessibilityLabel={T.starsLabel(node.stars)} style={styles.chip}>
              {[1, 2, 3].map((n) => (
                <Icon
                  key={n}
                  name="etoile"
                  variant="fill"
                  size={16}
                  color={n <= node.stars ? HUD.gold.face[1] : HUD.wood.frame}
                />
              ))}
            </View>
          </View>
          {level.objectives.length > 0 ? (
            <View style={styles.objectives}>
              <Text variant="caption" weight="bold" color={HUD.wood.parchmentInk}>
                {T.objectives.toUpperCase()}
              </Text>
              {level.objectives.map((objective) => (
                <View key={objective} style={styles.objective}>
                  <Icon name="coche" size={18} strokeWidth={2.6} color={HUD.status.done.ink} />
                  <Text variant="bodySm" color={HUD.wood.parchmentInk} style={styles.objectiveText}>
                    {objective}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {level.type === 'evaluation' ? (
            <View style={styles.rule}>
              <Icon name="alerte" size={18} strokeWidth={2.4} color={HUD.rule.border} />
              <Text
                variant="bodySm"
                weight="bold"
                color={HUD.rule.ink}
                style={styles.objectiveText}>
                {T.evaluationRule}
              </Text>
            </View>
          ) : null}
          {lock ? <Parchment lines={3}>{lockText(lock)}</Parchment> : null}
          <View style={styles.actions}>
            <GameButton
              tone="green"
              label={T.write}
              icon="clavier"
              size={52}
              accessibilityLabel={T.write}
              disabled={lock !== null}
              onPress={onWrite}
              style={styles.write}
            />
            {voice ? (
              <GameButton
                tone="blue"
                label={T.voice}
                icon="micro"
                size={52}
                accessibilityLabel={T.voiceLabel}
                disabled={lock !== null}
                onPress={onVoice}
                style={styles.voice}
              />
            ) : null}
          </View>
        </WoodFrame>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  veil: { backgroundColor: HUD.sheetVeil },
  sheet: {
    position: 'absolute',
    left: theme.layout.screenPadding,
    right: theme.layout.screenPadding,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[2] },
  titles: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.space[1],
    height: 32,
    paddingHorizontal: theme.space[3],
    borderRadius: theme.radius.full,
    backgroundColor: HUD.wood.groove,
  },
  objectives: {
    gap: theme.space[2],
    paddingVertical: theme.space[3],
    paddingHorizontal: theme.space[3],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HUD.wood.parchmentBorder,
    backgroundColor: HUD.wood.parchment,
  },
  objective: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[2] },
  objectiveText: { flex: 1 },
  rule: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.space[2],
    paddingVertical: theme.space[2],
    paddingHorizontal: theme.space[3],
    borderRadius: 12,
    borderWidth: 2,
    borderColor: HUD.rule.border,
    backgroundColor: HUD.rule.face,
  },
  actions: { flexDirection: 'row', gap: theme.space[3], marginTop: theme.space[1] },
  write: { flex: 1.3 },
  voice: { flex: 1 },
});
