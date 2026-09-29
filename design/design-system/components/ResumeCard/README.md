# ResumeCard

Carte « reprendre » de la dernière séance, aux couleurs de la matière, avec bouton blanc.

## Quand l'utiliser

Haut de l'accueil élève : une seule, la dernière notion travaillée.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `title` | `string` | Notion. |
| `subtitle` | `string` | Contexte (ex. « Tuteur écrit · il y a 2 h »). |
| `progress` | `number` | Avancement en %. |
| `actionLabel` | `string` | « Reprendre » par défaut. |
| `onResume` | `function` | Action. |
| `href` | `string` | Lien. |

## Exemple

```js
const { ResumeCard } = window.TutorIA;
```
