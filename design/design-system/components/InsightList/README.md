# InsightList

Carte « points forts » (vert) ou « à retravailler » (orange) avec une liste de notions.

## Quand l'utiliser

Statistiques élève. Les notions à revoir proposent une action directe (« Réviser »).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `tone` | `'strengths' \| 'review'` | Type. |
| `title` | `string` | Titre. |
| `subtitle` | `string` | Sous-titre. |
| `items` | `{ title, meta, value?, actionLabel?, onAction?, href? }[]` | Notions. |

## Exemple

```js
const { InsightList } = window.TutorIA;
```
