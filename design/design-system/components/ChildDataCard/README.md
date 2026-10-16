# ChildDataCard

L'enfant dans les Données personnelles du parent (D3, v2.16) : avatar et prénom, classe et accord (« Accord donné » en vert, « Accord en attente » en orange), « Retirer le lien » en violet doux, puis **la suppression à part**, sous un trait, avec son titre rouge et son explication, en rouge doux. Elle ouvre la deuxième confirmation (`ConfirmDialog` `ackLabel`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `name` | `string` | Prénom de l'enfant. |
| `grade` | `string` | Classe (« Classe de 4e »). |
| `consent` | `boolean` | `false` : accord en attente. |
| `hint` | `string` | Texte sous l'en-tête. |
| `onUnlink`, `unlinkHref` | | Retirer le lien. |
| `deleteHint`, `onDelete`, `deleteHref` | | La suppression. |

## Exemple

```js
const { ChildDataCard } = window.TutorIA;
h(ChildDataCard, { name: 'Léa', grade: 'Classe de 4e', onDelete: () => setConfirm(true) });
```
