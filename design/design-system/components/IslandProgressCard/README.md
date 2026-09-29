# IslandProgressCard

Carte d'avancement d'une île : villes validées, étoiles, barre aux couleurs de la matière et bouton « Explorer l'île ».

## Quand l'utiliser

Sous le carrousel des îles (X1).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `SubjectId` | Matière (couleur de la barre). |
| `done` | `number` | Villes validées. |
| `total` | `number` | Villes au total. |
| `stars` | `number` | Étoiles cumulées. |
| `next` | `string` | Prochaine étape. |
| `actionLabel` | `string` | Libellé du bouton. |
| `onExplore` | `() => void` | Clic sur le bouton. |
| `href` | `string` | Lien du bouton. |

## Exemple

```js
const { IslandProgressCard } = window.TutorIA;
```
