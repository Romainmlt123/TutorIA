# ChatBubble

Bulle de chat : tuteur à gauche en blanc avec l'avatar logo, élève à droite en `primary`. Depuis la v2.12, la bulle de l'élève peut porter la **photo d'un exercice** (216 × 162, coins de 16 px) au-dessus de son texte.

## Quand l'utiliser

Fil du tuteur écrit. Texte courant 16px minimum. Une erreur de l'élève n'est jamais signalée en rouge.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `from` | `'tutor' \| 'student'` | Auteur. |
| `avatar` | `boolean` | Affiche l'avatar du tuteur (par défaut pour `tutor`). |
| `image` | `string \| node` | Photo envoyée par l'élève. |
| `imageAlt` | `string` | Texte de la photo (« Photo de ton exercice »). |
| `children` | `node` | Contenu. |

## Exemple

```js
const { ChatBubble } = window.TutorIA;
h(ChatBubble, { from: 'student', image: photo.uri }, 'Je bloque sur le b)');
```
