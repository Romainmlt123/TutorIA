# LevelStepCard

« Étape 1 réussie ! » dans la discussion d'une leçon (X4a, v2.13) : un moment de progression, donc un élément de jeu au milieu du chat. Bandeau de 44 px au vert des boutons de jeu (`#7EE86D → #2FB84A`), cerné de bleu nuit avec un rebord dur `#1B7F33`, coche verte dans un rond blanc, texte en Lilita One 17.

## Quand l'utiliser

Après chaque étape réussie d'une leçon, aligné sur les bulles du tuteur (marge de 40 px). Il fait avancer un segment de `LevelHeader`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `step` | `number` | Numéro de l'étape. |
| `text` | `string` | Remplace « Étape n réussie ! ». |
| `inChat` | `boolean` | Marge des bulles (true). |

## Exemple

```js
const { LevelStepCard } = window.TutorIA;
h(LevelStepCard, { step: 1 });
```
