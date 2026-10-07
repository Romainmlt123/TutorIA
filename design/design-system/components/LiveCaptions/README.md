# LiveCaptions

Sous-titres en direct de l’appel : la phrase en cours, les mots déjà dits en blanc, les suivants à 45 %. Une couleur nommée par le tuteur (« la droite rouge ») s’affiche dans une pastille de sa couleur, pour faire le lien avec le visuel ; les nombres et formules sont en gras.

## Quand l'utiliser

Sous la pastille d’état. Activés par défaut, l’élève les coupe avec le bouton « Sous-titres ». 20/30 px seul (2B), 16/22 px sur deux lignes sous un visuel (2D, 2F).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `text` | `string` | Phrase en cours (tuteur ou élève). Garder les espaces insécables dans les formules. |
| `spoken` | `number` | Nombre de mots déjà prononcés (tous par défaut). |
| `speaker` | `'tutor' | 'student'` | Qui parle. |
| `showSpeaker` | `boolean` | Affiche « Tutor’IA » ou « Toi » au-dessus. |
| `surface` | `'brand' | 'light'` | Sur le dégradé (blanc) ou sur fond clair. |
| `size` | `'lg' | 'md'` | Taille du texte. |
| `maxLines` | `number` | Nombre de lignes au plus. |
| `colorWords` | `boolean` | Pastilles de couleur (true par défaut). |
| `align` | `'center' | 'left'` | Alignement. |

## Exemple

```js
const { LiveCaptions } = window.TutorIA;
```
