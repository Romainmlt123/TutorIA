import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { GameButton } from '@/components/game/GameButton';
import { GameText } from '@/components/game/GameText';
import { Parchment, WoodFrame } from '@/components/game/WoodFrame';
import { fr } from '@/i18n/fr';
import { formatHour } from '@/lib/format';
import type { StudyRules } from '@/services/student';
import type { StudyBlock } from '@/services/student/studyRules';
import { theme } from '@/theme';

import { LevelBackdrop } from './components/level/LevelBackdrop';

const T = fr.studyPause.level;

/**
 * R6 · Un niveau d'Explorer pendant la pause (v2.15) : on reste dans le jeu. Un panneau de bois
 * sur le ciel (de nuit pour la pause du soir) dit pourquoi, et ramène à la carte.
 */
export function LevelPauseScreen({ block, rules }: { block: StudyBlock; rules: StudyRules }) {
  const router = useRouter();
  const reason =
    block === 'outside_window'
      ? T.reason.outside_window(formatHour(rules.allowedFrom), formatHour(rules.allowedUntil))
      : T.reason[block];
  const back = () => (router.canGoBack() ? router.back() : router.replace('/explorer'));
  return (
    <LevelBackdrop night={block === 'evening_pause'}>
      <View style={styles.center}>
        <View role="alertdialog" accessibilityLabel={T.ribbon[block]} style={styles.dialog}>
          <WoodFrame tab={T.ribbon[block]} accessibilityLabel={T.ribbon[block]}>
            <GameText size={24} align="center" accessibilityRole="header">
              {T.title}
            </GameText>
            <Parchment lines={3}>{reason}</Parchment>
            <Parchment lines={3}>{T.rule[block]}</Parchment>
            <GameButton
              tone="yellow"
              label={T.back}
              accessibilityLabel={T.back}
              onPress={back}
              size={52}
              style={styles.action}
            />
          </WoodFrame>
        </View>
      </View>
    </LevelBackdrop>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  dialog: { alignSelf: 'center', width: '100%', maxWidth: 420 },
  action: { marginTop: theme.space[2] },
});
