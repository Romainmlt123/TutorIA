# SessionSummaryCard

Résumé d'une séance : en-tête aux couleurs de la matière, résumé, bilan et modes utilisés.

## Quand l'utiliser

Page Sessions de l'espace Parents.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `title` | `string` | Notion. |
| `meta` | `string` | Date et durée. |
| `summary` | `string` | Résumé en une ou deux phrases. |
| `outcome` | `'understood' \| 'progressing' \| 'toReview'` | Bilan. |
| `modes` | `('ecrit' \| 'vocal' \| 'tableau' \| 'graphique' \| 'flashcards')[]` | Modes utilisés. |

## Exemple

```js
const { SessionSummaryCard } = window.TutorIA;
```
