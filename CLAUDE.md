# Studio vidéo IA : règles de travail

Chaînes : DevsTeach (programmation et IA expliquées par des objets du quotidien)
et Astuces (problèmes courants et solutions malignes).
Public : France, français courant, ton d'un enseignant sympathique. Pas de jargon sans image.
Format : vertical 1080x1920, 30 images par seconde, 45 à 60 secondes. Une seule idée par vidéo.
Pile : Remotion + TypeScript. La voix off est générée hors dépôt (Google AI Studio)
et déposée dans public/audio/.

## Règles
1. Lis STYLE.md avant toute animation. Ne change pas un style sans que je le demande.
2. Sous-titres mot à mot, mot actif surligné, dans la zone sûre (hors 20 % du bas et 12 % de droite).
3. Le montage suit la voix : la durée de la composition vient de la durée de l'audio (calculateMetadata).
4. Aucune musique ni image protégée. Musique libre de droits uniquement, volume bas sous la voix.
5. Personnages et décors originaux : ne reproduis jamais ceux d'autres créateurs.
6. Un changement visuel toutes les 2 à 4 secondes. Pas d'apparition sèche : mouvements doux.
7. Les scripts sont dans channels/<chaine>/scripts/ ; ne les modifie pas sans me le dire.
8. Après chaque vidéo : rends dans out/, liste ce qui est fait et ce qui reste, sans tout recopier.
