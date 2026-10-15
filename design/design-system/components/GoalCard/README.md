# GoalCard

Objectif du jour de l'accueil (v2.10) : carte en dégradé violet → bleu de la marque, qui glisse lentement d'un bout à l'autre, anneau blanc de 64 px, titre 22 Black, détail, et une pastille blanche d'encouragement.

## Quand l'utiliser

Accueil élève, sous la carte « Reprendre », au-dessus de « Tes matières ».

## Comportement

- Le dégradé (`violet-500` → `blue-500` → `violet-500`, deux fois plus large que la carte) glisse en 6 s aller-retour (`.tia-goal` dans `bundle.css`). Il est figé quand l'élève a demandé moins d'animations ; dans l'app, il se met aussi en pause hors de l'Accueil.
- Le vert de la v2.5 est abandonné : il ressemblait trop à la carte Histoire-Géo juste en dessous (écart 18 de l'app, 7 octobre 2026).
- La pastille dit ce qui reste : « Une séance pour lancer ta journée » tant que rien n’est fait (v2.19), puis « Plus que 2 ! », « Plus qu’une ! » et « Objectif atteint ! ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `done` | `number` | Séances faites. |
| `total` | `number` | Séances visées. |
| `title` | `string` | « Objectif du jour » par défaut. |
| `detail` | `string` | Détail (« 15 min · 2/3 sessions »). |
| `badge` | `string \| null` | Pastille ; calculée par défaut, `null` la masque. |

## Exemple

```js
const { GoalCard } = window.TutorIA;
h(GoalCard, { done: 2, total: 3, detail: '15 min · 2/3 sessions' });
```
