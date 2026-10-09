# IslandCarousel

Carrousel des îles-matières : nom de la matière en pastille dégradée, île centrale qui flotte, îles voisines estompées, flèches et points.

## Quand l'utiliser

Écran d'accueil de l'onglet Explorer (X1). Contrôlé via `index` ou libre via `defaultIndex`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subjects` | `SubjectId[]` | Ordre des îles (les 6 matières par défaut). |
| `index` | `number` | Île affichée (contrôlé). |
| `defaultIndex` | `number` | Île de départ (non contrôlé). |
| `onChange` | `(index, subject) => void` | Changement d'île. |

## Exemple

```js
const { IslandCarousel } = window.TutorIA;
```
