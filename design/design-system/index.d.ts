// Tutor'IA — types des composants (documentation). window.TutorIA.<Composant>.
import * as React from "react";

export type SubjectId = 'maths' | 'francais' | 'histoire-geo' | 'anglais' | 'svt' | 'physique-chimie';
export type LevelType = 'lecon' | 'exercices' | 'evaluation';

/** Icône au trait fin (grille 24), en currentColor, pour l'interface et les six matières. */
export interface IconProps {
  /** Nom de l'icône : home, map, cards, stats, chat, mic, video, flame, star, bulb, graph, pen… et les matières maths, francais, histoire-geo, anglais, svt, physique-chimie. */
  name?: string;
  /** Taille en px (24 par défaut). */
  size?: number;
  /** Épaisseur du trait (1.75 par défaut). */
  strokeWidth?: number;
  /** Couleur CSS ; hérite de currentColor sinon. */
  color?: string;
  /** Version pleine (onglet actif). */
  filled?: boolean;
  /** Libellé accessible ; sans lui l'icône est décorative. */
  label?: string;
}
export declare function Icon(props: IconProps): React.ReactElement;

/** Logo Tutor'IA (bulle au clin d'œil coiffée d'un mortier), toujours bleu, sur fond blanc ou sur carré bleu. */
export interface LogoProps {
  /** Version du fichier de marque (blanc par défaut). */
  variant?: 'blanc' | 'bleu';
  /** Taille en px (40 par défaut). */
  size?: number;
  /** Découpe ronde (avatar du tuteur). */
  round?: boolean;
  /** Texte alternatif (Tutor'IA par défaut, '' si décoratif). */
  alt?: string;
}
export declare function Logo(props: LogoProps): React.ReactElement;

/** Pastille d'état d'une notion : acquis, en cours, à consolider, pas commencé, ou bilan d'une séance. */
export interface StatusChipProps {
  /** État affiché. */
  status?: 'acquired' | 'inProgress' | 'toConsolidate' | 'notStarted' | 'understood' | 'progressing' | 'toReview';
  /** Ajoute l'icône de l'état. */
  icon?: boolean;
  /** Remplace le libellé par défaut. */
  label?: string;
}
export declare function StatusChip(props: StatusChipProps): React.ReactElement;

/** Anneau de progression avec une valeur au centre. */
export interface ProgressRingProps {
  /** Avancement de 0 à 1. */
  value?: number;
  /** Diamètre (56 par défaut). */
  size?: number;
  /** Épaisseur (6 par défaut). */
  stroke?: number;
  /** Texte au centre. */
  label?: string;
  /** Couleur de l'arc (primary par défaut). */
  color?: string;
  /** Version blanche sur fond coloré. */
  onColor?: boolean;
}
export declare function ProgressRing(props: ProgressRingProps): React.ReactElement;

/** Citation d'accueil, en italique discret, sous le bonjour de l'élève. */
export interface QuoteProps {
  /** Citation. */
  text?: string;
  /** Auteur, affiché en fin de ligne. */
  author?: string;
}
export declare function Quote(props: QuoteProps): React.ReactElement;

/** Bouton d'action, 48px de haut, arrondi radius-2xl, en six variantes. */
export interface ButtonProps {
  /** Style (primary par défaut). */
  variant?: 'primary' | 'vivid' | 'soft' | 'white' | 'ghost' | 'danger';
  /** sm : 40px, texte 14 gras. */
  size?: 'md' | 'sm';
  /** Ombre bleue shadow-brand (un seul par écran). */
  brand?: boolean;
  /** Icône à gauche. */
  icon?: string;
  /** Icône à droite. */
  iconRight?: string;
  /** Pleine largeur. */
  fullWidth?: boolean;
  /** Désactivé. */
  disabled?: boolean;
  /** Rend un lien. */
  href?: string;
  /** Action. */
  onClick?: () => void;
}
export declare function Button(props: ButtonProps): React.ReactElement;

/** Bouton carré arrondi 48px avec une icône, pour les actions d'en-tête (retour, notifications, réglages). */
export interface IconButtonProps {
  /** Icône. */
  icon?: string;
  /** Libellé accessible (obligatoire). */
  label?: string;
  /** Pastille violette de notification. */
  badge?: boolean;
  /** Fond blanc surélevé (défaut) ou fond bg sans ombre. */
  tone?: 'surface' | 'soft';
  /** Taille (48 par défaut). */
  size?: number;
  /** Action. */
  onClick?: () => void;
}
export declare function IconButton(props: IconButtonProps): React.ReactElement;

/** Sélecteur à segments dans une piste grise ; le segment choisi passe en blanc surélevé. */
export interface SegmentedControlProps {
  /** Segments. */
  options?: { id: string; label: string; icon?: string }[];
  /** Segment sélectionné. */
  value?: string;
  /** Changement. */
  onChange?: (id: string) => void;
  /** Pleine largeur, segments égaux. */
  fullWidth?: boolean;
  /** Libellé accessible du groupe. */
  label?: string;
}
export declare function SegmentedControl(props: SegmentedControlProps): React.ReactElement;

/** Interrupteur on / off, piste 52×32, en primary quand il est actif. */
export interface SwitchProps {
  /** État. */
  checked?: boolean;
  /** Changement. */
  onChange?: (checked: boolean) => void;
  /** Libellé accessible. */
  label?: string;
}
export declare function Switch(props: SwitchProps): React.ReactElement;

/** Réglage d'un objectif chiffré avec deux boutons − / + et la valeur en grand. */
export interface GoalStepperProps {
  /** Valeur (contrôlée ou initiale). */
  value?: number;
  /** Minimum. */
  min?: number;
  /** Maximum. */
  max?: number;
  /** Unité affichée après la valeur. */
  unit?: string;
  /** Titre du réglage. */
  title?: string;
  /** Aide sous le titre. */
  hint?: string;
  /** Changement. */
  onChange?: (value: number) => void;
}
export declare function GoalStepper(props: GoalStepperProps): React.ReactElement;

/** Barre de navigation flottante en bas de l'écran, l'actif monte dans une bulle bleue. Élève : 5 onglets dont Explorer (boussole) ; Parents : 4 onglets. */
export interface BottomNavProps {
  /** Jeu d'onglets. */
  space?: 'eleve' | 'parents';
  /** Onglet actif : accueil, explorer (alias parcours), tuteur, revisions, stats ou accueil, progres, sessions, reglages. */
  active?: string;
  /** Clic sur un onglet. */
  onNavigate?: (id: string) => void;
}
export declare function BottomNav(props: BottomNavProps): React.ReactElement;

/** Bascule entre le tuteur écrit et le tuteur vocal, en haut des écrans Tutor'IA. */
export interface ModeToggleProps {
  /** Mode affiché. */
  mode?: 'ecrit' | 'vocal';
  /** Changement de mode. */
  onChange?: (mode: 'ecrit' | 'vocal') => void;
}
export declare function ModeToggle(props: ModeToggleProps): React.ReactElement;

/** Sélecteur de l'enfant suivi, en haut de l'espace Parents. */
export interface ChildSwitcherProps {
  /** Prénom de l'enfant. */
  name?: string;
  /** Classe (4e…). */
  grade?: string;
  /** Ouvre le choix. */
  onClick?: () => void;
}
export declare function ChildSwitcher(props: ChildSwitcherProps): React.ReactElement;

/** Carte de matière pleine couleur (dégradé de la matière, texte blanc, picto en filigrane). */
export interface SubjectCardProps {
  /** Matière. */
  subject?: 'maths' | 'francais' | 'histoire-geo' | 'anglais' | 'svt' | 'physique-chimie';
  /** Progression en % (barre blanche). */
  progress?: number;
  /** Ligne secondaire (ex. « 24 cartes »). */
  count?: string;
  /** Anneau de sélection + coche. */
  selected?: boolean;
  /** Rend la carte cliquable. */
  onClick?: () => void;
}
export declare function SubjectCard(props: SubjectCardProps): React.ReactElement;

/** Série de jours d'affilée, en orange plein (orange-500) avec texte blanc, sur une seule ligne. */
export interface StreakCardProps {
  /** Nombre de jours. */
  days?: number;
  /** Relance (ex. « Plus que 4 jours pour ton record »). */
  caption?: string;
}
export declare function StreakCard(props: StreakCardProps): React.ReactElement;

/** Niveau et jauge d'XP sur fond ardoise (gray-600), jauge verte. */
export interface LevelCardProps {
  /** Niveau. */
  level?: number;
  /** XP actuels. */
  xp?: number;
  /** XP du prochain niveau. */
  xpMax?: number;
}
export declare function LevelCard(props: LevelCardProps): React.ReactElement;

/** Carte « reprendre » de la dernière séance, aux couleurs de la matière, avec bouton blanc. */
export interface ResumeCardProps {
  /** Matière. */
  subject?: SubjectId;
  /** Notion. */
  title?: string;
  /** Contexte (ex. « Tuteur écrit · il y a 2 h »). */
  subtitle?: string;
  /** Avancement en %. */
  progress?: number;
  /** « Reprendre » par défaut. */
  actionLabel?: string;
  /** Action. */
  onResume?: () => void;
  /** Lien. */
  href?: string;
}
export declare function ResumeCard(props: ResumeCardProps): React.ReactElement;

/** Objectif du jour : anneau de progression, titre et détail. */
export interface GoalCardProps {
  /** Réalisé. */
  done?: number;
  /** Objectif. */
  total?: number;
  /** « Objectif du jour » par défaut. */
  title?: string;
  /** Détail. */
  detail?: string;
  /** Pastille à droite (ex. « +20 XP »). */
  badge?: string;
}
export declare function GoalCard(props: GoalCardProps): React.ReactElement;

/** Encadré du sujet en cours en haut du tuteur : pastille matière, notion, badge d'état. */
export interface TopicCardProps {
  /** Matière. */
  subject?: SubjectId;
  /** Notion travaillée. */
  title?: string;
  /** Texte du badge (ex. « En cours », « En direct »). */
  badge?: string;
  /** Point clignotant. */
  live?: boolean;
}
export declare function TopicCard(props: TopicCardProps): React.ReactElement;

/** Bulle de chat : tuteur à gauche en blanc avec l'avatar logo, élève à droite en primary. */
export interface ChatBubbleProps {
  /** Auteur. */
  from?: 'tutor' | 'student';
  /** Affiche l'avatar du tuteur (par défaut pour tutor). */
  avatar?: boolean;
  /** Contenu. */
  children?: React.ReactNode;
}
export declare function ChatBubble(props: ChatBubbleProps): React.ReactElement;

/** Encadré « conseil » en violet accent, avec une ampoule. */
export interface TipCardProps {
  /** « Conseil » par défaut. */
  title?: string;
  /** Décalé comme une bulle du tuteur. */
  inChat?: boolean;
  /** Texte. */
  children?: React.ReactNode;
}
export declare function TipCard(props: TipCardProps): React.ReactElement;

/** Champ de réponse du tuteur écrit avec le bouton d'envoi rond. */
export interface ChatInputProps {
  /** Valeur contrôlée. */
  value?: string;
  /** Valeur initiale. */
  defaultValue?: string;
  /** Saisie. */
  onChange?: (v: string) => void;
  /** Envoi. */
  onSend?: (v: string) => void;
  /** « Écris ta réponse… » par défaut. */
  placeholder?: string;
  /** Libellé accessible. */
  label?: string;
}
export declare function ChatInput(props: ChatInputProps): React.ReactElement;

/** Quatre barres animées bleu → violet qui suivent la voix du tuteur (remplacées par VoiceAvatar dans l'appel du tuteur depuis la v2.6). */
export interface VoiceVisualizerProps {
  /** État de la conversation. */
  state?: 'speaking' | 'listening' | 'idle' | 'muted' | 'writing' | 'explaining';
  /** Version réduite. */
  compact?: boolean;
  /** Remplace le libellé d'état. */
  status?: string;
  /** Aide sous l'état (false pour la masquer). */
  hint?: string | false;
  /** Toucher pour interrompre. */
  onInterrupt?: () => void;
}
export declare function VoiceVisualizer(props: VoiceVisualizerProps): React.ReactElement;

/** Commandes d'appel : micro, raccrocher (rouge, au centre), caméra (discussion vocale d'Explorer ; l'appel du tuteur utilise CallDock depuis la v2.6). */
export interface CallControlsProps {
  /** Micro coupé. */
  muted?: boolean;
  /** Caméra active. */
  cameraOn?: boolean;
  /** Micro. */
  onToggleMute?: () => void;
  /** Caméra. */
  onToggleCamera?: () => void;
  /** Fin de séance. */
  onHangUp?: () => void;
}
export declare function CallControls(props: CallControlsProps): React.ReactElement;

/** Sorte de visuel du tuteur : couleurs (violet pour le graphique, azur pour le tableau) et icône. */
export type VisualKind = 'graph' | 'whiteboard';

/** En-tête d'un visuel : tuile et surtitre dans la couleur du visuel, titre, agrandir, replier. */
export interface PanelHeaderProps {
  /** Sorte de visuel. */
  kind?: VisualKind;
  /** Matière (surtitre « Graphique · Maths »). */
  subject?: SubjectId;
  /** Surtitre. */
  kicker?: string;
  /** Titre. */
  title?: string;
  /** Point rouge clignotant (le tuteur dessine). */
  live?: boolean;
  /** Chevron ouvert / fermé. */
  open?: boolean;
  /** Chevron présent (true par défaut). */
  collapsible?: boolean;
  /** Bouton agrandir présent (true par défaut). */
  expandable?: boolean;
  /** Replier / déplier : tout le bandeau devient un bouton. */
  onToggle?: () => void;
  /** Plein écran. */
  onExpand?: () => void;
}
export declare function PanelHeader(props: PanelHeaderProps): React.ReactElement;

/** Carte d'un visuel, teintée de sa couleur, avec le dessin sur une feuille blanche. */
export interface VisualPanelProps {
  /** Sorte de visuel. */
  kind?: VisualKind;
  /** Matière. */
  subject?: SubjectId;
  /** Surtitre. */
  kicker?: string;
  /** Titre. */
  title?: string;
  /** Dessin en cours. */
  live?: boolean;
  /** Contrôlé. */
  open?: boolean;
  /** Ouvert au départ. */
  defaultOpen?: boolean;
  /** Repliable (true par défaut ; false dans l'appel vocal). */
  collapsible?: boolean;
  /** Bouton agrandir (true par défaut). */
  expandable?: boolean;
  /** Ombre forte, pour l'appel vocal sur le dégradé de marque. */
  elevated?: boolean;
  /** Replier. */
  onToggle?: (open: boolean) => void;
  /** Agrandir. */
  onExpand?: () => void;
  /** Contenu (MathGraph, Whiteboard). */
  children?: React.ReactNode;
  /** Légende sous le visuel. */
  footer?: React.ReactNode;
}
export declare function VisualPanel(props: VisualPanelProps): React.ReactElement;

/** Repère cartésien en SVG : quadrillage, droites, points, légende en pastilles ; `focus` met en avant ce que le tuteur nomme. */
export interface MathGraphProps {
  /** Matière (couleur des tracés). */
  subject?: SubjectId;
  /** Bornes en x. */
  xRange?: [number, number];
  /** Bornes en y. */
  yRange?: [number, number];
  /** Pas des graduations y. */
  yStep?: number;
  /** Droites (from / to bornent le tracé). */
  lines?: { m: number; b: number; color?: string; dashed?: boolean; label?: string; from?: number; to?: number }[];
  /** Points (étiquette à droite par défaut). */
  points?: { x: number; y: number; pulse?: boolean; guide?: boolean; key?: boolean; label?: string; labelSide?: 'left' | 'right' }[];
  /** Droite (index) ou point clé mis en avant. */
  focus?: number | 'point';
  /** Pastille de légende du point clé (« Solution »). */
  pointLegend?: string;
  /** Texte accessible. */
  description?: string;
}
export declare function MathGraph(props: MathGraphProps): React.ReactElement;

/** Tableau blanc : calcul ligne à ligne, opérations en bleu, notes numérotées, résultat entouré ; s'écrit en direct en vocal. */
export interface WhiteboardProps {
  /** Matière. */
  subject?: SubjectId;
  /** Lignes du calcul ; op = opération qui mène à cette ligne. */
  steps?: { expr: string; op?: string; note?: string }[];
  /** Résultat entouré. */
  result?: string;
  /** Note du résultat. */
  resultNote?: string;
  /** Lignes déjà écrites (le résultat compte pour une) ; tout est visible par défaut. */
  progress?: number;
  /** Stylo au bout de la dernière ligne écrite. */
  writing?: boolean;
  /** Résultat entouré (true par défaut). */
  circled?: boolean;
  /** Texte accessible. */
  description?: string;
}
export declare function Whiteboard(props: WhiteboardProps): React.ReactElement;

/** Barre du haut de l'appel vocal : « Écrit » et chrono. */
export interface CallTopBarProps {
  /** Durée affichée, « 02:17 ». */
  elapsed?: string;
  /** Point qui clignote (true par défaut). */
  live?: boolean;
  /** Passer à l'écrit. */
  onWritten?: () => void;
}
export declare function CallTopBar(props: CallTopBarProps): React.ReactElement;

/** Le logo du tuteur en appel : il rebondit au niveau de sa voix, penche la tête quand il écoute. */
export interface VoiceAvatarProps {
  /** Qui a la parole. */
  state?: 'speaking' | 'listening' | 'idle' | 'muted' | 'connecting';
  /** Niveau de la voix du tuteur, 0 à 1, lissé (simulé s'il est absent). */
  level?: number;
  /** 148 (par défaut) ou 96. */
  size?: number;
  /** Libellé accessible. */
  label?: string;
  /** Toucher pendant que le tuteur parle : l'interrompre. */
  onInterrupt?: () => void;
  /** Appui long (600 ms) : signaler. */
  onLongPress?: () => void;
}
export declare function VoiceAvatar(props: VoiceAvatarProps): React.ReactElement;

/** Pastille d'état de l'appel : verte « Je t'explique… », rouge « Je t'écoute… », neutre sinon. */
export interface VoiceStatusProps {
  /** État de l'appel. */
  state?: 'speaking' | 'listening' | 'muted' | 'connecting' | 'ended' | 'error';
  /** Couleur de « Je t'écoute… » (rouge par défaut). */
  listenColor?: 'red' | 'orange';
  /** Hauteur 40 ou 32 px. */
  size?: 'md' | 'sm';
  /** Remplace le libellé. */
  label?: string;
}
export declare function VoiceStatus(props: VoiceStatusProps): React.ReactElement;

/** Sous-titres en direct : mots dits en blanc, suivants à 45 %, couleurs nommées en pastille. */
export interface LiveCaptionsProps {
  /** Phrase en cours. */
  text?: string;
  /** Mots déjà prononcés (tous par défaut). */
  spoken?: number;
  /** Qui parle. */
  speaker?: 'tutor' | 'student';
  /** Affiche « Tutor'IA » ou « Toi ». */
  showSpeaker?: boolean;
  /** Sur le dégradé (blanc) ou sur fond clair. */
  surface?: 'brand' | 'light';
  /** 20/30 (lg) ou 16/22 (md). */
  size?: 'lg' | 'md';
  /** Lignes au plus. */
  maxLines?: number;
  /** Pastilles de couleur (true par défaut). */
  colorWords?: boolean;
  /** Alignement. */
  align?: 'center' | 'left';
  /** Texte quand la phrase est vide. */
  placeholder?: React.ReactNode;
}
export declare function LiveCaptions(props: LiveCaptionsProps): React.ReactElement;

/** Commandes de l'appel en verre : micro, sous-titres, caméra, raccrocher. */
export interface CallDockProps {
  /** Micro coupé. */
  muted?: boolean;
  /** Sous-titres affichés (true par défaut). */
  captionsOn?: boolean;
  /** Photo en cours. */
  cameraOn?: boolean;
  /** Bouton caméra présent (true par défaut ; false si les parents l'ont désactivée). */
  cameraVisible?: boolean;
  /** Micro. */
  onToggleMute?: () => void;
  /** Sous-titres. */
  onToggleCaptions?: () => void;
  /** Montrer un exercice. */
  onCamera?: () => void;
  /** Raccrocher et revenir au chat écrit. */
  onHangUp?: () => void;
}
export declare function CallDock(props: CallDockProps): React.ReactElement;

/** Carte « Révision du jour » : nombre de cartes, durée, série, matières concernées et bouton vert vif. */
export interface DailyReviewCardProps {
  /** Cartes à revoir. */
  count?: number;
  /** Durée estimée. */
  minutes?: number;
  /** Série (pastille orange). */
  streak?: number;
  /** Jusqu'à 3 matières en pastilles. */
  subjects?: SubjectId[];
  /** Matières en plus (« +2 »). */
  extra?: number;
  /** « Révision du jour ». */
  title?: string;
  /** « C'est parti ». */
  actionLabel?: string;
  /** Action. */
  onStart?: () => void;
  /** Lien. */
  href?: string;
}
export declare function DailyReviewCard(props: DailyReviewCardProps): React.ReactElement;

/** Ligne de chapitre à réviser : numéro dans la couleur de la matière, titre, cartes et durée. */
export interface ChapterRowProps {
  /** Numéro. */
  index?: number;
  /** Chapitre. */
  title?: string;
  /** Nombre de cartes. */
  cards?: number;
  /** Durée. */
  minutes?: number;
  /** Matière. */
  subject?: SubjectId;
  /** Sélectionné. */
  selected?: boolean;
  /** Action. */
  onClick?: () => void;
}
export declare function ChapterRow(props: ChapterRowProps): React.ReactElement;

/** Barre d'avancement d'une session de flashcards avec le compteur « 4 / 12 ». */
export interface SessionProgressProps {
  /** Carte en cours. */
  value?: number;
  /** Total. */
  total?: number;
  /** Matière (couleur de la barre). */
  subject?: SubjectId;
}
export declare function SessionProgress(props: SessionProgressProps): React.ReactElement;

/** Réponse de QCM (lettre + texte), en grille 2×2 ; se colore en vert ou orange après le choix. */
export interface AnswerOptionProps {
  /** A, B, C, D. */
  letter?: string;
  /** État après réponse. */
  state?: 'default' | 'correct' | 'wrong' | 'dimmed';
  /** Choisie par l'élève. */
  chosen?: boolean;
  /** Non cliquable. */
  disabled?: boolean;
  /** Choix. */
  onClick?: () => void;
  /** Texte. */
  children?: React.ReactNode;
}
export declare function AnswerOption(props: AnswerOptionProps): React.ReactElement;

/** Carte de flashcard en QCM : question, 4 réponses en 2×2, puis l'explication après le choix. */
export interface QuizCardProps {
  /** Matière (en-tête coloré). */
  subject?: SubjectId;
  /** Question. */
  question?: string;
  /** 4 réponses. */
  options?: string[];
  /** Index de la bonne réponse. */
  answer?: number;
  /** Index choisi (contrôlé). */
  picked?: number;
  /** Choix. */
  onAnswer?: (index: number) => void;
  /** Explication après réponse. */
  explanation?: string;
  /** Indice avant réponse. */
  hint?: string;
}
export declare function QuizCard(props: QuizCardProps): React.ReactElement;

/** Compteurs de session : cartes sues (vert) et à revoir (orange). */
export interface TallyChipsProps {
  /** Cartes sues. */
  known?: number;
  /** Cartes à revoir. */
  review?: number;
}
export declare function TallyChips(props: TallyChipsProps): React.ReactElement;

/** Chiffre clé sur dégradé coloré avec picto en filigrane et évolution. */
export interface KpiCardProps {
  /** Couleur. */
  tone?: 'blue' | 'hero' | 'cyan' | 'violet' | 'green' | 'red' | 'orange' | 'slate';
  /** Picto. */
  icon?: string;
  /** Libellé. */
  label?: string;
  /** Valeur. */
  value?: string;
  /** Évolution (ex. « +12 % »). */
  delta?: string;
  /** Version réduite. */
  compact?: boolean;
}
export declare function KpiCard(props: KpiCardProps): React.ReactElement;

/** Histogramme vertical (temps par jour), barre du jour en primary, ligne d'objectif en pointillés. */
export interface BarChartProps {
  /** Barres. */
  data?: { label: string; value: number; tip?: string }[];
  /** Échelle. */
  max?: number;
  /** Ligne d'objectif. */
  goal?: number;
  /** Hauteur (140 par défaut). */
  height?: number;
}
export declare function BarChart(props: BarChartProps): React.ReactElement;

/** Courbe d'évolution avec aire dégradée ; onColor pour la poser sur une carte colorée. */
export interface LineChartProps {
  /** Points. */
  values?: number[];
  /** Étiquettes x. */
  labels?: string[];
  /** Minimum. */
  min?: number;
  /** Maximum. */
  max?: number;
  /** Version blanche sur carte colorée (par défaut) ; false sur fond blanc. */
  onColor?: boolean;
  /** Texte accessible. */
  description?: string;
}
export declare function LineChart(props: LineChartProps): React.ReactElement;

/** Calendrier d'activité : une case par jour, 5 niveaux d'intensité en bleu. */
export interface HeatmapProps {
  /** Semaines × 7 jours, niveaux 0 à 4. */
  weeks?: number[][];
}
export declare function Heatmap(props: HeatmapProps): React.ReactElement;

/** Progression d'une matière : picto de la matière en couleur, nom, barre et pourcentage. */
export interface SubjectProgressRowProps {
  /** Matière. */
  subject?: SubjectId;
  /** Progression en %. */
  value?: number;
}
export declare function SubjectProgressRow(props: SubjectProgressRowProps): React.ReactElement;

/** Carte « points forts » (vert) ou « à retravailler » (orange) avec une liste de notions. */
export interface InsightListProps {
  /** Type. */
  tone?: 'strengths' | 'review';
  /** Titre. */
  title?: string;
  /** Sous-titre. */
  subtitle?: string;
  /** Notions. */
  items?: { title: string; meta: string; value?: number; actionLabel?: string; onAction?: () => void; href?: string }[];
}
export declare function InsightList(props: InsightListProps): React.ReactElement;

/** Grande carte héros sur dégradé bleu → violet, avec logo, surtitre, titre et message. */
export interface HeroCardProps {
  /** Surtitre. */
  kicker?: string;
  /** Titre. */
  title?: string;
  /** Ligne sous le titre. */
  caption?: string;
  /** Pastille logo. */
  logo?: boolean;
  /** Titre 28px. */
  big?: boolean;
  /** Picto en filigrane. */
  icon?: string;
  /** Pastille verte de progrès. */
  badge?: string;
  /** Libellé accessible. */
  label?: string;
  /** Message. */
  children?: React.ReactNode;
}
export declare function HeroCard(props: HeroCardProps): React.ReactElement;

/** Alerte douce (orange) sur un point à surveiller, avec une action. */
export interface AlertCardProps {
  /** Titre. */
  title?: string;
  /** Texte. */
  children?: React.ReactNode;
  /** Action. */
  actionLabel?: string;
  /** Action. */
  onAction?: () => void;
  /** Lien. */
  href?: string;
}
export declare function AlertCard(props: AlertCardProps): React.ReactElement;

/** Conseil aux parents en violet accent, avec une ampoule. */
export interface AdviceCardProps {
  /** « Comment l'encourager » par défaut. */
  title?: string;
  /** Texte. */
  children?: React.ReactNode;
}
export declare function AdviceCard(props: AdviceCardProps): React.ReactElement;

/** Carte dépliable d'une matière : score, évolution, barre segmentée par chapitre et liste des chapitres. */
export interface SubjectProgressCardProps {
  /** Matière. */
  subject?: SubjectId;
  /** Score en %. */
  value?: number;
  /** Évolution en points. */
  delta?: number;
  /** Chapitres (acquired, inProgress, toConsolidate, notStarted). */
  chapters?: { title: string; meta?: string; status: 'acquired' | 'inProgress' | 'toConsolidate' | 'notStarted' }[];
  /** Contrôlé. */
  open?: boolean;
  /** Ouvert au départ. */
  defaultOpen?: boolean;
  /** Déplier. */
  onToggle?: () => void;
}
export declare function SubjectProgressCard(props: SubjectProgressCardProps): React.ReactElement;

/** Résumé d'une séance : en-tête aux couleurs de la matière, résumé, bilan et modes utilisés. */
export interface SessionSummaryCardProps {
  /** Matière. */
  subject?: SubjectId;
  /** Notion. */
  title?: string;
  /** Date et durée. */
  meta?: string;
  /** Résumé en une ou deux phrases. */
  summary?: string;
  /** Bilan. */
  outcome?: 'understood' | 'progressing' | 'toReview';
  /** Modes utilisés. */
  modes?: ('ecrit' | 'vocal' | 'tableau' | 'graphique' | 'flashcards')[];
}
export declare function SessionSummaryCard(props: SessionSummaryCardProps): React.ReactElement;

/** Ligne de réglage : pastille d'icône colorée, libellé, aide, et interrupteur ou chevron. */
export interface SettingRowProps {
  /** Icône. */
  icon?: string;
  /** Couleur de la pastille. */
  tone?: 'orange' | 'violet' | 'blue' | 'cyan' | 'red' | 'green';
  /** Libellé. */
  label?: string;
  /** Aide. */
  hint?: string;
  /** Affiche un interrupteur. */
  checked?: boolean;
  /** Changement de l'interrupteur. */
  onChange?: () => void;
  /** Lien (chevron). */
  href?: string;
  /** Action (chevron). */
  onClick?: () => void;
  /** Séparateur en haut. */
  divider?: boolean;
}
export declare function SettingRow(props: SettingRowProps): React.ReactElement;
export type ProfileTone = 'orange' | 'violet' | 'blue' | 'green' | 'red' | 'cyan';
export interface ProfileHeroProps {
  /** Prénom, en 44 Black. */
  name?: string;
  /** Classe (« 4e » donne « Élève de 4e »). */
  grade?: string;
  /** Ligne sous la classe (« Depuis septembre »). */
  since?: string;
  /** Surtitre (« Mon profil » par défaut). */
  kicker?: string;
  /** Image de la figurine (dans l'app : la figurine 3D) ; sans image, l'initiale dans un disque blanc. */
  avatarSrc?: string;
  /** Texte alternatif de la figurine. */
  avatarAlt?: string;
  /** Nouveautés de la garde-robe : pastille orange sur « Modifier l'avatar ». */
  newsCount?: number;
  /** « Modifier l'avatar » (ou « Créer mon avatar » sans figurine). */
  onEditAvatar?: () => void;
  /** Retour ; null masque la flèche. */
  onBack?: (() => void) | null;
}
export declare function ProfileHero(props: ProfileHeroProps): React.ReactElement;
export interface LevelBarProps {
  /** Niveau atteint. */
  level?: number;
  /** XP gagnés dans ce niveau. */
  xp?: number;
  /** XP du niveau (seuil du suivant). */
  xpMax?: number;
}
export declare function LevelBar(props: LevelBarProps): React.ReactElement;
export interface ProfileSummaryProps {
  /** Trois chiffres : icône, couleur, valeur, légende. */
  stats?: { icon: string; tone?: ProfileTone; value: string; label: string }[];
  /** Niveau, XP et seuil : affiche la barre de niveau sous les chiffres. */
  level?: number;
  xp?: number;
  xpMax?: number;
  /** Libellé accessible de la carte. */
  label?: string;
}
export declare function ProfileSummary(props: ProfileSummaryProps): React.ReactElement;
export interface TrophyBadgeProps {
  /** Nom du trophée (deux lignes au plus). */
  label: string;
  /** Icône (crown, flame, compass, star, trophy…). */
  icon?: string;
  /** Couleur de la médaille. */
  tone?: ProfileTone;
  /** Pas encore gagné : grisé avec un cadenas. */
  locked?: boolean;
  /** Ouvre le détail du trophée. */
  onClick?: () => void;
}
export declare function TrophyBadge(props: TrophyBadgeProps): React.ReactElement;
export interface TrophyShelfProps {
  /** Titre (« Mes trophées »). */
  title?: string;
  /** Trophées, les gagnés d'abord. */
  trophies?: TrophyBadgeProps[];
  /** Nombre gagné (calculé sinon). */
  earned?: number;
  /** Nombre total de trophées. */
  total?: number;
}
export declare function TrophyShelf(props: TrophyShelfProps): React.ReactElement;

/** Grande carte de choix du profil (élève en bleu, parent en violet) sur l'écran de bienvenue. */
export interface ProfileChoiceCardProps {
  /** Profil. */
  role?: 'eleve' | 'parent';
  /** « Je suis élève » ou « Je suis parent » par défaut. */
  title?: string;
  /** Anneau et coche. */
  selected?: boolean;
  /** Choix. */
  onClick?: () => void;
}
export declare function ProfileChoiceCard(props: ProfileChoiceCardProps): React.ReactElement;

/** Illustration d'accueil : les six pastilles de matières inclinées autour du logo. */
export interface SubjectClusterProps {
  /** Hauteur (176 par défaut). */
  height?: number;
  /** false pour retirer le logo central. */
  logo?: boolean;
}
export declare function SubjectCluster(props: SubjectClusterProps): React.ReactElement;

/** En-tête coloré des écrans de connexion : surtitre de l'espace, titre et phrase d'accueil. */
export interface AuthHeroProps {
  /** Espace (couleur, picto, surtitre). */
  space?: 'eleve' | 'parents';
  /** Surtitre (« Espace élève » par défaut). */
  kicker?: string;
  /** Titre. */
  title?: string;
  /** Phrase sous le titre. */
  subtitle?: string;
}
export declare function AuthHero(props: AuthHeroProps): React.ReactElement;
export interface AuthScreenProps {
  /** Espace : bleu élève (tutoiement) ou violet parents (vouvoiement). */
  space?: 'eleve' | 'parents';
  /** Titre en blanc sous le logo. */
  title?: string;
  /** Phrase sous le titre. */
  subtitle?: string;
  /** Retour (flèche en verre en haut à gauche) ; null pour la masquer. */
  onBack?: (() => void) | null;
  /** Le logo fait un petit rebond à l'arrivée (true par défaut). */
  greet?: boolean;
  /** Hauteur minimale de l'écran (844 par défaut). */
  height?: number;
  /** Bas de la feuille : « J'ai un code de mon parent », « Créer un compte ». */
  footer?: React.ReactNode;
  /** Contenu de la feuille blanche : formulaire, séparateur, boutons Apple / Google. */
  children?: React.ReactNode;
}
export declare function AuthScreen(props: AuthScreenProps): React.ReactElement;

/** Champ de formulaire 52px avec libellé, icône, pastille optionnelle, aide et bouton « afficher » pour les mots de passe. */
export interface TextFieldProps {
  /** Libellé au-dessus. */
  label?: string;
  /** Icône à gauche (user, mail, lock, key). */
  icon?: string;
  /** text, email, password. */
  type?: string;
  /** Valeur contrôlée. */
  value?: string;
  /** Valeur initiale. */
  defaultValue?: string;
  /** Saisie. */
  onChange?: (value: string) => void;
  /** Exemple. */
  placeholder?: string;
  /** Champ rempli (fond bg, sans ombre) : dans une carte ou une feuille blanche. */
  filled?: boolean;
  /** Pastille à droite du libellé. */
  badge?: string;
  /** Aide sous le champ. */
  hint?: string;
  /** Saisie automatique. */
  autoComplete?: string;
  /** numeric pour un code. */
  inputMode?: string;
  /** Longueur max. */
  maxLength?: number;
}
export declare function TextField(props: TextFieldProps): React.ReactElement;

/** Règles du mot de passe cochées en vert au fil de la saisie. */
export interface PasswordRulesProps {
  /** Règles et leur état. */
  rules?: { label: string; ok: boolean }[];
  /** Sur une ligne. */
  inline?: boolean;
}
export declare function PasswordRules(props: PasswordRulesProps): React.ReactElement;

/** Case à cocher 24px avec son texte, bleue côté élève, violette côté parent. */
export interface CheckboxProps {
  /** État. */
  checked?: boolean;
  /** Changement. */
  onChange?: (checked: boolean) => void;
  /** Couleur. */
  tone?: 'eleve' | 'parents';
  /** Texte. */
  children?: React.ReactNode;
}
export declare function Checkbox(props: CheckboxProps): React.ReactElement;

/** Séparateur « ou » entre le formulaire et les connexions Apple / Google. */
export interface OrDividerProps {
  /** « ou » par défaut. */
  label?: string;
}
export declare function OrDivider(props: OrDividerProps): React.ReactElement;

/** Boutons « Continuer avec Apple » et « Continuer avec Google », placés sous le formulaire. */
export interface AuthProviderButtonsProps {
  /** Empilés ou côte à côte. */
  layout?: 'stack' | 'row';
  /** Apple. */
  onApple?: () => void;
  /** Google. */
  onGoogle?: () => void;
}
export declare function AuthProviderButtons(props: AuthProviderButtonsProps): React.ReactElement;

/** Carte violette qui affiche le code à 6 chiffres pour relier le compte de l'enfant, avec sa validité et un bouton de partage. */
export interface ParentCodeCardProps {
  /** Code (ex. « 482 913 »). */
  code?: string;
  /** Prénom de l'enfant. */
  name?: string;
  /** « Valable 24 h » par défaut. */
  validity?: string;
  /** Partager. */
  onShare?: () => void;
  /** Libellé du bouton. */
  shareLabel?: string;
}
export declare function ParentCodeCard(props: ParentCodeCardProps): React.ReactElement;

/** Liste d'étapes numérotées dans une carte blanche. */
export interface StepListProps {
  /** Titre. */
  title?: string;
  /** Icône du titre. */
  icon?: string;
  /** Couleur des numéros. */
  tone?: 'eleve' | 'parents';
  /** Étapes. */
  steps?: string[];
}
export declare function StepList(props: StepListProps): React.ReactElement;

/** En-tête des parcours en plusieurs étapes : retour, « Étape n sur N », barre segmentée et lien « Passer ». */
export interface StepHeaderProps {
  /** Étape en cours. */
  step?: number;
  /** Nombre d’étapes (4 par défaut). */
  total?: number;
  /** Couleur. */
  tone?: 'eleve' | 'parents';
  /** Retour. */
  onBack?: () => void;
  /** Retour en lien. */
  backHref?: string;
  /** Affiche « Passer ». */
  onSkip?: () => void;
  /** Libellé du lien. */
  skipLabel?: string;
}
export declare function StepHeader(props: StepHeaderProps): React.ReactElement;

/** Choix de la classe du CP à la Terminale, groupé par cycle ou en grille compacte. */
export interface GradePickerProps {
  /** Classe (contrôlée). */
  value?: string;
  /** Classe initiale. */
  defaultValue?: string;
  /** Choix. */
  onChange?: (grade: string) => void;
  /** false : grille 4 colonnes. */
  grouped?: boolean;
  /** Couleur. */
  tone?: 'eleve' | 'parents';
  /** Libellé accessible. */
  label?: string;
}
export declare function GradePicker(props: GradePickerProps): React.ReactElement;

/** Auto-évaluation d'une matière sur 4 niveaux (Galère, Bof, Ça va, À l’aise) dans la couleur de la matière. */
export interface SelfAssessmentRowProps {
  /** Matière. */
  subject?: SubjectId;
  /** Niveau 0 à 3 (contrôlé). */
  value?: number;
  /** Niveau initial. */
  defaultValue?: number;
  /** Choix. */
  onChange?: (level: { id: string; type: LevelType; title: string }) => void;
  /** Libellés des 4 niveaux. */
  levels?: string[];
}
export declare function SelfAssessmentRow(props: SelfAssessmentRowProps): React.ReactElement;

/** Tuile d'objectif à cocher, qui se remplit du dégradé de sa couleur une fois choisie. */
export interface GoalTileProps {
  /** Objectif. */
  label?: string;
  /** Picto. */
  icon?: string;
  /** Couleur. */
  tone?: 'green' | 'violet' | 'red' | 'brown' | 'cyan' | 'blue';
  /** Coché. */
  selected?: boolean;
  /** Basculer. */
  onClick?: () => void;
}
export declare function GoalTile(props: GoalTileProps): React.ReactElement;

/** Choix du temps de travail par jour (10, 15, 20, 30 min). */
export interface DurationPickerProps {
  /** Durées. */
  options?: number[];
  /** Durée (contrôlée). */
  value?: number;
  /** Durée initiale. */
  defaultValue?: number;
  /** Choix. */
  onChange?: (minutes: number) => void;
  /** « min » par défaut. */
  unit?: string;
  /** Couleur. */
  tone?: 'eleve' | 'parents';
}
export declare function DurationPicker(props: DurationPickerProps): React.ReactElement;

/** Ligne de choix avec pastille d'icône, titre et aide ; se remplit du dégradé de sa couleur une fois choisie. */
export interface ChoiceRowProps {
  /** Icône. */
  icon?: string;
  /** Couleur (blue, violet, red, cyan…). */
  tone?: string;
  /** Titre. */
  label?: string;
  /** Aide. */
  hint?: string;
  /** Choisi. */
  selected?: boolean;
  /** Bouton radio. */
  single?: boolean;
  /** Basculer. */
  onClick?: () => void;
}
export declare function ChoiceRow(props: ChoiceRowProps): React.ReactElement;

/** Puce à cocher avec icône, bordée de bleu une fois choisie. */
export interface ToggleChipProps {
  /** Icône. */
  icon?: string;
  /** Libellé. */
  label?: string;
  /** Choisie. */
  selected?: boolean;
  /** Basculer. */
  onClick?: () => void;
}
export declare function ToggleChip(props: ToggleChipProps): React.ReactElement;

/** Étape du plan personnalisé : pastille de la matière, surtitre, titre et raison. */
export interface PlanRowProps {
  /** Matière (pastille et couleur). */
  subject?: SubjectId;
  /** Icône si pas de matière. */
  icon?: string;
  /** Couleur si pas de matière. */
  tone?: string;
  /** Surtitre. */
  kicker?: string;
  /** Titre. */
  title?: string;
  /** Explication. */
  meta?: string;
}
export declare function PlanRow(props: PlanRowProps): React.ReactElement;

/** Trois étoiles de réussite (0 à 3), pleines en orange, vides en gris. */
export interface StarsProps {
  /** Étoiles obtenues. */
  value?: 0 | 1 | 2 | 3;
  /** Taille en px (16 par défaut). */
  size?: number;
  /** Version blanche pour fond coloré. */
  onColor?: boolean;
  /** Contour blanc (sur la carte). */
  outline?: boolean;
  /** Écart entre étoiles. */
  gap?: number;
}
export declare function Stars(props: StarsProps): React.ReactElement;

/** Île flottante en illustration vectorielle simple : rocher facetté, herbe, cascade et motifs de la matière (règle et équerre pour les maths). */
export interface IslandIllustrationProps {
  /** Matière de l'île. */
  subject?: SubjectId;
  /** Largeur en px (300 par défaut). */
  size?: number;
  /** Afficher les motifs de la matière (vrai par défaut). */
  motifs?: boolean;
  /** Nom accessible (sinon décoratif). */
  label?: string;
  /** Suffixe des id SVG quand plusieurs îles cohabitent. */
  idSuffix?: string;
}
export declare function IslandIllustration(props: IslandIllustrationProps): React.ReactElement;

/** Carrousel des îles-matières : nom de la matière en pastille dégradée, île centrale qui flotte, îles voisines estompées, flèches et points. */
export interface IslandCarouselProps {
  /** Ordre des îles (les 6 matières par défaut). */
  subjects?: SubjectId[];
  /** Île affichée (contrôlé). */
  index?: number;
  /** Île de départ (non contrôlé). */
  defaultIndex?: number;
  /** Changement d'île. */
  onChange?: (index: number, subject: SubjectId) => void;
}
export declare function IslandCarousel(props: IslandCarouselProps): React.ReactElement;

/** Carte d'avancement d'une île : villes validées, étoiles, barre aux couleurs de la matière et bouton « Explorer l'île ». */
export interface IslandProgressCardProps {
  /** Matière (couleur de la barre). */
  subject?: SubjectId;
  /** Villes validées. */
  done?: number;
  /** Villes au total. */
  total?: number;
  /** Étoiles cumulées. */
  stars?: number;
  /** Prochaine étape. */
  next?: string;
  /** Libellé du bouton. */
  actionLabel?: string;
  /** Clic sur le bouton. */
  onExplore?: () => void;
  /** Lien du bouton. */
  href?: string;
}
export declare function IslandProgressCard(props: IslandProgressCardProps): React.ReactElement;

/** En-tête flottant de la carte : retour aux îles, île, ville et région courantes, série et niveau. */
export interface ExplorerHudProps {
  /** Couleur du nom de l'île. */
  subject?: SubjectId;
  /** Nom de l'île. */
  island?: string;
  /** Ville courante (chapitre). */
  city?: string;
  /** Région (thème). */
  region?: string;
  /** Jours de série. */
  streak?: number;
  /** Niveau de l'élève. */
  level?: number;
  /** Retour aux îles. */
  onBack?: () => void;
  /** Libellé accessible du retour. */
  backLabel?: string;
}
export declare function ExplorerHud(props: ExplorerHudProps): React.ReactElement;

/** Point de niveau sur la carte. Couleur et icône selon le type : leçon verte (livre), exercices bleus (crayon), évaluation rouge (couronne, plus grande, double anneau). États terminé (coche et étoiles), en cours (halo pulsé) et verrouillé (gris, cadenas). */
export interface LevelNodeProps {
  /** Type de niveau. */
  type?: LevelType;
  /** État. */
  state?: 'completed' | 'active' | 'locked';
  /** Étoiles si terminé. */
  stars?: number;
  /** Titre (libellé accessible). */
  title?: string;
  /** Ouvre la fiche du niveau. */
  onClick?: () => void;
}
export declare function LevelNode(props: LevelNodeProps): React.ReactElement;

/** Avatar de l'élève qui flotte au-dessus du niveau en cours (initiale dans une pastille bleue). */
export interface MapAvatarProps {
  /** Initiale de l'élève. */
  initial?: string;
}
export declare function MapAvatar(props: MapAvatarProps): React.ReactElement;

/** Panneau d'une ville (chapitre) : validée en vert, en cours en rouge avec drapeau, à consolider en orange, verrouillée en gris. */
export interface CityBannerProps {
  /** Nom de la ville. */
  name?: string;
  /** État de la ville. */
  status?: 'done' | 'current' | 'consolidate' | 'locked';
}
export declare function CityBanner(props: CityBannerProps): React.ReactElement;

/** Panonceau de région (thème de la matière) : surtitre « Région N » et nom. */
export interface RegionSignProps {
  /** Numéro de région. */
  index?: number;
  /** Nom de la région. */
  name?: string;
  /** Couleur du surtitre. */
  color?: string;
}
export declare function RegionSign(props: RegionSignProps): React.ReactElement;

/** Carte d'une île façon jeu d'aventure : mer, bande de terre, chemin en vague (orange parcouru, gris à venir), villes, niveaux et avatar. Défile horizontalement. */
export interface WorldMapProps {
  /** Niveaux dans l’ordre. */
  levels?: Array<{ id: string; type: LevelType; state: 'completed' | 'active' | 'locked'; stars?: number; title: string; gapBefore?: number }>;
  /** Villes et leur premier niveau. */
  cities?: Array<{ name: string; status: 'done' | 'current' | 'consolidate' | 'locked'; startIndex: number }>;
  /** Initiale de l'avatar. */
  initial?: string;
  /** Hauteur (844 par défaut). */
  height?: number;
  /** Axe du chemin. */
  centerY?: number;
  /** Amplitude de la vague. */
  amplitude?: number;
  /** Écart horizontal entre niveaux. */
  step?: number;
  /** Clic sur un niveau. */
  onSelect?: (level: { id: string; type: LevelType; title: string }) => void;
  /** Nom accessible de la carte. */
  label?: string;
}
export declare function WorldMap(props: WorldMapProps): React.ReactElement;

/** Étiquette du type de niveau : pastille dégradée avec l'icône et libellé sur fond doux de la même couleur. */
export interface LevelTypePillProps {
  /** Type de niveau. */
  type?: LevelType;
}
export declare function LevelTypePill(props: LevelTypePillProps): React.ReactElement;

/** Fiche d'un niveau en feuille du bas : type, titre, lieu, durée, étoiles, objectifs, règle de l'évaluation et lancement du chat à l'écrit ou à la voix (le dernier mode utilisé en premier). */
export interface LevelSheetProps {
  /** Type de niveau. */
  type?: LevelType;
  /** Titre. */
  title?: string;
  /** Île, ville, région. */
  where?: string;
  /** Durée estimée. */
  minutes?: number;
  /** Meilleur score. */
  stars?: number;
  /** Objectifs. */
  objectives?: string[];
  /** Règle spéciale (évaluation : pas d'indice). */
  rule?: string;
  /** Niveau verrouillé : explication. */
  lockedMessage?: string;
  /** Dernier mode utilisé. */
  lastMode?: 'ecrit' | 'vocal';
  /** Lance le chat écrit. */
  onWritten?: () => void;
  /** Lance le chat vocal. */
  onVoice?: () => void;
  /** Ferme la fiche. */
  onClose?: () => void;
}
export declare function LevelSheet(props: LevelSheetProps): React.ReactElement;

/** Fond d'écran du chat d'un niveau aux couleurs de l'île : dégradé doux de la matière, motifs et île miniature en haut à droite. */
export interface IslandBackdropProps {
  /** Matière de l'île. */
  subject?: SubjectId;
  /** Hauteur (100 % par défaut). */
  height?: number | string;
  /** Contenu posé sur le fond. */
  children?: React.ReactNode;
}
export declare function IslandBackdrop(props: IslandBackdropProps): React.ReactElement;

/** En-tête du chat d'un niveau : retour à la carte, type et titre, bascule écrit / vocal et progression en segments de la couleur du type. */
export interface LevelProgressHeaderProps {
  /** Type de niveau. */
  type?: LevelType;
  /** Titre. */
  title?: string;
  /** Étape en cours. */
  step?: number;
  /** Nombre d'étapes. */
  total?: number;
  /** Ville (ajoutée au libellé). */
  city?: string;
  /** Mode actif. */
  mode?: 'ecrit' | 'vocal';
  /** Bascule de mode. */
  onModeChange?: (mode: 'ecrit' | 'vocal') => void;
  /** Retour à la carte. */
  onBack?: () => void;
}
export declare function LevelProgressHeader(props: LevelProgressHeaderProps): React.ReactElement;

/** Tableau du tuteur en mode vocal : les étapes du calcul s'écrivent au fil de la voix (faites en vert, à venir en gris). */
export interface VoiceBoardCardProps {
  /** Surtitre (« Au tableau du tuteur »). */
  title?: string;
  /** Lignes du tableau. */
  lines?: Array<{ expr: string; state?: 'done' | 'todo' }>;
}
export declare function VoiceBoardCard(props: VoiceBoardCardProps): React.ReactElement;

/** Carte de bilan d'un niveau : validé sur dégradé vert, à consolider sur dégradé orange, étoiles, message, score et XP. */
export interface LevelResultCardProps {
  /** Type de niveau. */
  type?: LevelType;
  /** Réussi (vrai par défaut). */
  validated?: boolean;
  /** Étoiles obtenues. */
  stars?: number;
  /** Titre. */
  headline?: string;
  /** Message. */
  message?: string;
  /** Score (« 4/5 »). */
  score?: string;
  /** XP gagnés. */
  xp?: number;
}
export declare function LevelResultCard(props: LevelResultCardProps): React.ReactElement;

/** Retour du tuteur en fin de niveau : ce qui est réussi (vert) ou ce qui est à revoir (orange). */
export interface TutorFeedbackProps {
  /** Réussi ou à revoir. */
  kind?: 'success' | 'review';
  /** Surtitre. */
  title?: string;
  /** Texte. */
  children?: React.ReactNode;
}
export declare function TutorFeedback(props: TutorFeedbackProps): React.ReactElement;

export declare const SUBJECTS: Record<SubjectId, { name: string; gradient: string; soft: string; ink: string; deep: string; bar: string }>;
export declare const LEVEL_TYPES: Record<LevelType, { label: string; icon: string; grad: string; solid: string; soft: string; ink: string; ring: string }>;
export declare const ICONS: Record<string, string>;
export declare const VISUAL_KINDS: Record<VisualKind, { name: string; gradient: string; soft: string; border: string; ink: string; icon: string; noun: string; label: string }>;
