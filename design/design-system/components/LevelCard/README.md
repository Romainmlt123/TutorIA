# LevelCard

Niveau et jauge d'XP sur fond ardoise (`gray-600`), jauge verte.

## Quand l'utiliser

Accueil élève, sous la série.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `level` | `number` | Niveau. |
| `xp` | `number` | XP actuels. |
| `xpMax` | `number` | XP du prochain niveau. |
| `lifted` | `boolean \| 'parents'` | Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). `'parents'` sur le bandeau violet. |

## Exemple

```js
const { LevelCard } = window.TutorIA;
```
