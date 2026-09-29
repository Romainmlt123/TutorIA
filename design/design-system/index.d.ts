// Tutor'IA — types des composants (documentation). window.TutorIA.<Composant>.
import * as React from "react";

export type SubjectId = 'maths' | 'francais' | 'histoire-geo' | 'anglais' | 'svt' | 'physique-chimie';

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

/** Barre de navigation flottante en bas de l'écran, 4 onglets, l'actif monte dans une bulle bleue. */
export interface BottomNavProps {
  /** Jeu d'onglets. */
  space?: 'eleve' | 'parents';
  /** Onglet actif : accueil, tuteur, flashcards, stats ou accueil, progres, sessions, reglages. */
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

/** Quatre barres animées bleu → violet qui suivent la voix du tuteur, avec l'état en dessous. */
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

/** Commandes d'appel du tuteur vocal : micro, raccrocher (rouge, au centre), caméra. */
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

/** En-tête d'un panneau visuel (graphique ou tableau blanc) : surtitre matière, titre, agrandir, replier. */
export interface PanelHeaderProps {
  /** Type de panneau. */
  kind?: 'graph' | 'whiteboard';
  /** Matière (couleurs). */
  subject?: SubjectId;
  /** Surtitre (par défaut « Graphique · Maths »). */
  kicker?: string;
  /** Titre. */
  title?: string;
  /** Point rouge clignotant (le tuteur dessine). */
  live?: boolean;
  /** Chevron ouvert / fermé. */
  open?: boolean;
  /** Replier / déplier. */
  onToggle?: () => void;
  /** Plein écran. */
  onExpand?: () => void;
}
export declare function PanelHeader(props: PanelHeaderProps): React.ReactElement;

/** Panneau repliable qui accueille un graphique ou un tableau blanc au-dessus du chat. */
export interface VisualPanelProps {
  /** Type. */
  kind?: 'graph' | 'whiteboard';
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
  /** Replier. */
  onToggle?: () => void;
  /** Agrandir. */
  onExpand?: () => void;
  /** Contenu (MathGraph, Whiteboard). */
  children?: React.ReactNode;
  /** Légende sous le visuel. */
  footer?: React.ReactNode;
}
export declare function VisualPanel(props: VisualPanelProps): React.ReactElement;

/** Repère cartésien en SVG : quadrillage, droites y = mx + b, points (avec halo et pointillés de lecture). */
export interface MathGraphProps {
  /** Matière (couleur des tracés). */
  subject?: SubjectId;
  /** Bornes en x. */
  xRange?: [number, number];
  /** Bornes en y. */
  yRange?: [number, number];
  /** Pas des graduations y. */
  yStep?: number;
  /** Droites. */
  lines?: { m: number; b: number; color?: string; dashed?: boolean; label?: string }[];
  /** Points. */
  points?: { x: number; y: number; pulse?: boolean; guide?: boolean; label?: string }[];
  /** Texte accessible. */
  description?: string;
}
export declare function MathGraph(props: MathGraphProps): React.ReactElement;

/** Tableau blanc : étapes de calcul écrites ligne à ligne, opérations en marge, résultat encadré. */
export interface WhiteboardProps {
  /** Matière. */
  subject?: SubjectId;
  /** Lignes du calcul. */
  steps?: { expr: string; op?: string; note?: string }[];
  /** Résultat encadré. */
  result?: string;
  /** Note sous le résultat. */
  resultNote?: string;
  /** Nombre d'étapes déjà écrites (les suivantes apparaissent en fondu) ; tout est visible par défaut. */
  progress?: number;
  /** Texte accessible. */
  description?: string;
}
export declare function Whiteboard(props: WhiteboardProps): React.ReactElement;

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
  onChange?: (value: number) => void;
  /** Exemple. */
  placeholder?: string;
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
  onChange?: (level: number) => void;
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

export declare const SUBJECTS: Record<SubjectId, { name: string; gradient: string; soft: string; ink: string; deep: string; bar: string }>;
export declare const ICONS: Record<string, string>;
