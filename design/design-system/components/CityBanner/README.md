# CityBanner

Panneau d'une ville (chapitre) : validée en vert, en cours en rouge avec drapeau, à consolider en orange, verrouillée en gris.

## Quand l'utiliser

Au-dessus du premier niveau de chaque ville sur la carte.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `name` | `string` | Nom de la ville. |
| `status` | `'done' \| 'current' \| 'consolidate' \| 'locked'` | État de la ville. |

## Exemple

```js
const { CityBanner } = window.TutorIA;
```
