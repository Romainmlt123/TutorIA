# SelfAssessmentRow

Auto-évaluation d'une matière sur 4 niveaux (Galère, Bof, Ça va, À l’aise) dans la couleur de la matière.

## Quand l'utiliser

Onboarding élève, une carte par matière. Sert à choisir par où commencer : jamais présentée comme une note.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `subject` | `SubjectId` | Matière. |
| `value` | `number` | Niveau 0 à 3 (contrôlé). |
| `defaultValue` | `number` | Niveau initial. |
| `onChange` | `(level) => void` | Choix. |
| `levels` | `string[]` | Libellés des 4 niveaux. |

## Exemple

```js
const { SelfAssessmentRow } = window.TutorIA;
```
