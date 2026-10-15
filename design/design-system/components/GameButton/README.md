# GameButton

Bouton de jeu du HUD d'Explorer (comme `GameButton` du code) : face brillante en dégradé, cernée de bleu nuit `#16244F`, posée sur un rebord plus sombre de 5 px ; la face s'enfonce à l'appui. Icône seule (rond) ou libellé en Lilita One.

## Quand l'utiliser

Côté jeu seulement : retour jaune de l'en-tête d'un niveau, boutons de l'ardoise, commandes de la leçon à la voix, saisie d'une leçon à l'écrit. Jaune = retour ou bouton actif, vert = valider (« C'est parti ! »), bleu = action, rouge = raccrocher (v2.13), blanc = photo (v2.13).

| Ton | Face | Rebord | Icône |
| --- | --- | --- | --- |
| `yellow` | `#FFE872 → #FFC21F` | `#C98600` | `#5A3600` |
| `green` | `#7EE86D → #2FB84A` | `#1B7F33` | blanc |
| `blue` | `#7FB0FF → #3F7BE8` | `#1F4FB5` | blanc |
| `red` | `#FF8F7F → #E0504F` | `#A3302E` | blanc |
| `white` | `#FFFFFF → #E6ECF7` | `#AEBBD2` | `primary` |

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `tone` | `'yellow' \| 'green' \| 'blue' \| 'red' \| 'white'` | Couleur. |
| `size` | `number` | Hauteur de la face (56). |
| `icon` / `label` | `string` | Icône, libellé. |
| `round` | `boolean` | Rond (par défaut) ou rectangle. |
| `pressed`, `expanded`, `disabled` | `boolean` | États. |
| `onClick` / `href` | | Action. |
| `ariaLabel` | `string` | Libellé accessible (obligatoire pour une icône seule). |

## Exemple

```js
const { GameButton } = window.TutorIA;
h(GameButton, { tone: 'red', size: 64, icon: 'hangup', ariaLabel: 'Raccrocher', iconStyle: { transform: 'rotate(135deg)' } });
```
