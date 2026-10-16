# SlateBoard

Le tableau du tuteur dans une leçon d'Explorer (v2.13) : une **ardoise** vert foncé dans un **cadre de bois** (texture, clous), ruban « Au tableau », boutons bleus en relief en haut à droite. Le calcul s'y écrit à la craie : formules crème, opérations en bleu craie `#9CC8FF`, notes numérotées, résultat entouré de corail `#FF8A7A` ; le stylo est un point de craie.

## Quand l'utiliser

- **À l'écrit (X4a)** : épinglé au-dessus de la discussion, **repliable** (`collapsible`) en une bande qui montre la première ligne ; il se replie quand le clavier s'ouvre. La pastille « Voir le tableau » de la discussion ne s'affiche que quand il est replié.
- **À la voix (X4b)** : non repliable, il s'écrit au fil de la voix (`progress`, `writing`).
- Dans l'app : `Whiteboard` avec ses couleurs de craie (`chalk`) dans `WoodFrame`. Un graphique, une statistique ou une figure garderaient leur feuille blanche dans le même cadre.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `steps`, `result`, `resultNote` | | Comme `Whiteboard`. |
| `progress`, `writing` | | Écriture en direct. |
| `collapsible`, `open`, `defaultOpen`, `onToggle` | | Repli. |
| `onExpand`, `expandable` | | Plein écran. |
| `title` | `string` | Ligne montrée replié. |
| `height` | `number` | Hauteur ouverte. |

## Exemple

```js
const { SlateBoard } = window.TutorIA;
h(SlateBoard, { steps, collapsible: true, height: 146 });
```
