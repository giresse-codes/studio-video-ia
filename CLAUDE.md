# Studio vidéo IA : règles de travail

Chaînes : DevsTeach (programmation et IA expliquées par des objets du quotidien)
et Astuces (problèmes courants et solutions malignes).
Public : France, français courant, ton d'un enseignant sympathique. Pas de jargon sans image.
Format : vertical 1080x1920, 30 images par seconde. Astuces 25 à 35 s (65 à 85 mots), DevsTeach 35 à 50 s (90 à 120 mots).
Une seule idée par vidéo.
Pile : HyperFrames par défaut, avec l'outillage de `kit/` (Remotion seulement s'il apporte un avantage clair, à justifier).
La voix off (un seul narrateur : ma voix ou celle d'AI Studio) est déposée dans public/audio/.

## Règles
1. Lis STYLE.md avant toute animation. Ne change pas un style sans que je le demande.
2. Sous-titres mot à mot (3 à 4 mots, pastille, 56 px minimum, mot actif surligné) dans la zone sûre : 80 px à gauche, 130 px à droite, 380 px en bas.
   Les indications entre crochets ou parenthèses ne s'affichent jamais : elles choisissent la pose de l'avatar.
3. Le montage suit la voix : la durée vient de l'audio, et chaque événement est lié à un mot par une ancre `@mot`
   (heure Whisper, ±150 ms). Si l'audio est trop long, propose de couper le texte avant d'accélérer (atempo 1,1 maximum).
4. Aucune musique ni image protégée. Bruitages générés en local, 18 dB sous la voix, à chaque transition et chaque gag.
5. Personnages et décors originaux : ne reproduis jamais ceux d'autres créateurs.
6. Un changement d'image ou d'élément toutes les 1,5 à 3 s, rien de vide dans la première seconde, jamais de coupe sèche.
7. Les scripts sont dans channels/<chaine>/scripts/ ; ne les modifie pas sans me le dire.
8. Une vidéo se fait avec `npm run nouvelle-video`, `npm run preparer` puis `npm run verifier` ; corrige tout ce que la vérification signale avant de rendre.
9. Après chaque vidéo : rends dans out/, liste ce qui est fait et ce qui reste, sans tout recopier.
