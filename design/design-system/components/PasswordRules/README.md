# PasswordRules

Règles du mot de passe cochées en vert au fil de la saisie.

## Quand l'utiliser

Sous le champ mot de passe des écrans de compte. Dans la feuille blanche (`AuthScreen`), en pastilles (`pills`, v2.11) : vertes quand la règle est suivie, grises sinon. `inline` pour une ligne compacte sans pastilles.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `rules` | `{ label, ok }[]` | Règles et leur état. |
| `pills` | `boolean` | Pastilles (écrans de compte). |
| `inline` | `boolean` | Sur une ligne. |

Libellés : élève « 8 caractères », « Un chiffre », « Une majuscule » ; parent « 8 caractères minimum », « Au moins un chiffre », « Au moins une majuscule ».

## Exemple

```js
const { PasswordRules } = window.TutorIA;
h(PasswordRules, { pills: true, rules: [{ label: '8 caractères', ok: true }, { label: 'Un chiffre', ok: true }, { label: 'Une majuscule', ok: false }] });
```
