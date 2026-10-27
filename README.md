# studio-video-ia

Studio de vidéos animées verticales pour trois chaînes françaises actives : **Astuces** (problèmes courants et solutions malignes ; 21 scripts), **DevsTeach** (programmation et IA expliquées par des objets du quotidien ; 19 scripts) et **Mode Survie** (situations extrêmes, protocole en 3 règles ; 30 scripts). Moteur : HyperFrames (HTML + GSAP), avec l'outillage de `kit/`. Astuces #1 est en Remotion (`src/`).

## Commande « Fais <Chaîne> #N »

Dis par exemple « Fais Astuces #2 » ou « Fais DevsTeach #5 » : Claude lit `STYLE.md`, `channels/<chaîne>/STYLE.md` et le script `channels/<chaîne>/scripts/<NNN>-<slug>.md` (voix off, bloc Écran, légende), puis déroule les étapes ci-dessous avec la voix `public/audio/<chaîne>-<NNN>.wav`. Détail dans [CLAUDE.md](CLAUDE.md).

## Mode d'emploi

1. `npm install` (une fois), puis `npx hyperframes browser ensure` pour le Chrome de rendu.
2. `npm run nouvelle-video -- astuces 2 cable-abime` crée le script, `hyperframes/astuces-002/` (video.json, ancres.md, scène vide).
3. Écrire le script dans `channels/astuces/scripts/002-cable-abime.md` : durée libre (20 s à 3 min, repère 2,5 mots/s), indications entre [crochets].
4. Déposer la voix en WAV : `public/audio/astuces-002.wav` (ta voix ou AI Studio).
5. Découper en scènes dans `video.json` : un fichier par scène, chacune commence sur un mot (`"debut": "@chaleur"`). Options : `"theme"` (`atelier`, `schema`, `alerte`), `"avatar": false` (sans avatar), `"calques"` (écran fixe sur toute la vidéo, ex. horodatage de Mode Survie, `kit.calque('hud')`).
6. Dans chaque scène, lier chaque événement à un mot : `S.ancre('@chaleur')`, `S.zoomMot('@lithium')` (modèle : `kit/modeles/scene.html`).
7. `npm run preparer -- astuces-002` : heures des mots (Whisper, sinon estimation), sous-titres, avatar, bruitages, transitions.
8. `npm run verifier -- astuces-002` : durée, silences > 0,6 s, scènes > 6 s sans nouveauté, ancres > 150 ms, bords < 60 px, une image par ancre (`docs/verifications/`).
9. Corriger ce qui est signalé, relancer 7 et 8, puis rendre : `cd hyperframes/astuces-002 && npm run render` (→ `out/astuces-002.mp4`).
10. Règles de travail : [CLAUDE.md](CLAUDE.md). Styles : [STYLE.md](STYLE.md) (règles communes) et `channels/<chaîne>/STYLE.md` ; chiffres : `kit/config.ts`.

## Structure

- `channels/<chaine>/` : `STYLE.md` de la chaîne et `scripts/` (Astuces et DevsTeach découpés depuis `channels/scripts-complets.md`) ; `public/audio/` : voix off ; `hyperframes/<chaine>-<numero>/` : vidéos HyperFrames.
- `kit/` : outils (`outils/`), code partagé par les scènes (`runtime/` : animations, transitions, avatar, look, 3D), modèles (`modeles/`).
- `src/` : version Remotion (Astuces #1) ; `docs/` : comparaisons et vérifications ; `out/` : rendus (non versionnés).
