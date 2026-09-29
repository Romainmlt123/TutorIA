# SubjectCard

Carte de matière pleine couleur (dégradé de la matière, texte blanc, picto en filigrane).

## Quand l'utiliser

Grille 2 colonnes de l'accueil et choix de la matière en flashcards. Chaque matière garde sa couleur partout : Maths rouge, Français bleu, Histoire-Géo vert, Physique-Chimie violet, SVT brun (orange foncé), Anglais cyan.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `'maths' \| 'francais' \| 'histoire-geo' \| 'anglais' \| 'svt' \| 'physique-chimie'` | Matière. |
| `progress` | `number` | Progression en % (barre blanche). |
| `count` | `string` | Ligne secondaire (ex. « 24 cartes »). |
| `selected` | `boolean` | Anneau de sélection + coche. |
| `onClick` | `function` | Rend la carte cliquable. |

## Exemple

```js
const { SubjectCard } = window.TutorIA;
```
