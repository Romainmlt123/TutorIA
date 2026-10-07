# LevelResultCard

Carte de bilan d'un niveau : validé sur dégradé vert, à consolider sur dégradé orange, étoiles, message, score et XP.

## Quand l'utiliser

Écran de fin de niveau (X5). Pour une évaluation validée, le surtitre dit « ville validée ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `type` | `'lecon' \| 'exercices' \| 'evaluation'` | Type de niveau. |
| `validated` | `boolean` | Réussi (vrai par défaut). |
| `stars` | `number` | Étoiles obtenues. |
| `headline` | `string` | Titre. |
| `message` | `string` | Message. |
| `score` | `string` | Score (« 4/5 »). |
| `xp` | `number` | XP gagnés. |

## Exemple

```js
const { LevelResultCard } = window.TutorIA;
```
