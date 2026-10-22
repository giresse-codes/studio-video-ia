# studio-video-ia

Studio de vidéos animées verticales pour deux chaînes françaises : **DevsTeach** (programmation et IA expliquées par des objets du quotidien) et **Astuces** (problèmes courants et solutions malignes). Moteur : HyperFrames (HTML + GSAP), avec l'outillage de `kit/`. Astuces #1 est en Remotion (`src/`).

## Mode d'emploi

1. `npm install` (une fois), puis `npx hyperframes browser ensure` pour le Chrome de rendu.
2. `npm run nouvelle-video -- astuces 2 cable-abime` crée le script, `hyperframes/astuces-002/` (video.json, ancres.md, scène vide).
3. Écrire le script dans `channels/astuces/scripts/002-cable-abime.md` : 65 à 85 mots (DevsTeach : 90 à 120), indications entre [crochets].
4. Déposer la voix en WAV : `public/audio/astuces-002.wav` (ta voix ou AI Studio).
5. Découper en scènes dans `video.json` : un fichier par scène, chacune commence sur un mot (`"debut": "@chaleur"`).
6. Dans chaque scène, lier chaque événement à un mot : `S.ancre('@chaleur')`, `S.zoomMot('@lithium')` (modèle : `kit/modeles/scene.html`).
7. `npm run preparer -- astuces-002` : heures des mots (Whisper, sinon estimation), sous-titres, avatar, bruitages, transitions.
8. `npm run verifier -- astuces-002` : durée, sous-titres dans la zone sûre, ancres à ±150 ms, une image par ancre dans `docs/verifications/`.
9. Corriger ce qui est signalé, relancer 7 et 8, puis rendre : `cd hyperframes/astuces-002 && npm run render` (→ `out/astuces-002.mp4`).
10. Règles de travail : [CLAUDE.md](CLAUDE.md). Styles et chiffres : [STYLE.md](STYLE.md) et `kit/config.ts`.

## Structure

- `channels/<chaine>/scripts/` : scripts ; `public/audio/` : voix off ; `hyperframes/<chaine>-<numero>/` : vidéos HyperFrames.
- `kit/` : outils (`outils/`), code partagé par les scènes (`runtime/` : animations, transitions, avatar, look), modèles (`modeles/`).
- `src/` : version Remotion (Astuces #1) ; `docs/` : comparaisons et vérifications ; `out/` : rendus (non versionnés).
