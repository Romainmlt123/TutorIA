# WoodDialog

Question posée dans un écran de jeu, sur un panneau de bois (comme `WoodDialog` du code) : titre en Lilita One, texte sur un parchemin (`Parchment`), puis deux boutons en relief (`GameButton`) : l'autre choix en jaune à gauche, l'action conseillée en vert à droite. Un voile `rgba(0,6,18,0.40)` couvre l'écran ; toucher en dehors, ou le retour d'Android, vaut l'action conseillée.

## Quand l'utiliser

Côté jeu, pour confirmer une action qui fait perdre quelque chose. Aujourd'hui : « Quitter le niveau ? » (X4c), quand l'élève quitte une partie commencée et pas finie. En leçon et en exercices : « Ta progression dans ce niveau ne sera pas gardée : tu le reprendras depuis le début. » ; en évaluation : « Si tu quittes maintenant, l'évaluation sera à recommencer. ». Et la pause dans Explorer (R6, v2.15) : sur `LevelBackdrop` `night`, ruban « Pause du soir », « On fait une pause ? », deux parchemins et un seul bouton jaune « Revenir à la carte » (`single`, `primaryTone: 'yellow'`, `veil: false`).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `title` | `string` | Question. |
| `body` | `string` | Texte du parchemin. |
| `primaryLabel` / `onPrimary` / `primaryHref` | | Action conseillée, bouton vert (« Continuer »). |
| `secondaryLabel` / `onSecondary` / `secondaryHref` | | Autre choix, bouton jaune (« Quitter »). |
| `veil` | `boolean` | `false` : le panneau seul, sans voile. |
| `tab`, `note` | `string` | Ruban sur le bord haut, second parchemin (v2.15). |
| `single`, `primaryTone` | | Une seule action, et sa couleur (v2.15). |

## Exemple

```js
const { WoodDialog } = window.TutorIA;
h(WoodDialog, { title: 'Quitter le niveau ?', body: 'Ta progression dans ce niveau ne sera pas gardée : tu le reprendras depuis le début.', onPrimary: rester, onSecondary: quitter });
```
