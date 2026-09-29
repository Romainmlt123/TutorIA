# ChoiceRow

Ligne de choix avec pastille d'icône, titre et aide ; se remplit du dégradé de sa couleur une fois choisie.

## Quand l'utiliser

Onboarding « Comment tu aimes apprendre ? » (à l'écrit, à la voix, avec des schémas, avec des quiz). `single` pour un choix unique.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `icon` | `string` | Icône. |
| `tone` | `string` | Couleur (`blue`, `violet`, `red`, `cyan`…). |
| `label` | `string` | Titre. |
| `hint` | `string` | Aide. |
| `selected` | `boolean` | Choisi. |
| `single` | `boolean` | Bouton radio. |
| `onClick` | `function` | Basculer. |

## Exemple

```js
const { ChoiceRow } = window.TutorIA;
```
