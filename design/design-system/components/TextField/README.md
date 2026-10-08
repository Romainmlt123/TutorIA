# TextField

Champ de formulaire 52px avec libellé, icône, pastille optionnelle, aide et bouton « afficher » pour les mots de passe.

## Quand l'utiliser

Tous les formulaires : connexion, inscription, code parent. `type: 'password'` ajoute l'œil ; `badge: 'Facultatif'` signale un champ optionnel. Dans une carte ou une feuille blanche (connexion plein écran L2 et L3, v2.7), passer `filled` : fond `bg`, bordure très claire, sans ombre.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Libellé au-dessus. |
| `icon` | `string` | Icône à gauche (`user`, `mail`, `lock`, `key`). |
| `type` | `string` | `text`, `email`, `password`. |
| `value` | `string` | Valeur contrôlée. |
| `defaultValue` | `string` | Valeur initiale. |
| `onChange` | `(value) => void` | Saisie. |
| `placeholder` | `string` | Exemple. |
| `filled` | `boolean` | Champ rempli, pour une carte ou une feuille blanche. |
| `badge` | `string` | Pastille à droite du libellé. |
| `hint` | `string` | Aide sous le champ. |
| `autoComplete` | `string` | Saisie automatique. |
| `inputMode` | `string` | `numeric` pour un code. |
| `maxLength` | `number` | Longueur max. |

## Exemple

```js
const { TextField } = window.TutorIA;
```
