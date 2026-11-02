# STYLE GIRESSE Digital Studio (publicités du studio)

Publicités pour GIRESSE Digital Studio. Les règles communes sont dans le `STYLE.md` racine.
Référence de qualité : le motion design « produit » sur fond clair (phrase qui s'écrit en haut, objets brillants à ombre douce, maquettes, compteurs).

## Marque
- Logo : `channels/giresse/logo/` (original fourni, et versions détourées : monogramme GS, nom « GIRESSE / DIGITAL STUDIO », losange, logo complet). Toujours le fichier, jamais redessiné.
- Couleurs tirées du logo : fond crème #EFEDE8, anthracite #2B2B2F, taupe #9E978C (texte d'accent #7A7166 pour la lisibilité). Vert #25D366 réservé au bouton WhatsApp final.
- Thème `"theme": "studio"` dans `video.json`.

## Mise en page (vertical 1080x1920)
- Sans avatar (`"avatar": false`). Sous-titres en mode `"sousTitres": "titre"` : la phrase s'écrit mot à mot en haut (y ≈ 200), mots d'accent (`"accents"`) en taupe foncé.
- L'objet principal au centre, entre y = 420 et y = 1300 ; rien d'important sous 1330 px (interface des applis).
- Objets : cartes blanches brillantes à ombre douce, pastilles anthracite ou taupe, maquettes de téléphone et de navigateur, notifications, curseur, emojis (police Noto Color Emoji, licence libre).

## Mouvement
- Arrivées du flou au net sur une longue traîne (`kit.entre`), sorties plus courtes (`kit.sort`) ; pas de travelling automatique (`kit.scene(id, {travelling: false})`).
- Une scène par phrase, 1,5 à 4 s ; transitions variées : flou, zoom, balayage.
- Fin : logo et bouton « Écrivez-nous sur WhatsApp » au moins 2 s à l'écran.
- Pas de logo de marque tierce : le bouton WhatsApp est une bulle verte dessinée, sans le logo officiel.
