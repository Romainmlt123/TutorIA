# SwitchField

Ligne remplie avec un interrupteur (v2.11) : titre 15 Bold, aide 13, interrupteur de 52 × 32 de la couleur de l'espace. Elle se range dans la feuille blanche comme les champs remplis.

## Quand l'utiliser

« J'ai moins de 15 ans » sur l'inscription élève (E1) ; activé, il fait apparaître le champ « E-mail d'un parent ».

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | Titre. |
| `hint` | `string` | Aide. |
| `checked` | `boolean` | État. |
| `onChange` | `(checked) => void` | Changement. |
| `tone` | `'eleve' \| 'parents'` | Couleur. |

## Exemple

```js
const { SwitchField } = window.TutorIA;
h(SwitchField, { label: 'J’ai moins de 15 ans', hint: 'Un parent devra valider ton compte', checked: minor, onChange: setMinor });
```
