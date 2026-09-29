# BarChart

Histogramme vertical (temps par jour), barre du jour en `primary`, ligne d'objectif en pointillés.

## Quand l'utiliser

Statistiques élève et Parents.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `data` | `{ label, value, tip? }[]` | Barres. |
| `max` | `number` | Échelle. |
| `goal` | `number` | Ligne d'objectif. |
| `height` | `number` | Hauteur (140 par défaut). |

## Exemple

```js
const { BarChart } = window.TutorIA;
```
