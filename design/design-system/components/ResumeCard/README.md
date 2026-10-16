# ResumeCard

Carte « reprendre » de la dernière séance, aux couleurs de la matière, avec bouton blanc.

## Quand l'utiliser

Haut de l'accueil élève : une seule, la dernière notion travaillée. Le premier jour (v2.19), `first` : « Ta première séance », la durée et « D’après ton parcours » en pastilles, pas de 0 %, et « Commencer ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `string` | Matière. |
| `title` | `string` | Notion. |
| `subtitle` | `string` | Contexte (ex. « Tuteur écrit · il y a 2 h »). |
| `progress` | `number` | Avancement en %. |
| `actionLabel` | `string` | « Reprendre » par défaut (« Commencer » avec `first`). |
| `first` | `boolean` | Premier jour : surtitre, pastilles, pas de progression. |
| `kicker`, `minutes`, `chips` | | Surtitre, durée (10 min), pastilles avec `first`. |
| `onResume` | `function` | Action. |
| `href` | `string` | Lien. |

## Exemple

```js
const { ResumeCard } = window.TutorIA;
h(ResumeCard, { first: true, subject: 'maths', title: 'Équations du 1er degré', subtitle: 'Maths · Leçon 1 sur 5' });
```
