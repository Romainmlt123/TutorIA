# Switch

Interrupteur on / off, piste 52×32, en `primary` quand il est actif.

## Quand l'utiliser

Réglages (notifications, rappels, pause du soir). Toujours accompagné d'un libellé, souvent dans une `SettingRow`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `checked` | `boolean` | État. |
| `onChange` | `(checked) => void` | Changement. |
| `label` | `string` | Libellé accessible. |

## Exemple

```js
const { Switch } = window.TutorIA;
```
