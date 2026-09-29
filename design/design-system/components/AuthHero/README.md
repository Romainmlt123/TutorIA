# AuthHero

En-tête coloré des écrans de connexion : surtitre de l'espace, titre et phrase d'accueil.

## Quand l'utiliser

Connexion élève (bleu, tutoiement) et connexion parent (violet, vouvoiement).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `space` | `'eleve' \| 'parents'` | Espace (couleur, picto, surtitre). |
| `kicker` | `string` | Surtitre (« Espace élève » par défaut). |
| `title` | `string` | Titre. |
| `subtitle` | `string` | Phrase sous le titre. |

## Exemple

```js
const { AuthHero } = window.TutorIA;
```
