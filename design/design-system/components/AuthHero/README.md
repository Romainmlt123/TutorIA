# AuthHero

En-tête coloré des écrans de connexion : surtitre de l'espace, titre et phrase d'accueil.

## Quand l'utiliser

En-tête de connexion dans une page qui défile. Depuis la v2.7, les écrans de connexion élève (L2) et parent (L3) utilisent `AuthScreen`, en plein écran.

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
