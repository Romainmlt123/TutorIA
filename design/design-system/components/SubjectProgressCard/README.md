# SubjectProgressCard

Bloc dépliable d'une matière (v2.10) : tuile de la matière, score, évolution, barre segmentée par chapitre, puis la liste des chapitres. Par défaut, le bloc est **teinté de sa matière** (fond `soft`, sans ombre) et les chapitres dépliés sont des lignes blanches.

## Quand l'utiliser

Page Progrès de l'espace Parents (P2), les six matières empilées dans la carte « Par matière ». `tinted: false` donne l'ancienne carte blanche autonome.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `value` | `number` | Score en %. |
| `delta` | `number` | Évolution en points. |
| `chapters` | `{ title, meta?, status }[]` | Chapitres (`acquired`, `inProgress`, `toConsolidate`, `notStarted`). |
| `open` | `boolean` | Contrôlé. |
| `defaultOpen` | `boolean` | Ouvert au départ. |
| `onToggle` | `function` | Déplier. |
| `tinted` | `boolean` | Bloc teinté (par défaut) ou carte blanche. |

## Exemple

```js
const { SubjectProgressCard } = window.TutorIA;
h(SubjectProgressCard, { subject: 'maths', value: 72, delta: 12, defaultOpen: true, chapters: chapitres });
```
