# STYLE Mode Survie : « Alerte » sombre 2D

Mode Survie : situations extrêmes, un scénario fictif à la 2e personne, le mécanisme du danger, le protocole en 3 règles, une question finale.
Ton calme et tendu, jamais d'humour sur le danger. Les règles communes (plein cadre, zone sûre, ancres, bords, durée, vérification) sont dans le `STYLE.md` racine.

## Palette (`"theme": "alerte"` dans `video.json`)
- Fond nuit en dégradé #16233F → #0B1220, eau #1E5A8C → #0E2E4F, encre des traits #0B1220.
- Texte clair #F2F5FA, alerte rouge #E5383B (rouge foncé #B8262A sous du texte blanc), danger orange #FF8A3D, sortie et bon geste vert #3DDC97.
- Rouge et orange signalent le danger ou l'erreur (croix, flèches de pression) ; le vert, le bon geste et la sortie.

## Écran fixe (calque `hud` de la vidéo, au-dessus des scènes)
- Horodatage en haut à gauche, police mono : « 17:12 · CANAL », avec un point rouge qui clignote, dès 0 s.
- Compte à rebours en haut à droite, police mono (« 0:60 » qui descend), quand le script donne un délai.
- Carte de données sous l'horodatage : un titre en capitales (« NIVEAU D'EAU », « ÉNERGIE », « CO »…) et une jauge qui évolue avec le récit (orange puis rouge).
- Le calque occupe la bande du haut (y 160 à 340) ; les scènes ne mettent rien d'important dans cette bande.

## Scènes
- Schémas 2D plats, traits #0B1220 de 8 à 12 px, aplats sans texture : vues en coupe (voiture dans l'eau, immeuble, glace), vues du dessus (plage, foule).
- Personnages : silhouettes simples sans visage (tête ronde, corps arrondi), originales.
- Le danger se montre par le mécanisme : flèches de pression, niveau qui monte, zone rouge. Jamais de blessure ni de sang réaliste.
- Pas d'avatar (`"avatar": false`) : le schéma et le texte occupent tout le cadre (y 380 à 1350, au-dessus des sous-titres).
- Erreur à éviter : objet barré d'une grande croix rouge qui se trace.

## Protocole
- Chaque règle a sa carte : grand numéro dans un cercle vert, verbe d'action en capitales blanches (« CEINTURE »), 56 px minimum.
- Les trois cartes reviennent ensemble pour le résumé (phrase à retenir, 3 s), puis la question finale.
- Fin : la carte « Ceci ne remplace pas une formation aux premiers secours. Urgence : 112. » reste à l'écran pendant la question.

## Mouvement
- Travelling lent (100 à 112 %) et zoom rapide sur le mot clé, comme les autres chaînes, mais sans écrasement comique : apparitions nettes (`kit.pop`, `kit.cascade`), tracés, montées de niveau.
- Transitions : zoom-through ou balayage, jamais de coupe sèche. Un nouvel élément toutes les 1,5 à 3 s.

## Son
- Whoosh à chaque transition ; bruitages sobres liés aux mots : `bip` (compte à rebours, carte de règle), `impact` (choc, chute), `eau` (plongeon, bulles), `verre` (vitre cassée), `alerte` (danger, erreur).
- Générés en local (`kit/outils/sons.ts`), crête 18 dB sous la voix. Aucune musique.

## Texte
- Polices du kit : Poppins ExtraBold pour les titres, Inter pour le reste, Kit Mono pour l'horodatage, le compte à rebours et les données.
- Étiquettes : fond rouge foncé ou nuit, texte blanc, 56 px minimum, au mot qu'elles nomment.
