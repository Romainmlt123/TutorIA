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
  variant?: 'primary' | 'vivid' | 'soft' | 'white' | 'ghost' | 'danger' | 'vividSoft' | 'dangerSolid';
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
  /** Vocal coupé dans les réglages d'un parent (v2.15) : « Vocal » grisé avec un cadenas, l'explication s'affiche au toucher. */
  voiceLocked?: boolean;
  /** Texte de l'explication. */
  lockedHint?: string;
  /** Affiche l'explication d'emblée (aperçu). */
  showHint?: boolean;
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

/** Un enfant dans ChildPickerSheet. */
export interface PickerChild {
  name: string;
  /** Classe (4e…) : « Classe de 4e ». */
  grade?: string;
  /** Temps de la semaine (« 4 h 40 ») : « · 4 h 40 cette semaine ». */
  week?: string;
  /** Ligne complète à la place de la classe et du temps. */
  meta?: string;
}
/** Choisir l'enfant affiché (F3, v2.18) : feuille du bas ouverte par ChildSwitcher. L'enfant affiché en violet, « Ajouter un enfant » en pointillés. */
export interface ChildPickerSheetProps {
  childList: PickerChild[];
  /** Prénom de l'enfant affiché (le premier par défaut). */
  selected?: string;
  onSelect?: (child: PickerChild) => void;
  onClose?: () => void;
  /** « Vos enfants ». */
  title?: string;
  addLabel?: string;
  /** Sous « Ajouter un enfant » (« Jusqu'à 4 profils avec la formule Famille »). */
  addHint?: string;
  onAdd?: () => void;
  addHref?: string;
  /** false : la feuille seule, sans le voile. */
  veil?: boolean;
  style?: React.CSSProperties;
}
export declare function ChildPickerSheet(props: ChildPickerSheetProps): React.ReactElement;

/** Demande de liaison d'un enfant, en tête de P1 (F4, v2.18) : « Refuser » en rouge doux, « Accepter » en violet. */
export interface LinkRequestCardProps {
  /** Prénom de l'enfant. */
  name: string;
  /** « Tom souhaite relier son compte au vôtre ». */
  title?: string;
  /** « En acceptant, vous validez son compte et vous suivez ses progrès. » */
  body?: string;
  /** Message d'erreur sous le texte. */
  error?: string;
  /** Pendant l'envoi : les deux boutons estompés. */
  pending?: boolean;
  acceptLabel?: string;
  declineLabel?: string;
  onAccept?: () => void;
  onDecline?: () => void;
  acceptHref?: string;
  declineHref?: string;
  style?: React.CSSProperties;
}
export declare function LinkRequestCard(props: LinkRequestCardProps): React.ReactElement;

/** Carte de matière pleine couleur (dégradé de la matière, texte blanc, picto en filigrane). */
export interface SubjectCardProps {
  /** Matière. */
  subject?: 'maths' | 'francais' | 'histoire-geo' | 'anglais' | 'svt' | 'physique-chimie';
  /** Progression en % (barre blanche). */
  progress?: number;
  /** Ligne secondaire (ex. « 24 cartes »). */
  count?: string;
  /** Matière pas encore commencée (v2.19) : « À découvrir » à la place du pourcentage et de la barre. */
  fresh?: boolean;
  /** Anneau de sélection + coche. */
  selected?: boolean;
  /** Rend la carte cliquable. */
  onClick?: () => void;
}
export declare function SubjectCard(props: SubjectCardProps): React.ReactElement;

/** Série de jours d'affilée, en orange plein (orange-500) avec texte blanc, sur une seule ligne. */
export interface StreakCardProps {
  /** Nombre de jours. 0 : « Ta série », « commence aujourd’hui » (premier jour, v2.19). */
  days?: number;
  /** Relance (ex. « Plus que 4 jours pour ton record »). */
  caption?: string;
  /** Texte à la place du nombre de jours. */
  label?: string;
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
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
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
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
  /** « Reprendre » par défaut (« Commencer » avec `first`). */
  actionLabel?: string;
  /** Premier jour (v2.19) : surtitre « Ta première séance », la durée et la raison en pastilles, pas de progression. */
  first?: boolean;
  /** Surtitre avec `first`. */
  kicker?: string;
  /** Durée annoncée avec `first` (10 min par défaut). */
  minutes?: number;
  /** Pastilles avec `first` (icône et texte). */
  chips?: { icon: string; label: string }[];
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
  /** Pastille blanche sous le détail ; par défaut « Une séance pour lancer ta journée » (rien encore fait), « Plus qu’une ! », « Plus que 2 ! » ou « Objectif atteint ! ». `null` la masque. */
  badge?: string | null;
}
export declare function GoalCard(props: GoalCardProps): React.ReactElement;

/** Carte « Sujet de la discussion » en haut du tuteur, dans le dégradé de sa matière (v2.12) : icône en filigrane, textes blancs, badge blanc. */
export interface TopicCardProps {
  /** Matière ; absente ou « toutes » : discussion libre, en bleu de l'élève. */
  subject?: SubjectId | 'toutes';
  /** Remplace le nom de la matière (surtitre). */
  subjectName?: string;
  /** Chapitre, ou titre de la discussion libre. */
  title?: string;
  /** « Leçon 3/5 » à l'écrit, chrono de l'appel au vocal ; rien pour une discussion libre. */
  badge?: string;
  /** Point rouge clignotant dans le badge (appel en cours). */
  live?: boolean;
}
export declare function TopicCard(props: TopicCardProps): React.ReactElement;

/** Bulle de chat : tuteur à gauche en blanc avec l'avatar logo, élève à droite en primary. */
export interface ChatBubbleProps {
  /** Auteur. */
  from?: 'tutor' | 'student';
  /** Affiche l'avatar du tuteur (par défaut pour tutor). */
  avatar?: boolean;
  /** Photo d'un exercice envoyée par l'élève (adresse ou nœud), au-dessus du texte (v2.12). */
  image?: string | React.ReactNode;
  imageAlt?: string;
  /** Contenu. */
  children?: React.ReactNode;
}
export declare function ChatBubble(props: ChatBubbleProps): React.ReactElement;

/** Idées de départ d'une discussion libre encore vide : pastilles dégradées (violet, orange, vert, cyan) qui défilent sur le côté, au-dessus de la saisie (v2.12). */
export interface ChatStartersProps {
  /** Les quatre idées par défaut : notion, exercice, révision, graphique. */
  items?: Array<{ id?: string; label: string; message?: string; icon: string; colors: [string, string] }>;
  /** Un toucher envoie la demande au tuteur. */
  onPick?: (message: string, id?: string) => void;
  /** Marge de côté (20). */
  inset?: number;
  label?: string;
}
export declare function ChatStarters(props: ChatStartersProps): React.ReactElement;

/** Pastille « Voir le graphique » / « Voir le tableau » sous une réponse du tuteur qui avait un visuel (v2.12). */
export interface VisualChipProps {
  kind?: VisualKind;
  label?: string;
  /** Alignée sur les bulles du tuteur (décalée de 40 px). */
  inChat?: boolean;
  onClick?: () => void;
}
export declare function VisualChip(props: VisualChipProps): React.ReactElement;

/** Volet « Tes discussions » (☰ du tuteur) : bandeau bleu, « Nouvelle discussion », discussions rangées par jour (v2.12). */
export interface ConversationDrawerProps {
  /** « Aujourd'hui », « Hier », « 7 derniers jours »… */
  groups?: Array<{ label: string; items: Array<{ id?: string; subject?: SubjectId | 'toutes'; title: string; active?: boolean }> }>;
  onOpen?: (id?: string) => void;
  onNew?: () => void;
  onClose?: () => void;
  title?: string;
  newLabel?: string;
  /** Aide en bas ; false pour la masquer. */
  hint?: string | false;
  /** 335 par défaut. */
  width?: number;
  height?: number | string;
  /** Marge du haut du bandeau (56, sous la barre d'état). */
  topInset?: number;
}
export declare function ConversationDrawer(props: ConversationDrawerProps): React.ReactElement;

/** Choix de la photo d'un exercice, posé en bas de l'écran : appareil photo, galerie, annuler (v2.12). */
export interface PhotoSourceDialogProps {
  onChoose?: (source: 'camera' | 'library') => void;
  onCancel?: () => void;
  title?: string;
  hint?: string;
}
export declare function PhotoSourceDialog(props: PhotoSourceDialogProps): React.ReactElement;

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
  /** « Écris ta réponse… » par défaut ; « Pose ta question… » dans une discussion libre neuve. */
  placeholder?: string;
  /** Libellé accessible. */
  label?: string;
  /** Bouton photo à gauche (v2.12) : absent si un parent a coupé la caméra, hors connexion et pendant une évaluation. */
  onCamera?: () => void;
  /** Ou un lien. */
  cameraHref?: string;
  /** Photo prête à partir : vignette, aide « Cadre seulement l'exercice, sans ton nom. » et croix pour la retirer. */
  attachment?: { src?: string; alt?: string; thumb?: React.ReactNode; hint?: string; onRemove?: () => void } | null;
  /** Pendant la réponse du tuteur. */
  disabled?: boolean;
  /** Discussion d'un niveau d'Explorer (X4a) : photo en bouton blanc en relief, champ cerné de bleu nuit, envoi en bouton bleu en relief (v2.13). */
  game?: boolean;
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
  /** Craie sur ardoise (SlateBoard) : texte crème, opérations bleu craie, résultat corail (v2.13). */
  chalk?: boolean;
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
  state?: 'speaking' | 'listening' | 'muted' | 'connecting' | 'ended' | 'error' | 'limit';
  /** Couleur de « Je t'écoute… » (rouge par défaut). */
  listenColor?: 'red' | 'orange';
  /** Hauteur 40 ou 32 px. */
  size?: 'md' | 'sm';
  /** Remplace le libellé. */
  label?: string;
  /** HUD d'Explorer (X4b) : cernée de bleu nuit, ombre dure, bleu nuit pour les états neutres (v2.13). */
  hud?: boolean;
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
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
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

/** Bouton sous la carte d'une session : gris « Choisis une réponse » (pas estompé) avant la réponse, puis violet « Carte suivante » ou « Voir mon bilan » (v2.12). */
export interface NextCardButtonProps {
  answered?: boolean;
  /** Dernière carte : « Voir mon bilan ». */
  last?: boolean;
  onClick?: () => void;
  label?: string;
  lastLabel?: string;
  waitLabel?: string;
}
export declare function NextCardButton(props: NextCardButtonProps): React.ReactElement;

/** Bilan d'une session de flashcards dans le dégradé de la marque (violet → bleu) : compteurs, XP, objectif du jour, « Recommencer » et « Choisir un autre chapitre » (v2.12). */
export interface SessionCompleteProps {
  known?: number;
  toReview?: number;
  /** XP gagnés (sans pastille si 0). */
  xp?: number;
  /** Objectif du jour : sessions faites sur le total. */
  goal?: { done: number; total: number };
  onRestart?: () => void;
  onOtherChapter?: () => void;
  otherHref?: string;
  title?: string;
  summary?: string;
  restartLabel?: string;
  otherLabel?: string;
  /** 540 par défaut. */
  minHeight?: number;
}
export declare function SessionComplete(props: SessionCompleteProps): React.ReactElement;

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
  /** Icône, valeur et libellé centrés, sans évolution ni filigrane (chiffres clés de P1). */
  centered?: boolean;
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
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
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
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
  /** Conseil. */
  children?: React.ReactNode;
  /** Questions à poser à l'enfant, rédigées à l'avance (deux en général). */
  questions?: string[];
  /** « Questions à lui poser » par défaut. */
  questionsTitle?: string;
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
  /** Bloc teinté de la matière, sans ombre, dans la carte « Par matière » (par défaut) ; `false` pour une carte blanche autonome. */
  tinted?: boolean;
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
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
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

/** Texte de jeu (HUD d'Explorer) : Lilita One, blanc cerné de bleu nuit #16244F, ombre portée. */
export interface GameTextProps {
  /** Taille en px (17 par défaut). */
  size?: number;
  /** Épaisseur du contour (taille / 9, 2 au moins) ; 0 sans contour. */
  stroke?: number;
  /** Décalage de l'ombre portée (taille / 8) ; 0 sans ombre. */
  drop?: number;
  /** Couleur du texte (blanc). */
  color?: string;
  align?: 'left' | 'center' | 'right';
  /** Balise (span par défaut). */
  as?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function GameText(props: GameTextProps): React.ReactElement;

/** Bouton de jeu en relief (GameButton du code) : face brillante en dégradé cernée de bleu nuit, rebord de 5 px plus sombre ; la face s'enfonce à l'appui (v2.13). */
export interface GameButtonProps {
  /** jaune (retour, actif), vert (valider), bleu, rouge (raccrocher), blanc (photo). */
  tone?: 'yellow' | 'green' | 'blue' | 'red' | 'white';
  /** Hauteur de la face (56). */
  size?: number;
  icon?: string;
  label?: string;
  /** Rond (par défaut) ; false : rectangle à coins de 18 px. */
  round?: boolean;
  width?: number | string;
  pressed?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  ariaLabel?: string;
  iconStyle?: React.CSSProperties;
}
export declare function GameButton(props: GameButtonProps): React.ReactElement;

/** Bouton de bois du côté jeu : planche texturée, cadre sombre, biseau clair, rebord dessous ; s'enfonce à l'appui. */
export interface WoodButtonProps {
  /** Libellé en texte de jeu. */
  label: string;
  /** Icône après le libellé. */
  icon?: string;
  /** Hauteur de la planche (48 par défaut ; le rebord ajoute 5 px). */
  size?: number;
  /** Largeur (100 % par défaut). */
  width?: number | string;
  /** Pastille orange cernée de bleu nuit en haut à droite (nouveautés). */
  badge?: number | string | null;
  /** Libellé accessible complet. */
  ariaLabel?: string;
  onClick?: () => void;
}
export declare function WoodButton(props: WoodButtonProps): React.ReactElement;

/** Panneau de bois du côté jeu : planches, cadre, clous aux quatre coins, ruban bleu sur le bord haut. */
export interface WoodFrameProps {
  /** Texte du ruban (« Mes trophées », « Ta quête ») ; sans ruban s'il est absent. */
  tab?: string;
  /** Libellé accessible. */
  ariaLabel?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function WoodFrame(props: WoodFrameProps): React.ReactElement;

/** Étiquette de parchemin posée sur le bois (Parchment du code) : légende 12/16 en gras, encre brune, papier crème cerné de caramel (v2.14). */
export interface ParchmentProps {
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Parchment(props: ParchmentProps): React.ReactElement;

/** Question posée dans un écran de jeu, sur un panneau de bois (WoodDialog du code) : autre choix en jaune, action conseillée en vert ; toucher en dehors vaut l'action conseillée (v2.14). */
export interface WoodDialogProps {
  /** « Quitter le niveau ? » */
  title: string;
  /** Texte du parchemin. */
  body?: string;
  /** Action conseillée, bouton vert (« Continuer »). */
  primaryLabel?: string;
  /** Autre choix, bouton jaune (« Quitter »). */
  secondaryLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  primaryHref?: string;
  secondaryHref?: string;
  /** false : le panneau seul, sans le voile qui couvre l'écran. */
  veil?: boolean;
  /** Ruban sur le bord haut (« Pause du soir »), v2.15. */
  tab?: string;
  /** Second parchemin. */
  note?: string;
  /** Une seule action (v2.15). */
  single?: boolean;
  /** Ton du bouton principal (vert par défaut). */
  primaryTone?: 'yellow' | 'green' | 'blue';
  style?: React.CSSProperties;
}
export declare function WoodDialog(props: WoodDialogProps): React.ReactElement;

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
  /** Pastilles vertes ou grises sous le champ (écrans de compte, v2.11). */
  pills?: boolean;
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
  /** Sans carte, posée dans la feuille blanche (numéros de 28 px, texte 15). */
  plain?: boolean;
}
export declare function StepList(props: StepListProps): React.ReactElement;

/** Six cases pour un code (e-mail, mot de passe oublié, code parent) : 3 + 3, curseur qui clignote dans la case en cours. */
export interface CodeInputProps {
  /** Libellé (« Code reçu », « Code parent »). */
  label?: string;
  /** Chiffres saisis (contrôlé). */
  value?: string;
  defaultValue?: string;
  /** Saisie (chiffres seulement). */
  onChange?: (value: string) => void;
  /** Nombre de cases (6). */
  length?: number;
  /** Force l'état « en cours de saisie » (aperçus). */
  focused?: boolean;
  /** Bleu élève ou violet parents. */
  tone?: 'eleve' | 'parents';
  /** Aide sous les cases (« Il est valable 24 h… »). */
  hint?: string;
  /** Icône de l'aide (clock). */
  hintIcon?: string;
  /** one-time-code par défaut. */
  autoComplete?: string;
  ariaLabel?: string;
}
export declare function CodeInput(props: CodeInputProps): React.ReactElement;

/** Pastille sous le champ de confirmation : verte quand les deux mots de passe sont identiques, grise sinon. */
export interface PasswordMatchProps {
  /** Mot de passe et confirmation, comparés. */
  password?: string;
  confirm?: string;
  /** Ou l'état déjà calculé. */
  match?: boolean;
  /** « Les deux sont identiques ». */
  okLabel?: string;
  /** « Pas encore identiques ». */
  waitLabel?: string;
}
export declare function PasswordMatch(props: PasswordMatchProps): React.ReactElement;

/** Ligne remplie avec interrupteur (« J'ai moins de 15 ans »), dans la feuille blanche. */
export interface SwitchFieldProps {
  label: string;
  hint?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  tone?: 'eleve' | 'parents';
}
export declare function SwitchField(props: SwitchFieldProps): React.ReactElement;

/** Carte d'aide douce : pastille blanche avec une icône, titre et phrase (« Où trouver ce code ? »). */
export interface HelpCardProps {
  icon?: string;
  title?: string;
  /** Bleu élève, violet pour tout ce qui concerne un parent. */
  tone?: 'eleve' | 'parents';
  children?: React.ReactNode;
}
export declare function HelpCard(props: HelpCardProps): React.ReactElement;

/** Bandeau vert de confirmation dans un formulaire, avec une action en lien (« Code 482 913 gardé… », « Retirer le code »). */
export interface InlineNoticeProps {
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: React.ReactNode;
}
export declare function InlineNotice(props: InlineNoticeProps): React.ReactElement;

/** Carte blanche du tuteur en attente (moins de 15 ans) : demande envoyée, « Relier un parent », délai avant suppression. */
export interface ConsentPendingCardProps {
  /** Adresse du parent à qui la demande est partie. */
  parentEmail?: string;
  /** Jours avant suppression sans validation (28). */
  days?: number;
  title?: string;
  linkLabel?: string;
  onLink?: () => void;
  linkHref?: string;
}
/** Pause décidée avec les parents (StudyPauseScreen, R1 à R3, v2.15) : fond de marque, logo du tuteur avec un badge, titre et texte sur le bleu, bouton blanc ; pour le temps du jour, une carte verte qui félicite et « Voir mes progrès ». */
export interface StudyPauseScreenProps {
  /** Soir (après 21 h), hors de la plage horaire, temps du jour atteint. */
  reason?: 'evening' | 'window' | 'daily';
  /** Plage horaire (« 17 h », « 21 h »). */
  from?: string;
  until?: string;
  /** Temps du jour (« 1 h 30 »). */
  time?: string;
  /** Série en cours, en jours. */
  streak?: number;
  onHome?: () => void;
  homeHref?: string;
  onProgress?: () => void;
  progressHref?: string;
  /** Barre de navigation posée en bas. */
  footer?: React.ReactNode;
  height?: number | string;
  style?: React.CSSProperties;
}
/** Message hors ligne du tuteur (H1, v2.19.1) : jaune, dans la conversation sous la question de l'élève, avec un bouton rond pour réessayer. */
export interface OfflineNoticeProps {
  /** « Pas de connexion ». */
  title?: string;
  /** « Vérifie ton Wi-Fi ou tes données mobiles. » */
  body?: string;
  onRetry?: () => void;
  retryHref?: string;
  retryLabel?: string;
  style?: React.CSSProperties;
}
export declare function OfflineNotice(props: OfflineNoticeProps): React.ReactElement;

/** Pas de réseau au premier lancement (H2, v2.19) : écran de marque, élève ou parent, texte neutre. */
export interface OfflineScreenProps {
  title?: string;
  body?: string;
  retryLabel?: string;
  onRetry?: () => void;
  retryHref?: string;
  /** Aide sous le bouton ; `null` la masque. */
  hint?: string | null;
  /** « Changer de compte » ; `null` le masque. */
  linkLabel?: string | null;
  onLink?: () => void;
  linkHref?: string;
  height?: number;
  style?: React.CSSProperties;
}
export declare function OfflineScreen(props: OfflineScreenProps): React.ReactElement;

/** « Bientôt disponible » (B1, v2.19) : feuille du bas sur l'écran d'où l'on vient, avec ce qui arrive. */
export interface ComingSoonSheetProps {
  title: string;
  /** Icône de la tuile (sliders par défaut). */
  icon?: string;
  /** « Bientôt ». */
  badge?: string;
  body?: string;
  /** Ce qui arrive, une ligne par élément. */
  items?: string[];
  /** « Continuer » par défaut. */
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
  onClose?: () => void;
  /** false : la feuille seule. */
  veil?: boolean;
  style?: React.CSSProperties;
}
export declare function ComingSoonSheet(props: ComingSoonSheetProps): React.ReactElement;

/** Espace Parents sans enfant relié (J3, v2.19) : trois étapes et « Ajouter un enfant ». */
export interface AddChildCardProps {
  title?: string;
  steps?: string[];
  actionLabel?: string;
  onAdd?: () => void;
  href?: string;
  /** false : `shadow-md` au lieu de l'ombre portée violette. */
  lifted?: boolean;
  style?: React.CSSProperties;
}
export declare function AddChildCard(props: AddChildCardProps): React.ReactElement;

/** Courte liste d'icônes et de phrases, avec une ligne de confiance en bas (J3, v2.19). */
export interface FeatureListProps {
  title?: string;
  items: { icon: string; text: string }[];
  tone?: 'eleve' | 'parents';
  note?: string;
  noteIcon?: string;
  style?: React.CSSProperties;
}
export declare function FeatureList(props: FeatureListProps): React.ReactElement;

export declare function StudyPauseScreen(props: StudyPauseScreenProps): React.ReactElement;

/** Confirmation d'une action qui efface (ConfirmDialog, D2 et D4, v2.16) : corbeille, titre, texte ; le choix sûr en bouton principal, la suppression en second. Avec `ackLabel`, une case à cocher active la suppression (rouge plein). */
export interface ConfirmDialogProps {
  title: string;
  body?: string;
  /** Icône du badge (corbeille par défaut). */
  icon?: string;
  /** Espace : bleu côté élève, violet côté parent. */
  tone?: 'eleve' | 'parents';
  /** Choix sûr (« Garder mon compte »). */
  keepLabel?: string;
  onKeep?: () => void;
  keepHref?: string;
  /** Suppression (« Supprimer définitivement »). */
  confirmLabel?: string;
  onConfirm?: () => void;
  /** Lien au-dessus des boutons (« Télécharger mes données d'abord »). */
  extraLabel?: string;
  extraIcon?: string;
  onExtra?: () => void;
  extraHref?: string;
  /** Case à cocher qui active la suppression (« Je comprends que c'est définitif. »). */
  ackLabel?: string;
  /** Case cochée d'emblée (aperçu). */
  acked?: boolean;
  /** false : la carte seule, sans le voile. */
  veil?: boolean;
  style?: React.CSSProperties;
}
export declare function ConfirmDialog(props: ConfirmDialogProps): React.ReactElement;

/** Une ligne de PrivacyCard. */
export interface PrivacyFact {
  text: string;
  /** yes : coche verte (partagé) ; no : cadenas bleu (jamais partagé). */
  kind?: 'yes' | 'no';
  /** Icône à la place de la coche ou du cadenas. */
  icon?: string;
  /** Pastille à droite (« 6 mois, puis effacés »). */
  chip?: string;
  chipTone?: 'blue' | 'green' | 'violet';
}
/** Carte de confidentialité (PrivacyCard, D1 et D3, v2.16) : pastille d'icône, titre, puis une liste, des pastilles cochées ou un texte, et des actions. */
export interface PrivacyCardProps {
  title: string;
  icon?: string;
  tone?: 'violet' | 'blue' | 'green' | 'cyan' | 'red' | 'orange';
  items?: PrivacyFact[];
  /** Pastilles violettes cochées (« Prénom », « Classe »…). */
  chips?: string[];
  /** Ligne d'information grise sous les pastilles. */
  note?: string;
  text?: string;
  /** Actions (boutons) en bas de la carte. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
  /** Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). 'parents' sur le bandeau violet. */
  lifted?: boolean | 'parents';
}
export declare function PrivacyCard(props: PrivacyCardProps): React.ReactElement;

/** L'enfant d'un parent (ChildDataCard, D3, v2.16) : avatar, classe, accord, « Retirer le lien », puis la suppression à part. */
export interface ChildDataCardProps {
  /** Prénom de l'enfant. */
  name?: string;
  grade?: string;
  /** false : « Accord en attente ». */
  consent?: boolean;
  hint?: string;
  onUnlink?: () => void;
  unlinkHref?: string;
  deleteHint?: string;
  onDelete?: () => void;
  deleteHref?: string;
  style?: React.CSSProperties;
}
export declare function ChildDataCard(props: ChildDataCardProps): React.ReactElement;

export declare function ConsentPendingCard(props: ConsentPendingCardProps): React.ReactElement;

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
  /** false : sans flèche de retour, barres de 6 px, en tête de la feuille blanche (inscription parent). */
  back?: boolean;
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
  /** Pastilles remplies sur une grille de 5 colonnes par cycle, dans la feuille blanche (L5). */
  filled?: boolean;
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

/** Ciel d'Explorer (#2F6FD0 → #8FC0F2) avec quelques nuages, derrière la leçon d'un niveau (LevelBackdrop du code, v2.13). */
export interface LevelBackdropProps {
  height?: number | string;
  /** [x, y, largeur, opacité] de chaque nuage. */
  clouds?: Array<[number, number, number, number]>;
  /** Ciel de nuit avec la lune et des étoiles (pause du soir, v2.15). */
  night?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function LevelBackdrop(props: LevelBackdropProps): React.ReactElement;

/** En-tête de la leçon d'un niveau dans le HUD (LevelHeader du code, v2.13) : retour jaune en relief, pastille du type, titre en Lilita One, progression en segments, ou durée de l'appel à la voix. */
export interface LevelHeaderProps {
  type?: LevelType;
  title?: string;
  /** Étapes, exercices ou questions terminés. */
  done?: number;
  total?: number;
  city?: string;
  /** À la voix (X4b) : « À la voix · 02:14 · Ville… » remplace la progression. */
  callTime?: string;
  onBack?: () => void;
  backHref?: string;
}
export declare function LevelHeader(props: LevelHeaderProps): React.ReactElement;

/** Le tableau du tuteur en ardoise dans un cadre de bois (v2.13) : ruban « Au tableau », boutons bleus en relief (agrandir, replier), craie. */
export interface SlateBoardProps {
  steps?: { expr: string; op?: string; note?: string }[];
  result?: string;
  resultNote?: string;
  progress?: number;
  writing?: boolean;
  description?: string;
  /** Repliable (X4a) : une bande avec la première ligne quand il est replié. */
  collapsible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  onExpand?: () => void;
  expandable?: boolean;
  /** Ligne montrée replié (la première étape par défaut). */
  title?: string;
  tab?: string;
  height?: number | string;
}
export declare function SlateBoard(props: SlateBoardProps): React.ReactElement;

/** « Étape n réussie ! » dans la discussion d'une leçon : bandeau vert de jeu cerné de bleu nuit, coche dans un rond blanc, Lilita One (v2.13). */
export interface LevelStepCardProps {
  step?: number;
  text?: string;
  /** Aligné sur les bulles du tuteur (true). */
  inChat?: boolean;
}
export declare function LevelStepCard(props: LevelStepCardProps): React.ReactElement;

/** Sous-titres du tuteur dans une bulle de dialogue blanche cernée de bleu nuit, ruban « Tutor'IA » (X4b, v2.13). */
export interface CaptionBubbleProps {
  text?: string;
  /** Mots déjà prononcés. */
  spoken?: number;
  name?: string;
  maxLines?: number;
  colorWords?: boolean;
  placeholder?: string;
}
export declare function CaptionBubble(props: CaptionBubbleProps): React.ReactElement;

/** Commandes de la leçon à la voix sur une planche de bois (X4b, v2.13) : micro, sous-titres, caméra en boutons bleus (jaunes quand ils sont actifs), raccrocher en rouge. */
export interface WoodCallDockProps {
  muted?: boolean;
  captionsOn?: boolean;
  cameraOn?: boolean;
  /** false si un parent a coupé la caméra. */
  cameraVisible?: boolean;
  onToggleMute?: () => void;
  onToggleCaptions?: () => void;
  onCamera?: () => void;
  onHangUp?: () => void;
  hangUpHref?: string;
  style?: React.CSSProperties;
}
export declare function WoodCallDock(props: WoodCallDockProps): React.ReactElement;

/** Bilan d'un niveau d'Explorer (LevelResultPanel du code, X5a, X5b) : panneau de bois sur la leçon, ruban « type · verdict », étoiles or ou bois creusé, score, XP et la suite (v2.14). */
export interface LevelResultPanelProps {
  type?: LevelType;
  /** Réussi (vrai par défaut). */
  passed?: boolean;
  /** Titre du niveau (« Isoler x »). */
  levelTitle?: string;
  firstName?: string;
  /** 0 à 3. */
  stars?: number;
  /** Étapes réussies (leçon) ou bonnes réponses. */
  correct?: number;
  total?: number;
  /** Remplace le score calculé. */
  score?: string;
  /** XP gagnée ; rien n'est affiché à 0 (rejouer sans nouvelle étoile). */
  xp?: number;
  /** Objectifs du niveau, affichés si réussi (« Ce que tu as travaillé »). */
  objectives?: string[];
  /** Titre de la leçon à revoir quand le niveau n'est pas réussi. */
  review?: string;
  onContinue?: () => void;
  onReview?: () => void;
  continueHref?: string;
  reviewHref?: string;
  /** false : le panneau seul, sans le voile. */
  veil?: boolean;
  style?: React.CSSProperties;
}
export declare function LevelResultPanel(props: LevelResultPanelProps): React.ReactElement;

/** Tableau du tuteur en mode vocal : les étapes du calcul s'écrivent au fil de la voix (faites en vert, à venir en gris). */
export interface VoiceBoardCardProps {
  /** Surtitre (« Au tableau du tuteur »). */
  title?: string;
  /** Lignes du tableau. */
  lines?: Array<{ expr: string; state?: 'done' | 'todo' }>;
}
export declare function VoiceBoardCard(props: VoiceBoardCardProps): React.ReactElement;

/** Ancienne carte de bilan d'un niveau (dégradé vert ou orange). Remplacée par LevelResultPanel depuis la v2.14. */
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
/** Ombre portée d'une carte posée à cheval sur le bandeau (v2.17) : `tone` = couleur de la carte (white, orange, slate, blue, hero, cyan, violet, green, red), `parents` = bandeau violet. */
export declare function liftShadow(tone?: string, parents?: boolean): string;
export declare const VISUAL_KINDS: Record<VisualKind, { name: string; gradient: string; soft: string; border: string; ink: string; icon: string; noun: string; label: string }>;
