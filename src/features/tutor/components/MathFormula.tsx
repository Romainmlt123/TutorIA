import { useMemo } from 'react';
import { ScrollView, StyleSheet, View, type ColorValue } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { Text } from '@/components/Text';
import { textStyle } from '@/theme';

import { spokenTex } from '../logic/mathText';
import { renderTex } from '../math/texToSvg';

/** Taille d'un « ex » MathJax par rapport à la police du texte : la hauteur d'un x de Satoshi. */
const EX_PER_EM = 0.48;
/** Les formules isolées sont un peu plus grandes que le texte, comme dans un manuel. */
const DISPLAY_SCALE = 1.15;

type Props = {
  tex: string;
  /** Formule seule sur sa ligne ($$…$$), sinon dans la phrase. */
  display?: boolean;
  color: ColorValue;
};

/**
 * Formule mathématique dessinée par MathJax (SVG). Dans la phrase, elle s'aligne sur la ligne de
 * base du texte. Si elle ne peut pas être dessinée, son LaTeX reste affiché en texte.
 */
export function MathFormula({ tex, display = false, color }: Props) {
  const rendered = useMemo(() => renderTex(tex, display), [tex, display]);
  const label = spokenTex(tex);
  if (!rendered) {
    return (
      <Text variant="body" color={color} accessibilityLabel={label}>
        {tex}
      </Text>
    );
  }
  const fontSize = textStyle('body').fontSize ?? 16;
  const ex = fontSize * EX_PER_EM * (display ? DISPLAY_SCALE : 1);
  const width = rendered.width * ex;
  const height = rendered.height * ex;
  const formula = (
    <SvgXml
      xml={rendered.xml}
      width={width}
      height={height}
      color={color as string}
      accessibilityLabel={label}
    />
  );
  if (display) {
    // Une longue formule défile sur le côté au lieu de déborder de la bulle.
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessible
        accessibilityLabel={label}
        contentContainerStyle={styles.display}>
        {formula}
      </ScrollView>
    );
  }
  // Dans un texte, la vue se pose sur la ligne de base : on la descend de sa profondeur.
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{ width, height, transform: [{ translateY: rendered.depth * ex }] }}>
      {formula}
    </View>
  );
}

const styles = StyleSheet.create({
  display: { flexGrow: 1, justifyContent: 'center' },
});
