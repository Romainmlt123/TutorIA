# BottomNav

Barre de navigation flottante en bas de l'écran, l'actif monte dans une bulle bleue. Élève : 5 onglets dont Explorer (boussole) ; Parents : 4 onglets.

## Quand l'utiliser

Sur les écrans élève (Accueil, Explorer, Tutor'IA, Révisions, Stats) et Parents (Accueil, Progrès, Sessions, Réglages). Posée à 20px des bords, `shadow-lg`. Elle est **masquée** pendant l'appel vocal (2B, 2D, 2F, depuis la v2.6) et pendant une session de flashcards (3B à 3C, depuis la v2.12). L'onglet Tutor'IA ouvre une **discussion libre neuve** (2G) ; les discussions passées sont dans le volet ☰ (`ConversationDrawer`).

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
