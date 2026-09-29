# SubjectProgressCard

Carte dépliable d'une matière : score, évolution, barre segmentée par chapitre et liste des chapitres.

## Quand l'utiliser

Page Progrès de l'espace Parents.

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

## Exemple

```js
const { SubjectProgressCard } = window.TutorIA;
```
