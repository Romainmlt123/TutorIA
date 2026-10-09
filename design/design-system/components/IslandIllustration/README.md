# IslandIllustration

Île flottante en illustration vectorielle simple : rocher facetté, herbe, cascade et motifs de la matière (règle et équerre pour les maths).

## Quand l'utiliser

Dans le carrousel des îles, en décor réduit derrière le chat d'un niveau. Une île = une matière. `motifs={false}` pour les îles latérales.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `SubjectId` | Matière de l'île. |
| `size` | `number` | Largeur en px (300 par défaut). |
| `motifs` | `boolean` | Afficher les motifs de la matière (vrai par défaut). |
| `label` | `string` | Nom accessible (sinon décoratif). |
| `idSuffix` | `string` | Suffixe des id SVG quand plusieurs îles cohabitent. |

## Exemple

```js
const { IslandIllustration } = window.TutorIA;
```
