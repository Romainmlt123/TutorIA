# FeatureList

Ce qu'un écran montrera, en quelques lignes (J3 : « Chaque semaine, vous verrez »). Validé le 15 octobre 2026 (v2.19).

- Carte blanche, titre 20/26 Black, lignes de 36 px (tuile douce de l'espace et icône), texte 15/20.
- Une ligne de confiance en bas, sous un filet (cadenas : « Jamais ses conversations avec le tuteur. »).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | Titre. |
| `items` | `{ icon, text }[]` | Les lignes. |
| `tone` | `'eleve' \| 'parents'` | Couleur des tuiles. |
| `note`, `noteIcon` | `string` | Ligne du bas. |

## Exemple

```js
const { FeatureList } = window.TutorIA;
h(FeatureList, { tone: 'parents', title: 'Chaque semaine, vous verrez', items: [...], note: 'Jamais ses conversations avec le tuteur.' });
```
