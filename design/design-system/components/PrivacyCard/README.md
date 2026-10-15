# PrivacyCard

Une carte de l'écran Confidentialité de l'élève (D1) ou des Données personnelles du parent (D3), v2.16 : ce qui est partagé, gardé ou jamais enregistré, en listes qu'on lit d'un coup d'œil plutôt qu'en paragraphes.

- Pastille d'icône en dégradé (violet, bleu, vert), titre 20 px.
- `items` : une ligne par fait, coche verte pour ce que voient les parents (`kind: 'yes'`), cadenas bleu pour ce qui reste privé (`kind: 'no'`), ou une icône et une pastille de durée (« 6 mois, puis effacés » en bleu, « Jamais enregistrées » en vert).
- `chips` : pastilles violettes cochées (« Prénom », « Classe », « Séances », « Progression ») et `note` en gris dessous.
- `text` et `children` : un texte et les actions (« Télécharger mes données », « Supprimer mon compte »).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title`, `icon`, `tone` | | En-tête. |
| `items` | `Array<{ text, kind?, icon?, chip?, chipTone? }>` | Liste. |
| `chips` | `string[]` | Pastilles cochées. |
| `note` | `string` | Ligne d'information. |
| `text` | `string` | Texte. |
| `children` | `node` | Actions. |
| `lifted` | `boolean \| 'parents'` | Posée à cheval sur le bandeau de marque : ombre portée de sa couleur (v2.17). `'parents'` sur le bandeau violet. |

## Exemple

```js
const { PrivacyCard } = window.TutorIA;
h(PrivacyCard, { icon: 'eye', tone: 'violet', title: 'Ce que voient tes parents', items: [
  { kind: 'yes', text: 'Ton temps de travail' }, { kind: 'yes', text: 'Tes progrès par matière' },
  { kind: 'no', text: 'Jamais tes conversations avec le tuteur' }] });
```
