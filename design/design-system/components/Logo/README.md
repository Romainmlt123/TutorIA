# Logo

Logo Tutor'IA (bulle au clin d'œil coiffée d'un mortier), toujours bleu, sur fond blanc ou sur carré bleu.

## Quand l'utiliser

`blanc` sur les fonds clairs (barre de navigation, en-têtes), `bleu` pour l'avatar du tuteur, l'icône d'app ou un fond chargé. Jamais recoloré, étiré ni ombré.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `variant` | `'blanc' \| 'bleu'` | Version du fichier de marque (`blanc` par défaut). |
| `size` | `number` | Taille en px (40 par défaut). |
| `round` | `boolean` | Découpe ronde (avatar du tuteur). |
| `alt` | `string` | Texte alternatif (`Tutor'IA` par défaut, `''` si décoratif). |

## Exemple

```js
const { Logo } = window.TutorIA;
```
