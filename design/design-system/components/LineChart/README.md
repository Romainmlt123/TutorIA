# LineChart

Courbe d'évolution avec aire dégradée ; `onColor` pour la poser sur une carte colorée.

## Quand l'utiliser

Évolution de la moyenne ou de la maîtrise sur plusieurs semaines.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `values` | `number[]` | Points. |
| `labels` | `string[]` | Étiquettes x. |
| `min` | `number` | Minimum. |
| `max` | `number` | Maximum. |
| `onColor` | `boolean` | Version blanche sur carte colorée (par défaut) ; `false` sur fond blanc. |
| `description` | `string` | Texte accessible. |

## Exemple

```js
const { LineChart } = window.TutorIA;
```
