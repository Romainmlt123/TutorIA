# SessionComplete

Bilan d'une session de flashcards (v2.12, 3C) dans le **dégradé de la marque** (violet → bleu, plus le vert d'Histoire-Géo), avec une étoile en filigrane : coche dans un disque voilé, « Session terminée ! », phrase du bilan, compteurs Je sais / À revoir en pastilles blanches, XP gagnés, objectif du jour, puis « Recommencer » (blanc) et « Choisir un autre chapitre » (en verre).

## Quand l'utiliser

À la place de la carte quand la session est finie. La barre de navigation reste masquée ; « Choisir un autre chapitre » ramène au choix des chapitres (3A).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `known` | `number` | Cartes sues. |
| `toReview` | `number` | Cartes à revoir. |
| `xp` | `number` | XP gagnés (sans pastille si 0). |
| `goal` | `{ done, total }` | Objectif du jour en sessions. |
| `onRestart` | `function` | Recommencer. |
| `onOtherChapter` / `otherHref` | `function` / `string` | Autre chapitre. |
| `title`, `summary`, `restartLabel`, `otherLabel` | `string` | Libellés. |
| `minHeight` | `number` | 540 par défaut. |

## Exemple

```js
const { SessionComplete } = window.TutorIA;
h(SessionComplete, { known: 9, toReview: 3, xp: 60, goal: { done: 3, total: 3 }, onRestart, onOtherChapter });
```
