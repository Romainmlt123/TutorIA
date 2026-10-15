# StudyPauseScreen

La pause décidée avec les parents (réglages de P4), côté élève : R1 (le soir, de 21 h à 6 h), R2 (hors de la plage horaire), R3 (temps du jour atteint). Elle remplace l'onglet Tutor'IA, la session de flashcards et, dans Explorer, le niveau (voir `WoodDialog` sur `LevelBackdrop` `night`). Un message bienveillant, jamais une punition.

- Fond de marque (comme C1), le logo du tuteur (`VoiceAvatar`, 148 px, au repos) avec un badge blanc : lune violette, horloge orange ou trophée vert.
- Le titre et le texte sur le bleu : « Il est tard, on reprend demain ? », « On se retrouve à 17 h », « Tu as bien travaillé aujourd'hui ! ».
- Un bouton blanc qui ressort : « Revenir à l'accueil ».
- Temps du jour atteint : d'abord une carte verte qui félicite (« 1 h 30 de révisions aujourd'hui », jauge pleine, « Ton maximum du jour, décidé avec tes parents », la série qui continue), puis « Revenir à l'accueil » et « Voir mes progrès » (transparent).

## Props

| Prop | Type | Rôle |
| --- | --- | --- |
| `reason` | `'evening' \| 'window' \| 'daily'` | La raison de la pause. |
| `from`, `until` | `string` | Plage horaire (« 17 h », « 21 h »). |
| `time` | `string` | Temps du jour (« 1 h 30 »). |
| `streak` | `number` | Série en cours. |
| `onHome` / `homeHref`, `onProgress` / `progressHref` | | Les boutons. |
| `footer` | `node` | Barre de navigation en bas (dans l'onglet Tutor'IA). |
| `height` | `number \| string` | Hauteur (844). |

## Exemple

```js
const { StudyPauseScreen, BottomNav } = window.TutorIA;
h(StudyPauseScreen, { reason: 'daily', time: '1 h 30', streak: 12, footer: h(BottomNav, { active: 'tuteur' }) });
```
