# AnswerOption

Réponse de QCM (lettre + texte), en grille 2×2 ; se colore en vert ou orange après le choix.

## Quand l'utiliser

Dans `QuizCard`. La mauvaise réponse choisie passe en orange doux, jamais en rouge ; les autres s'estompent.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `letter` | `string` | A, B, C, D. |
| `state` | `'default' \| 'correct' \| 'wrong' \| 'dimmed'` | État après réponse. |
| `chosen` | `boolean` | Choisie par l'élève. |
| `disabled` | `boolean` | Non cliquable. |
| `onClick` | `function` | Choix. |
| `children` | `node` | Texte. |

## Exemple

```js
const { AnswerOption } = window.TutorIA;
```
