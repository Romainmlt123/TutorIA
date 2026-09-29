# ChatInput

Champ de réponse du tuteur écrit avec le bouton d'envoi rond.

## Quand l'utiliser

Bas du tuteur écrit, au-dessus de la barre de navigation.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `value` | `string` | Valeur contrôlée. |
| `defaultValue` | `string` | Valeur initiale. |
| `onChange` | `(v) => void` | Saisie. |
| `onSend` | `(v) => void` | Envoi. |
| `placeholder` | `string` | « Écris ta réponse… » par défaut. |
| `label` | `string` | Libellé accessible. |

## Exemple

```js
const { ChatInput } = window.TutorIA;
```
