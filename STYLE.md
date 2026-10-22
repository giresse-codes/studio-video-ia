# STYLES

## Règles communes
- Format 1080x1920, 30 i/s.
- Zone sûre du texte : 80 px à gauche, 130 px à droite, 380 px en bas, 160 px en haut.
- Polices : Poppins ExtraBold pour les titres, Inter pour le reste (via @remotion/google-fonts).
- Sous-titres : 56 px, mot actif jaune #FFD23F, autres mots blancs, contour noir 6 px.
- Mouvement : ressorts doux (spring), pas d'apparition sèche. Un changement visuel toutes les 2 à 4 s.
- Fin : phrase à retenir en grand pendant 3 s, puis une question pour les commentaires.
- Mascotte : un personnage original à définir ensemble, différent de ceux des références.

## Style 1 « Schéma » (fond clair)
- Fond #FFFFFF, encre #141414, accent vert #2EB82E, alerte rouge #E5383B, aplats beige #EBDDBB.
- Dessin 2D en traits noirs épais ; chiffres énormes qui s'incrémentent ; blocs qui se remplissent.
- Usage : démonstration par les chiffres, comparaisons, arnaques.

## Style 2 « Atelier » (pseudo-3D chaud)
- Décor isométrique en formes arrondies, ombres douces.
- Mur #D8B7A4, sol #B8A9D6, verre bleu translucide #7CC8F0, métal #BFC5CC.
- Étiquettes noires #1A1A1A avec texte bleu clair #8EE3FF, qui apparaissent quand le terme est dit.
- Caméra : zoom sur la pièce, puis dézoom final sur l'ensemble.
- Usage : expliquer comment un objet fonctionne.

## Style 3 « Écran code » (sombre)
- Fond #0E1422, texte #E8EEF7, accent doré #FFC857, vert #3DDC97, violet #9B8CFF.
- Une fenêtre d'éditeur arrondie à côté d'une illustration plate d'un objet du quotidien ; le code s'écrit ligne par ligne.
- Usage : DevsTeach.

## Avatar Astuces
- Personnage original : jeune adulte en 2D plate, silhouette simple, grande tête, lunettes rondes noires, cheveux bouclés brun foncé, haut blanc à manches longues, pantalon bleu #2F5FA7, chaussures noires. Peau #C68A5E, contour noir #141414 de 6 px. Ni logo ni marque.
- Composant : `src/components/Avatar.tsx`, dessin SVG sans image externe.
- Poses (`pose`) : « neutre » (bras le long du corps), « explique » (main levée), « montre » (bras tendu vers le centre de l'image, index pointé), « surpris » (mains levées, yeux ronds, bouche en O), « reflechit » (main au menton, regard en l'air), « content » (mains sur les hanches, yeux plissés, grand sourire).
- Passage d'une pose à l'autre : ressort doux (props `previousPose` et `poseFrom`). Respiration lente et clignement des yeux toutes les 3,5 s environ.
- Parole (`speaking` + `audioSrc`) : la bouche s'ouvre selon le volume de la voix ; sinon elle reste fermée.
- Placement (`side`) : « droite » par défaut, en bas à droite ; « gauche » le place en bas à gauche, retourné pour regarder vers le centre.
  - Hauteur 560 px, largeur 373 px.
  - Toujours dans la zone sûre : 130 px du bord droit (80 px du bord gauche avec `side="gauche"`).
  - Bas de l'avatar à 560 px du bas de l'image : 380 px de zone basse + 180 px réservés aux sous-titres. Il ne recouvre jamais les sous-titres.
