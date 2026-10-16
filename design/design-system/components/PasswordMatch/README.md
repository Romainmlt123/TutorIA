# PasswordMatch

Pastille sous le champ « Confirme le mot de passe » (v2.11, demandé par Romain) : verte « Les deux sont identiques » quand les deux saisies correspondent, grise « Pas encore identiques » sinon. Même dessin que les règles en pastilles (`PasswordRules` `pills`) ; jamais de rouge.

## Quand l'utiliser

Nouveau mot de passe (M3) : le mot de passe, ses règles, puis la confirmation (« Tape-le une deuxième fois ») et cette pastille. Le bouton « Enregistrer » ne valide que si les deux sont identiques.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `password` | `string` | Mot de passe. |
| `confirm` | `string` | Confirmation. |
| `match` | `boolean` | Ou l'état déjà calculé. |
| `okLabel` | `string` | « Les deux sont identiques ». |
| `waitLabel` | `string` | « Pas encore identiques ». |

## Exemple

```js
const { TextField, PasswordMatch } = window.TutorIA;
h(TextField, { label: 'Confirme le mot de passe', icon: 'lock', type: 'password', placeholder: 'Tape-le une deuxième fois', filled: true, onChange: setConfirm }),
h(PasswordMatch, { password: pw, confirm: confirm });
```
