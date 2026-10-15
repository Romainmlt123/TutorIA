# TutorFeedback

> Remplacé par `LevelResultPanel` (ce que tu as travaillé, ou la leçon à revoir, sur un parchemin) depuis la v2.14.

Retour du tuteur en fin de niveau : ce qui est réussi (vert) ou ce qui est à revoir (orange).

## Quand l'utiliser

Dans le bilan d'un niveau (X5), sous la carte de résultat.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `kind` | `'success' \| 'review'` | Réussi ou à revoir. |
| `title` | `string` | Surtitre. |
| `children` | `ReactNode` | Texte. |

## Exemple

```js
const { TutorFeedback } = window.TutorIA;
```
