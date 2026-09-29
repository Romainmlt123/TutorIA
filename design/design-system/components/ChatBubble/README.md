# ChatBubble

Bulle de chat : tuteur à gauche en blanc avec l'avatar logo, élève à droite en `primary`.

## Quand l'utiliser

Fil du tuteur écrit. Texte courant 16px minimum. Une erreur de l'élève n'est jamais signalée en rouge.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `from` | `'tutor' \| 'student'` | Auteur. |
| `avatar` | `boolean` | Affiche l'avatar du tuteur (par défaut pour `tutor`). |
| `children` | `node` | Contenu. |

## Exemple

```js
const { ChatBubble } = window.TutorIA;
```
