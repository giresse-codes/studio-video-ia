# Studio vidéo IA : règles de travail

Trois chaînes actives : Astuces (problèmes courants et solutions malignes, channels/astuces/),
DevsTeach (programmation et IA expliquées par des objets du quotidien, channels/devsteach/)
et Mode Survie (situations extrêmes, protocole en 3 règles, channels/mode-survie/).
Tous les scripts d'Astuces et de DevsTeach : channels/scripts-complets.md, découpé en channels/<chaîne>/scripts/.
Public : France, français courant, ton d'un enseignant sympathique. Pas de jargon sans image.
Format : vertical 1080x1920, 30 images par seconde. Durée libre de 20 s à 3 min, qui suit le contenu (repère : 2,5 mots par seconde).
Une seule idée par vidéo. Aucune phrase de remplissage : chacune apporte une information, une image ou une blague.
Au-delà de 45 s, un rebond d'attention toutes les 15 à 20 s (changement de décor, nouvelle question, gag ou annonce de la suite).
Pile : HyperFrames par défaut, avec l'outillage de `kit/` (Remotion seulement s'il apporte un avantage clair, à justifier).
La voix off (un seul narrateur : ma voix ou celle d'AI Studio) est déposée dans public/audio/.

## Règles
1. Lis STYLE.md (règles communes) et channels/<chaîne>/STYLE.md (style de la chaîne) avant toute animation. Ne change pas un style sans que je le demande.
2. Sous-titres mot à mot (3 à 4 mots, pastille, 56 px minimum, mot actif surligné) dans la zone sûre : 80 px à gauche, 130 px à droite, 380 px en bas.
   Les indications entre crochets ou parenthèses ne s'affichent jamais : elles choisissent la pose de l'avatar.
3. Le montage suit la voix : la durée vient de l'audio, et chaque événement est lié à un mot par une ancre `@mot`
   (heure Whisper, ±150 ms).
4. Aucune musique ni image protégée. Bruitages générés en local, 18 dB sous la voix, à chaque transition et chaque gag.
5. Personnages et décors originaux : ne reproduis jamais ceux d'autres créateurs.
6. Un changement d'image ou d'élément toutes les 1,5 à 3 s, rien de vide dans la première seconde, jamais de coupe sèche.
7. Les scripts sont dans channels/<chaine>/scripts/ ; ne les modifie pas sans me le dire.
8. Une vidéo se fait avec `npm run nouvelle-video`, `npm run preparer` puis `npm run verifier` ; corrige ce que la vérification signale
   (silence de plus de 0,6 s, scène de plus de 6 s sans nouvel élément, ancre à plus de 150 ms, élément important à moins de 60 px d'un bord) avant de rendre.
9. Après chaque vidéo : rends dans out/, liste ce qui est fait et ce qui reste, sans tout recopier.

## Commande « Fais <Chaîne> #N »
Exemple : « Fais Astuces #2 », « Fais DevsTeach #5 », « Fais Mode Survie #1 ».
1. Lis STYLE.md, channels/<chaîne>/STYLE.md et le script channels/<chaîne>/scripts/<NNN>-<slug>.md (N sur 3 chiffres) :
   voix off, bloc Écran (visuels et ancres) et légende. S'il manque le style ou le script, arrête-toi et dis-le-moi.
2. La voix doit être dans public/audio/<chaîne>-<NNN>.wav ; sinon, demande-la-moi.
3. `npm run nouvelle-video -- <chaîne> <N> <slug>` (le script existant est gardé), puis les scènes, `npm run preparer` et `npm run verifier` (règle 8).
4. Rends dans out/<chaîne>-<NNN>.mp4 et fais le point (règle 9).
