# VoiceBoardCard

Tableau du tuteur en mode vocal : les étapes du calcul s'écrivent au fil de la voix (faites en vert, à venir en gris).

## Quand l'utiliser

Pendant une discussion vocale de niveau (X4b), au-dessus du visualiseur.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | Surtitre (« Au tableau du tuteur »). |
| `lines` | `Array<{ expr, state?: 'done' \| 'todo' }>` | Lignes du tableau. |

## Exemple

```js
const { VoiceBoardCard } = window.TutorIA;
```
