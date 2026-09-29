# QuizCard

Carte de flashcard en QCM : question, 4 réponses en 2×2, puis l'explication après le choix.

## Quand l'utiliser

Écran de session. Pas de boutons d'auto-évaluation : la réponse choisie suffit à noter la carte.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière (en-tête coloré). |
| `question` | `string` | Question. |
| `options` | `string[]` | 4 réponses. |
| `answer` | `number` | Index de la bonne réponse. |
| `picked` | `number` | Index choisi (contrôlé). |
| `onAnswer` | `(index) => void` | Choix. |
| `explanation` | `string` | Explication après réponse. |
| `hint` | `string` | Indice avant réponse. |

## Exemple

```js
const { QuizCard } = window.TutorIA;
```
