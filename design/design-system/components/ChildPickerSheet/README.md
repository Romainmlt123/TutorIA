# ChildPickerSheet

Choisir l'enfant affiché dans l'espace Parents (F3). La pastille du bandeau de P1 (`ChildSwitcher`) l'ouvre. Validé le 15 octobre 2026 (v2.18).

- **Une feuille du bas**, à portée de pouce, sur le voile `rgba(0,6,18,0.40)` : poignée, « Vos enfants » et un bouton pour fermer.
- **Chaque enfant avec de quoi le reconnaître** : son rond, son prénom, « Classe de 4e · 4 h 40 cette semaine ».
- **L'enfant affiché en violet** (fond `violet-100`, bord `accent`, rond coché), comme tout l'espace Parents.
- **« Ajouter un enfant » en pointillés violets**, avec la limite de la formule en dessous ; il mène à « Ajouter un enfant » (F1).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `childList` | `{ name, grade?, week?, meta? }[]` | Les enfants reliés. |
| `selected` | `string` | Prénom de l'enfant affiché (le premier par défaut). |
| `onSelect`, `onClose` | `function` | Choisir un enfant, fermer. |
| `title` | `string` | « Vos enfants ». |
| `addLabel`, `addHint` | `string` | « Ajouter un enfant » et sa ligne d'aide. |
| `onAdd`, `addHref` | | Ouvre « Ajouter un enfant ». |
| `veil` | `boolean` | `false` : la feuille seule. |

## Exemple

```js
const { ChildPickerSheet } = window.TutorIA;
h(ChildPickerSheet, { selected: 'Léa', childList: [{ name: 'Léa', grade: '4e', week: '4 h 40' }, { name: 'Tom', grade: '6e', week: '1 h 10' }], addHint: 'Jusqu’à 4 profils avec la formule Famille' });
```
