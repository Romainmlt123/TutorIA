import { colors, palette } from './tokens.generated';

/**
 * Visuels du tuteur (chantier 3, maquettes 2C à 2F) : les six couleurs que le tuteur peut nommer
 * (« la droite rouge »), prises dans la palette de la marque, et les traits du repère et du tableau.
 */
export const visualArt = {
  tones: {
    rouge: palette.red[500],
    bleu: palette.blue[500],
    vert: palette.green[600],
    orange: palette.orange[500],
    violet: palette.violet[500],
    gris: palette.gray[500],
  },
  /** Teintes douces des mêmes couleurs : halo d'un point clé, fond d'une étiquette. */
  soft: {
    rouge: palette.red[100],
    bleu: palette.blue[100],
    vert: palette.green[100],
    orange: palette.orange[100],
    violet: palette.violet[100],
    gris: palette.gray[100],
  },
  grid: palette.gray[200],
  axis: palette.gray[400],
  tick: colors.textSecondary,
  ink: colors.text,
  surface: colors.surface,
  /**
   * Couleur de chaque sorte de visuel (couleurs d'accent de la palette) : carte teintée, tuile et
   * pastille « Voir… » en dégradé, surtitre. Elle les distingue de la carte du chapitre (rouge Maths).
   */
  kinds: {
    graph: {
      gradient: [palette.violet[400], palette.violet[600]],
      soft: palette.violet[100],
      border: palette.violet[200],
      ink: palette.violet[700],
    },
    board: {
      gradient: [palette.azure[400], palette.azure[600]],
      soft: palette.azure[100],
      border: palette.azure[200],
      ink: palette.azure[700],
    },
    chart: {
      gradient: [palette.orange[500], palette.orange[700]],
      soft: palette.orange[100],
      border: palette.orange[200],
      ink: palette.orange[800],
    },
    figure: {
      gradient: [palette.cyan[600], palette.cyan[800]],
      soft: palette.cyan[100],
      border: palette.cyan[200],
      ink: palette.cyan[800],
    },
  },
  /** Opérations écrites dans la marge du tableau, et résultat entouré. */
  boardOperation: palette.blue[500],
  boardResult: palette.red[500],
} as const;
