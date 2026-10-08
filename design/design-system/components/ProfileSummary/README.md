# ProfileSummary

Carte « résumé » du profil (v2.8) : trois chiffres côte à côte, chacun centré sous sa tuile d'icône en dégradé (48 px, rayon 16, légère lueur de sa couleur), séparés par des filets fins ; puis la barre de niveau (`LevelBar`).

## Quand l'utiliser

Première carte du profil, qui déborde sur le bandeau. Chiffres de Léa : série (orange, flamme), étoiles gagnées (violet, étoile), temps de la semaine (bleu, horloge).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `stats` | `{ icon, tone, value, label }[]` | Les chiffres (trois). |
| `level` | `number` | Niveau atteint (affiche la barre). |
| `xp` | `number` | XP dans ce niveau. |
| `xpMax` | `number` | Seuil du niveau suivant. |

## Exemple

```js
const { ProfileSummary } = window.TutorIA;
h(ProfileSummary, { stats: [
  { icon: 'flame', tone: 'orange', value: '12', label: 'jours de série' },
  { icon: 'star', tone: 'violet', value: '18', label: 'étoiles gagnées' },
  { icon: 'clock', tone: 'blue', value: '4 h 40', label: 'cette semaine' }
], level: 7, xp: 340, xpMax: 500 });
```
