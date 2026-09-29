# Tutor'IA — composants du design system (référence)

Copie des composants publiés dans le design system Tutor'IA sur claude.ai (64 composants + la couverture). C'est l'**implémentation de référence** des maquettes : chaque composant de `design/COMPONENTS.md` y existe, avec ses props, ses états et ses couleurs exactes.

Ce n'est **pas** du code à importer tel quel dans l'app : c'est un bundle web (React 18, styles en ligne, variables CSS des tokens). Dans l'app, on reproduit chaque composant avec la stack du projet et le thème généré depuis `design/tokens/`, en gardant les mêmes noms et les mêmes props.

## Contenu

```
design-system/
├── README.md        ← ce fichier
├── bundle.js        ← les 64 composants (window.TutorIA), React 18 via window.React
├── bundle.css       ← animations partagées (clignotement « en direct », halo, onde)
├── index.d.ts       ← props typées de chaque composant (documentation)
└── components/
    ├── <Composant>/README.md     ← quand l'utiliser, tableau des props
    ├── <Composant>/preview.html  ← exemple d'usage (états montrés dans le design system)
    └── Cover/preview.html        ← couverture du design system
```

Les `preview.html` sont des fragments : ils tournent dans la page du design system, qui précharge les tokens, React et `bundle.js`. Ils servent ici d'exemples d'appel.

## Groupes

- **Fondations** : Icon, Logo, StatusChip, ProgressRing, Quote
- **Actions** : Button, IconButton, SegmentedControl, Switch, GoalStepper
- **Navigation** : BottomNav, ModeToggle, ChildSwitcher
- **Élève** : SubjectCard, StreakCard, LevelCard, ResumeCard, GoalCard
- **Tuteur** : TopicCard, ChatBubble, TipCard, ChatInput, VoiceVisualizer, CallControls, PanelHeader, VisualPanel, MathGraph, Whiteboard
- **Flashcards** : DailyReviewCard, ChapterRow, SessionProgress, AnswerOption, QuizCard, TallyChips
- **Stats** : KpiCard, BarChart, LineChart, Heatmap, SubjectProgressRow, InsightList
- **Parents** : HeroCard, AlertCard, AdviceCard, SubjectProgressCard, SessionSummaryCard, SettingRow
- **Connexion** : ProfileChoiceCard, SubjectCluster, AuthHero, TextField, PasswordRules, Checkbox, OrDivider, AuthProviderButtons, ParentCodeCard, StepList
- **Onboarding** : StepHeader, GradePicker, SelfAssessmentRow, GoalTile, DurationPicker, ChoiceRow, ToggleChip, PlanRow

Identifiants de matière communs à tous les composants : `maths`, `francais`, `histoire-geo`, `anglais`, `svt`, `physique-chimie`.

## Ordre de priorité en cas de doute

1. Les maquettes (`design/screens/`) et la section « Écarts assumés » de `design/README.md`.
2. Ces composants (`design/design-system/`).
3. Les règles générales de `design/DESIGN_SYSTEM.md`.

Source : design system Tutor'IA sur claude.ai, version du 28 septembre 2026. Pour le mettre à jour, demander à Claude de republier le design system puis de recopier ce dossier.
