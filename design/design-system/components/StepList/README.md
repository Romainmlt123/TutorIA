# StepList

Liste d'étapes numérotées, dans une carte blanche ou posée dans la feuille.

## Quand l'utiliser

Instructions courtes : « Sur le téléphone de Léa » (L6, `plain` dans la feuille blanche), premiers pas.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | Titre. |
| `icon` | `string` | Icône du titre. |
| `tone` | `'eleve' \| 'parents'` | Couleur des numéros. |
| `steps` | `string[]` | Étapes. |
| `plain` | `boolean` | Sans carte (feuille blanche). |

## Exemple

```js
const { StepList } = window.TutorIA;
h(StepList, { tone: 'parents', icon: 'phone', plain: true, title: 'Sur le téléphone de Léa', steps: ['Installez Tutor’IA et ouvrez l’app.', 'Léa crée son compte élève, ou se connecte si elle en a déjà un.', 'Elle touche « J’ai un code de mon parent » et saisit ce code.'] });
```
