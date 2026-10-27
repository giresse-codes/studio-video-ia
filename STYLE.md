# STYLES : règles communes

Règles communes aux trois chaînes (Astuces, DevsTeach, Survie). Chaque chaîne a son style dans `channels/<chaîne>/STYLE.md` : lire les deux avant toute animation.
Les valeurs chiffrées sont aussi dans `kit/config.ts`, lu par les outils : garder les deux alignés.

## Moteur
- HyperFrames par défaut (HTML + GSAP, outillage dans `kit/`). Remotion seulement s'il apporte un avantage clair, à justifier par écrit avant de commencer.

## Durée libre
- La durée suit le contenu : de 20 s à 3 min, sans plafond fixe par chaîne. La durée de la vidéo est celle de l'audio.
- Budget indicatif pour écrire le script : 2,5 mots par seconde.
- Aucune phrase ne sert de remplissage : chacune apporte une information, une image ou une blague.
- Pour toute vidéo de plus de 45 s : un « rebond d'attention » toutes les 15 à 20 s (changement de décor, nouvelle question, gag ou annonce de la suite).

## Plein cadre et zone sûre (1080x1920, 30 i/s)
- La scène remplit l'image de y = 0 à y = 1500, sans bande vide. Sous 1500 px, le sol continue en dégradé (zone couverte par l'interface des applis).
- Zone sûre du texte : 80 px à gauche, 130 px à droite, 380 px en bas, 160 px en haut.
- Sous-titres : 3 à 4 mots, sur une pastille sombre arrondie, 56 px minimum, mot actif en jaune #FFD23F, autres mots blancs, dans la zone sûre. Ils passent au-dessus de l'avatar.
- Les indications entre [crochets] ou (parenthèses) ne s'affichent jamais dans les sous-titres.

## Rien de coupé par les bords
- Aucun élément important (objet, objet 3D marqué `D.important`, étiquette, titre, chiffre) à moins de 60 px d'un bord de l'image.
- Les objets entrent en se posant, en poussant ou en apparaissant dans le cadre ; un décor plein cadre peut toucher les bords.

## Ancres @mot synchronisées par Whisper
- Chaque événement visuel ou sonore est lié à un mot du script par une ancre `@mot`. Il se déclenche à l'heure Whisper de ce mot, à ±150 ms près.
- Si Whisper est indisponible, on utilise l'heure estimée (calage sur les pauses de la voix), et la vérification le signale.
- Syntaxe des ancres : `@mot`, `@mot#2`, `@chauff*`, `@mot+0.1`, `@0`. Détail dans `kit/outils/ancres.ts`.
- Aucun plan vide dans la première seconde : l'action commence à 0 s, avec un son à 0,2 s.
- Fin : phrase à retenir en grand pendant 3 s, puis une question pour les commentaires.

## npm run verifier
- `npm run verifier` affiche la durée et signale seulement : un silence de plus de 0,6 s, une scène de plus de 6 s sans nouvel élément visuel, une ancre à plus de 150 ms de son mot, un élément important à moins de 60 px d'un bord.
- Une vidéo se fait avec `npm run nouvelle-video`, `npm run preparer` puis `npm run verifier` ; on corrige ce qu'il signale avant de rendre.
