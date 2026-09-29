# PlanRow

Étape du plan personnalisé : pastille de la matière, surtitre, titre et raison.

## Quand l'utiliser

Écran « Ton parcours est prêt » de fin d'onboarding.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `SubjectId` | Matière (pastille et couleur). |
| `icon` | `string` | Icône si pas de matière. |
| `tone` | `string` | Couleur si pas de matière. |
| `kicker` | `string` | Surtitre. |
| `title` | `string` | Titre. |
| `meta` | `string` | Explication. |

## Exemple

```js
const { PlanRow } = window.TutorIA;
```
