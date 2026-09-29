# SettingRow

Ligne de réglage : pastille d'icône colorée, libellé, aide, et interrupteur ou chevron.

## Quand l'utiliser

Page Réglages de l'espace Parents, groupées dans une carte blanche avec `divider`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `icon` | `string` | Icône. |
| `tone` | `'orange' \| 'violet' \| 'blue' \| 'cyan' \| 'red' \| 'green'` | Couleur de la pastille. |
| `label` | `string` | Libellé. |
| `hint` | `string` | Aide. |
| `checked` | `boolean` | Affiche un interrupteur. |
| `onChange` | `function` | Changement de l'interrupteur. |
| `href` | `string` | Lien (chevron). |
| `onClick` | `function` | Action (chevron). |
| `divider` | `boolean` | Séparateur en haut. |

## Exemple

```js
const { SettingRow } = window.TutorIA;
```
