# DailyReviewCard

Carte « Révision du jour » : nombre de cartes, durée, série, matières concernées et bouton vert vif.

## Quand l'utiliser

Haut de l'écran Flashcards.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `count` | `number` | Cartes à revoir. |
| `minutes` | `number` | Durée estimée. |
| `streak` | `number` | Série (pastille orange). |
| `subjects` | `string[]` | Jusqu'à 3 matières en pastilles. |
| `extra` | `number` | Matières en plus (« +2 »). |
| `title` | `string` | « Révision du jour ». |
| `actionLabel` | `string` | « C'est parti ». |
| `onStart` | `function` | Action. |
| `href` | `string` | Lien. |

## Exemple

```js
const { DailyReviewCard } = window.TutorIA;
```
