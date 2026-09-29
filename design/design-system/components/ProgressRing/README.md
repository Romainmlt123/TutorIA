# ProgressRing

Anneau de progression avec une valeur au centre.

## Quand l'utiliser

Objectif du jour, jauge d'une carte héros. `onColor` pour le poser sur un dégradé.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `value` | `number` | Avancement de 0 à 1. |
| `size` | `number` | Diamètre (56 par défaut). |
| `stroke` | `number` | Épaisseur (6 par défaut). |
| `label` | `string` | Texte au centre. |
| `color` | `string` | Couleur de l'arc (`primary` par défaut). |
| `onColor` | `boolean` | Version blanche sur fond coloré. |

## Exemple

```js
const { ProgressRing } = window.TutorIA;
```
