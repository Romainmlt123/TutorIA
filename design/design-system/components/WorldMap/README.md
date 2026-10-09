# WorldMap

Carte d'une île façon jeu d'aventure : mer, bande de terre, chemin en vague (orange parcouru, gris à venir), villes, niveaux et avatar. Défile horizontalement.

## Quand l'utiliser

Écran carte de l'île (X2) et fond de la fiche d'un niveau (X3). `gapBefore` sur un niveau espace deux villes.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `levels` | `Array<{ id, type, state, stars?, title, gapBefore? }>` | Niveaux dans l’ordre. |
| `cities` | `Array<{ name, status, startIndex }>` | Villes et leur premier niveau. |
| `initial` | `string` | Initiale de l'avatar. |
| `height` | `number` | Hauteur (844 par défaut). |
| `centerY` | `number` | Axe du chemin. |
| `amplitude` | `number` | Amplitude de la vague. |
| `step` | `number` | Écart horizontal entre niveaux. |
| `onSelect` | `(level) => void` | Clic sur un niveau. |
| `label` | `string` | Nom accessible de la carte. |

## Exemple

```js
const { WorldMap } = window.TutorIA;
```
