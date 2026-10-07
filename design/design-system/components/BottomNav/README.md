# BottomNav

Barre de navigation flottante en bas de l'écran, l'actif monte dans une bulle bleue. Élève : 5 onglets dont Explorer (boussole) ; Parents : 4 onglets.

## Quand l'utiliser

Sur tous les écrans élève (Accueil, Explorer, Tutor'IA, Révisions, Stats) et Parents (Accueil, Progrès, Sessions, Réglages), y compris le mode vocal. Posée à 20px des bords, `shadow-lg`.

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `space` | `'eleve' \| 'parents'` | Jeu d'onglets. |
| `active` | `string` | Onglet actif : `accueil`, `explorer` (alias `parcours`), `tuteur`, `revisions`, `stats` ou `accueil`, `progres`, `sessions`, `reglages`. |
| `onNavigate` | `(id) => void` | Clic sur un onglet. |

## Exemple

```js
const { BottomNav } = window.TutorIA;
```
