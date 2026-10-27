# STYLE DevsTeach

DevsTeach : programmation et IA expliquées par des objets du quotidien. Grand frère qui apprend à coder, une mission concrète à la fin, avatar en tenue bleue.
Les règles communes (plein cadre, zone sûre, ancres, bords, durée, vérification) sont dans le `STYLE.md` racine.

## Mise en page
- Étiquettes : 56 px minimum, fond noir en dégradé, texte bleu clair #8EE3FF, apparition au mot qu'elles nomment.
- Polices : Poppins ExtraBold pour les titres, Inter pour le reste. Fichiers embarqués par le kit, les mêmes au rendu et à la vérification.
- Avatar : 1,6 fois sa taille d'origine (597 x 896 px), en bas à droite. Il chevauche le bord bas de la scène (pieds 300 px sous y = 1500) et dépasse un peu du bord de l'image. Il regarde l'objet principal de la scène (`cible` dans `video.json`).

## Look
- Dégradés doux, ombres portées, cartes arrondies, léger grain sur toute l'image.
- Chaque scène a 3 plans de profondeur avec parallaxe : fond, objets, premier plan flou.
- L'objet principal est gros et détaillé : c'est lui qui explique.
- Illustrations dessinées en SVG par nos soins : objets du quotidien en personnages (pizzeria, serveur, annuaire, fichiers HTML/CSS/JS en squelette, vêtements, muscles…). Ni Lottie, ni image téléchargée sans licence claire.

## Mouvement
- Travelling lent sur chaque scène, de 100 à 112 %.
- Zoom rapide sur le mot clé : 125 % en 0,25 s vers l'objet, puis retour doux (`S.zoomMot('@mot')`).
- Transitions : zoom-through ou balayage. Jamais de coupe sèche.
- Un changement d'image ou un nouvel élément toutes les 1,5 à 3 s.
- Animations : rebond, écrasement et étirement, apparition en cascade, flèches et traits qui se dessinent. Pas d'apparition sèche.

## Son
- Bruitage court à chaque transition (whoosh) et à chaque gag (pop, boing, ding…), crête 18 dB sous celle de la voix.
- Tous les bruitages sont générés en local (`kit/outils/sons.ts`, ffmpeg), sans fichier téléchargé. Varier les prises d'un même son.
- Aucune musique ni son protégé.

## Voix
- Un seul narrateur. L'audio peut être ta voix ou celle d'AI Studio, en WAV dans `public/audio/<chaine>-<numero>.wav`.
- Les indications entre [crochets] ou (parenthèses) ne s'affichent jamais dans les sous-titres. Elles servent seulement à choisir la pose de l'avatar.

## Humour
- Une blague (dite ou gag visuel) toutes les 10 à 15 s au maximum.
- Toujours au service de l'explication : la blague illustre l'idée en cours.
- Jamais d'humour contre les victimes d'arnaques.
- La clarté passe avant la blague : si elle gêne la compréhension, on la coupe.

## Style 1 « Schéma » (fond clair)
- Fond #FFFFFF, encre #141414, accent vert #2EB82E, alerte rouge #E5383B, aplats beige #EBDDBB.
- Dessin 2D en traits noirs épais ; chiffres énormes qui s'incrémentent ; blocs qui se remplissent.
- Usage : démonstration par les chiffres, comparaisons, arnaques.

## Style 3 « Écran code » (sombre)
- Fond #0E1422, texte #E8EEF7, accent doré #FFC857, vert #3DDC97, violet #9B8CFF.
- Une fenêtre d'éditeur arrondie à côté d'une illustration plate d'un objet du quotidien ; le code s'écrit ligne par ligne.
- Usage : DevsTeach.

Une vidéo choisit sa palette de fond dans `video.json` (`"theme": "schema"` ou `"atelier"`, par défaut) ; le style « Écran code » s'utilise dans une scène (classe `ecran-code` du kit).

## Style 3D « pâte à modeler »
- Outil : Three.js dans HyperFrames (`kit/runtime/kit3d.js`, modèle : `hyperframes/test-3d`). Rendu logiciel accepté (environ 13 s de rendu par seconde de vidéo, contre 6 s en 2D).
- Quand l'utiliser : les scènes « comment ça marche » où l'on entre dans un objet, et les vues en coupe (l'intérieur d'un téléphone, d'un serveur, d'un mur, d'une batterie). Une seule grosse scène 3D par vidéo suffit souvent.
- Quand rester en 2D : les listes et étapes numérotées, les missions et tutoriels pas à pas, le code (style « Écran code »), les comparaisons chiffrées (style « Schéma »).
- Formes simples : boîtes arrondies, cylindres, sphères (`D.boite`, `D.cylindre`, `D.sphere`). Matériaux mats (`MeshStandardMaterial`, rugosité 0,85 ou plus, aucun métal), couleurs pastel de STYLE.md.
- Lumière douce : `HemisphereLight` et `DirectionalLight` avec ombres floues ; une lueur locale (four, écran) si l'objet en a une.
- Coupes : plan de coupe (`D.coupe`) pour ouvrir une face et montrer l'intérieur.
- Pas de modèle téléchargé, sauf CC0 (Kenney, par exemple) quand le téléchargement fonctionne ; sinon tout se construit en code. Hasard toujours semé.
- Mouvements de pâte à modeler : l'objet sort du sol ou se pose avec écrasement et rebond, sans entrer par un bord du cadre.
- Rendu déterministe : chaque image se calcule à partir de son numéro (événement `hf-seek` arrondi à l'image), jamais avec une horloge.
- Caméra : travelling lent (100 à 112 %) et zoom rapide sur le mot clé (`D.zoomMot('@mot', [x, y, z])`), avec les mêmes ancres que la 2D.
- Composition : la 3D est en fond plein cadre ; par-dessus, l'avatar 2D, les étiquettes (qui suivent les objets 3D, `D.suivre`) et les sous-titres, dans la zone sûre habituelle.
- Marge : aucun élément important (objet 3D marqué `D.important`, étiquette, titre, chiffre) à moins de 60 px d'un bord, contrôlé par `npm run verifier`.

Une vidéo choisit sa palette de fond dans `video.json` (`"theme": "schema"` ou `"atelier"`, par défaut) ; le style « Écran code » s'utilise dans une scène (classe `ecran-code` du kit).

## Avatar
- Personnage original : jeune adulte en 2D plate, silhouette simple, grande tête, lunettes rondes noires, cheveux bouclés brun foncé, haut blanc à manches longues, pantalon bleu #2F5FA7, chaussures noires. Peau #C68A5E, contour noir #141414 de 6 px. Ni logo ni marque.
- Composant : `kit/runtime/avatar.html` (HyperFrames, copié dans chaque vidéo). La version Remotion `src/components/Avatar.tsx` reste pour Astuces #1.
- Poses : « neutre », « explique » (main levée), « montre » (bras tendu vers le centre, index pointé), « surpris », « choque » (mains sur les joues), « reflechit » (main au menton), « rit » (sursauts, mains sur le ventre), « content » (mains sur les hanches).
- La pose suit l'indication de chaque phrase du script ; une phrase sans indication prend la pose « explique ». Changement de pose en douceur, avec un léger écrasement puis un rebond. Respiration lente, clignement toutes les 3,5 s environ.
- Tenue : bleue (`"avatar": {"tenue": "bleue"}` dans `video.json`).
- Bouche : elle suit le volume de la voix et reste fermée dans les silences.
- Placement : à droite par défaut ; `"avatar": {"cote": "gauche"}` dans `video.json` le place à gauche, retourné.
