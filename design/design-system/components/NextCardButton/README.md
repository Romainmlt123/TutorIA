# NextCardButton

Bouton sous la carte d'une session de flashcards (v2.12). Avant la réponse, il est **gris** et dit « Choisis une réponse » : il n'est pas estompé, l'élève comprend ce qu'on attend de lui. Après la réponse, il passe en **violet** avec une flèche : « Carte suivante », ou « Voir mon bilan » sur la dernière carte.

## Quand l'utiliser

3B, 3B2, 3B3 : entre `QuizCard` et `TallyChips`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `answered` | `boolean` | L'élève a répondu. |
| `last` | `boolean` | Dernière carte. |
| `onClick` | `function` | Carte suivante, ou bilan. |
| `label` / `lastLabel` / `waitLabel` | `string` | Libellés. |

## Exemple

```js
const { NextCardButton } = window.TutorIA;
h(NextCardButton, { answered: !!picked, last: i === total - 1, onClick: next });
```
