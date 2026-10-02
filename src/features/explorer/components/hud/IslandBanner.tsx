import { StyleSheet, View } from 'react-native';

import { GradientSurface } from '@/components/GradientSurface';
import type { SubjectId } from '@/data/types';
import { fr } from '@/i18n/fr';
import { subjectTheme, theme } from '@/theme';
import { explorerArt } from '@/theme/explorerArt';

import { GameText } from '@/components/game/GameText';

const HEIGHT = 46;

/** Nom de l'île dans un encadré aux couleurs de la matière, avec un reflet en haut. */
export function IslandBanner({ subjectId }: { subjectId: SubjectId }) {
  return (
    <GradientSurface
      gradient={subjectTheme(subjectId).gradient}
      angle={180}
      radius={HEIGHT / 2}
      style={styles.banner}
      contentStyle={styles.face}>
      <View style={styles.shine} />
      <GameText size={24} align="center" numberOfLines={1}>
        {fr.explorer.islandNames[subjectId]}
      </GameText>
    </GradientSurface>
  );
}

const styles = StyleSheet.create({
  banner: { alignSelf: 'center', height: HEIGHT },
  face: {
    height: HEIGHT,
    paddingHorizontal: theme.space[6],
    alignItems: 'center',
    justifyContent: 'center',
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: explorerArt.hud.shine,
  },
});
