# ProfileHero

En-tête du profil de l'élève (v2.8) : bandeau de marque bleu, « Mon profil », le prénom en grand, la classe dans une pastille en verre, « Depuis septembre » et le bouton blanc « Modifier l'avatar ». La figurine de l'élève se tient à droite, sur une ombre au sol, avec un halo clair derrière elle.

## Quand l'utiliser

Haut de l'écran Profil (on y arrive en touchant son rond sur l'accueil). La première carte de l'écran (`ProfileSummary`) déborde de 72 px sur le bas du bandeau.

## Comportement

- Dans l'app, la figurine est la vraie 3D (`AvatarPreview`, en pied, animation « attente », un « salut » à l'arrivée). Le design system montre une image de la même figurine.
- Sans avatar, l'initiale dans un disque blanc remplace la figurine et le bouton devient « Créer mon avatar ».
- `newsCount` : pastille orange sur le bouton quand la garde-robe a des nouveautés.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `name` | `string` | Prénom. |
| `grade` | `string` | Classe (« 4e »). |
| `since` | `string` | Ligne sous la classe. |
| `kicker` | `string` | Surtitre (« Mon profil »). |
| `avatarSrc` | `string` | Image de la figurine. |
| `avatarAlt` | `string` | Texte alternatif. |
| `newsCount` | `number` | Nouveautés de la garde-robe. |
| `onEditAvatar` | `function` | Ouvre l'éditeur d'avatar. |
| `onBack` | `function \| null` | Retour à l'accueil. |

## Exemple

```js
const { ProfileHero } = window.TutorIA;
h(ProfileHero, { name: 'Léa', grade: '4e', since: 'Depuis septembre', avatarSrc: figurine, newsCount: 2, onEditAvatar: openEditor, onBack: goBack });
```
