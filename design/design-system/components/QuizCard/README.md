# QuizCard

Carte de flashcard en QCM : question, 4 réponses en 2×2, puis le retour après le choix. Depuis la v2.12, le retour porte une **pastille** : coche blanche sur vert pour une bonne réponse, flèche blanche sur orange pour une carte à revoir. Jamais de rouge.

## Quand l'utiliser

Écran de session (3B, 3B2, 3B3), suivi de `NextCardButton` puis de `TallyChips`. Pas de boutons d'auto-évaluation : la réponse choisie suffit à noter la carte. Pas de barre de navigation pendant une session.

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
