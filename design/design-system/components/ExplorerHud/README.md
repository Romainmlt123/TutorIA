# ExplorerHud

En-tête flottant de la carte : retour aux îles, île, ville et région courantes, série et niveau.

## Quand l'utiliser

En haut de la carte d'une île (X2), posé sur la mer à 16px des bords.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `SubjectId` | Couleur du nom de l'île. |
| `island` | `string` | Nom de l'île. |
| `city` | `string` | Ville courante (chapitre). |
| `region` | `string` | Région (thème). |
| `streak` | `number` | Jours de série. |
| `level` | `number` | Niveau de l'élève. |
| `onBack` | `() => void` | Retour aux îles. |
| `backLabel` | `string` | Libellé accessible du retour. |

## Exemple

```js
const { ExplorerHud } = window.TutorIA;
```
