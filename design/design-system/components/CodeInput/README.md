# CodeInput

Six cases pour un code à 6 chiffres (v2.11), en deux groupes de trois. La case en cours a un contour de la couleur de l'espace et un curseur qui clignote ; les cases remplies ont un contour clair, les vides le fond des champs remplis.

## Quand l'utiliser

Vérification de l'e-mail (E2, L4b), mot de passe oublié (M2), code de mon parent (L7) et relier un parent (C2). Bleu côté élève, violet côté parent.

## Comportement

- Un seul champ réel, invisible, couvre les cases : chiffres seulement, `inputMode: numeric`, `autoComplete: one-time-code` (le code reçu par e-mail se propose au-dessus du clavier).
- Le curseur ne clignote pas quand l'utilisateur a demandé moins d'animations.
- Le bouton qui valide vient juste dessous.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `label` | `string` | « Code reçu », « Code parent ». |
| `value` / `defaultValue` | `string` | Chiffres saisis. |
| `onChange` | `(value) => void` | Saisie. |
| `length` | `number` | Nombre de cases (6). |
| `tone` | `'eleve' \| 'parents'` | Couleur. |
| `hint` | `string` | Aide sous les cases. |
| `hintIcon` | `string` | Icône de l'aide (horloge). |
| `focused` | `boolean` | Force la saisie en cours (aperçus). |

## Exemple

```js
const { CodeInput } = window.TutorIA;
h(CodeInput, { label: 'Code reçu', value: code, onChange: setCode });
```
