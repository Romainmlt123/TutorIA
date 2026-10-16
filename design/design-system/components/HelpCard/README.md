# HelpCard

Carte d'aide douce (v2.11) : fond `soft` de l'espace, pastille blanche avec une icône, titre 15 Bold et une phrase. Elle répond à la question que l'écran fait naître.

## Quand l'utiliser

« Où trouver ce code ? » (L7), « Tu utilises Apple ou Google ? » (M1), « Et après ? » (E2), « Ses conversations restent privées » (C4). En violet dès qu'elle parle d'un parent, même sur un écran élève.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `icon` | `string` | Icône (info). |
| `title` | `string` | Titre. |
| `tone` | `'eleve' \| 'parents'` | Couleur. |
| `children` | `node` | Phrase. |

## Exemple

```js
const { HelpCard } = window.TutorIA;
h(HelpCard, { icon: 'key', title: 'Où trouver ce code ?' }, 'Ton parent le crée dans son espace Tutor’IA, en ajoutant ton profil.');
```
