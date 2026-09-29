# ProfileChoiceCard

Grande carte de choix du profil (élève en bleu, parent en violet) sur l'écran de bienvenue.

## Quand l'utiliser

Écran « Bienvenue sur Tutor'IA » : deux cartes empilées, une seule sélectionnée, puis un bouton « Continuer comme… » de la couleur choisie.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `role` | `'eleve' \| 'parent'` | Profil. |
| `title` | `string` | « Je suis élève » ou « Je suis parent » par défaut. |
| `selected` | `boolean` | Anneau et coche. |
| `onClick` | `function` | Choix. |

## Exemple

```js
const { ProfileChoiceCard } = window.TutorIA;
```
