# AddChildCard

L'espace Parents quand aucun enfant n'est relié (J3), posée à cheval sur le bandeau violet. Validé le 15 octobre 2026 (v2.19).

- Tuile violette de 48 px (famille), « Ajoutez votre enfant » 22/30 Black.
- Trois étapes (`StepList` `plain`, ton parents) : le profil, le code, le suivi.
- « Ajouter un enfant » en violet (`Button` `vivid`, icône +), vers « Ajouter un enfant » (F1).
- Ombre portée violette (`shadow-lift-parents`) ; `lifted: false` pour `shadow-md`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title`, `steps` |  | Titre et étapes. |
| `actionLabel`, `onAdd`, `href` |  | « Ajouter un enfant ». |
| `lifted` | `boolean` | Ombre portée (par défaut). |

## Exemple

```js
const { AddChildCard } = window.TutorIA;
h(AddChildCard, { onAdd: addChild });
```
