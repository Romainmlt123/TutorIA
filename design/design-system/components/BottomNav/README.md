# BottomNav

Barre de navigation flottante en bas de l'écran, 4 onglets, l'actif monte dans une bulle bleue.

## Quand l'utiliser

Sur tous les écrans élève (Accueil, Tutor'IA, Flashcards, Stats) et Parents (Accueil, Progrès, Sessions, Réglages), y compris le mode vocal. Posée à 20px des bords, `shadow-lg`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `space` | `'eleve' \| 'parents'` | Jeu d'onglets. |
| `active` | `string` | Onglet actif : `accueil`, `tuteur`, `flashcards`, `stats` ou `accueil`, `progres`, `sessions`, `reglages`. |
| `onNavigate` | `(id) => void` | Clic sur un onglet. |

## Exemple

```js
const { BottomNav } = window.TutorIA;
```
